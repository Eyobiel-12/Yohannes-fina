import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, Building, FileText, Pencil } from "lucide-react"

export const metadata: Metadata = {
  title: "Client Details | Yohannes Hoveniersbedrijf",
  description: "View client details",
}

interface ClientPageProps {
  params: {
    id: string
  }
}

export default async function ClientPage({ params }: ClientPageProps) {
  const supabase = createClient()

  const { data: client } = await supabase.from("clients").select("*").eq("id", params.id).single()

  if (!client) {
    notFound()
  }

  // Get projects for this client
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })

  // Get invoices for this client
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", client.id)
    .order("invoice_date", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/clients"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to clients
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
        </div>
        <Link href={`/clients/${client.id}/edit`}>
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Client
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground mt-1" />
                <span className="whitespace-pre-line">{client.address}</span>
              </div>
            )}
            {client.kvk_number && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>KvK: {client.kvk_number}</span>
              </div>
            )}
            {client.btw_number && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>BTW: {client.btw_number}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Link href={`/projects/new?client=${client.id}`}>
              <Button variant="outline" size="sm">
                Add Project
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <ul className="space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link href={`/projects/${project.id}`} className="text-sm hover:underline">
                      {project.project_number}: {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No projects found for this client.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <Link href={`/invoices/new?client=${client.id}`}>
              <Button variant="outline" size="sm">
                Create Invoice
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {invoices && invoices.length > 0 ? (
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Invoice Number</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-4 py-3 text-sm">
                          <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                            {invoice.invoice_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(invoice.invoice_date).toLocaleDateString("nl-NL")}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {new Intl.NumberFormat("nl-NL", {
                            style: "currency",
                            currency: "EUR",
                          }).format(invoice.total_incl_vat || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              invoice.is_paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {invoice.is_paid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No invoices found for this client.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
