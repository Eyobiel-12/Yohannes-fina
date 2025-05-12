import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    
    // Explicitly await the session
    const { data: { session } } = await supabase.auth.getSession()
    
    // If no session and trying to access protected routes, redirect to login
    const path = req.nextUrl.pathname
    const isAuthRoute = path.startsWith('/auth')
    const isApiRoute = path.startsWith('/api')
    
    if (!session && !isAuthRoute && !isApiRoute && path !== '/') {
      const redirectUrl = new URL('/auth/login', req.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // If session exists and on auth routes, redirect to dashboard
    if (session && isAuthRoute) {
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }
  
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
