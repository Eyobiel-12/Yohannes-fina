import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Pencil, Send, Edit, FileText, AlertTriangle } from "lucide-react"
import { InvoiceForm } from "./invoice-form"

export const metadata: Metadata = {
  title: "Edit Invoice | Yohannes Hoveniersbedrijf",
  description: "Edit invoice details",
}

interface InvoicePageProps {
  params: {
    id: string
  }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const id = params.id
  const supabase = createClient()

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (!invoice) {
    return <div>Invoice not found</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
        <p className="text-muted-foreground">Edit invoice details</p>
      </div>

      <InvoiceForm invoice={invoice} />
    </div>
  )
}
