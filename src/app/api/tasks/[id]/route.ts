import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get specific task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const task = await db.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔧 PATCH API CALLED for task:', id)

    const user = await getCurrentUserFromRequest(request)
    console.log('User in PATCH:', user)

    if (!user) {
      console.error('❌ No user found in PATCH request')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('PATCH body:', body)

    // Handle progress update separately
    if (body.progress !== undefined) {
      console.log('Updating progress to:', body.progress)
      const newStatus = body.progress === 100 ? 'Selesai' :
                       body.progress > 0 ? 'Dalam Proses' : 'Menunggu'

      const task = await db.task.update({
        where: { id },
        data: {
          progress: body.progress,
          status: newStatus,
          completedAt: body.progress === 100 ? new Date() : undefined
        }
      })

      return NextResponse.json({ success: true, data: task })
    }

    // Handle general update
    console.log('Updating task with data:', body)
    const task = await db.task.update({
      where: { id },
      data: body
    })

    console.log('✅ Task updated successfully:', task)
    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('❌ Error updating task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await db.task.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
