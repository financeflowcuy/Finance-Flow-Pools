import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const reports = {
      revenue: [
        { date: '2025-10-01', revenue: 8500000, bets: 156, users: 45 },
        { date: '2025-10-02', revenue: 9200000, bets: 178, users: 52 },
        { date: '2025-10-03', revenue: 7800000, bets: 142, users: 38 }
      ],
      users: [
        { date: '2025-10-01', newUsers: 12, totalUsers: 1100 },
        { date: '2025-10-02', newUsers: 18, totalUsers: 1118 }
      ]
    }

    return NextResponse.json({
      success: true,
      data: reports[type as keyof typeof reports] || [],
      type
    })

  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}