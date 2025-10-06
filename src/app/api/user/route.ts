import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        balance: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bets: true,
            winnings: true
          }
        }
      }
    })

    return user
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin users should use admin panel' },
        { status: 403 }
      )
    }

    // Get additional stats
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

    const winRate = user._count.bets > 0 
      ? (user._count.winnings / user._count.bets) * 100 
      : 0

    const userData = {
      id: user.id,
      username: user.name || user.email.split('@')[0],
      email: user.email,
      phone: user.phone,
      fullName: user.name,
      balance: user.balance,
      memberSince: user.createdAt.toISOString().split('T')[0],
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
      level: 'PREMIUM', // Could be determined by total bets/winnings
      totalBets: user._count.bets,
      totalWinnings: totalWinningsAmount._sum.amount || 0,
      totalBetAmount: totalBetsAmount._sum.amount || 0,
      winRate: parseFloat(winRate.toFixed(1))
    }

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, amount } = body

    if (action === 'WITHDRAW') {
      if (amount > user.balance) {
        return NextResponse.json(
          { success: false, error: 'Insufficient balance' },
          { status: 400 }
        )
      }

      const newBalance = user.balance - amount
      
      // Update user balance
      await db.user.update({
        where: { id: user.id },
        data: { balance: newBalance }
      })

      // Log the transaction
      await db.auditLog.create({
        data: {
          action: 'user_withdrawal',
          userId: user.id,
          data: JSON.stringify({ amount, newBalance, timestamp: new Date().toISOString() }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })
      
      return NextResponse.json({
        success: true,
        newBalance,
        transactionId: `TXN${Date.now()}`,
        message: `Withdrawal of Rp ${amount.toLocaleString()} successful`
      })
    }

    if (action === 'DEPOSIT') {
      const newBalance = user.balance + amount
      
      // Update user balance
      await db.user.update({
        where: { id: user.id },
        data: { balance: newBalance }
      })

      // Log the transaction
      await db.auditLog.create({
        data: {
          action: 'user_deposit',
          userId: user.id,
          data: JSON.stringify({ amount, newBalance, timestamp: new Date().toISOString() }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })
      
      return NextResponse.json({
        success: true,
        newBalance,
        transactionId: `TXN${Date.now()}`,
        message: `Deposit of Rp ${amount.toLocaleString()} successful`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('User update API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}