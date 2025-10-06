import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const mockWithdrawals = [
      {
        id: 1,
        userId: 3,
        username: 'winner456',
        amount: 2500000,
        bank: 'BCA',
        accountName: 'Winner King',
        accountNumber: '1234567890',
        status: 'pending',
        createdAt: '2025-10-06T13:45:20Z'
      },
      {
        id: 2,
        userId: 2,
        username: 'player123',
        amount: 1500000,
        bank: 'Mandiri',
        accountName: 'Player One',
        accountNumber: '0987654321',
        status: 'approved',
        createdAt: '2025-10-06T12:30:15Z'
      }
    ]

    return NextResponse.json({
      success: true,
      withdrawals: mockWithdrawals,
      stats: {
        total: mockWithdrawals.length,
        pending: mockWithdrawals.filter(w => w.status === 'pending').length,
        approved: mockWithdrawals.filter(w => w.status === 'approved').length
      }
    })

  } catch (error) {
    console.error('Admin withdrawals API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}