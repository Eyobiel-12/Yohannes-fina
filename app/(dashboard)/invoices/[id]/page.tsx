import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Pencil, Send, Edit, FileText, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "Invoice Details | Yohannes Hoveniersbedrijf",
  description: "View invoice details",
}

interface InvoicePageProps {
  params: {
    id: string
  }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  // Await params to address the async params warning
  const id = await params.id
  const supabase = createClient()

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      `
      *,
      clients (
        id,
        name,
        address,
        kvk_number,
        btw_number
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!invoice) {
    notFound()
  }

  // Get invoice items
  const { data: invoiceItems } = await supabase
    .from("invoice_items")
    .select(
      `
      *,
      projects (
        id,
        project_number,
        title
      )
    `,
    )
    .eq("invoice_id", invoice.id)
    .order("id", { ascending: true })

  // Get company settings
  const { data: companySettings, error: settingsError } = await supabase
    .from("company_settings")
    .select("*")
    .eq("user_id", invoice.user_id)
  
  // Changed from using .single() to check for any rows returned
  const hasCompanySettings = companySettings && companySettings.length > 0;

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "€0,00"
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoices
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoice_number}</h1>
          <p className="text-muted-foreground">
            {formatDate(invoice.invoice_date)} - {invoice.clients.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoice.id}/pdf`}>
              <FileText className="mr-2 h-4 w-4" />
              View PDF
            </Link>
          </Button>
          <Link href={`/invoices/${invoice.id}/send`}>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send by Email
            </Button>
          </Link>
        </div>
      </div>

      {!hasCompanySettings && (
        <Card className="border-amber-500 bg-amber-50">
          <CardContent className="p-4 text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p><strong>Company settings missing!</strong> PDF generation requires company information.</p>
              <Button variant="outline" className="ml-auto" asChild>
                <Link href="/settings">
                  Setup Company Info
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice Number:</span>
              <span className="font-medium">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice Date:</span>
              <span>{formatDate(invoice.invoice_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge
                variant={invoice.is_paid ? "default" : "outline"}
                className={invoice.is_paid ? "bg-green-500" : ""}
              >
                {invoice.is_paid ? "Paid" : "Unpaid"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT Rate:</span>
              <span>{invoice.vat_percent}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="font-medium">{invoice.clients.name}</div>
            {invoice.clients.address && <div className="whitespace-pre-line text-sm">{invoice.clients.address}</div>}
            {invoice.clients.kvk_number && (
              <div className="text-sm">
                <span className="text-muted-foreground">KvK: </span>
                {invoice.clients.kvk_number}
              </div>
            )}
            {invoice.clients.btw_number && (
              <div className="text-sm">
                <span className="text-muted-foreground">BTW: </span>
                {invoice.clients.btw_number}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Quantity</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Unit Price</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoiceItems?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm">
                      {item.projects ? (
                        <Link href={`/projects/${item.projects.id}`} className="hover:underline">
                          {item.projects.project_number}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.description || "-"}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.quantity || 0}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">
                    Subtotal:
                  </td>
                  <td className="px-4 py-3 text-right text-sm">{formatCurrency(invoice.total_excl_vat)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">
                    VAT ({invoice.vat_percent}%):
                  </td>
                  <td className="px-4 py-3 text-right text-sm">{formatCurrency(invoice.vat_amount)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold">{formatCurrency(invoice.total_incl_vat)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">{invoice.notes}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {hasCompanySettings && companySettings[0]?.payment_terms ||
              `Please pay within 14 days to ${hasCompanySettings && companySettings[0]?.iban || ""} referencing invoice number ${
                invoice.invoice_number
              }.`}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
