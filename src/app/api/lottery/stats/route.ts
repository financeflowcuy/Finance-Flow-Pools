import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get overall statistics
    const [
      totalUsers,
      totalBets,
      totalWinnings,
      totalDraws,
      recentDraws,
      betTypeStats,
      numberFrequency
    ] = await Promise.all([
      // Total users
      db.user.count(),
      
      // Total bets
      db.bet.count(),
      
      // Total winnings amount
      db.winning.aggregate({
        _sum: { amount: true }
      }),
      
      // Total draws
      db.lotteryDraw.count({
        where: { isCompleted: true }
      }),
      
      // Recent draws with numbers
      db.lotteryDraw.findMany({
        where: { isCompleted: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          numbers: true,
          betType: true,
          createdAt: true
        }
      }),
      
      // Bet type statistics
      db.bet.groupBy({
        by: ['betType'],
        _count: { id: true },
        _sum: { amount: true }
      }),
      
      // Number frequency from recent draws
      db.lotteryDraw.findMany({
        where: { isCompleted: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { numbers: true }
      })
    ])

    // Calculate number frequency
    const frequencyMap: { [key: number]: number } = {}
    recentDraws.forEach(draw => {
      const numbers = JSON.parse(draw.numbers)
      numbers.forEach((num: number) => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1
      })
    })

    const numberFrequencyArray = Object.entries(frequencyMap)
      .map(([num, count]) => ({
        number: parseInt(num),
        frequency: count,
        percentage: ((count / recentDraws.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.frequency - a.frequency)

    // Calculate win rate
    const wonBets = await db.bet.count({
      where: { status: 'won' }
    })
    const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(1) : '0'

    // Calculate average bet amount
    const avgBetResult = await db.bet.aggregate({
      _avg: { amount: true }
    })

    // Get today's activity
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayBets = await db.bet.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    const todayWinnings = await db.winning.aggregate({
      where: {
        createdAt: {
          gte: today
        }
      },
      _sum: { amount: true }
    })

    // Get hourly activity for the last 24 hours
    const hourlyActivity = []
    for (let i = 23; i >= 0; i--) {
      const hour = new Date()
      hour.setHours(hour.getHours() - i)
      hour.setMinutes(0, 0, 0)
      
      const nextHour = new Date(hour)
      nextHour.setHours(nextHour.getHours() + 1)
      
      const betsInHour = await db.bet.count({
        where: {
          createdAt: {
            gte: hour,
            lt: nextHour
          }
        }
      })
      
      hourlyActivity.push({
        hour: hour.getHours(),
        bets: betsInHour
      })
    }

    const statistics = {
      overview: {
        totalUsers,
        totalBets,
        totalWinnings: totalWinnings._sum.amount || 0,
        totalDraws,
        winRate: parseFloat(winRate),
        averageBet: avgBetResult._avg.amount || 0,
        todayBets,
        todayWinnings: todayWinnings._sum.amount || 0
      },
      betTypeStats: betTypeStats.map(stat => ({
        type: stat.betType,
        count: stat._count.id,
        totalAmount: stat._sum.amount || 0
      })),
      numberFrequency: numberFrequencyArray,
      hourlyActivity,
      recentDraws: recentDraws.map(draw => ({
        numbers: JSON.parse(draw.numbers),
        betType: draw.betType,
        time: draw.createdAt
      })),
      topWinners: await getTopWinners(),
      securityMetrics: await getSecurityMetrics()
    }

    return NextResponse.json({
      success: true,
      statistics
    })

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get statistics' },
      { status: 500 }
    )
  }
}

async function getTopWinners() {
  try {
    const topWinners = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        winnings: {
          select: {
            amount: true
          }
        },
        bets: {
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        balance: 'desc'
      },
      take: 10
    })

    return topWinners.map(user => ({
      id: user.id,
      name: user.name || user.email,
      balance: user.balance,
      totalWinnings: user.winnings.reduce((sum, w) => sum + w.amount, 0),
      totalBets: user.bets.reduce((sum, b) => sum + b.amount, 0),
      profit: user.balance - 1000000 // Assuming starting balance
    })).sort((a, b) => b.profit - a.profit)

  } catch (error) {
    console.error('Error getting top winners:', error)
    return []
  }
}

async function getSecurityMetrics() {
  try {
    const [
      totalAuditLogs,
      recentSecurityEvents,
      verificationAttempts
    ] = await Promise.all([
      db.auditLog.count(),
      db.auditLog.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      db.auditLog.groupBy({
        by: ['action'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _count: { id: true }
      })
    ])

    return {
      totalAuditLogs,
      recentEvents: recentSecurityEvents.map(log => ({
        action: log.action,
        timestamp: log.createdAt,
        userId: log.userId
      })),
      verificationAttempts: verificationAttempts.map(stat => ({
        action: stat.action,
        count: stat._count.id
      }))
    }

  } catch (error) {
    console.error('Error getting security metrics:', error)
    return {
      totalAuditLogs: 0,
      recentEvents: [],
      verificationAttempts: []
    }
  }
}