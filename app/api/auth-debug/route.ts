import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the Supabase URL and key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Test the Supabase connection
    const { data: authSettings, error } = await supabase.from('auth_settings').select('*').limit(1).maybeSingle();
    
    // Get current session if any
    const { data: { session } } = await supabase.auth.getSession();
    
    return NextResponse.json({
      environmentCheck: {
        supabaseUrl: supabaseUrl,
        supabaseKeyFirstChars: supabaseKey ? supabaseKey.substring(0, 10) + '...' : null,
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      },
      connectionCheck: {
        connected: !error,
        errorMessage: error?.message || null,
      },
      sessionCheck: {
        hasSession: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "API error occurred",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 