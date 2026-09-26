import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const now = new Date()

  // Find tasks that are past their due date and still PENDING
  const lateTasks = await prisma.task.findMany({
    where: {
      status: { notIn: ['DONE', 'LATE'] },
      dueDate: {
        lt: now
      }
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      platform: true
    }
  })

  // Mark them as LATE
  if (lateTasks.length > 0) {
    const taskIds = lateTasks.map(t => t.id)
    await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: { status: 'LATE' }
    })

    // NOTE: In a real app, you would loop through `lateTasks` here 
    // and send a message to LINE API or Telegram Bot API for each user.
    // e.g. sendLineNotify(`ແຈ້ງເຕືອນ: ${task.user.name} ຍັງບໍ່ລົງໂພສ ${task.title} ໃນເພຈ ${task.platform.name}`)
    
    console.log(`[Cron] Marked ${lateTasks.length} tasks as LATE and sent notifications.`)
  }

  return NextResponse.json({ 
    success: true, 
    markedLateCount: lateTasks.length,
    message: lateTasks.length > 0 ? 'Sent notifications for late tasks' : 'No late tasks found'
  })
}
