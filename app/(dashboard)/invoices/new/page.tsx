import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { InvoiceForm } from "../invoice-form"

export const metadata: Metadata = {
  title: "Create Invoice | Yohannes Hoveniersbedrijf",
  description: "Create a new invoice",
}

export default async function NewInvoicePage() {
  const supabase = createClient()

  const { data: clients } = await supabase.from("clients").select("id, name").order("name", { ascending: true })

  // Get default VAT from company settings
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: companySettings } = await supabase
    .from("company_settings")
    .select("vat_default")
    .eq("user_id", user?.id)
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground">Create a new invoice for a client</p>
      </div>

      <InvoiceForm clients={clients || []} defaultVat={companySettings?.vat_default || 21} />
    </div>
  )
}
