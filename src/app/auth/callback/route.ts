import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  
  // Demo mode - just redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}