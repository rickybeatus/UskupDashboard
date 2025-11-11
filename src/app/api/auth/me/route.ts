import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}