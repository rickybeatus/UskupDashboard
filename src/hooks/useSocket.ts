'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketOptions {
  autoConnect?: boolean
  userId?: string
  userName?: string
  userRole?: string
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connectedUsers: any[]
  notifications: any[]
  messages: any[]
  sendNotification: (notification: any) => void
  sendMessage: (message: any) => void
  requestDashboardRefresh: () => void
  startTyping: (targetId?: string) => void
  stopTyping: (targetId?: string) => void
  sendDataUpdate: (data: any) => void
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!options.autoConnect) return

    const socketInstance = io({
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setIsConnected(true)
      
      // Identify user if user info is available
      if (options.userId) {
        socketInstance.emit('user:identify', {
          id: options.userId,
          name: options.userName,
          role: options.userRole || 'user'
        })
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // Handle connection events
    socketInstance.on('connection:established', (data) => {
      console.log('Connection established:', data)
    })

    // Handle user presence
    socketInstance.on('user:joined', (data) => {
      console.log('User joined:', data.user)
      // Could show notification or update UI
    })

    socketInstance.on('user:left', (data) => {
      console.log('User left:', data.user)
      // Could show notification or update UI
    })

    socketInstance.on('users:list', (users) => {
      setConnectedUsers(users)
    })

    // Handle notifications
    socketInstance.on('notification:receive', (notification) => {
      setNotifications(prev => [...prev, notification])
      // You can integrate with a toast system here
      console.log('New notification:', notification)
    })

    // Handle chat messages
    socketInstance.on('chat:message', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Handle typing indicators
    socketInstance.on('typing:start', (data) => {
      // Could show typing indicator in UI
      console.log('User typing:', data.userId)
    })

    socketInstance.on('typing:stop', (data) => {
      // Hide typing indicator
      console.log('User stopped typing:', data.userId)
    })

    // Handle data updates
    socketInstance.on('data:changed', (data) => {
      console.log('Data changed:', data)
      // Could trigger a refetch of data in the relevant component
    })

    // Handle dashboard refresh
    socketInstance.on('dashboard:should-refresh', (data) => {
      console.log('Dashboard refresh requested by:', data.requestedBy)
      // Could trigger a refetch of dashboard data
      window.location.reload() // Simple approach - could be more sophisticated
    })

    setSocket(socketInstance)

    // Send periodic heartbeat
    const heartbeatInterval = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('heartbeat')
      }
    }, 30000) // Every 30 seconds

    return () => {
      clearInterval(heartbeatInterval)
      socketInstance.disconnect()
    }
  }, [options.autoConnect, options.userId])

  // Cleanup notifications and messages periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Keep only last 100 notifications and messages
      if (notifications.length > 100) {
        setNotifications(prev => prev.slice(-100))
      }
      if (messages.length > 100) {
        setMessages(prev => prev.slice(-100))
      }
    }, 60000) // Every minute

    return () => clearInterval(cleanupInterval)
  }, [notifications.length, messages.length])

  const sendNotification = (notification: any) => {
    if (socket && isConnected) {
      socket.emit('notification:send', notification)
    }
  }

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.emit('chat:message', {
        ...message,
        senderId: options.userId,
        senderName: options.userName
      })
    }
  }

  const requestDashboardRefresh = () => {
    if (socket && isConnected) {
      socket.emit('dashboard:refresh', {
        userId: options.userId
      })
    }
  }

  const startTyping = (targetId?: string) => {
    if (socket && isConnected) {
      socket.emit('typing:start', {
        userId: options.userId,
        targetId
      })
    }
  }

  const stopTyping = (targetId?: string) => {
    if (socket && isConnected) {
      socket.emit('typing:stop', {
        userId: options.userId,
        targetId
      })
    }
  }

  const sendDataUpdate = (data: any) => {
    if (socket && isConnected) {
      socket.emit('data:update', data)
    }
  }

  return {
    socket,
    isConnected,
    connectedUsers,
    notifications,
    messages,
    sendNotification,
    sendMessage,
    requestDashboardRefresh,
    startTyping,
    stopTyping,
    sendDataUpdate
  }
}