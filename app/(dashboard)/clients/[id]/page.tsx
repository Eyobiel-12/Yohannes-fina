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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/clients"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to clients
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{client.name}</h1>
        </div>
        <Link href={`/clients/${client.id}/edit`}>
          <Button
            variant="outline"
            className="backdrop-blur-md bg-white/60 border border-white/40 shadow-md rounded-xl transition-all hover:bg-white/80 hover:shadow-lg"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Client
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" /> Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-base">
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-500" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-500" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-green-500 mt-1" />
                <span className="whitespace-pre-line">{client.address}</span>
              </div>
            )}
            {client.kvk_number && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                <span>KvK: {client.kvk_number}</span>
              </div>
            )}
            {client.btw_number && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                <span>BTW: {client.btw_number}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" /> Projects
            </CardTitle>
            <Link href={`/projects/new?client=${client.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="backdrop-blur-md bg-white/60 border border-white/40 shadow rounded-lg transition-all hover:bg-white/80 hover:shadow-md"
              >
                Add Project
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <ul className="space-y-2">
                {projects.map((project: any) => (
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

        <Card className="md:col-span-2 bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" /> Invoices
            </CardTitle>
            <Link href={`/invoices/new?client=${client.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="backdrop-blur-md bg-white/60 border border-white/40 shadow rounded-lg transition-all hover:bg-white/80 hover:shadow-md"
              >
                Create Invoice
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {invoices && invoices.length > 0 ? (
              <div className="rounded-xl border border-white/30 overflow-x-auto bg-white/40 backdrop-blur-sm">
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
                    {invoices.map((invoice: any) => (
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
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                              invoice.is_paid
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
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
