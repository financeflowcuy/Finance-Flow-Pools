import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get recent completed draws
    const recentDraws = await db.lotteryDraw.findMany({
      where: { isCompleted: true },
      orderBy: { drawTime: 'desc' },
      take: 3,
      select: {
        id: true,
        numbers: true,
        drawTime: true,
        betType: true,
      }
    })

    // Get total users count
    const totalUsers = await db.user.count({
      where: { isActive: true, isAdmin: false }
    })

    // Get total bets amount
    const totalBets = await db.bet.aggregate({
      _sum: { amount: true }
    })

    // Get total winnings
    const totalWinnings = await db.winning.aggregate({
      _sum: { amount: true }
    })

    // Get active announcements
    const announcements = await db.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get system settings
    const systemSettings = await db.systemSettings.findMany({
      where: { key: { in: ['system_status', 'draw_interval_minutes'] } }
    })

    const settings = systemSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Format draws data
    const formattedDraws = recentDraws.map((draw, index) => ({
      draw: recentDraws.length - index,
      numbers: JSON.parse(draw.numbers),
      time: new Date(draw.drawTime).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '/')
    }))

    return NextResponse.json({
      success: true,
      data: {
        recentDraws: formattedDraws,
        totalUsers,
        totalBets: totalBets._sum.amount || 0,
        totalWinnings: totalWinnings._sum.amount || 0,
        announcements,
        systemStatus: settings.system_status || 'active',
        drawInterval: parseInt(settings.draw_interval_minutes || '5'),
      }
    })

  } catch (error) {
    console.error('Error fetching landing data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing data' },
      { status: 500 }
    )
  }
}