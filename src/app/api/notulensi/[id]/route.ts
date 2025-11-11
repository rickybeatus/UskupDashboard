import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get single notulensi by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const notulensi = await db.notulensi.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        agenda: {
          select: {
            judul: true,
            tanggal: true
          }
        }
      }
    })

    if (!notulensi) {
      return NextResponse.json(
        { success: false, error: 'Notulensi not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: notulensi })
  } catch (error) {
    console.error('Error fetching notulensi:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notulensi' },
      { status: 500 }
    )
  }
}

// Update notulensi by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { judul, tanggal, jenis, peserta, isi, kesimpulan, status } = body

    // Check if notulensi exists and user has permission
    const existingNotulensi = await db.notulensi.findUnique({
      where: { id }
    })

    if (!existingNotulensi) {
      return NextResponse.json(
        { success: false, error: 'Notulensi not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (judul !== undefined) updateData.judul = judul
    if (tanggal !== undefined) updateData.tanggal = tanggal
    if (jenis !== undefined) updateData.jenis = jenis
    if (peserta !== undefined) updateData.peserta = peserta
    if (isi !== undefined) updateData.isi = isi
    if (kesimpulan !== undefined) updateData.kesimpulan = kesimpulan

    // Special handling for status changes (approval)
    if (status !== undefined) {
      updateData.status = status
      if (status === 'Disetujui') {
        updateData.approvedAt = new Date()
        updateData.approvedBy = user.id
      }
    }

    const notulensi = await db.notulensi.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: notulensi })
  } catch (error) {
    console.error('Error updating notulensi:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notulensi' },
      { status: 500 }
    )
  }
}

// Delete notulensi by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if notulensi exists
    const existingNotulensi = await db.notulensi.findUnique({
      where: { id }
    })

    if (!existingNotulensi) {
      return NextResponse.json(
        { success: false, error: 'Notulensi not found' },
        { status: 404 }
      )
    }

    await db.notulensi.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notulensi:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete notulensi' },
      { status: 500 }
    )
  }
}