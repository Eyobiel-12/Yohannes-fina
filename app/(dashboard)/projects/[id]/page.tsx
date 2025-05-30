import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building, FileText, Pencil } from "lucide-react"

export const metadata: Metadata = {
  title: "Project Details | Yohannes Hoveniersbedrijf",
  description: "View project details",
}

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createClient()

  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .eq("id", params.id)
    .single()

  if (!project) {
    notFound()
  }

  // Get invoices that include this project
  const { data: invoiceItems } = await supabase
    .from("invoice_items")
    .select(`
      *,
      invoices (
        id,
        invoice_number,
        invoice_date,
        is_paid
      )
    `)
    .eq("project_id", project.id)

  // Get unique invoices
  const uniqueInvoices = invoiceItems
    ? Array.from(new Map(invoiceItems.map((item) => [item.invoices.id, item.invoices])).values())
    : []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {project.project_number}: {project.title}
          </h1>
        </div>
        <Link href={`/projects/${project.id}/edit`}>
          <Button
            variant="outline"
            className="backdrop-blur-md bg-white/60 border border-white/40 shadow-md rounded-xl transition-all hover:bg-white/80 hover:shadow-lg"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-1 animate-fade-in-up transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" /> Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-base">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-green-500" />
              <span>Client: </span>
              <Link href={`/clients/${project.clients.id}`} className="font-medium hover:underline">
                {project.clients.name}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-500" />
              <span>Project Number: {project.project_number}</span>
            </div>
            {project.description && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{project.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-1 animate-fade-in-up transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" /> Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uniqueInvoices.length > 0 ? (
              <ul className="space-y-2">
                {uniqueInvoices.map((invoice: any) => (
                  <li key={invoice.id} className="flex items-center justify-between">
                    <Link href={`/invoices/${invoice.id}`} className="text-sm hover:underline">
                      {invoice.invoice_number} ({new Date(invoice.invoice_date).toLocaleDateString("nl-NL")})
                    </Link>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 ${
                        invoice.is_paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {invoice.is_paid ? "Paid" : "Unpaid"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No invoices found for this project.</p>
            )}
            <div className="mt-4">
              <Link href={`/invoices/new?project=${project.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="backdrop-blur-md bg-white/60 border border-white/40 shadow rounded-lg transition-all hover:bg-white/80 hover:shadow-md"
                >
                  Create Invoice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
