import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// In-memory cache for dashboard data
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'dashboard-data'
    const cached = cache.get(cacheKey)
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, { status: 200 })
    }

    // Fetch all data in parallel with optimized queries
    const [
      agendaCount,
      tasksActive,
      notulensiCount,
      imamCount,
      decisionsActive,
      recentAgenda,
      urgentTasks,
      pendingNotulensi
    ] = await Promise.all([
      // Agenda count for today
      prisma.agenda.count({
        where: {
          tanggal: new Date().toISOString().split('T')[0]
        }
      }),
      
      // Active tasks count
      prisma.task.count({
        where: {
          status: { not: 'Selesai' }
        }
      }),
      
      // Notulensi count for current month
      prisma.notulensi.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Active priest count
      prisma.imam.count({
        where: {
          status: 'Aktif'
        }
      }),
      
      // Active decisions count
      prisma.decision.count({
        where: {
          status: { not: 'Selesai' }
        }
      }),
      
      // Recent agenda (last 5)
      prisma.agenda.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { name: true }
          }
        }
      }),
      
      // Urgent tasks (last 10)
      prisma.task.findMany({
        take: 10,
        where: {
          OR: [
            { status: 'Terlambat' },
            { prioritas: 'Tinggi' }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { name: true }
          }
        }
      }),
      
      // Pending notulensi (last 5)
      prisma.notulensi.findMany({
        take: 5,
        where: {
          status: { not: 'Disetujui' }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { name: true }
          }
        }
      })
    ])

    const dashboardData = {
      summary: {
        agendaToday: agendaCount,
        tasksActive: tasksActive,
        notulensiMonth: notulensiCount,
        imamAktif: imamCount,
        decisionsActive: decisionsActive
      },
      recentAgenda: recentAgenda.map(item => ({
        ...item,
        creatorName: item.creator?.name || 'Unknown'
      })),
      urgentTasks: urgentTasks.map(item => ({
        ...item,
        creatorName: item.creator?.name || 'Unknown'
      })),
      pendingNotulensi: pendingNotulensi.map(item => ({
        ...item,
        creatorName: item.creator?.name || 'Unknown'
      })),
      lastUpdated: new Date().toISOString()
    }

    // Cache the result
    cache.set(cacheKey, {
      data: dashboardData,
      timestamp: Date.now()
    })

    return NextResponse.json(dashboardData, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'ETag': `"${Date.now()}"`
      }
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    )
  }
}

// Clear cache function (can be called when data is updated)
export function clearCache() {
  cache.clear()
}