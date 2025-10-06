import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple admin authentication
const ADMIN_KEY = process.env.ADMIN_KEY || 'batik-admin-2024'

function authenticate(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const apiKey = request.headers.get('x-admin-key')
  
  return authHeader === `Bearer ${ADMIN_KEY}` || apiKey === ADMIN_KEY
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    if (!authenticate(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get overall statistics
    const [
      totalUsers,
      totalBets,
      totalWinnings,
      completedDraws,
      pendingBets,
      topUsers,
      recentBets,
      recentDraws,
      todayStats,
      auditLogs
    ] = await Promise.all([
      db.user.count(),
      db.bet.count(),
      db.winning.aggregate({ _sum: { amount: true } }),
      db.lotteryDraw.count({ where: { isCompleted: true } }),
      db.bet.count({ where: { status: 'pending' } }),
      
      // Top users by balance
      db.user.findMany({
        orderBy: { balance: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          balance: true,
          createdAt: true
        }
      }),
      
      // Recent bets
      db.bet.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          }
        }
      }),
      
      // Recent draws
      db.lotteryDraw.findMany({
        where: { isCompleted: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          numbers: true,
          betType: true,
          createdAt: true
        }
      }),
      
      // Today's stats
      db.bet.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _count: { id: true },
        _sum: { amount: true }
      }),
      
      // Recent audit logs
      db.auditLog.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    ])

    // Get today's winnings
    const todayWinnings = await db.winning.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: { amount: true }
    })

    // Get today's new users
    const todayNewUsers = await db.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    // Get today's draws
    const todayDraws = await db.lotteryDraw.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        },
        isCompleted: true
      }
    })

    const dashboard = {
      overview: {
        totalUsers,
        totalBets,
        totalWinnings: totalWinnings._sum.amount || 0,
        completedDraws,
        pendingBets
      },
      todayStats: {
        bets: todayStats._count.id,
        winnings: todayWinnings._sum.amount || 0,
        newUsers: todayNewUsers,
        draws: todayDraws
      },
      topUsers,
      recentBets: recentBets.map(bet => ({
        id: bet.id,
        user: bet.user.name || bet.user.email,
        numbers: bet.numbers,
        betType: bet.betType,
        amount: bet.amount,
        status: bet.status,
        createdAt: bet.createdAt
      })),
      recentDraws: recentDraws.map(draw => ({
        id: draw.id,
        numbers: draw.numbers,
        betType: draw.betType,
        drawTime: draw.createdAt
      })),
      auditLogs
    }

    return NextResponse.json({
      success: true,
      dashboard
    })

  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}