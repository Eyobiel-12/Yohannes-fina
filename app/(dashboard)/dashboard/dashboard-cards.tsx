import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderKanban, Euro, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface DashboardCardsProps {
  clientCount: number
  projectCount: number
  totalRevenue: number
  outstandingAmount: number
  prevClientCount: number
  prevProjectCount: number
  prevTotalRevenue: number
  prevOutstandingAmount: number
  revenueSpark: number[]
  outstandingSpark: number[]
  clientSpark: number[]
  projectSpark: number[]
  monthLabels: string[]
}

function Sparkline({ data, color = "#22c55e" }: { data: number[]; color?: string }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 60
    const y = 24 - ((d - min) / range) * 20
    return `${x},${y}`
  }).join(" ")
  return (
    <svg width="64" height="24" viewBox="0 0 64 24" className="mt-1">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        style={{ opacity: 0.8 }}
      />
    </svg>
  )
}

export function DashboardCards({ clientCount, projectCount, totalRevenue, outstandingAmount, prevClientCount, prevProjectCount, prevTotalRevenue, prevOutstandingAmount, revenueSpark, outstandingSpark, clientSpark, projectSpark, monthLabels }: DashboardCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const getDelta = (current: number, prev: number) => {
    if (prev === 0) return null
    const delta = ((current - prev) / Math.abs(prev)) * 100
    return delta
  }

  const renderDelta = (delta: number | null) => {
    if (delta === null) return null
    const isUp = delta >= 0
    return (
      <span className={
        `ml-2 inline-flex items-center text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`
      }>
        {isUp ? <ArrowUpRight className="h-4 w-4 mr-0.5" /> : <ArrowDownRight className="h-4 w-4 mr-0.5" />}
        {Math.abs(delta).toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-green-50 via-white to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {formatCurrency(totalRevenue)}
            {renderDelta(getDelta(totalRevenue, prevTotalRevenue))}
          </div>
          <Sparkline data={revenueSpark} color="#22c55e" />
          <p className="text-xs text-muted-foreground">Paid invoices</p>
        </CardContent>
      </Card>
      <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-green-50 via-white to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {formatCurrency(outstandingAmount)}
            {renderDelta(getDelta(outstandingAmount, prevOutstandingAmount))}
          </div>
          <Sparkline data={outstandingSpark} color="#f59e42" />
          <p className="text-xs text-muted-foreground">Unpaid invoices</p>
        </CardContent>
      </Card>
      <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-green-50 via-white to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {clientCount}
            {renderDelta(getDelta(clientCount, prevClientCount))}
          </div>
          <Sparkline data={clientSpark} color="#22c55e" />
          <p className="text-xs text-muted-foreground">Total clients</p>
        </CardContent>
      </Card>
      <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-green-50 via-white to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projects</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {projectCount}
            {renderDelta(getDelta(projectCount, prevProjectCount))}
          </div>
          <Sparkline data={projectSpark} color="#3b82f6" />
          <p className="text-xs text-muted-foreground">Total projects</p>
        </CardContent>
      </Card>
    </div>
  )
}
