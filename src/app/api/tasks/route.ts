import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get all tasks or filter by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prioritas = searchParams.get('prioritas')
    const status = searchParams.get('status')
    const kategori = searchParams.get('kategori')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (prioritas && prioritas !== 'semua') {
      where.prioritas = prioritas
    }
    
    if (status && status !== 'semua') {
      where.status = status
    }

    if (kategori && kategori !== 'semua') {
      where.kategori = kategori
    }
    
    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } }
      ]
    }

    const tasks = await db.task.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ success: true, data: tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// Create new task
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { judul, deskripsi, prioritas, deadline, kategori, penanggungJawab } = body

    if (!judul || !deskripsi || !prioritas || !deadline || !kategori || !penanggungJawab) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const task = await db.task.create({
      data: {
        judul,
        deskripsi,
        prioritas,
        deadline,
        kategori,
        penanggungJawab,
        createdBy: user.id,
        status: 'Menunggu',
        progress: 0
      }
    })

    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
