import { Server, Socket } from 'socket.io';

interface ConnectedUser {
  id: string
  socketId: string
  name: string
  role: string
  lastSeen: Date
  joinTime: Date
  messageCount: number
  lastActivity: Date
}

interface MemoryStats {
  totalConnections: number
  maxConnections: number
  memoryUsage: number
  averageSessionTime: number
  totalMessages: number
}

export const setupSocket = (io: Server) => {
  // Store connected users with enhanced tracking
  const connectedUsers = new Map<string, ConnectedUser>()
  const userActivity = new Map<string, Date>() // Track user activity
  const eventCounts = new Map<string, number>() // Track event frequency

  // Memory management settings
  const MAX_CONNECTIONS = 100 // Maximum concurrent connections
  const CLEANUP_INTERVAL = 2 * 60 * 1000 // 2 minutes
  const INACTIVE_THRESHOLD = 10 * 60 * 1000 // 10 minutes
  const MAX_MESSAGES_PER_MINUTE = 50 // Rate limiting
  const MEMORY_WARNING_THRESHOLD = 100 * 1024 * 1024 // 100MB

  // Statistics tracking
  let totalConnections = 0
  let totalDisconnections = 0
  let totalMessages = 0
  let startTime = new Date()

  // Memory usage monitoring
  const getMemoryUsage = (): number => {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }
    return 0
  }

  // Enhanced cleanup function
  const cleanupInactiveUsers = () => {
    const now = new Date()
    const inactiveUsers: string[] = []

    connectedUsers.forEach((user, socketId) => {
      const inactiveTime = now.getTime() - user.lastActivity.getTime()
      
      if (inactiveTime > INACTIVE_THRESHOLD) {
        inactiveUsers.push(socketId)
      }
    })

    // Remove inactive users
    inactiveUsers.forEach(socketId => {
      const user = connectedUsers.get(socketId)
      if (user) {
        connectedUsers.delete(socketId)
        userActivity.delete(user.id)
        
        // Broadcast user timeout
        io.emit('user:timeout', {
          user,
          reason: 'inactive',
          timestamp: now.toISOString()
        })
      }
    })

    // Log cleanup stats
    if (inactiveUsers.length > 0) {
      console.log(`🧹 Cleaned up ${inactiveUsers.length} inactive connections`)
    }
  }

  // Rate limiting check
  const isRateLimited = (socketId: string, eventName: string): boolean => {
    const key = `${socketId}:${eventName}`
    const now = Date.now()
    const windowStart = now - 60000 // 1 minute window

    // Clean old entries
    for (const [key, timestamp] of eventCounts.entries()) {
      if (timestamp < windowStart) {
        eventCounts.delete(key)
      }
    }

    // Check current rate
    const currentCount = Array.from(eventCounts.entries())
      .filter(([k, t]) => k.startsWith(socketId + ':') && t >= windowStart).length

    if (currentCount >= MAX_MESSAGES_PER_MINUTE) {
      return true
    }

    eventCounts.set(key, now)
    return false
  }

  // Memory monitoring
  const monitorMemory = () => {
    const memoryUsage = getMemoryUsage()
    const connectionCount = connectedUsers.size

    // Log memory stats periodically
    if (connectionCount % 10 === 0 || memoryUsage > MEMORY_WARNING_THRESHOLD) {
      console.log(`📊 Socket.IO Stats:
        Connections: ${connectionCount}/${MAX_CONNECTIONS}
        Memory: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB
        Total Messages: ${totalMessages}
        Uptime: ${Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)} minutes
      `)
    }

    // Warning for high memory usage
    if (memoryUsage > MEMORY_WARNING_THRESHOLD) {
      console.warn(`⚠️ High memory usage detected: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`)
      // Force cleanup
      cleanupInactiveUsers()
    }
  }

  // Connection limit enforcement
  const checkConnectionLimit = (): boolean => {
    return connectedUsers.size < MAX_CONNECTIONS
  }

  io.on('connection', (socket: Socket) => {
    totalConnections++

    // Check connection limit
    if (!checkConnectionLimit()) {
      console.log(`🚫 Connection limit reached (${MAX_CONNECTIONS}). Rejecting new connection.`)
      socket.emit('error:connection', {
        message: 'Server at maximum capacity',
        code: 'CONNECTION_LIMIT_EXCEEDED'
      })
      socket.disconnect(true)
      return
    }

    console.log(`✅ Client connected: ${socket.id} (${connectedUsers.size + 1}/${MAX_CONNECTIONS})`)
    
    // Send connection stats to client
    socket.emit('connection:stats', {
      totalConnections: totalConnections,
      currentConnections: connectedUsers.size + 1,
      uptime: Math.floor((Date.now() - startTime.getTime()) / 1000),
      memoryUsage: getMemoryUsage()
    })

    // Handle user authentication/identification
    socket.on('user:identify', (userData: { id: string; name: string; role: string }) => {
      // Rate limiting check
      if (isRateLimited(socket.id, 'user:identify')) {
        socket.emit('error:rate-limit', { message: 'Too many identification requests' })
        return
      }

      const now = new Date()
      connectedUsers.set(socket.id, {
        id: userData.id,
        socketId: socket.id,
        name: userData.name,
        role: userData.role,
        lastSeen: now,
        joinTime: now,
        messageCount: 0,
        lastActivity: now
      })
      
      userActivity.set(userData.id, now)
      
      // Broadcast user join
      io.emit('user:joined', {
        user: connectedUsers.get(socket.id),
        timestamp: now.toISOString(),
        connectionCount: connectedUsers.size
      })
      
      // Send current connected users list
      io.emit('users:list', Array.from(connectedUsers.values()))
    })

    // Enhanced notification handler with rate limiting
    socket.on('notification:send', (notification: {
      type: 'info' | 'success' | 'warning' | 'error'
      title: string
      message: string
      targetUsers?: string[]
    }) => {
      if (isRateLimited(socket.id, 'notification:send')) {
        socket.emit('error:rate-limit', { message: 'Too many notifications' })
        return
      }

      totalMessages++
      const user = connectedUsers.get(socket.id)
      if (user) {
        user.messageCount++
        user.lastActivity = new Date()
      }

      if (notification.targetUsers) {
        // Send to specific users
        connectedUsers.forEach((user, socketId) => {
          if (notification.targetUsers!.includes(user.id)) {
            socket.to(socketId).emit('notification:receive', {
              ...notification,
              senderId: user?.id,
              timestamp: new Date().toISOString()
            })
          }
        })
      } else {
        // Broadcast to all users
        io.emit('notification:receive', {
          ...notification,
          senderId: user?.id,
          timestamp: new Date().toISOString()
        })
      }
    })

    // Enhanced data update events with validation
    socket.on('data:update', (data: {
      type: 'agenda' | 'tasks' | 'notulensi' | 'surat' | 'decisions'
      action: 'create' | 'update' | 'delete'
      recordId: string
      data: any
    }) => {
      if (isRateLimited(socket.id, 'data:update')) {
        socket.emit('error:rate-limit', { message: 'Too many data updates' })
        return
      }

      totalMessages++
      const user = connectedUsers.get(socket.id)
      if (user) {
        user.messageCount++
        user.lastActivity = new Date()
      }

      // Validate data type
      const validTypes = ['agenda', 'tasks', 'notulensi', 'surat', 'decisions']
      const validActions = ['create', 'update', 'delete']
      
      if (!validTypes.includes(data.type) || !validActions.includes(data.action)) {
        socket.emit('error:validation', { message: 'Invalid data update parameters' })
        return
      }

      // Broadcast to all other users (not the sender)
      socket.broadcast.emit('data:changed', {
        ...data,
        senderId: user?.id,
        timestamp: new Date().toISOString()
      })
    })

    // Handle dashboard refresh requests
    socket.on('dashboard:refresh', (data: { userId: string }) => {
      if (isRateLimited(socket.id, 'dashboard:refresh')) {
        socket.emit('error:rate-limit', { message: 'Too many refresh requests' })
        return
      }

      totalMessages++
      
      // Broadcast to all users that dashboard should be refreshed
      socket.broadcast.emit('dashboard:should-refresh', {
        requestedBy: data.userId,
        requesterName: connectedUsers.get(socket.id)?.name || 'Unknown',
        timestamp: new Date().toISOString()
      })
    })

    // Enhanced chat/messaging with moderation
    socket.on('chat:message', (message: {
      text: string
      senderId: string
      senderName: string
      targetId?: string
    }) => {
      if (isRateLimited(socket.id, 'chat:message')) {
        socket.emit('error:rate-limit', { message: 'Too many messages' })
        return
      }

      totalMessages++
      const user = connectedUsers.get(socket.id)
      if (user) {
        user.messageCount++
        user.lastActivity = new Date()
      }

      // Basic message validation
      if (!message.text || message.text.length > 1000) {
        socket.emit('error:validation', { message: 'Invalid message content' })
        return
      }

      if (message.targetId) {
        // Send to specific user
        connectedUsers.forEach((user, socketId) => {
          if (user.id === message.targetId) {
            socket.to(socketId).emit('chat:message', {
              ...message,
              timestamp: new Date().toISOString()
            })
          }
        })
      } else {
        // Broadcast to all users
        io.emit('chat:message', {
          ...message,
          timestamp: new Date().toISOString()
        })
      }
    })

    // Enhanced heartbeat with activity tracking
    socket.on('heartbeat', () => {
      const user = connectedUsers.get(socket.id)
      if (user) {
        user.lastSeen = new Date()
        user.lastActivity = new Date()
        userActivity.set(user.id, user.lastActivity)
      }
      
      // Send memory stats on heartbeat
      socket.emit('heartbeat:ack', {
        timestamp: new Date().toISOString(),
        memoryUsage: getMemoryUsage(),
        connectionCount: connectedUsers.size
      })
    })

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      totalDisconnections++
      const user = connectedUsers.get(socket.id)
      if (user) {
        // Remove user from connected users
        connectedUsers.delete(socket.id)
        userActivity.delete(user.id)
        
        // Broadcast user left
        io.emit('user:left', {
          user,
          reason: reason,
          timestamp: new Date().toISOString()
        })
        
        // Update users list
        io.emit('users:list', Array.from(connectedUsers.values()))
      }
      
      console.log(`❌ Client disconnected: ${socket.id} (${connectedUsers.size}/${MAX_CONNECTIONS}) - Reason: ${reason}`)
    })

    // Send welcome message and initial connection status
    socket.emit('connection:established', {
      message: 'Welcome to Dashboard Uskup Surabaya Real-time System!',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      features: [
        'Real-time notifications',
        'Live data updates',
        'User presence tracking',
        'Dashboard refresh sync',
        'Memory monitoring',
        'Rate limiting'
      ],
      limits: {
        maxConnections: MAX_CONNECTIONS,
        maxMessagesPerMinute: MAX_MESSAGES_PER_MINUTE,
        inactiveTimeout: INACTIVE_THRESHOLD / 1000 / 60
      }
    })
  })

  // Periodic cleanup of inactive connections
  setInterval(() => {
    cleanupInactiveUsers()
    monitorMemory()
  }, CLEANUP_INTERVAL)

  // Memory monitoring interval
  setInterval(() => {
    monitorMemory()
  }, 30000) // Every 30 seconds

  // Log initial setup
  console.log(`🚀 Socket.IO server initialized with memory management:
    - Max connections: ${MAX_CONNECTIONS}
    - Cleanup interval: ${CLEANUP_INTERVAL / 1000}s
    - Inactive timeout: ${INACTIVE_THRESHOLD / 1000 / 60} minutes
    - Rate limit: ${MAX_MESSAGES_PER_MINUTE} messages/minute
  `)
}