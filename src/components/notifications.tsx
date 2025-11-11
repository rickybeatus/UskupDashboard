"use client"

import * as React from "react"
import { Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useSocket } from "@/hooks/useSocket"
import { useCurrentUser } from "@/hooks/useAuth"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Rapat Kuria Dimulai",
    message: "Rapat kuria bulanan akan dimulai dalam 30 menit",
    type: "info",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false
  },
  {
    id: "2",
    title: "Tugas Selesai",
    message: "Review proposal gereja baru telah selesai",
    type: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false
  },
  {
    id: "3",
    title: "Deadline Surat",
    message: "Surat edaran Adven perlu disetujui hari ini",
    type: "warning",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true
  }
]

export function Notifications() {
  const { user } = useCurrentUser()
  const { isConnected, notifications: socketNotifications } = useSocket({
    autoConnect: true,
    userId: user?.id,
    userName: user?.name,
    userRole: user?.role
  })
  
  const [notifications, setNotifications] = React.useState<Notification[]>(sampleNotifications)
  const [isOpen, setIsOpen] = React.useState(false)

  // Combine sample notifications with real-time notifications
  React.useEffect(() => {
    const realTimeNotifications: Notification[] = socketNotifications.map((notif, index) => ({
      id: `realtime-${index}`,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      timestamp: new Date(notif.timestamp),
      read: false
    }))
    
    setNotifications(prev => [...realTimeNotifications, ...prev])
  }, [socketNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} hari lalu`
    if (hours > 0) return `${hours} jam lalu`
    if (minutes > 0) return `${minutes} menit lalu`
    return "Baru saja"
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <div className="relative">
          <Bell className="h-4 w-4" />
          {isConnected && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
            {unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifikasi</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-background border rounded-lg shadow-lg z-50">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifikasi</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Tandai semua dibaca
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada notifikasi
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-muted/30' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {getIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{notification.title}</p>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}