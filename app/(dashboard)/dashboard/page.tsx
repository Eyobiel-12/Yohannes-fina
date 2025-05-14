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
import { AlertTriangle, FileText } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RecentActivityFeed } from "./recent-activity"
import { TopClientsProjects } from "./top-clients-projects"

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

  // Calculate date ranges for current and previous month
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Get client count
  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  // Previous month client count
  const { count: prevClientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

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

  // Previous month project count
  const { count: prevProjectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  // Get total revenue (paid invoices)
  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("total_incl_vat")
    .eq("user_id", user?.id)
    .eq("is_paid", true)

  const totalRevenue = paidInvoices?.reduce((sum, invoice) => sum + (invoice.total_incl_vat || 0), 0) || 0

  // Previous month paid revenue
  const { data: prevPaidInvoices } = await supabase
    .from("invoices")
    .select("total_incl_vat")
    .eq("user_id", user?.id)
    .eq("is_paid", true)
    .gte("invoice_date", startOfLastMonth.toISOString())
    .lte("invoice_date", endOfLastMonth.toISOString())
  const prevTotalRevenue = prevPaidInvoices?.reduce((sum, invoice) => sum + (invoice.total_incl_vat || 0), 0) || 0

  // Get outstanding amount (unpaid invoices)
  const { data: unpaidInvoices } = await supabase
    .from("invoices")
    .select("total_incl_vat")
    .eq("user_id", user?.id)
    .eq("is_paid", false)

  const outstandingAmount = unpaidInvoices?.reduce((sum, invoice) => sum + (invoice.total_incl_vat || 0), 0) || 0

  // Previous month outstanding amount
  const { data: prevUnpaidInvoices } = await supabase
    .from("invoices")
    .select("total_incl_vat")
    .eq("user_id", user?.id)
    .eq("is_paid", false)
    .gte("invoice_date", startOfLastMonth.toISOString())
    .lte("invoice_date", endOfLastMonth.toISOString())
  const prevOutstandingAmount = prevUnpaidInvoices?.reduce((sum, invoice) => sum + (invoice.total_incl_vat || 0), 0) || 0

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

  // Get last 6 months for sparklines
  function getMonthRange(monthsAgo: number) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    return d
  }
  const monthLabels: string[] = []
  const revenueSpark: number[] = []
  const outstandingSpark: number[] = []
  const clientSpark: number[] = []
  const projectSpark: number[] = []
  for (let i = 5; i >= 0; i--) {
    const start = getMonthRange(i)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    monthLabels.push(start.toLocaleString("default", { month: "short" }))
    // Revenue
    const { data: monthPaid } = await supabase
      .from("invoices")
      .select("total_incl_vat")
      .eq("user_id", user?.id)
      .eq("is_paid", true)
      .gte("invoice_date", start.toISOString())
      .lte("invoice_date", end.toISOString())
    revenueSpark.push(monthPaid?.reduce((sum, inv) => sum + (inv.total_incl_vat || 0), 0) || 0)
    // Outstanding
    const { data: monthUnpaid } = await supabase
      .from("invoices")
      .select("total_incl_vat")
      .eq("user_id", user?.id)
      .eq("is_paid", false)
      .gte("invoice_date", start.toISOString())
      .lte("invoice_date", end.toISOString())
    outstandingSpark.push(monthUnpaid?.reduce((sum, inv) => sum + (inv.total_incl_vat || 0), 0) || 0)
    // Clients
    const { count: monthClients } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
    clientSpark.push(monthClients || 0)
    // Projects
    const { count: monthProjects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
    projectSpark.push(monthProjects || 0)
  }

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen p-4 md:p-8">
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
        prevClientCount={prevClientCount || 0}
        prevProjectCount={prevProjectCount || 0}
        prevTotalRevenue={prevTotalRevenue}
        prevOutstandingAmount={prevOutstandingAmount}
        revenueSpark={revenueSpark}
        outstandingSpark={outstandingSpark}
        clientSpark={clientSpark}
        projectSpark={projectSpark}
        monthLabels={monthLabels}
      />

      {/* Main grid for insights and actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Activity & Top Clients/Projects */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <RecentActivityFeed userId={user?.id || ''} />
          <TopClientsProjects userId={user?.id || ''} />
        </div>
        {/* Right column: Quick Actions, Revenue, Payments */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <QuickActions />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <RevenueChart />
            <UpcomingPayments />
          </div>
          <div className="flex items-center gap-2 mt-8 mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FileText className="h-5 w-5 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>Recent Invoices</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <h2 className="text-xl font-bold">Recent Invoices</h2>
          </div>
          <RecentInvoices invoices={recentInvoices || []} />
        </div>
      </div>
    </div>
  )
}
