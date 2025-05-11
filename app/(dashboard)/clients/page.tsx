import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { ClientsTable } from "./clients-table"

export const metadata: Metadata = {
  title: "Clients | Yohannes Hoveniersbedrijf",
  description: "Manage your clients",
}

export default async function ClientsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user?.id)
    .order("name", { ascending: true })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client information</p>
        </div>
        <Link href="/clients/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      <ClientsTable clients={clients || []} />
    </div>
  )
}
