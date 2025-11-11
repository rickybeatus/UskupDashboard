import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get all imam or filter by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paroki = searchParams.get('paroki')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status && status !== 'semua') {
      where.status = status
    }
    
    if (paroki) {
      where.paroki = { contains: paroki, mode: 'insensitive' }
    }
    
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { paroki: { contains: search, mode: 'insensitive' } },
        { jabatan: { contains: search, mode: 'insensitive' } }
      ]
    }

    const imam = await db.imam.findMany({
      where,
      orderBy: {
        nama: 'asc'
      }
    })

    return NextResponse.json({ success: true, data: imam })
  } catch (error) {
    console.error('Error fetching imam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch imam data' },
      { status: 500 }
    )
  }
}

// Create new imam entry
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nama, paroki, jabatan, tanggalTahbisan, nomorTelepon, email, alamat, status } = body

    if (!nama || !paroki || !jabatan || !tanggalTahbisan) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const imam = await db.imam.create({
      data: {
        nama,
        paroki,
        jabatan,
        tanggalTahbisan,
        nomorTelepon,
        email,
        alamat,
        status: status || 'Aktif'
      }
    })

    return NextResponse.json({ success: true, data: imam }, { status: 201 })
  } catch (error) {
    console.error('Error creating imam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create imam entry' },
      { status: 500 }
    )
  }
}
