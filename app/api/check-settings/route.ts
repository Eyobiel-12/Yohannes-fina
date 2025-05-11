import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check for company settings
    const { data: settings, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      hasSettings: settings && settings.length > 0,
      settings: settings,
      userId: user.id
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 