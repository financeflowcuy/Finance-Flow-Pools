import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create response and clear all auth cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear all possible auth cookies
    response.cookies.delete('auth_token')
    response.cookies.delete('token')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}