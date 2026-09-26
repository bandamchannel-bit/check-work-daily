'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateTaskStatus(taskId: string, newStatus: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { 
      status: newStatus,
      completedAt: newStatus === 'DONE' ? new Date() : null
    }
  })
  
  revalidatePath('/admin/projects/[id]/board', 'page')
}

export async function addComment(taskId: string, content: string) {
  const { getSession } = await import('@/app/actions/auth')
  const session = await getSession()
  if (!session || !session.userId) throw new Error('Unauthorized')

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      userId: session.userId,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  })

  revalidatePath('/admin/projects/[id]/board', 'page')
  return comment
}
