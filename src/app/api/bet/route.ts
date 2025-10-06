import { NextRequest, NextResponse } from 'next/server'

// Betting types configuration
const bettingTypes = {
  basic: [
    { type: '2D', prize: 70, maxLength: 2 },
    { type: '3D', prize: 400, maxLength: 3 },
    { type: '4D', prize: 3000, maxLength: 4 }
  ],
  colok: [
    { type: 'Colok Bebas', prize: 1.5, maxLength: 1 },
    { type: 'Colok Bebas 2D', prize: 6, maxLength: 2 },
    { type: 'Colok Naga', prize: 20, maxLength: 3 },
    { type: 'Colok Jitu', prize: 8, maxLength: 1 }
  ],
  kombinasi: [
    { type: '50:50', prize: 1.9, maxLength: 1 },
    { type: 'Shio', prize: 9, maxLength: 2 },
    { type: 'Tengah Tepi', prize: 1.8, maxLength: 2 },
    { type: 'Dasar', prize: 1.5, maxLength: 1 }
  ],
  spesial: [
    { type: '2D Depan', prize: 70, maxLength: 2 },
    { type: '2D Tengah', prize: 70, maxLength: 2 },
    { type: '2D Belakang', prize: 70, maxLength: 2 },
    { type: 'Macau', prize: 6, maxLength: 2 },
    { type: 'BBFS 2D', prize: 35, maxLength: 2 },
    { type: 'BBFS 3D', prize: 200, maxLength: 3 },
    { type: 'BBFS 4D', prize: 1500, maxLength: 4 }
  ]
}

// Get all betting types
const allBettingTypes = Object.values(bettingTypes).flat()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { betType, betNumber, betAmount, userId, betCategory } = body

    // Validation
    if (!betType || !betNumber || !betAmount || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate bet type
    const betTypeConfig = allBettingTypes.find(bt => bt.type === betType)
    if (!betTypeConfig) {
      return NextResponse.json(
        { error: 'Invalid bet type' },
        { status: 400 }
      )
    }

    // Validate number format based on bet type
    let validationResult = validateBetNumber(betType, betNumber)
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }

    // Validate amount
    const amount = parseInt(betAmount)
    if (isNaN(amount) || amount < 1000) {
      return NextResponse.json(
        { error: 'Minimum bet amount is Rp 1,000' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Check user balance
    // 2. Deduct balance from user account
    // 3. Save bet to database
    // 4. Generate bet ID
    
    // For demo purposes, we'll simulate a successful bet
    const betId = `BET${Date.now()}`
    const drawNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    // Calculate potential winnings
    const potentialWinning = Math.floor(amount * betTypeConfig.prize)

    return NextResponse.json({
      success: true,
      betId,
      betType,
      betNumber,
      betAmount: amount,
      potentialWinning,
      drawNumber,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      betCategory
    })

  } catch (error) {
    console.error('Bet API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Validation function for different bet types
function validateBetNumber(betType: string, betNumber: string): { isValid: boolean; error?: string } {
  const betTypeConfig = allBettingTypes.find(bt => bt.type === betType)
  
  switch (betType) {
    case '2D':
    case '3D':
    case '4D':
    case '2D Depan':
    case '2D Tengah':
    case '2D Belakang':
    case 'Colok Bebas 2D':
    case 'Colok Naga':
    case 'Macau':
    case 'BBFS 2D':
    case 'BBFS 3D':
    case 'BBFS 4D':
      if (!/^\d+$/.test(betNumber)) {
        return { isValid: false, error: 'Number must contain only digits' }
      }
      if (betNumber.length !== betTypeConfig?.maxLength) {
        return { isValid: false, error: `Invalid number length. Expected ${betTypeConfig?.maxLength} digits` }
      }
      
      // Additional validation for BBFS - check for unique digits
      if (betType.startsWith('BBFS')) {
        const uniqueDigits = new Set(betNumber.split(''))
        if (uniqueDigits.size !== betNumber.length) {
          return { isValid: false, error: 'BBFS numbers must contain unique digits' }
        }
      }
      break
      
    case 'Colok Bebas':
    case 'Colok Jitu':
      if (!/^\d+$/.test(betNumber)) {
        return { isValid: false, error: 'Number must contain only digits' }
      }
      if (betNumber.length !== 1) {
        return { isValid: false, error: 'Please enter 1 digit' }
      }
      break
      
    case '50:50':
      const valid5050 = ['G', 'Genap', 'B', 'Besar', 'K', 'Kecil', 'GB', 'GK', 'BB', 'BK']
      if (!valid5050.includes(betNumber.toUpperCase())) {
        return { isValid: false, error: 'Invalid choice. Use: G/Genap, B/Besar, K/Kecil, or combinations like GB, GK' }
      }
      break
      
    case 'Shio':
      const shioNum = parseInt(betNumber)
      if (isNaN(shioNum) || shioNum < 1 || shioNum > 12) {
        return { isValid: false, error: 'Shio must be between 1 and 12' }
      }
      break
      
    case 'Tengah Tepi':
      const validTT = ['Tengah', 'Tepi', 'T', 'TP']
      if (!validTT.includes(betNumber)) {
        return { isValid: false, error: 'Invalid choice. Use: Tengah or Tepi' }
      }
      break
      
    case 'Dasar':
      const validDasar = ['GB', 'GK', 'BB', 'BK']
      if (!validDasar.includes(betNumber.toUpperCase())) {
        return { isValid: false, error: 'Invalid choice. Use: GB (Ganjil Besar), GK (Ganjil Kecil), BB (Genap Besar), BK (Genap Kecil)' }
      }
      break
      
    default:
      return { isValid: false, error: 'Invalid bet type' }
  }
  
  return { isValid: true }
}

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would fetch from database
    // For demo purposes, return mock betting history
    const mockBets = [
      {
        id: 'BET1728123456789',
        type: '2D',
        numbers: '82',
        amount: 5000,
        result: 'WIN',
        winning: 350000,
        drawNumber: '8249',
        timestamp: '2025-10-06T01:30:00Z'
      },
      {
        id: 'BET1728123456788',
        type: '3D',
        numbers: '824',
        amount: 10000,
        result: 'LOSE',
        winning: 0,
        drawNumber: '3715',
        timestamp: '2025-10-06T01:15:00Z'
      },
      {
        id: 'BET1728123456787',
        type: '4D',
        numbers: '8249',
        amount: 5000,
        result: 'WIN',
        winning: 15000000,
        drawNumber: '8249',
        timestamp: '2025-10-06T00:45:00Z'
      }
    ]

    return NextResponse.json({
      success: true,
      bets: mockBets
    })

  } catch (error) {
    console.error('Get bets API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}