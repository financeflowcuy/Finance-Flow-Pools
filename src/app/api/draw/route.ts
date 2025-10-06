import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would fetch from database
    // For demo purposes, return mock draw results
    const mockDraws = [
      {
        id: 5,
        numbers: [8, 2, '-', 4, 9, 0, 1],
        time: '02:32:06',
        date: '6/10/2025',
        timestamp: '2025-10-06T02:32:06Z',
        status: 'COMPLETED'
      },
      {
        id: 4,
        numbers: [3, 7, '-', 1, 5, 2, 8],
        time: '01:57:08',
        date: '6/10/2025',
        timestamp: '2025-10-06T01:57:08Z',
        status: 'COMPLETED'
      },
      {
        id: 3,
        numbers: [9, 4, '-', 6, 3, 7, 2],
        time: '01:22:15',
        date: '6/10/2025',
        timestamp: '2025-10-06T01:22:15Z',
        status: 'COMPLETED'
      },
      {
        id: 2,
        numbers: [5, 1, '-', 8, 4, 6, 3],
        time: '00:47:22',
        date: '6/10/2025',
        timestamp: '2025-10-06T00:47:22Z',
        status: 'COMPLETED'
      },
      {
        id: 1,
        numbers: [2, 6, '-', 7, 9, 5, 4],
        time: '00:12:39',
        date: '6/10/2025',
        timestamp: '2025-10-06T00:12:39Z',
        status: 'COMPLETED'
      }
    ]

    // Calculate next draw time (every 30 minutes)
    const now = new Date()
    const nextDraw = new Date(now.getTime() + 30 * 60 * 1000)
    const timeUntilNextDraw = Math.floor((nextDraw.getTime() - now.getTime()) / 1000)

    return NextResponse.json({
      success: true,
      draws: mockDraws,
      nextDraw: {
        time: nextDraw.toISOString(),
        countdown: timeUntilNextDraw,
        drawNumber: 6
      },
      todayStats: {
        totalDraws: 5,
        totalBets: 0,
        totalWinnings: 0,
        activeUsers: 0
      }
    })

  } catch (error) {
    console.error('Draw API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // In a real application, this would trigger a new draw
    // For demo purposes, generate random numbers
    
    const generateDrawNumbers = () => {
      const numbers = []
      for (let i = 0; i < 7; i++) {
        if (i === 2) {
          numbers.push('-')
        } else {
          numbers.push(Math.floor(Math.random() * 10))
        }
      }
      return numbers
    }

    const newDraw = {
      id: 6,
      numbers: generateDrawNumbers(),
      time: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      date: new Date().toLocaleDateString('id-ID'),
      timestamp: new Date().toISOString(),
      status: 'COMPLETED'
    }

    return NextResponse.json({
      success: true,
      draw: newDraw,
      message: 'Live draw completed successfully'
    })

  } catch (error) {
    console.error('Create draw API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}