import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// DISABLED - No middleware to prevent redirect loops
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: []
}