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
    // Get all pending bets (all bet types can win against any draw)
    const pendingBets = await db.bet.findMany({
      where: {
        status: 'pending'
      },
      include: {
        user: true
      }
    })

    for (const bet of pendingBets) {
      const betNumbers = JSON.parse(bet.numbers)
      const isWinner = checkWin(betNumbers, winningNumbers, bet.betType)
      
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

function checkWin(betNumbers: number[], winningNumbers: number[], betType: string): boolean {
  const betNumStr = betNumbers.join('')
  const winNumStr = winningNumbers.join('')
  
  switch (betType) {
    // Basic betting types
    case '2D':
      return betNumStr === winNumStr.slice(-2)
      
    case '3D':
      return betNumStr === winNumStr.slice(-3)
      
    case '4D':
      return betNumStr === winNumStr
      
    case '2D Depan':
      return betNumStr === winNumStr.slice(0, 2)
      
    case '2D Tengah':
      return betNumStr === winNumStr.slice(1, 3)
      
    case '2D Belakang':
      return betNumStr === winNumStr.slice(-2)
      
    // Colok betting types
    case 'Colok Bebas':
      return betNumbers.some(num => winningNumbers.includes(num))
      
    case 'Colok Bebas 2D':
      return betNumbers.every(num => winningNumbers.includes(num))
      
    case 'Colok Naga':
      return betNumbers.every(num => winningNumbers.includes(num))
      
    case 'Colok Jitu':
      // Format: "digit-position" (e.g., "8-0" for position 0/As)
      if (betNumbers.length === 2) {
        const [digit, position] = betNumbers
        return winningNumbers[position] === digit
      }
      return false
      
    // Combination betting types
    case '50:50':
      return check5050(betNumStr, winNumStr)
      
    case 'Shio':
      return checkShio(betNumbers[0], winNumStr)
      
    case 'Tengah Tepi':
      const choiceTT = betNumStr.toLowerCase()
      const isTengah = checkTengahTepi(parseInt(winNumStr.slice(-2)))
      if (choiceTT === 'tengah' || choiceTT === 't') return isTengah
      if (choiceTT === 'tepi' || choiceTT === 'tp') return !isTengah
      return false
      
    case 'Dasar':
      return checkDasar(betNumStr, winNumStr)
      
    // Special betting types
    case 'Macau':
      return betNumbers.every(num => winningNumbers.includes(num))
      
    // BBFS betting types
    case 'BBFS 2D':
      return checkBBFS2D(betNumStr, winNumStr.slice(-2))
      
    case 'BBFS 3D':
      return checkBBFS3D(betNumStr, winNumStr.slice(-3))
      
    case 'BBFS 4D':
      return checkBBFS4D(betNumStr, winNumStr)
      
    default:
      return false
  }
}

// Helper functions for specific betting types
function check5050(betChoice: string, winNumStr: string): boolean {
  const last2Digits = parseInt(winNumStr.slice(-2))
  const isGanjil = last2Digits % 2 === 1
  const isGenap = !isGanjil
  const isBesar = last2Digits >= 50
  const isKecil = !isBesar
  
  const choice = betChoice.toUpperCase()
  
  if (choice === 'G' || choice === 'GANJIL') return isGanjil
  if (choice === 'GENAP') return isGenap
  if (choice === 'B' || choice === 'BESAR') return isBesar
  if (choice === 'K' || choice === 'KECIL') return isKecil
  
  // Combined choices
  if (choice === 'GB') return isGanjil && isBesar
  if (choice === 'GK') return isGanjil && isKecil
  if (choice === 'BB') return isGenap && isBesar
  if (choice === 'BK') return isGenap && isKecil
  
  return false
}

function checkShio(shioNum: number, winNumStr: string): boolean {
  const last2Digits = parseInt(winNumStr.slice(-2))
  const shioMapping = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  ]
  return shioMapping[last2Digits] === shioNum
}

function checkTengahTepi(last2Digits: number): boolean {
  return last2Digits >= 25 && last2Digits <= 74
}

function checkDasar(betChoice: string, winNumStr: string): boolean {
  const last2Digits = parseInt(winNumStr.slice(-2))
  const isGanjil = last2Digits % 2 === 1
  const isGenap = !isGanjil
  const isBesar = last2Digits >= 50
  const isKecil = !isBesar
  
  const choice = betChoice.toUpperCase()
  
  if (choice === 'GB') return isGanjil && isBesar
  if (choice === 'GK') return isGanjil && isKecil
  if (choice === 'BB') return isGenap && isBesar
  if (choice === 'BK') return isGenap && isKecil
  
  return false
}

function checkBBFS2D(betNumStr: string, winLast2Digits: string): boolean {
  // Check all permutations for BBFS 2D
  const permutations = [betNumStr, betNumStr.split('').reverse().join('')]
  return permutations.includes(winLast2Digits)
}

function checkBBFS3D(betNumStr: string, winLast3Digits: string): boolean {
  // Check all 6 permutations for BBFS 3D
  const digits = betNumStr.split('')
  const permutations = []
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (i !== j && i !== k && j !== k) {
          permutations.push(digits[i] + digits[j] + digits[k])
        }
      }
    }
  }
  
  return permutations.includes(winLast3Digits)
}

function checkBBFS4D(betNumStr: string, winNumStr: string): boolean {
  // Check all 24 permutations for BBFS 4D
  const digits = betNumStr.split('')
  const permutations = []
  
  // Generate all permutations of 4 digits
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        for (let l = 0; l < 4; l++) {
          if (i !== j && i !== k && i !== l && j !== k && j !== l && k !== l) {
            permutations.push(digits[i] + digits[j] + digits[k] + digits[l])
          }
        }
      }
    }
  }
  
  return permutations.includes(winNumStr)
}

function calculateWinAmount(betAmount: number, betType: string): number {
  // Prize multipliers matching frontend configuration
  const multipliers = {
    // Basic betting types
    '2D': 70,
    '3D': 400,
    '4D': 3000,
    '2D Depan': 70,
    '2D Tengah': 70,
    '2D Belakang': 70,
    
    // Colok betting types
    'Colok Bebas': 1.5,
    'Colok Bebas 2D': 6,
    'Colok Naga': 20,
    'Colok Jitu': 8,
    
    // Combination betting types
    '50:50': 1.9,
    'Shio': 9,
    'Tengah Tepi': 1.8,
    'Dasar': 1.5,
    
    // Special betting types
    'Macau': 6,
    
    // BBFS betting types
    'BBFS 2D': 35,
    'BBFS 3D': 200,
    'BBFS 4D': 1500
  }
  
  const multiplier = multipliers[betType as keyof typeof multipliers] || 1
  return Math.floor(betAmount * multiplier)
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