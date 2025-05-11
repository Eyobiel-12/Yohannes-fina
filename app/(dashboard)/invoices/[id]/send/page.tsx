import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import { SendInvoiceForm } from "./send-invoice-form"

interface SendInvoicePageProps {
  params: {
    id: string
  }
}

export default async function SendInvoicePage({ params }: SendInvoicePageProps) {
  const supabase = createClient()

  try {
    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        clients (
          id,
          name,
          email
        )
      `,
      )
      .eq("id", params.id)
      .single()

    if (invoiceError || !invoice) {
      console.error("Error fetching invoice:", invoiceError)
      notFound()
    }

    // Get company settings
    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", invoice.user_id)
      .single()

    return (
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href={`/invoices/${invoice.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoice
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Send Invoice</h1>
          <p className="text-muted-foreground">Send invoice {invoice.invoice_number} by email</p>
        </div>

        <SendInvoiceForm invoice={invoice} companySettings={companySettings} clientEmail={invoice.clients.email} />
      </div>
    )
  } catch (error) {
    console.error("Error in send invoice page:", error)
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoices
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
          <p className="text-muted-foreground">An error occurred while loading the send invoice page.</p>
        </div>
      </div>
    )
  }
}
