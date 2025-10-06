import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  isAllowed(
    identifier: string, 
    limit: number, 
    windowMs: number
  ): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now()
    const key = identifier

    // Initialize or get existing record
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    const record = this.store[key]
    
    // Check if limit exceeded
    if (record.count >= limit) {
      return {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0
      }
    }

    // Increment count
    record.count++
    
    return {
      allowed: true,
      resetTime: record.resetTime,
      remaining: limit - record.count
    }
  }

  getClientIdentifier(request: NextRequest): string {
    // Try to get client IP from various headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    let ip = forwardedFor?.split(',')[0] || 
             realIp || 
             cfConnectingIp || 
             'unknown'
    
    // Add user agent to make it more unique
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Create a hash of IP + user agent for privacy
    return Buffer.from(`${ip}-${userAgent}`).toString('base64').slice(0, 32)
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Rate limit configurations
export const RATE_LIMITS = {
  BET: { limit: 10, windowMs: 60000 }, // 10 bets per minute
  DRAW: { limit: 5, windowMs: 300000 }, // 5 draws per 5 minutes
  STATS: { limit: 30, windowMs: 60000 }, // 30 stats requests per minute
  VERIFY: { limit: 20, windowMs: 60000 } // 20 verifications per minute
}