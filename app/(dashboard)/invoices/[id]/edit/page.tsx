import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InvoiceForm } from "../../invoice-form"

export const metadata: Metadata = {
  title: "Edit Invoice | Yohannes Hoveniersbedrijf",
  description: "Edit invoice details",
}

interface EditInvoicePageProps {
  params: {
    id: string
  }
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const supabase = createClient()

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", params.id).single()

  if (!invoice) {
    notFound()
  }

  const { data: invoiceItems } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoice.id)
    .order("id", { ascending: true })

  const { data: clients } = await supabase.from("clients").select("id, name").order("name", { ascending: true })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
        <p className="text-muted-foreground">Update invoice {invoice.invoice_number}</p>
      </div>

      <InvoiceForm invoice={invoice} invoiceItems={invoiceItems || []} clients={clients || []} />
    </div>
  )
}
