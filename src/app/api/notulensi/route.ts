import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get all notulensi or filter by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get('jenis')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (jenis && jenis !== 'semua') {
      where.jenis = jenis
    }

    if (status && status !== 'semua') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { jenis: { contains: search, mode: 'insensitive' } }
      ]
    }

    const notulensi = await db.notulensi.findMany({
      where,
      include: {
        creator: {
          select: { name: true, email: true }
        },
        agenda: {
          select: { judul: true, tanggal: true }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    return NextResponse.json({ success: true, data: notulensi })
  } catch (error) {
    console.error('Error fetching notulensi:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notulensi' },
      { status: 500 }
    )
  }
}

// Create new notulensi
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in to create notulensi' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { judul, tanggal, jenis, peserta, isi, kesimpulan, agendaId } = body

    if (!judul || !tanggal || !jenis || !peserta) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const notulensi = await db.notulensi.create({
      data: {
        judul,
        tanggal,
        jenis,
        peserta,
        isi,
        kesimpulan,
        agendaId,
        createdBy: user.id,
        status: 'Draft'
      }
    })

    return NextResponse.json({ success: true, data: notulensi }, { status: 201 })
  } catch (error) {
    console.error('Error creating notulensi:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notulensi' },
      { status: 500 }
    )
  }
}