import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { generateInvoiceHTML } from "@/lib/simple-invoice-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Send } from "lucide-react"
import { PDFDownloadButton } from "./pdf-download-button"

interface InvoicePdfPageProps {
  params: {
    id: string
  }
}

export default async function InvoicePdfPage({ params }: InvoicePdfPageProps) {
  // Await params to address the async params warning
  const id = await params.id
  const supabase = createClient()

  // Define default company settings
  const defaultCompanySettings = {
    id: "default",
    user_id: "",
    company_name: "Your Company Name",
    address: "Your Company Address",
    kvk_number: "KVK Number",
    btw_number: "BTW Number",
    iban: "NL00BANK0123456789",
    phone: "Your Phone",
    email: "your.email@example.com",
    vat_default: 21,
    payment_terms: "Betaling binnen 14 dagen na factuurdatum.",
    created_at: new Date().toISOString()
  }

  try {
    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single()

    if (invoiceError || !invoice) {
      console.error("Error fetching invoice:", invoiceError)
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
            <h1 className="text-3xl font-bold tracking-tight">Invoice Not Found</h1>
            <p className="text-muted-foreground">The requested invoice could not be found.</p>
          </div>
        </div>
      )
    }

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", invoice.client_id)
      .single()

    if (clientError || !client) {
      console.error("Error fetching client:", clientError)
      notFound()
    }

    // Get invoice items
    const { data: invoiceItems, error: itemsError } = await supabase
      .from("invoice_items")
      .select(
        `
        *,
        projects (
          project_number,
          title
        )
      `,
      )
      .eq("invoice_id", invoice.id)
      .order("id", { ascending: true })

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError)
    }

    // Get company settings
    const { data: companySettings, error: settingsError } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", invoice.user_id)
    
    // Changed from using .single() to check for existence more reliably
    const hasCompanySettings = companySettings && companySettings.length > 0;

    if (!hasCompanySettings) {
      console.error("Company settings not found:", settingsError)
      // Set the user_id in default settings
      defaultCompanySettings.user_id = invoice.user_id
      
      // Generate HTML for the invoice using default settings
      const invoiceHTML = generateInvoiceHTML(invoice, invoiceItems || [], client, defaultCompanySettings)

      // Create a data URI for the HTML
      const htmlDataUri = `data:text/html;charset=utf-8,${encodeURIComponent(invoiceHTML)}`

      // Create a filename for download
      const filename = `Invoice-${invoice.invoice_number}.html`

      return (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/invoices/${invoice.id}`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to invoice
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Invoice Preview</h1>
              <p className="text-muted-foreground">Preview invoice {invoice.invoice_number}</p>
            </div>
            <div className="flex gap-2">
              <a href={htmlDataUri} download={filename} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML
                </Button>
              </a>
              <PDFDownloadButton 
                invoice={invoice} 
                client={client} 
                items={invoiceItems || []} 
                companySettings={hasCompanySettings ? companySettings[0] : defaultCompanySettings} 
              />
              <Link href={`/invoices/${invoice.id}/send`}>
                <Button variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Send by Email
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <iframe
                srcDoc={invoiceHTML}
                className="w-full h-[800px] border-0"
                title={`Invoice ${invoice.invoice_number}`}
              />
            </CardContent>
          </Card>
        </div>
      )
    }

    // Generate HTML for the invoice
    const invoiceHTML = generateInvoiceHTML(invoice, invoiceItems || [], client, hasCompanySettings ? companySettings[0] : defaultCompanySettings)

    // Create a data URI for the HTML
    const htmlDataUri = `data:text/html;charset=utf-8,${encodeURIComponent(invoiceHTML)}`

    // Create a filename for download
    const filename = `Invoice-${invoice.invoice_number}.html`

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/invoices/${invoice.id}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to invoice
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Invoice Preview</h1>
            <p className="text-muted-foreground">Preview invoice {invoice.invoice_number}</p>
          </div>
          <div className="flex gap-2">
            <a href={htmlDataUri} download={filename} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
            </a>
            <PDFDownloadButton 
              invoice={invoice} 
              client={client} 
              items={invoiceItems || []} 
              companySettings={hasCompanySettings ? companySettings[0] : defaultCompanySettings} 
            />
            <Link href={`/invoices/${invoice.id}/send`}>
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Send by Email
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <iframe
              srcDoc={invoiceHTML}
              className="w-full h-[800px] border-0"
              title={`Invoice ${invoice.invoice_number}`}
            />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error in invoice PDF page:", error)
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
          <p className="text-muted-foreground">An error occurred while generating the invoice preview.</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-sm">{String(error)}</pre>
        </div>
      </div>
    )
  }
}
