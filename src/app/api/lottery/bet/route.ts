import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecureLottoSystem } from '@/lib/crypto-lotto'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = rateLimiter.getClientIdentifier(request)
    const rateLimit = rateLimiter.isAllowed(
      `bet-${clientId}`,
      RATE_LIMITS.BET.limit,
      RATE_LIMITS.BET.windowMs
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many bet requests. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.BET.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }
    const body = await request.json()
    const { numbers, betType, amount, userId = 'demo-user' } = body

    // Validate input
    if (!numbers || !betType || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate numbers count
    const expectedCount = parseInt(betType.replace('D', ''))
    if (numbers.length !== expectedCount) {
      return NextResponse.json(
        { success: false, error: `Invalid number count for ${betType}` },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount < 10000) {
      return NextResponse.json(
        { success: false, error: 'Minimum bet is Rp 10.000' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await db.user.findUnique({
      where: { email: userId }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: userId,
          name: 'Demo User',
          balance: 1000000
        }
      })
    }

    // Check user balance
    if (user.balance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Create bet record
    const betId = SecureLottoSystem.generateTransactionId()
    const encryptionKey = process.env.ENCRYPTION_KEY || 'a'.repeat(64) // 32 bytes = 64 hex chars
    const encryptedData = SecureLottoSystem.encrypt(
      JSON.stringify({ numbers, amount }),
      encryptionKey
    )
    
    // Store encrypted data as JSON string
    const encryptedDataJson = JSON.stringify(encryptedData)

    // Use transaction for atomic operations
    const result = await db.$transaction(async (tx) => {
      // Create bet
      const bet = await tx.bet.create({
        data: {
          id: betId,
          userId: user.id,
          numbers: JSON.stringify(numbers),
          betType,
          amount,
          encryptedData: encryptedDataJson
        }
      })

      // Update user balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: user.balance - amount
        }
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'bet_placed',
          userId: user.id,
          data: JSON.stringify({ betId, numbers, amount, betType }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return bet
    })

    console.log('New bet placed:', result)

    return NextResponse.json({
      success: true,
      bet: {
        id: result.id,
        numbers: JSON.parse(result.numbers),
        betType: result.betType,
        amount: result.amount,
        timestamp: result.createdAt,
        status: result.status
      },
      newBalance: user.balance - amount,
      message: 'Bet placed successfully'
    })

  } catch (error) {
    console.error('Bet error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to place bet' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'

    // Get user
    const user = await db.user.findUnique({
      where: { email: userId },
      include: {
        bets: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: true,
        bets: [],
        balance: 0
      })
    }

    const bets = user.bets.map(bet => ({
      id: bet.id,
      numbers: JSON.parse(bet.numbers),
      betType: bet.betType,
      amount: bet.amount,
      timestamp: bet.createdAt,
      status: bet.status
    }))

    return NextResponse.json({
      success: true,
      bets,
      balance: user.balance
    })

  } catch (error) {
    console.error('Get bets error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get bets' },
      { status: 500 }
    )
  }
}