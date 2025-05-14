"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Users, FolderKanban, FileText, Settings, Plus, Bell, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// Example nav groups
const navGroups: NavGroup[] = [
  {
    label: "Management",
    items: [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
      },
    ],
  },
  {
    label: "Billing",
    items: [
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
        badge: 2, // Example: 2 new invoices
      },
    ],
  },
  {
    label: "Settings",
    items: [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
      },
    ],
  },
]

interface DashboardNavProps {
  user?: { email?: string }
  collapsed?: boolean
  setCollapsed?: (collapsed: boolean) => void
}

export function DashboardNav({ user, collapsed = false, setCollapsed }: DashboardNavProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<{ [label: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U"

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <nav
      className={cn(
        "flex flex-col h-full relative border-r bg-white shadow-sm transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
      style={{ borderTopRightRadius: "1.25rem", borderBottomRightRadius: "1.25rem" }}
    >
      {/* Collapse/Expand Button */}
      <button
        className={cn(
          "absolute -right-3 top-6 z-20 flex items-center justify-center w-6 h-6 rounded-full border bg-white shadow transition hover:bg-green-100",
          collapsed ? "border-green-300" : "border-green-500"
        )}
        onClick={() => setCollapsed && setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        type="button"
      >
        {collapsed ? <ChevronRight className="h-4 w-4 text-green-600" /> : <ChevronLeft className="h-4 w-4 text-green-600" />}
      </button>

      {/* Logo at the top */}
      <div className={cn("flex flex-col items-center justify-center py-6 transition-all", collapsed ? "py-4" : "py-6")}
        style={{ minHeight: collapsed ? 60 : 80 }}>
        <Image
          src="/yohannes-logo.png"
          alt="Yohannes Logo"
          width={collapsed ? 36 : 56}
          height={collapsed ? 36 : 56}
          className="rounded-xl shadow bg-white"
        />
        {!collapsed && (
          <span className="mt-2 text-xs font-bold text-green-700 tracking-wide text-center">YOHANNES</span>
        )}
      </div>

      {/* Notifications/Shortcuts */}
      <div className={cn("flex items-center justify-between px-3 mb-2 transition-all", collapsed && "justify-center px-0")}
        style={{ minHeight: 32 }}>
        <button className="relative group" title="Notifications">
          <Bell className={cn("h-5 w-5 text-green-700 group-hover:text-green-900 transition", collapsed && "mx-auto")} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5 font-bold animate-bounce">3</span>
        </button>
        {!collapsed && (
          <button className="text-xs text-green-900 hover:text-green-700 transition px-2 py-1 rounded-md border border-transparent hover:border-green-300">
            + Add Shortcut
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider uppercase text-green-700",
              !collapsed && "border-b border-green-100 mb-1"
            )}>
              <span className={cn(collapsed && "sr-only")}>{group.label}</span>
              <button
                className={cn(
                  "ml-auto text-green-400 hover:text-green-700 transition p-1 rounded",
                  collapsed && "hidden"
                )}
                onClick={() => toggleGroup(group.label)}
                type="button"
                aria-label={openGroups[group.label] ? `Collapse ${group.label}` : `Expand ${group.label}`}
              >
                <span className={cn("transition-transform", openGroups[group.label] ? "rotate-90" : "")}>▶</span>
              </button>
            </div>
            <div className={cn(
              "flex flex-col gap-1 transition-all",
              openGroups[group.label] === false ? "hidden" : "",
              collapsed && "items-center"
            )}>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-green-50 hover:text-green-900 transition-all relative overflow-hidden",
                      isActive ? "bg-green-100 text-green-900 font-semibold" : "text-green-700",
                      collapsed && "justify-center px-2 py-2"
                    )}
                    style={{ position: 'relative', minHeight: 40 }}
                  >
                    <item.icon className={cn("h-5 w-5 z-10", collapsed ? "mx-0" : "mr-2")}/>
                    {!collapsed && <span className="z-10">{item.title}</span>}
                    {item.badge && !collapsed && (
                      <span className="ml-auto bg-green-700 text-white rounded-full px-2 py-0.5 text-xs font-bold animate-pulse z-10">
                        {item.badge}
                      </span>
                    )}
                    {item.badge && collapsed && (
                      <span className="absolute top-1 right-1 bg-green-700 text-white rounded-full px-1 py-0.5 text-xs font-bold animate-pulse z-10">
                        {item.badge}
                      </span>
                    )}
        </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Account Info and Logout */}
      <div className={cn(
        "mt-4 p-3 border-t border-green-100 flex items-center gap-3 bg-green-50/60 backdrop-blur-sm transition-all",
        collapsed ? "flex-col p-2 gap-1" : ""
      )}>
        <Avatar className={cn("h-9 w-9", collapsed && "h-8 w-8 mx-auto") }>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {!collapsed ? (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold truncate text-green-900 w-full block" title={user?.email || "User"}>
              {user?.email || "User"}
            </span>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="mt-1 text-xs font-medium text-green-700 hover:underline focus:outline-none"
              style={{ whiteSpace: 'nowrap' }}
            >
              {isLoading ? "Signing out..." : "Logout"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="text-xs font-medium text-green-700 hover:underline focus:outline-none"
            style={{ whiteSpace: 'nowrap' }}
          >
            {isLoading ? "⏳" : "⎋"}
          </button>
        )}
      </div>
    </nav>
  )
}
