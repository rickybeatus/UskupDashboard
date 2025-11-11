import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { 
  withErrorHandling, 
  handlePrismaError, 
  createSuccessResponse, 
  createCreatedResponse, 
  createValidationError,
  createNotFoundError,
  generateRequestId 
} from '@/lib/errorHandler'

// Get all agenda or filter by query
export const GET = withErrorHandling(async (request: NextRequest) => {
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
      { lokasi: { contains: search, mode: 'insensitive' } },
      { deskripsi: { contains: search, mode: 'insensitive' } }
    ]
  }

  try {
    const agenda = await prisma.agenda.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    return createSuccessResponse(agenda, 'Agenda retrieved successfully')
  } catch (error) {
    const appError = handlePrismaError(error, 'GET /api/agenda')
    
    return NextResponse.json(
      { success: false, error: appError },
      { status: 500 }
    )
  }
}, 'GET /api/agenda')

// Create new agenda
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await getCurrentUserFromRequest(request)
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  const body = await request.json()
  const { judul, tanggal, waktu, lokasi, jenis, peserta, deskripsi } = body

  // Validation
  const requiredFields = ['judul', 'tanggal', 'waktu', 'lokasi', 'jenis', 'peserta']
  for (const field of requiredFields) {
    if (!body[field]) {
      const validationError = createValidationError(field, 'Field is required')
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      )
    }
  }

  try {
    const agenda = await prisma.agenda.create({
      data: {
        judul,
        tanggal,
        waktu,
        lokasi,
        jenis,
        peserta,
        deskripsi,
        createdBy: user.id,
        status: 'Dijadwalkan'
      }
    })

    return createCreatedResponse(agenda, 'Agenda created successfully')
  } catch (error) {
    const appError = handlePrismaError(error, 'POST /api/agenda')
    
    return NextResponse.json(
      { success: false, error: appError },
      { status: 500 }
    )
  }
}, 'POST /api/agenda')
