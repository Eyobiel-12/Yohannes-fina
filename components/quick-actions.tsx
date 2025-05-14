import { Plus, FileText, Users, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function QuickActions() {
  const actions = [
    {
      title: "New Invoice",
      description: "Create a new invoice",
      icon: FileText,
      href: "/invoices/new",
      color: "text-blue-500",
    },
    {
      title: "New Client",
      description: "Add a new client",
      icon: Users,
      href: "/clients/new",
      color: "text-green-500",
    },
    {
      title: "New Project",
      description: "Create a new project",
      icon: Plus,
      href: "/projects/new",
      color: "text-purple-500",
    },
    {
      title: "View Reports",
      description: "See financial reports",
      icon: BarChart3,
      href: "/dashboard",
      color: "text-amber-500",
    },
  ]

  return (
    <Card className="h-full shadow-lg bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Plus className="h-5 w-5 text-green-500 group-hover:animate-pulse transition-all" />
              </TooltipTrigger>
              <TooltipContent>Quick Actions</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CardTitle>Quick Actions</CardTitle>
        </div>
        <CardDescription>Common tasks you can perform</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {actions.map((action, i) => (
            <Link key={i} href={action.href} className="block group">
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-2 p-4 text-left transition-all hover:bg-accent hover:scale-105 hover:shadow-lg"
              >
                <action.icon className={`h-5 w-5 ${action.color} group-hover:animate-pulse transition-all`} />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
