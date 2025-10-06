import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ 
    success: true,
    message: 'All cookies cleared successfully' 
  })
  
  // Hapus semua cookies yang mungkin menyebabkan masalah
  const cookiesToDelete = ['auth_token', 'token', 'user_token', 'admin_token']
  
  cookiesToDelete.forEach(cookieName => {
    response.cookies.set(cookieName, '', { 
      expires: new Date(0),
      path: '/'
    })
  })

  return response
}

export async function GET() {
  const response = NextResponse.json({ 
    success: true,
    message: 'All cookies cleared successfully' 
  })
  
  // Hapus semua cookies yang mungkin menyebabkan masalah
  const cookiesToDelete = ['auth_token', 'token', 'user_token', 'admin_token']
  
  cookiesToDelete.forEach(cookieName => {
    response.cookies.set(cookieName, '', { 
      expires: new Date(0),
      path: '/'
    })
  })

  return response
}