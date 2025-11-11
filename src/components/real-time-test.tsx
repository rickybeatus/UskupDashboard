'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSocket } from '@/hooks/useSocket'
import { useSession } from 'next-auth/react'
import { Send, Users, MessageCircle, Bell, RefreshCw } from 'lucide-react'

export function RealTimeTest() {
  const { data: session } = useSession()
  const {
    isConnected,
    connectedUsers,
    notifications,
    messages,
    sendNotification,
    sendMessage,
    requestDashboardRefresh,
    sendDataUpdate
  } = useSocket({
    autoConnect: true,
    userId: session?.user?.id,
    userName: session?.user?.name,
    userRole: session?.user?.role
  })

  const [testMessage, setTestMessage] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')

  const sendTestNotification = () => {
    if (notificationTitle && notificationMessage) {
      sendNotification({
        type: 'info',
        title: notificationTitle,
        message: notificationMessage
      })
      setNotificationTitle('')
      setNotificationMessage('')
    }
  }

  const sendTestMessage = () => {
    if (testMessage) {
      sendMessage({
        text: testMessage
      })
      setTestMessage('')
    }
  }

  const triggerDataUpdate = () => {
    sendDataUpdate({
      type: 'tasks',
      action: 'update',
      recordId: 'test-123',
      data: { title: 'Task updated via real-time', status: 'In Progress' }
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            Status Koneksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">WebSocket</span>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Terhubung' : 'Terputus'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User Terhubung</span>
              <Badge variant="outline">{connectedUsers.length}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {session?.user?.id || 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {connectedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada user online</p>
            ) : (
              connectedUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="truncate">{user.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Notification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Test Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Judul notifikasi"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Pesan notifikasi"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            className="text-sm"
          />
          <Button 
            onClick={sendTestNotification} 
            size="sm" 
            className="w-full"
            disabled={!isConnected}
          >
            <Send className="h-3 w-3 mr-1" />
            Kirim Notifikasi
          </Button>
        </CardContent>
      </Card>

      {/* Test Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Test Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Pesan chat"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="text-sm"
          />
          <Button 
            onClick={sendTestMessage} 
            size="sm" 
            className="w-full"
            disabled={!isConnected}
          >
            <Send className="h-3 w-3 mr-1" />
            Kirim Pesan
          </Button>
        </CardContent>
      </Card>

      {/* Test Data Update */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Test Data Update
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={triggerDataUpdate} 
            size="sm" 
            className="w-full"
            disabled={!isConnected}
          >
            Update Data
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Meneruskan update data ke semua user yang terhubung
          </p>
        </CardContent>
      </Card>

      {/* Test Dashboard Refresh */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Test Dashboard Refresh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={requestDashboardRefresh} 
            size="sm" 
            className="w-full"
            disabled={!isConnected}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Semua Dashboard
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Meminta semua user untuk refresh halaman
          </p>
        </CardContent>
      </Card>
    </div>
  )
}