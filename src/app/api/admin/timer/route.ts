import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Global timer state and maintenance
let globalTimer = {
  startTime: Date.now(),
  duration: 5 * 60 * 1000, // 5 minutes
  drawNumber: 1,
  isPaused: false,
  isMaintenance: false,
  maintenanceMessage: '',
  maintenanceStartTime: null as Date | null,
  pausedBy: '',
  pausedAt: null as Date | null
}

// Load timer state
function loadTimer() {
  return globalTimer
}

function saveTimer() {
  // In production, save to database
  // For now, keep in memory
}

// Create audit log
async function createAuditLog(action: string, userId: string, data: any, request: NextRequest) {
  try {
    await db.auditLog.create({
      data: {
        action,
        userId,
        data: JSON.stringify(data),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const timer = loadTimer()
    const now = Date.now()
    const elapsed = now - timer.startTime
    const remaining = Math.max(0, timer.duration - elapsed)
    
    // If timer expired and not paused/maintenance, start new round
    if (remaining === 0 && !timer.isPaused && !timer.isMaintenance) {
      timer.startTime = now
      timer.drawNumber++
      saveTimer()
    }
    
    return NextResponse.json({
      success: true,
      timer: {
        remaining: Math.max(0, timer.duration - (Date.now() - timer.startTime)),
        duration: timer.duration,
        drawNumber: timer.drawNumber,
        isPaused: timer.isPaused,
        isMaintenance: timer.isMaintenance,
        maintenanceMessage: timer.maintenanceMessage,
        maintenanceStartTime: timer.maintenanceStartTime,
        pausedBy: timer.pausedBy,
        pausedAt: timer.pausedAt,
        nextDrawTime: timer.startTime + timer.duration
      }
    })
  } catch (error) {
    console.error('Admin timer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get timer' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, duration, message, adminName } = body
    
    // Get admin info from request (in production, verify admin auth)
    const adminId = request.headers.get('x-admin-id') || 'admin'
    const adminNameFromHeader = request.headers.get('x-admin-name') || adminName || 'Admin'
    
    const timer = loadTimer()
    const previousState = { ...timer }
    
    switch (action) {
      case 'pause':
        timer.isPaused = true
        timer.pausedBy = adminNameFromHeader
        timer.pausedAt = new Date()
        await createAuditLog('timer_pause', adminId, {
          drawNumber: timer.drawNumber,
          remaining: timer.duration - (Date.now() - timer.startTime),
          pausedBy: adminNameFromHeader
        }, request)
        break
        
      case 'resume':
        timer.isPaused = false
        timer.pausedBy = ''
        timer.pausedAt = null
        await createAuditLog('timer_resume', adminId, {
          drawNumber: timer.drawNumber,
          resumedBy: adminNameFromHeader
        }, request)
        break
        
      case 'reset':
        timer.startTime = Date.now()
        timer.drawNumber++
        timer.isPaused = false
        timer.isMaintenance = false
        timer.maintenanceMessage = ''
        timer.maintenanceStartTime = null
        timer.pausedBy = ''
        timer.pausedAt = null
        await createAuditLog('timer_reset', adminId, {
          newDrawNumber: timer.drawNumber,
          resetBy: adminNameFromHeader
        }, request)
        break
        
      case 'setDuration':
        const elapsed = Date.now() - timer.startTime
        timer.duration = duration || timer.duration
        timer.startTime = Date.now() - elapsed
        await createAuditLog('timer_duration_change', adminId, {
          newDuration: timer.duration,
          changedBy: adminNameFromHeader
        }, request)
        break
        
      case 'startMaintenance':
        timer.isMaintenance = true
        timer.maintenanceMessage = message || 'Sistem sedang dalam perbaikan'
        timer.maintenanceStartTime = new Date()
        timer.isPaused = true
        timer.pausedBy = adminNameFromHeader
        timer.pausedAt = new Date()
        await createAuditLog('maintenance_start', adminId, {
          message: timer.maintenanceMessage,
          startedBy: adminNameFromHeader
        }, request)
        break
        
      case 'endMaintenance':
        timer.isMaintenance = false
        timer.maintenanceMessage = ''
        timer.maintenanceStartTime = null
        timer.isPaused = false
        timer.pausedBy = ''
        timer.pausedAt = null
        await createAuditLog('maintenance_end', adminId, {
          endedBy: adminNameFromHeader
        }, request)
        break
        
      case 'updateMaintenanceMessage':
        timer.maintenanceMessage = message || timer.maintenanceMessage
        await createAuditLog('maintenance_message_update', adminId, {
          newMessage: timer.maintenanceMessage,
          updatedBy: adminNameFromHeader
        }, request)
        break
    }
    
    saveTimer()
    
    // Calculate new timer state
    const newElapsed = Date.now() - timer.startTime
    const newRemaining = Math.max(0, timer.duration - newElapsed)
    
    return NextResponse.json({
      success: true,
      timer: {
        remaining: newRemaining,
        duration: timer.duration,
        drawNumber: timer.drawNumber,
        isPaused: timer.isPaused,
        isMaintenance: timer.isMaintenance,
        maintenanceMessage: timer.maintenanceMessage,
        maintenanceStartTime: timer.maintenanceStartTime,
        pausedBy: timer.pausedBy,
        pausedAt: timer.pausedAt,
        nextDrawTime: timer.startTime + timer.duration
      },
      action: action,
      previousState: previousState,
      message: `Timer ${action} successful`
    })
  } catch (error) {
    console.error('Admin timer control error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to control timer' },
      { status: 500 }
    )
  }
}