import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path starts with /admin
  const isAdminPath = pathname.startsWith('/admin')
  
  // If it's not an admin path, allow the request
  if (!isAdminPath) {
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If there's no token, redirect to login
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If the user is not an admin, redirect to an unauthorized page
  // You can customize this based on your role management
  if (token.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Allow the request
  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/admin/:path*']
}