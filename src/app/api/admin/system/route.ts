import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get system settings
    const settings = await db.systemSettings.findMany()
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Get real-time stats
    const [
      totalUsers,
      activeUsers,
      totalBets,
      pendingBets,
      todayBets,
      todayUsers,
      totalBetAmount,
      totalWinningAmount,
      recentDraws
    ] = await Promise.all([
      db.user.count({ where: { isAdmin: false } }),
      db.user.count({ where: { isAdmin: false, isActive: true } }),
      db.bet.count(),
      db.bet.count({ where: { status: 'pending' } }),
      db.bet.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      db.user.count({
        where: {
          isAdmin: false,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      db.bet.aggregate({
        _sum: { amount: true }
      }),
      db.winning.aggregate({
        _sum: { amount: true }
      }),
      db.lotteryDraw.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    // Get today's revenue
    const todayBetAmount = await db.bet.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: { amount: true }
    })

    const todayWinningAmount = await db.winning.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: { amount: true }
    })

    const todayRevenue = (todayBetAmount._sum.amount || 0) - (todayWinningAmount._sum.amount || 0)

    const systemStatus = {
      bettingOpen: settingsMap.system_status !== 'closed',
      maintenanceMode: settingsMap.system_status === 'maintenance',
      systemHealth: 'good', // Could be determined by various factors
      uptime: process.uptime() + ' seconds',
      version: '1.0.0',
      
      stats: {
        totalUsers,
        activeUsers,
        totalBets,
        totalRevenue: (totalBetAmount._sum.amount || 0) - (totalWinningAmount._sum.amount || 0),
        pendingWithdrawals: 0, // Not implemented yet
        todayRevenue,
        todayBets,
        todayUsers,
        todayDraws: recentDraws
      }
    }

    return NextResponse.json({
      success: true,
      system: systemStatus,
      settings: settingsMap
    })

  } catch (error) {
    console.error('System status API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, settings } = await request.json()

    if (action === 'update_settings') {
      const updatePromises = Object.entries(settings).map(([key, value]) =>
        db.systemSettings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), description: `Updated via admin panel` }
        })
      )

      await Promise.all(updatePromises)

      // Log the action
      await db.auditLog.create({
        data: {
          action: 'admin_settings_update',
          data: JSON.stringify({ settings, timestamp: new Date().toISOString() }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully'
      })
    }

    if (action === 'toggle_betting') {
      const currentStatus = await db.systemSettings.findUnique({
        where: { key: 'system_status' }
      })

      const newStatus = currentStatus?.value === 'closed' ? 'active' : 'closed'

      await db.systemSettings.upsert({
        where: { key: 'system_status' },
        update: { value: newStatus },
        create: { key: 'system_status', value: newStatus, description: 'System operational status' }
      })

      // Log the action
      await db.auditLog.create({
        data: {
          action: 'admin_betting_toggle',
          data: JSON.stringify({ newStatus, timestamp: new Date().toISOString() }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        message: `Betting ${newStatus === 'closed' ? 'disabled' : 'enabled'} successfully`,
        newStatus
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('System action error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}