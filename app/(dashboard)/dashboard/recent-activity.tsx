import { Users, FolderKanban, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

interface ActivityItem {
  type: "client" | "project" | "invoice"
  id: string
  name: string
  date: string
  extra?: string
}

async function fetchRecentActivity(userId: string): Promise<ActivityItem[]> {
  const supabase = await createClient()
  // Fetch latest 5 clients
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)
  // Fetch latest 5 projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, project_number, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)
  // Fetch latest 5 invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)
  // Combine and sort by date
  const items: ActivityItem[] = []
  clients?.forEach((c: any) => items.push({ type: "client", id: c.id, name: c.name, date: c.created_at }))
  projects?.forEach((p: any) => items.push({ type: "project", id: p.id, name: p.title || p.project_number, date: p.created_at }))
  invoices?.forEach((i: any) => items.push({ type: "invoice", id: i.id, name: i.invoice_number, date: i.created_at }))
  // Sort by date descending
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return items.slice(0, 7)
}

export async function RecentActivityFeed({ userId }: { userId: string }) {
  const activity = await fetchRecentActivity(userId)
  return (
    <Card className="h-full shadow-lg bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <ul className="divide-y divide-muted-foreground/10">
          {activity.length === 0 && <li className="py-4 text-muted-foreground text-sm">No recent activity</li>}
          {activity.map((item) => (
            <li key={item.type + item.id} className="flex items-center gap-3 py-3">
              {item.type === "client" && <Users className="h-5 w-5 text-green-500" />}
              {item.type === "project" && <FolderKanban className="h-5 w-5 text-blue-500" />}
              {item.type === "invoice" && <FileText className="h-5 w-5 text-amber-500" />}
              <div className="flex-1 min-w-0">
                <span className="font-medium">
                  {item.type === "client" && <Link href={`/clients/${item.id}`}>New client: {item.name}</Link>}
                  {item.type === "project" && <Link href={`/projects/${item.id}`}>New project: {item.name}</Link>}
                  {item.type === "invoice" && <Link href={`/invoices/${item.id}`}>New invoice: {item.name}</Link>}
                </span>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
} 