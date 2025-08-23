"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Zap, Users, Bell, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (!role) {
      router.push("/")
      return
    }
    setUserRole(role)
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, current: pathname === "/dashboard" },
    { name: "Meters", href: "/meters", icon: Zap, current: pathname === "/meters" },
    { name: "Reports", href: "/reports", icon: BarChart3, current: pathname === "/reports" },
    { name: "Alerts", href: "/alerts", icon: Bell, current: pathname === "/alerts" },
    { name: "Settings", href: "/settings", icon: Settings, current: pathname === "/settings" },
    ...(userRole === "admin"
      ? [{ name: "Admin Panel", href: "/admin", icon: Users, current: pathname === "/admin" }]
      : []),
  ]

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20 electric-pulse">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold electric-text">ElectricPulse</span>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    item.current
                      ? "bg-primary/20 text-primary electric-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{userRole === "admin" ? "A" : "U"}</span>
            </div>
            <div>
              <div className="text-sm font-medium">{userRole === "admin" ? "Administrator" : "User"}</div>
              <div className="text-xs text-muted-foreground">
                {userRole === "admin" ? "System Admin" : "Company User"}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/alerts">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
