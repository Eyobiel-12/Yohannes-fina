"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChartData {
  month: string
  revenue: number
}

export function RevenueChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
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
      .select("invoice_date, total_incl_vat, is_paid")
      .eq("user_id", user.id)
      .gte("invoice_date", sixMonthsAgo.toISOString())
      .order("invoice_date", { ascending: true })

    if (!invoices) {
      setIsLoading(false)
      return
    }

    // Process data for chart
    const monthlyData: Record<string, number> = {}
    const paidMonthlyData: Record<string, number> = {}

    invoices.forEach((invoice) => {
      const date = new Date(invoice.invoice_date)
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

      // Total revenue (all invoices)
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0
      }
      monthlyData[monthYear] += invoice.total_incl_vat || 0

      // Paid revenue
      if (invoice.is_paid) {
        if (!paidMonthlyData[monthYear]) {
          paidMonthlyData[monthYear] = 0
        }
        paidMonthlyData[monthYear] += invoice.total_incl_vat || 0
      }
    })

    // Convert to array format for chart
    const chartDataArray = Object.keys(monthlyData).map((month) => ({
      month,
      revenue: monthlyData[month],
      paidRevenue: paidMonthlyData[month] || 0,
    }))

    setChartData(chartDataArray)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  // Calculate max value for chart scaling
  const maxValue = Math.max(...chartData.map((d) => d.revenue), 1000)

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue for the past 6 months</CardDescription>
        <div className="absolute right-4 top-4">
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
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
              <div className="h-full w-full">
                <div className="flex h-[240px] items-end gap-2">
                  {chartData.map((data, i) => (
                    <div key={i} className="relative flex h-full flex-1 flex-col justify-end">
                      <div
                        className="w-full rounded-md bg-blue-500 dark:bg-blue-600"
                        style={{
                          height: `${(data.revenue / maxValue) * 100}%`,
                          minHeight: "4px",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex w-full justify-between mt-2">
                  {chartData.map((data, i) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      {data.month}
                    </div>
                  ))}
                </div>
              </div>
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
              <div className="h-full w-full">
                <div className="flex h-[240px] items-end gap-2">
                  {chartData.map((data, i) => (
                    <div key={i} className="relative flex h-full flex-1 flex-col justify-end">
                      <div
                        className="w-full rounded-md bg-green-500 dark:bg-green-600"
                        style={{
                          height: `${(data.paidRevenue / maxValue) * 100}%`,
                          minHeight: "4px",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex w-full justify-between mt-2">
                  {chartData.map((data, i) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      {data.month}
                    </div>
                  ))}
                </div>
              </div>
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
