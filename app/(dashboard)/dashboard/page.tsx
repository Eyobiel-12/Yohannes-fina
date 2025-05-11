import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { DashboardCards } from "./dashboard-cards"
import { RecentInvoices } from "./recent-invoices"
import { WelcomeBanner } from "@/components/welcome-banner"
import { QuickActions } from "@/components/quick-actions"
import { RevenueChart } from "@/components/revenue-chart"
import { UpcomingPayments } from "@/components/upcoming-payments"
import { SeedDataButton } from "@/components/seed-data-button"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dashboard | Yohannes Hoveniersbedrijf",
  description: "Financial overview dashboard",
}

export default async function DashboardPage() {
  const supabase = createClient()

  // Fetch dashboard data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get client count
  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  // Check if company settings exist
  const { data: companySettings, error: settingsError } = await supabase
    .from("company_settings")
    .select("*")
    .eq("user_id", user?.id)
    
  // Changed from using .single() to check for any rows returned
  const hasCompanySettings = companySettings && companySettings.length > 0;
  
  console.log("Settings check:", { 
    userId: user?.id,
    hasSettings: hasCompanySettings,
    settingsCount: companySettings?.length || 0,
    error: settingsError?.message
  });

  // Get project count
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  // Get total revenue (paid invoices)
  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("total_incl_vat")
    .eq("user_id", user?.id)
    .eq("is_paid", true)

  const totalRevenue = paidInvoices?.reduce((sum, invoice) => sum + (invoice.total_incl_vat || 0), 0) || 0

  // Get outstanding amount (unpaid invoices)
  const { data: unpaidInvoices } = await supabase
    .from("invoices")
    .select("total_incl_vat")
    .eq("user_id", user?.id)
    .eq("is_paid", false)

  const outstandingAmount = unpaidInvoices?.reduce((sum, invoice) => sum + (invoice.total_incl_vat || 0), 0) || 0

  // Get recent invoices
  const { data: recentInvoices } = await supabase
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
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Check if user has any data
  const hasNoData = !clientCount || clientCount === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Financial overview of your business</p>
        </div>
        {hasNoData && <SeedDataButton />}
      </div>

      <WelcomeBanner />

      {!hasCompanySettings && (
        <Card className="border-amber-500 bg-amber-50">
          <CardContent className="p-4 text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p><strong>Company settings missing!</strong> Set up your company information to enable PDF invoices.</p>
              <Button variant="outline" className="ml-auto" asChild>
                <Link href="/settings">
                  Setup Company Info
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DashboardCards
        clientCount={clientCount || 0}
        projectCount={projectCount || 0}
        totalRevenue={totalRevenue}
        outstandingAmount={outstandingAmount}
      />

      <QuickActions />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <RevenueChart />
        <UpcomingPayments />
      </div>

      <RecentInvoices invoices={recentInvoices || []} />
    </div>
  )
}
