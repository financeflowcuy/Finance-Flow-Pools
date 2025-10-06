import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const mockAuditLogs = [
      {
        id: 1,
        action: 'user_register',
        username: 'new_user123',
        data: { username: 'new_user123', email: 'newuser@example.com' },
        ip: '192.168.1.100',
        timestamp: '2025-10-06T14:35:00Z',
        status: 'success'
      },
      {
        id: 2,
        action: 'bet_placed',
        username: 'john_doe',
        data: { type: '4D', numbers: '8249', amount: 50000 },
        ip: '192.168.1.100',
        timestamp: '2025-10-06T14:32:15Z',
        status: 'success'
      }
    ]

    return NextResponse.json({
      success: true,
      logs: mockAuditLogs,
      stats: {
        total: mockAuditLogs.length,
        today: mockAuditLogs.length
      }
    })

  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}