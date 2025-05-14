"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function RevenueChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'paid'>('all')
  const supabase = createClient()

  const fetchData = async (paidOnly = false) => {
    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }
    // Get invoices from the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const { data: invoices } = await supabase
      .from("invoices")
      .select("invoice_date, total_incl_vat, is_paid, clients(name, id)")
      .eq("user_id", user.id)
      .gte("invoice_date", sixMonthsAgo.toISOString())
      .order("invoice_date", { ascending: true })
    if (!invoices) {
      setIsLoading(false)
      return
    }
    // Group by month and client
    const months: string[] = []
    const clientSet = new Set<string>()
    const grouped: Record<string, Record<string, number>> = {}
    invoices.forEach((inv: any) => {
      if (paidOnly && !inv.is_paid) return
      const date = new Date(inv.invoice_date)
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
      if (!months.includes(monthYear)) months.push(monthYear)
      const client = inv.clients?.name || 'Unknown'
      clientSet.add(client)
      if (!grouped[monthYear]) grouped[monthYear] = {}
      grouped[monthYear][client] = (grouped[monthYear][client] || 0) + (inv.total_incl_vat || 0)
    })
    // Build chart data
    const chartArr = months.map(month => {
      const entry: any = { month }
      clientSet.forEach(client => {
        entry[client] = grouped[month]?.[client] || 0
      })
      return entry
    })
    setClients(Array.from(clientSet))
    setChartData(chartArr)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData(tab === 'paid')
    // eslint-disable-next-line
  }, [tab])

  // Color palette for clients
  const colors = [
    '#22c55e', '#3b82f6', '#f59e42', '#a855f7', '#f43f5e', '#eab308', '#0ea5e9', '#6366f1', '#14b8a6', '#f472b6'
  ]

  return (
    <Card className="h-full shadow-lg bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BarChart3 className="h-5 w-5 text-blue-500" aria-label="Revenue Overview" />
              </TooltipTrigger>
              <TooltipContent>Revenue Overview</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CardTitle>Revenue Overview</CardTitle>
        </div>
        <CardDescription>Monthly revenue for the past 6 months</CardDescription>
        <div className="absolute right-4 top-4">
          <Button variant="outline" size="sm" onClick={() => fetchData(tab === 'paid')} disabled={isLoading} aria-label="Refresh Revenue Chart">
            <RefreshCw className={`h-4 w-4 mr-1 transition-transform ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={tab} onValueChange={v => setTab(v as 'all' | 'paid')}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="paid">Paid Only</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="h-[300px] w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={v => `€${v.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`} />
                  <RechartsTooltip formatter={(value: any, name: string) => [`€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, name]} />
                  <Legend />
                  {clients.map((client, i) => (
                    <Bar key={client} dataKey={client} stackId="a" fill={colors[i % colors.length]} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No invoice data available</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="paid" className="h-[300px] w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={v => `€${v.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`} />
                  <RechartsTooltip formatter={(value: any, name: string) => [`€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, name]} />
                  <Legend />
                  {clients.map((client, i) => (
                    <Bar key={client} dataKey={client} stackId="a" fill={colors[i % colors.length]} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No paid invoice data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
