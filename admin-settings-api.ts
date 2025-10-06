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

    // Get system settings
    const settings = {
      maintenance: false,
      freezeBetting: false,
      minBet: 1000,
      maxBet: 10000000,
      // Add other settings as needed
    }

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    if (!authenticate(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action, data } = await request.json()

    switch (action) {
      case 'fixBalance':
        // Fix balance consistency
        const duplicateUsers = await db.$queryRaw`
          SELECT email, COUNT(*) as count, GROUP_CONCAT(id) as ids
          FROM User 
          GROUP BY email 
          HAVING COUNT(*) > 1
        `

        let fixedUsers = 0

        for (const duplicate of duplicateUsers as any[]) {
          const userIds = duplicate.ids.split(',').map((id: string) => id.trim())
          
          const userRecords = await db.user.findMany({
            where: { 
              email: duplicate.email,
              id: { in: userIds }
            },
            orderBy: { updatedAt: 'desc' }
          })
          
          if (userRecords.length > 1) {
            const primaryUser = userRecords[0]
            const duplicateRecords = userRecords.slice(1)
            
            for (const duplicateRecord of duplicateRecords) {
              await db.bet.updateMany({
                where: { userId: duplicateRecord.id },
                data: { userId: primaryUser.id }
              })
              
              await db.winning.updateMany({
                where: { userId: duplicateRecord.id },
                data: { userId: primaryUser.id }
              })
              
              await db.auditLog.updateMany({
                where: { userId: duplicateRecord.id },
                data: { userId: primaryUser.id }
              })
              
              const newBalance = Math.max(primaryUser.balance, duplicateRecord.balance)
              if (newBalance !== primaryUser.balance) {
                await db.user.update({
                  where: { id: primaryUser.id },
                  data: { balance: newBalance }
                })
              }
              
              await db.user.delete({
                where: { id: duplicateRecord.id }
              })
            }
            
            fixedUsers++
          }
        }

        // Fix demo-user
        const demoUser = await db.user.findFirst({
          where: { email: 'demo-user' },
          include: {
            bets: { select: { amount: true } },
            winnings: { select: { amount: true } }
          }
        })

        let demoUserFixed = false
        if (demoUser) {
          const totalBets = demoUser.bets.reduce((sum, bet) => sum + bet.amount, 0)
          const totalWinnings = demoUser.winnings.reduce((sum, win) => sum + win.amount, 0)
          const startingBalance = 1000000
          const expectedBalance = startingBalance - totalBets + totalWinnings
          
          if (Math.abs(expectedBalance - demoUser.balance) > 0) {
            await db.user.update({
              where: { id: demoUser.id },
              data: { balance: expectedBalance }
            })
            demoUserFixed = true
          }
        }

        await db.auditLog.create({
          data: {
            action: 'balance_fix_applied',
            userId: demoUser?.id || null,
            data: JSON.stringify({
              timestamp: new Date().toISOString(),
              duplicateUsersFixed: fixedUsers,
              demoUserFixed,
              demoUserEmail: demoUser?.email,
              newBalance: demoUser?.balance
            }),
            ipAddress: 'system',
            userAgent: 'balance-fix-script'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Balance fix completed',
          data: {
            duplicateUsersFixed: fixedUsers,
            demoUserFixed,
            demoUserBalance: demoUser?.balance || 0
          }
        })

      case 'resetUserBalance':
        const { userId, amount } = data
        await db.user.update({
          where: { id: userId },
          data: { balance: amount }
        })
        
        return NextResponse.json({
          success: true,
          message: 'User balance reset successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}