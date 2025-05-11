import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Get Supabase URL and anon key from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase URL or anon key env variables",
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey
      }, { status: 500 });
    }

    // Direct fetch to Supabase auth endpoint without using the client
    const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'X-Client-Info': 'direct-test'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    
    // Get full response details including headers for debugging
    const responseData = await response.json();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()].map(([key, value]) => [key, value])),
      data: responseData
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error in direct auth test",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 