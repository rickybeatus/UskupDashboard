/**
 * Error Tracking and Monitoring System
 * Dashboard Uskup Surabaya - Production Monitoring
 */

import { createError, ErrorTypes } from './errorHandler'

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Monitoring config
const MONITORING_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  apiEndpoint: process.env.MONITORING_API_ENDPOINT || '',
  apiKey: process.env.MONITORING_API_KEY || '',
  bufferSize: 100,
  flushInterval: 30000, // 30 seconds
  sampleRate: 0.1 // 10% of errors in development
}

// Error tracking interface
export interface ErrorEvent {
  id: string
  timestamp: string
  severity: ErrorSeverity
  type: string
  message: string
  stack?: string
  userId?: string
  sessionId?: string
  requestId?: string
  url: string
  userAgent: string
  metadata?: Record<string, any>
  context?: Record<string, any>
}

// Performance metrics interface
export interface PerformanceMetric {
  id: string
  timestamp: string
  name: string
  value: number
  unit: string
  tags?: Record<string, string>
  metadata?: Record<string, any>
}

// User session tracking
export interface UserSession {
  sessionId: string
  userId: string
  startTime: string
  lastActivity: string
  pageViews: number
  errors: number
  actions: number
}

// Error buffer for batching
let errorBuffer: ErrorEvent[] = []
let performanceBuffer: PerformanceMetric[] = []
let sessionBuffer: UserSession[] = []

// Monitoring client interface
interface MonitoringClient {
  trackError: (error: ErrorEvent) => Promise<void>
  trackPerformance: (metric: PerformanceMetric) => Promise<void>
  trackSession: (session: UserSession) => Promise<void>
  flush: () => Promise<void>
}

// Console monitoring (development)
class ConsoleMonitoring implements MonitoringClient {
  async trackError(error: ErrorEvent) {
    console.group(`🚨 Error Tracked [${error.severity.toUpperCase()}]`)
    console.log('Type:', error.type)
    console.log('Message:', error.message)
    console.log('User:', error.userId || 'Anonymous')
    console.log('URL:', error.url)
    console.log('Request ID:', error.requestId)
    if (error.stack) console.log('Stack:', error.stack)
    console.log('Metadata:', error.metadata)
    console.groupEnd()
  }

  async trackPerformance(metric: PerformanceMetric) {
    console.log(`📊 Metric: ${metric.name} = ${metric.value}${metric.unit} [${metric.timestamp}]`)
  }

  async trackSession(session: UserSession) {
    console.log(`👤 Session: ${session.sessionId} (${session.userId}) - ${session.pageViews} views, ${session.errors} errors`)
  }

  async flush() {
    console.log('🔄 Flushing monitoring data...')
  }
}

// API monitoring (production)
class ApiMonitoring implements MonitoringClient {
  private apiEndpoint: string
  private apiKey: string

  constructor(endpoint: string, apiKey: string) {
    this.apiEndpoint = endpoint
    this.apiKey = apiKey
  }

  async trackError(error: ErrorEvent) {
    try {
      await this.sendToAPI('/errors', error)
    } catch (err) {
      console.error('Failed to send error to monitoring API:', err)
    }
  }

  async trackPerformance(metric: PerformanceMetric) {
    try {
      await this.sendToAPI('/metrics', metric)
    } catch (err) {
      console.error('Failed to send performance metric to monitoring API:', err)
    }
  }

  async trackSession(session: UserSession) {
    try {
      await this.sendToAPI('/sessions', session)
    } catch (err) {
      console.error('Failed to send session data to monitoring API:', err)
    }
  }

  async flush() {
    if (errorBuffer.length > 0) {
      try {
        await this.sendToAPI('/errors/batch', { errors: errorBuffer })
        errorBuffer = []
      } catch (err) {
        console.error('Failed to flush error buffer:', err)
      }
    }

    if (performanceBuffer.length > 0) {
      try {
        await this.sendToAPI('/metrics/batch', { metrics: performanceBuffer })
        performanceBuffer = []
      } catch (err) {
        console.error('Failed to flush performance buffer:', err)
      }
    }
  }

  private async sendToAPI(endpoint: string, data: any) {
    const response = await fetch(`${this.apiEndpoint}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'Dashboard-Uskup-Monitoring/1.0'
      },
      body: JSON.stringify({
        ...data,
        source: 'dashboard-uskup',
        environment: process.env.NODE_ENV
      })
    })

    if (!response.ok) {
      throw new Error(`Monitoring API error: ${response.status} ${response.statusText}`)
    }
  }
}

// Initialize monitoring client
const monitoringClient: MonitoringClient = MONITORING_CONFIG.enabled && MONITORING_CONFIG.apiEndpoint
  ? new ApiMonitoring(MONITORING_CONFIG.apiEndpoint, MONITORING_CONFIG.apiKey)
  : new ConsoleMonitoring()

/**
 * Generate unique ID for monitoring events
 */
function generateId(): string {
  return `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get current user context for monitoring
 */
function getUserContext() {
  if (typeof window === 'undefined') {
    return {
      userId: 'server',
      sessionId: 'server-session',
      userAgent: 'Node.js Server'
    }
  }

  return {
    userId: localStorage.getItem('userId') || 'anonymous',
    sessionId: sessionStorage.getItem('sessionId') || 'anonymous',
    userAgent: navigator.userAgent
  }
}

/**
 * Track errors with automatic context collection
 */
export function trackError(
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Record<string, any>
): void {
  const errorEvent: ErrorEvent = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    severity,
    type: typeof error === 'string' ? 'CustomError' : error.name,
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    ...getUserContext(),
    metadata: {
      nodeEnv: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    },
    context
  }

  // Buffer error for batch processing
  if (monitoringClient instanceof ConsoleMonitoring || Math.random() < MONITORING_CONFIG.sampleRate) {
    errorBuffer.push(errorEvent)
  }

  // Track with monitoring client
  monitoringClient.trackError(errorEvent)

  // Console error for development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error Tracked:', errorEvent)
  }
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  name: string,
  value: number,
  unit: string = 'ms',
  tags?: Record<string, string>,
  metadata?: Record<string, any>
): void {
  const metric: PerformanceMetric = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    name,
    value,
    unit,
    tags,
    metadata
  }

  performanceBuffer.push(metric)
  monitoringClient.trackPerformance(metric)

  // Log performance warnings
  if (value > 5000 && name.includes('load')) {
    trackError(
      `Slow page load: ${value}ms`,
      ErrorSeverity.HIGH,
      { pageLoadTime: value, name }
    )
  }
}

/**
 * Track user sessions
 */
export function trackSession(
  sessionId: string,
  userId: string,
  action: 'start' | 'activity' | 'end' | 'error'
): void {
  const session: UserSession = {
    sessionId,
    userId,
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    pageViews: 1,
    errors: action === 'error' ? 1 : 0,
    actions: 1
  }

  sessionBuffer.push(session)
  monitoringClient.trackSession(session)
}

/**
 * Track API response times
 */
export function trackApiResponse(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
  error?: any
): void {
  const success = statusCode >= 200 && statusCode < 300
  
  trackPerformance(
    'api_response_time',
    duration,
    'ms',
    {
      endpoint,
      method,
      status_code: statusCode.toString(),
      success: success.toString()
    },
    { error: error?.message }
  )

  // Track API errors
  if (!success) {
    trackError(
      `API Error: ${method} ${endpoint} returned ${statusCode}`,
      statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      {
        endpoint,
        method,
        statusCode,
        duration
      }
    )
  }
}

/**
 * Track page view metrics
 */
export function trackPageView(page: string): void {
  trackPerformance('page_view', 1, 'count', { page })
  
  // Track with user session
  const context = getUserContext()
  trackSession(context.sessionId, context.userId, 'activity')
}

/**
 * Track user actions
 */
export function trackUserAction(action: string, metadata?: Record<string, any>): void {
  trackPerformance('user_action', 1, 'count', { action }, metadata)
  
  // Track with user session
  const context = getUserContext()
  trackSession(context.sessionId, context.userId, 'activity')
}

/**
 * Monitor memory usage
 */
export function trackMemoryUsage(): void {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage()
    
    trackPerformance('memory_heap_used', memory.heapUsed, 'bytes')
    trackPerformance('memory_heap_total', memory.heapTotal, 'bytes')
    trackPerformance('memory_rss', memory.rss, 'bytes')
    trackPerformance('memory_external', memory.external, 'bytes')
  }
}

/**
 * Monitor database query performance
 */
export function trackDatabaseQuery(
  query: string,
  duration: number,
  success: boolean,
  rowCount?: number
): void {
  trackPerformance(
    'database_query_time',
    duration,
    'ms',
    {
      query_type: query.split(' ')[0].toLowerCase(), // SELECT, INSERT, UPDATE, DELETE
      success: success.toString(),
      row_count: rowCount?.toString() || '0'
    },
    { query }
  )

  if (duration > 1000) {
    trackError(
      `Slow database query: ${duration}ms`,
      ErrorSeverity.MEDIUM,
      { query, duration, rowCount }
    )
  }
}

/**
 * Set up automatic monitoring
 */
export function setupMonitoring(): void {
  if (!MONITORING_CONFIG.enabled) {
    console.log('📊 Monitoring disabled in development mode')
    return
  }

  // Flush buffers periodically
  setInterval(() => {
    monitoringClient.flush()
  }, MONITORING_CONFIG.flushInterval)

  // Track memory usage every minute
  setInterval(() => {
    trackMemoryUsage()
  }, 60000)

  // Track unhandled errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      trackError(event.error, ErrorSeverity.HIGH, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      trackError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        ErrorSeverity.HIGH,
        { reason: event.reason }
      )
    })
  }

  // Track process errors
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      trackError(error, ErrorSeverity.CRITICAL, {
        type: 'uncaught_exception'
      })
    })

    process.on('unhandledRejection', (reason) => {
      trackError(
        new Error(`Unhandled Promise Rejection: ${reason}`),
        ErrorSeverity.CRITICAL,
        { reason }
      )
    })
  }

  console.log('📊 Monitoring system initialized')
}

/**
 * Get monitoring statistics
 */
export function getMonitoringStats(): {
  errorBufferSize: number
  performanceBufferSize: number
  sessionBufferSize: number
  monitoringEnabled: boolean
} {
  return {
    errorBufferSize: errorBuffer.length,
    performanceBufferSize: performanceBuffer.length,
    sessionBufferSize: sessionBuffer.length,
    monitoringEnabled: MONITORING_CONFIG.enabled
  }
}

/**
 * Manual flush of all buffers
 */
export async function flushMonitoring(): Promise<void> {
  await monitoringClient.flush()
  console.log('📊 Monitoring data flushed')
}

// Initialize monitoring automatically in production
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setupMonitoring()
  })
}