import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { betType, betNumber, betAmount, userId } = body

    // Validation
    if (!betType || !betNumber || !betAmount || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate bet type
    if (!['2D', '3D', '4D'].includes(betType)) {
      return NextResponse.json(
        { error: 'Invalid bet type' },
        { status: 400 }
      )
    }

    // Validate number length
    const expectedLength = parseInt(betType)
    if (betNumber.length !== expectedLength || !/^\d+$/.test(betNumber)) {
      return NextResponse.json(
        { error: `Invalid ${betType} number format` },
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
    const multipliers = { '2D': 70, '3D': 400, '4D': 3000 }
    const potentialWinning = amount * multipliers[betType as keyof typeof multipliers]

    return NextResponse.json({
      success: true,
      betId,
      betType,
      betNumber,
      betAmount: amount,
      potentialWinning,
      drawNumber,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    })

  } catch (error) {
    console.error('Bet API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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