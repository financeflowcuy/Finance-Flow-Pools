import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isAdmin: false // Exclude admin users
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.isActive = status === 'active'
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          balance: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bets: true,
              winnings: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [totalBetsAmount, totalWinningsAmount] = await Promise.all([
          db.bet.aggregate({
            where: { userId: user.id },
            _sum: { amount: true }
          }),
          db.winning.aggregate({
            where: { userId: user.id },
            _sum: { amount: true }
          })
        ])

        return {
          id: user.id,
          username: user.name || user.email.split('@')[0],
          email: user.email,
          fullName: user.name,
          phone: user.phone,
          balance: user.balance,
          status: user.isActive ? 'active' : 'blocked',
          joinDate: user.createdAt.toISOString().split('T')[0],
          lastLogin: user.updatedAt.toISOString(),
          totalBets: user._count.bets,
          totalWinnings: totalWinningsAmount._sum.amount || 0,
          totalDeposits: 0, // Not tracked in current schema
          totalWithdrawals: 0, // Not tracked in current schema
          ip: 'Unknown', // Not tracked in current schema
          kycStatus: 'unverified' // Not implemented in current schema
        }
      })
    )

    // Get overall stats
    const [totalUsers, activeUsers, blockedUsers] = await Promise.all([
      db.user.count({ where: { isAdmin: false } }),
      db.user.count({ where: { isAdmin: false, isActive: true } }),
      db.user.count({ where: { isAdmin: false, isActive: false } })
    ])

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      stats: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'toggle_status':
        updateData = { isActive: !data.isActive }
        break
      case 'update_balance':
        if (!data.balance || data.balance < 0) {
          return NextResponse.json(
            { success: false, error: 'Valid balance is required' },
            { status: 400 }
          )
        }
        updateData = { balance: data.balance }
        break
      case 'update_profile':
        updateData = {
          name: data.name,
          phone: data.phone
        }
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        balance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        action: `admin_user_${action}`,
        userId: userId,
        data: JSON.stringify({ 
          previousData: data, 
          newData: updateData, 
          timestamp: new Date().toISOString() 
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${action} completed successfully`
    })

  } catch (error) {
    console.error('Admin user action error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}