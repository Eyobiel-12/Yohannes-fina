import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Create the invoices bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets()

  if (!buckets?.find((bucket) => bucket.name === "invoices")) {
    const { error } = await supabase.storage.createBucket("invoices", {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
