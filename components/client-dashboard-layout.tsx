'use client'

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function ClientDashboardLayout({ user, children }: { user: any, children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <MobileSidebar />
            <div className="font-semibold sm:hidden">YH App</div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <DashboardNav user={user} collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={collapsed ? "w-full transition-all duration-300" : "w-full transition-all duration-300"}>
          <div className="px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 