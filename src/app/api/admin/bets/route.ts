import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    // Get bets with pagination
    const [bets, totalCount] = await Promise.all([
      db.bet.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          draw: {
            select: {
              id: true,
              numbers: true,
              drawTime: true
            }
          },
          winning: {
            select: {
              amount: true,
              numbers: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.bet.count({ where })
    ])

    // Format bets data
    const formattedBets = bets.map(bet => ({
      id: bet.id,
      userId: bet.userId,
      username: bet.user.name || bet.user.email.split('@')[0],
      userEmail: bet.user.email,
      type: bet.betType,
      numbers: bet.numbers,
      amount: bet.amount,
      status: bet.status,
      winning: bet.winning?.amount || 0,
      winningNumbers: bet.winning?.numbers || null,
      drawNumbers: bet.draw?.numbers || null,
      drawTime: bet.draw?.drawTime || null,
      createdAt: bet.createdAt
    }))

    // Get stats
    const [totalBets, pendingBets, wonBets, lostBets] = await Promise.all([
      db.bet.count(),
      db.bet.count({ where: { status: 'pending' } }),
      db.bet.count({ where: { status: 'won' } }),
      db.bet.count({ where: { status: 'lost' } })
    ])

    // Get total bet amounts
    const [totalBetAmount, totalWinningAmount] = await Promise.all([
      db.bet.aggregate({
        _sum: { amount: true }
      }),
      db.winning.aggregate({
        _sum: { amount: true }
      })
    ])

    return NextResponse.json({
      success: true,
      bets: formattedBets,
      stats: {
        total: totalBets,
        pending: pendingBets,
        won: wonBets,
        lost: lostBets,
        totalBetAmount: totalBetAmount._sum.amount || 0,
        totalWinningAmount: totalWinningAmount._sum.amount || 0
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Admin bets API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { betId, action } = await request.json()

    if (!betId || !action) {
      return NextResponse.json(
        { success: false, error: 'Bet ID and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'approve':
        updateData = { status: 'won' }
        break
      case 'reject':
        updateData = { status: 'lost' }
        break
      case 'refund':
        updateData = { status: 'refunded' }
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedBet = await db.bet.update({
      where: { id: betId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            balance: true
          }
        }
      }
    })

    // If refunding, add amount back to user balance
    if (action === 'refund') {
      await db.user.update({
        where: { id: updatedBet.userId },
        data: {
          balance: {
            increment: updatedBet.amount
          }
        }
      })
    }

    // Log the action
    await db.auditLog.create({
      data: {
        action: `admin_bet_${action}`,
        userId: updatedBet.userId,
        data: JSON.stringify({ 
          betId, 
          action, 
          amount: updatedBet.amount,
          timestamp: new Date().toISOString() 
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      bet: updatedBet,
      message: `Bet ${action} completed successfully`
    })

  } catch (error) {
    console.error('Admin bet action error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}