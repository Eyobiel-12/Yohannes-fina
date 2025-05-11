import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  total_incl_vat: number | null
  is_paid: boolean
  clients: {
    name: string
  }
}

interface RecentInvoicesProps {
  invoices: Invoice[]
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "€0,00"
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>{invoices.length} most recent invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {invoices.length === 0 ? (
            <div className="text-center text-muted-foreground">No invoices found</div>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{invoice.clients.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(invoice.invoice_date), {
                      addSuffix: true,
                      locale: nl,
                    })}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant={invoice.is_paid ? "default" : "outline"}>{invoice.is_paid ? "Paid" : "Unpaid"}</Badge>
                  <div className="font-medium">{formatCurrency(invoice.total_incl_vat)}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 text-center">
          <Link href="/invoices" className="text-sm text-primary hover:underline">
            View all invoices
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
