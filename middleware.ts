import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    
    // Explicitly await the user
    const { data: { user } } = await supabase.auth.getUser()
    
    // If no user and trying to access protected routes, redirect to login
    const path = req.nextUrl.pathname
    const isAuthRoute = path.startsWith('/auth')
    const isApiRoute = path.startsWith('/api')
    
    if (!user && !isAuthRoute && !isApiRoute && path !== '/') {
      const redirectUrl = new URL('/auth/login', req.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // If user exists and on auth routes, redirect to dashboard
    if (user && isAuthRoute) {
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }
  
  return res
}

export const config = {
  matcher: [
    // Exclude Next.js internals and all static files from middleware
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|json)).*)',
  ],
}
