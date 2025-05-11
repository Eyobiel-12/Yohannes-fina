import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Try to sign in directly using the API
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        message: error.message,
        error: error 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: data.user,
      session: {
        accessToken: data.session?.access_token ? "Present" : "Missing",
        refreshToken: data.session?.refresh_token ? "Present" : "Missing",
        expiresAt: data.session?.expires_at
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Server error during login",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 