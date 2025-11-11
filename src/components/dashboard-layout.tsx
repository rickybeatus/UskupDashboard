"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 border-r bg-muted/40 md:block">
        <ScrollArea className="h-full">
          <SidebarNav />
        </ScrollArea>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="container p-6">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}