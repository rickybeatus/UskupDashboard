"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  CheckSquare,
  Mail,
  BarChart3,
  Users,
  Settings,
  Church,
  UserCheck,
} from "lucide-react"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Notulensi",
    href: "/notulensi",
    icon: FileText,
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    title: "Tugas Uskup",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Surat Menyurat",
    href: "/surat",
    icon: Mail,
  },
  {
    title: "Timeline & Report",
    href: "/timeline",
    icon: BarChart3,
  },
  {
    title: "Database Imam",
    href: "/database-imam",
    icon: Users,
    external: true,
  },
  {
    title: "Profil Uskup",
    href: "/profil",
    icon: UserCheck,
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarNavProps {
  className?: string
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-2 mb-6">
            <Church className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Dashboard Uskup</h2>
          </div>
          <div className="space-y-1">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-muted"
                )}
                asChild
              >
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : "_self"}
                  rel={item.external ? "noopener noreferrer" : undefined}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}