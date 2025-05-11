import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Return the auth status
  return NextResponse.json({
    authenticated: !!session,
    session: session
      ? {
          expires_at: session.expires_at,
          created_at: session.created_at,
        }
      : null,
    user: user
      ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        }
      : null,
  })
}
