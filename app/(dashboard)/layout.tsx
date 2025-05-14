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

  // Get the user - this is the most secure way to check auth on the server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Pass only serializable data!
  return <ClientDashboardLayout user={user}>{children}</ClientDashboardLayout>
}
