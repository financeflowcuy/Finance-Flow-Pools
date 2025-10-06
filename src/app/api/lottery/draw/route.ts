import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecureLottoSystem } from '@/lib/crypto-lotto'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'

// In a real application, these would be stored securely in environment variables
const RSA_KEYS = SecureLottoSystem.generateRSAKeyPair()

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = rateLimiter.getClientIdentifier(request)
    const rateLimit = rateLimiter.isAllowed(
      `draw-${clientId}`,
      RATE_LIMITS.DRAW.limit,
      RATE_LIMITS.DRAW.windowMs
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many draw requests. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.DRAW.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }
    const body = await request.json()
    const { betType = '4D' } = body

    // Generate provably fair seed
    const { seed, hash, timestamp } = SecureLottoSystem.generateProvablyFairSeed()
    
    // Generate numbers based on bet type
    const count = parseInt(betType.replace('D', ''))
    const numbers = SecureLottoSystem.generateNumbersFromSeed(seed, count)
    
    // Sign the result
    const signature = SecureLottoSystem.signResult(numbers, RSA_KEYS.privateKey)
    
    // Create draw record in database
    const drawResult = await db.lotteryDraw.create({
      data: {
        id: SecureLottoSystem.generateTransactionId(),
        numbers: JSON.stringify(numbers),
        betType,
        seed,
        seedHash: hash,
        signature,
        publicKey: RSA_KEYS.publicKey,
        isCompleted: true
      }
    })

    // Process winning bets
    await processWinnings(drawResult.id, numbers)

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'draw_completed',
        data: JSON.stringify({ drawId: drawResult.id, numbers, betType }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    console.log('New draw result:', drawResult)

    return NextResponse.json({
      success: true,
      result: {
        id: drawResult.id,
        numbers,
        betType,
        seed,
        seedHash: hash,
        timestamp,
        signature,
        publicKey: RSA_KEYS.publicKey,
        drawTime: drawResult.createdAt
      },
      message: 'Numbers generated successfully with cryptographic security'
    })

  } catch (error) {
    console.error('Draw error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate numbers' },
      { status: 500 }
    )
  }
}

async function processWinnings(drawId: string, winningNumbers: number[]) {
  try {
    // Get all pending bets for this draw type
    const pendingBets = await db.bet.findMany({
      where: {
        status: 'pending',
        betType: {
          contains: winningNumbers.length.toString()
        }
      },
      include: {
        user: true
      }
    })

    for (const bet of pendingBets) {
      const betNumbers = JSON.parse(bet.numbers)
      const isWinner = checkWin(betNumbers, winningNumbers)
      
      if (isWinner) {
        const winAmount = calculateWinAmount(bet.amount, bet.betType)
        
        // Update bet status
        await db.bet.update({
          where: { id: bet.id },
          data: { 
            status: 'won',
            drawId: drawId
          }
        })

        // Create winning record
        await db.winning.create({
          data: {
            betId: bet.id,
            userId: bet.userId,
            drawId: drawId,
            amount: winAmount,
            numbers: JSON.stringify(winningNumbers)
          }
        })

        // Update user balance
        await db.user.update({
          where: { id: bet.userId },
          data: {
            balance: bet.user.balance + winAmount
          }
        })
      } else {
        // Mark as lost
        await db.bet.update({
          where: { id: bet.id },
          data: { 
            status: 'lost',
            drawId: drawId
          }
        })
      }
    }
  } catch (error) {
    console.error('Error processing winnings:', error)
  }
}

function checkWin(betNumbers: number[], winningNumbers: number[]): boolean {
  // Simple exact match for now
  // In a real system, you might have different winning conditions
  return JSON.stringify(betNumbers) === JSON.stringify(winningNumbers)
}

function calculateWinAmount(betAmount: number, betType: string): number {
  // Different multipliers for different bet types
  const multipliers = {
    '2D': 50,
    '3D': 400,
    '4D': 3000
  }
  
  return betAmount * (multipliers[betType as keyof typeof multipliers] || 1)
}

export async function GET() {
  try {
    // Get the latest draw result from database
    const latestResult = await db.lotteryDraw.findFirst({
      where: { isCompleted: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!latestResult) {
      return NextResponse.json({
        success: true,
        result: null,
        message: 'No draws completed yet'
      })
    }

    return NextResponse.json({
      success: true,
      result: {
        id: latestResult.id,
        numbers: JSON.parse(latestResult.numbers),
        betType: latestResult.betType,
        seedHash: latestResult.seedHash,
        timestamp: latestResult.createdAt.getTime(),
        drawTime: latestResult.createdAt
      }
    })

  } catch (error) {
    console.error('Get latest draw error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get latest result' },
      { status: 500 }
    )
  }
}