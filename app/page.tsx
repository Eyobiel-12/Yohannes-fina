import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect based on auth status
  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/auth/login")
  }

  // This will never be reached, but is needed for TypeScript
  return null
}
