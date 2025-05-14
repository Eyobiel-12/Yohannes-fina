"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  total_incl_vat: number
  is_paid: boolean
  clients: {
    name: string
  }
}

export function UpcomingPayments() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      // Get unpaid invoices
      const { data } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          invoice_date,
          total_incl_vat,
          is_paid,
          clients (
            name
          )
        `)
        .eq("user_id", user.id)
        .eq("is_paid", false)
        .order("invoice_date", { ascending: true })
        .limit(5)

      setInvoices(data || [])
      setIsLoading(false)
    }

    fetchData()
  }, [supabase])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Calculate days overdue
  const getDaysOverdue = (dateString: string) => {
    const invoiceDate = new Date(dateString)
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + 14) // Assuming 14 day payment terms

    const today = new Date()
    const diffTime = today.getTime() - dueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get due date (14 days after invoice date)
  const getDueDate = (dateString: string) => {
    const invoiceDate = new Date(dateString)
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + 14)
    return dueDate
  }

  // Mark invoice as paid
  const markAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase.from("invoices").update({ is_paid: true }).eq("id", invoiceId)

      if (error) throw error

      // Update the local state to reflect the change
      setInvoices(invoices.filter((inv) => inv.id !== invoiceId))

      toast({
        title: "Invoice marked as paid",
        description: "The invoice has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update invoice. Please try again.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent>Upcoming Payments</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CardTitle>Upcoming Payments</CardTitle>
        </div>
        <CardDescription>Unpaid invoices requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading invoices...</p>
          </div>
        ) : invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const daysOverdue = getDaysOverdue(invoice.invoice_date)

              return (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-2 border-b pb-4 mb-4 last:mb-0 last:pb-0 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline">
                        {invoice.invoice_number}
                      </Link>
                      <div className="text-sm text-muted-foreground">{invoice.clients.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {daysOverdue > 0 && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          {daysOverdue} days overdue
                        </Badge>
                      )}
                      <span className="font-medium">{formatCurrency(invoice.total_incl_vat)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Due: {formatDate(getDueDate(invoice.invoice_date))}
                    </span>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => markAsPaid(invoice.id)}>
                      Mark as Paid
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No unpaid invoices found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
