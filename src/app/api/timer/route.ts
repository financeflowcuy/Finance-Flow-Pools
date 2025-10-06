import { NextRequest, NextResponse } from 'next/server'

// Global timer state (in production, use Redis or database)
let globalTimer = {
  startTime: Date.now(),
  duration: 5 * 60 * 1000, // 5 minutes in milliseconds
  drawNumber: 1,
  isPaused: false
}

// Load timer from persistent storage or initialize
function loadTimer() {
  // In production, load from database
  const saved = globalTimer.startTime
  if (!saved) {
    globalTimer.startTime = Date.now()
  }
  return globalTimer
}

function saveTimer() {
  // In production, save to database
  // For now, just keep in memory
}

export async function GET(request: NextRequest) {
  try {
    const timer = loadTimer()
    const now = Date.now()
    const elapsed = now - timer.startTime
    const remaining = Math.max(0, timer.duration - elapsed)
    
    // If timer expired, start new round
    if (remaining === 0 && !timer.isPaused) {
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
        nextDrawTime: timer.startTime + timer.duration
      }
    })
  } catch (error) {
    console.error('Timer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get timer' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, duration } = body
    
    const timer = loadTimer()
    
    if (action === 'reset') {
      timer.startTime = Date.now()
      timer.drawNumber++
      timer.isPaused = false
    } else if (action === 'pause') {
      timer.isPaused = true
    } else if (action === 'resume') {
      timer.isPaused = false
      timer.startTime = Date.now() - (timer.duration - (duration || timer.duration))
    } else if (action === 'setDuration') {
      const elapsed = Date.now() - timer.startTime
      timer.duration = duration || timer.duration
      timer.startTime = Date.now() - elapsed
    }
    
    saveTimer()
    
    return NextResponse.json({
      success: true,
      timer: {
        remaining: Math.max(0, timer.duration - (Date.now() - timer.startTime)),
        duration: timer.duration,
        drawNumber: timer.drawNumber,
        isPaused: timer.isPaused,
        nextDrawTime: timer.startTime + timer.duration
      }
    })
  } catch (error) {
    console.error('Timer update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update timer' },
      { status: 500 }
    )
  }
}