import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // For now, we'll handle auth protection on the client side
  // This can be expanded later with proper SSR auth handling
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/visits/:path*',
    '/auth/sign-in'
  ]
}