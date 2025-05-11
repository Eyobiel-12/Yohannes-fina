"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [userName, setUserName] = useState("")
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkUserStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Get user's email and extract name
        const email = user.email || ""
        const name = email.split("@")[0]
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))

        // Check if company settings exist
        const { data: settings } = await supabase.from("company_settings").select("id").eq("user_id", user.id).single()

        // If no settings, this is likely a first login
        setIsFirstLogin(!settings)
        setIsVisible(!settings)
      }
    }

    checkUserStatus()
  }, [supabase])

  if (!isVisible) return null

  return (
    <Card className="relative mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setIsVisible(false)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Welcome to your financial dashboard, {userName}!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isFirstLogin
                ? "Let's get started by setting up your company information and creating your first client."
                : "Here's a summary of your recent activity and financial status."}
            </p>
          </div>
          <div className="flex gap-2">
            {isFirstLogin && (
              <Button asChild variant="default">
                <a href="/settings">Setup Company</a>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href="/clients/new">Add Client</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
