import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { InvoicesTable } from "./invoices-table"

export const metadata: Metadata = {
  title: "Invoices | Yohannes Hoveniersbedrijf",
  description: "Manage your invoices",
}

export default async function InvoicesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .eq("user_id", user?.id)
    .order("invoice_date", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices</p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <InvoicesTable invoices={invoices || []} />
    </div>
  )
}
