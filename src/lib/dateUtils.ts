/**
 * Date utility functions for Dashboard Uskup Surabaya
 * Provides timezone-aware and locale-specific date handling
 */

// Set timezone to Indonesia (WIB)
const TIMEZONE = 'Asia/Jakarta'

// Indonesian locale
const LOCALE = 'id-ID'

/**
 * Get current date in Indonesia timezone
 */
export function getCurrentDate(): Date {
  return new Date()
}

/**
 * Get date string in YYYY-MM-DD format for Indonesia timezone
 */
export function getDateString(date?: Date): string {
  const d = date || new Date()
  return d.toISOString().split('T')[0]
}

/**
 * Get formatted date for display in Indonesian locale
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'short') {
    return d.toLocaleDateString(LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } else if (format === 'long') {
    return d.toLocaleDateString(LOCALE, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } else {
    return d.toLocaleDateString(LOCALE, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

/**
 * Get relative time string (e.g., "2 jam yang lalu")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Baru saja'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} menit yang lalu`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} jam yang lalu`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} hari yang lalu`
  } else {
    return formatDate(d, 'long')
  }
}

/**
 * Get time of day greeting
 */
export function getTimeGreeting(): string {
  const now = new Date()
  const hour = now.getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'Selamat pagi'
  } else if (hour >= 12 && hour < 15) {
    return 'Selamat siang'
  } else if (hour >= 15 && hour < 18) {
    return 'Selamat sore'
  } else {
    return 'Selamat malam'
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

/**
 * Check if a date is within a specific range
 */
export function isWithinRange(date: Date | string, startDate: Date, endDate: Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d >= startDate && d <= endDate
}

/**
 * Get start and end of month
 */
export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
  
  return { start, end }
}

/**
 * Get week range (Monday to Sunday)
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  
  const start = new Date(date.setDate(diff))
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Get age in Indonesian format
 */
export function getAge(birthDate: Date | string): string {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--
    months += 12
  }
  
  if (years > 0) {
    return `${years} tahun`
  } else {
    return `${months} bulan`
  }
}

/**
 * Format duration in Indonesian
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`
  } else if (minutes < 1440) { // Less than a day
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours} jam`
    } else {
      return `${hours} jam ${remainingMinutes} menit`
    }
  } else {
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    
    if (remainingHours === 0) {
      return `${days} hari`
    } else {
      return `${days} hari ${remainingHours} jam`
    }
  }
}

/**
 * Get business days between two dates (excluding weekends)
 */
export function getBusinessDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return count
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

/**
 * Get next business day
 */
export function getNextBusinessDay(date: Date = new Date()): Date {
  const next = new Date(date)
  do {
    next.setDate(next.getDate() + 1)
  } while (isWeekend(next))
  
  return next
}

/**
 * Get date ranges for filtering
 */
export const DateRanges = {
  today: (): { start: Date; end: Date } => {
    const today = new Date()
    return {
      start: new Date(today.setHours(0, 0, 0, 0)),
      end: new Date(today.setHours(23, 59, 59, 999))
    }
  },
  
  yesterday: (): { start: Date; end: Date } => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return {
      start: new Date(yesterday.setHours(0, 0, 0, 0)),
      end: new Date(yesterday.setHours(23, 59, 59, 999))
    }
  },
  
  thisWeek: (): { start: Date; end: Date } => {
    return getWeekRange()
  },
  
  thisMonth: (): { start: Date; end: Date } => {
    return getMonthRange()
  },
  
  last7Days: (): { start: Date; end: Date } => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    
    return {
      start: new Date(start.setHours(0, 0, 0, 0)),
      end: new Date(end.setHours(23, 59, 59, 999))
    }
  },
  
  last30Days: (): { start: Date; end: Date } => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    return {
      start: new Date(start.setHours(0, 0, 0, 0)),
      end: new Date(end.setHours(23, 59, 59, 999))
    }
  }
}