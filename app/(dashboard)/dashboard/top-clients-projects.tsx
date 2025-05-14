import { Users, FolderKanban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

async function fetchTopClients(userId: string) {
  const supabase = createClient()
  // Aggregate total paid revenue per client
  const { data } = await supabase.rpc('top_clients_by_revenue', { user_id_input: userId, limit_input: 3 })
  return data || []
}

async function fetchTopProjects(userId: string) {
  const supabase = createClient()
  // Aggregate total paid revenue per project
  const { data } = await supabase.rpc('top_projects_by_revenue', { user_id_input: userId, limit_input: 3 })
  return data || []
}

export async function TopClientsProjects({ userId }: { userId: string }) {
  // Fallback: If no RPC, do aggregation in JS (less efficient)
  const supabase = createClient()
  // Top clients
  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("client_id, total_incl_vat, is_paid, clients(name)")
    .eq("user_id", userId)
    .eq("is_paid", true)
  const clientMap: Record<string, { name: string; total: number }> = {}
  paidInvoices?.forEach((inv: any) => {
    if (!inv.client_id || !inv.clients?.name) return
    if (!clientMap[inv.client_id]) clientMap[inv.client_id] = { name: inv.clients.name, total: 0 }
    clientMap[inv.client_id].total += inv.total_incl_vat || 0
  })
  const topClients = Object.entries(clientMap)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
  // Top projects
  const { data: paidItems } = await supabase
    .from("invoice_items")
    .select("project_id, total, projects(title)")
  const projectMap: Record<string, { title: string; total: number }> = {}
  paidItems?.forEach((item: any) => {
    if (!item.project_id || !item.projects?.title) return
    if (!projectMap[item.project_id]) projectMap[item.project_id] = { title: item.projects.title, total: 0 }
    projectMap[item.project_id].total += item.total || 0
  })
  const topProjects = Object.entries(projectMap)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
  return (
    <Card className="h-full shadow-lg bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
      <CardHeader>
        <CardTitle>Top Clients & Projects</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-green-500" />Top Clients</h3>
            <ul>
              {topClients.length === 0 && <li className="text-muted-foreground text-sm">No data</li>}
              {topClients.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-1">
                  <span>{c.name}</span>
                  <span className="bg-green-100 text-green-800 rounded px-2 py-0.5 text-xs font-semibold">€{c.total.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-muted-foreground/10 pt-4 md:pt-0 md:pl-6">
            <h3 className="font-semibold flex items-center gap-2 mb-2"><FolderKanban className="h-4 w-4 text-blue-500" />Top Projects</h3>
            <ul>
              {topProjects.length === 0 && <li className="text-muted-foreground text-sm">No data</li>}
              {topProjects.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-1">
                  <span>{p.title}</span>
                  <span className="bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs font-semibold">€{p.total.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 