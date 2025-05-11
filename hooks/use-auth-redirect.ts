"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export function useAuthRedirect() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    const isAuthRoute = pathname.startsWith("/auth")

    if (!user && !isAuthRoute) {
      router.replace("/auth/login")
    } else if (user && isAuthRoute) {
      router.replace("/dashboard")
    }
  }, [user, isLoading, router, pathname])

  return { user, isLoading }
}
