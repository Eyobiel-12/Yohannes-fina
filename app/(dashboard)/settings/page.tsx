import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "./settings-form"

export const metadata: Metadata = {
  title: "Settings | Yohannes Hoveniersbedrijf",
  description: "Manage your company settings",
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get company settings or create default if not exists
  const { data: settings } = await supabase.from("company_settings").select("*").eq("user_id", user?.id).single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your company information and preferences</p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
