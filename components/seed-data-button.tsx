"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function SeedDataButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSeedData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/seed-data")
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sample data has been added to your account.",
        })
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to add sample data.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSeedData} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLoading ? "Adding Sample Data..." : "Add Sample Data"}
    </Button>
  )
}
