import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const { email, name, password, phone } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = await db.user.create({
      data: {
        email,
        name: name || null,
        phone: phone || null,
        password: hashedPassword,
        isAdmin: false,
        isActive: true,
        balance: 1000000, // Default balance 1M IDR
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isAdmin: true,
        isActive: true,
        balance: true,
        createdAt: true,
      }
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        isAdmin: newUser.isAdmin 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Log the registration
    await db.auditLog.create({
      data: {
        action: 'user_register',
        userId: newUser.id,
        data: JSON.stringify({ email, name, timestamp: new Date().toISOString() }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: newUser,
        token,
        message: 'Registration successful! Welcome bonus of Rp 1,000,000 has been added to your account.'
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}