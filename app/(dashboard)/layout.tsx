import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import ClientDashboardLayout from "@/components/client-dashboard-layout"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create a new supabase server client with the cookies
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get the session - this is the most reliable way to check auth on the server
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login
  if (!session) {
    redirect("/auth/login")
  }

  // Pass only serializable data!
  return <ClientDashboardLayout user={session.user}>{children}</ClientDashboardLayout>
}
