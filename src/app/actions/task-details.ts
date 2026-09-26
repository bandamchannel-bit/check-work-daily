'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth'

export async function createSubTask(taskId: string, title: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.subTask.create({
    data: { taskId, title }
  })
  
  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
  revalidatePath('/admin/projects/[id]/board', 'page')
}

export async function toggleSubTask(subTaskId: string, isCompleted: boolean) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.subTask.update({
    where: { id: subTaskId },
    data: { isCompleted }
  })

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
  revalidatePath('/admin/projects/[id]/board', 'page')
}

export async function deleteSubTask(subTaskId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.subTask.delete({
    where: { id: subTaskId }
  })

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
  revalidatePath('/admin/projects/[id]/board', 'page')
}

export async function addComment(taskId: string, content: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.comment.create({
    data: {
      taskId,
      userId: session.userId,
      content
    }
  })

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
  revalidatePath('/admin/projects/[id]/board', 'page')
}

export async function deleteComment(commentId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.comment.delete({
    where: { id: commentId }
  })

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
  revalidatePath('/admin/projects/[id]/board', 'page')
}

export async function addAttachment(taskId: string, fileName: string, fileUrl: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.attachment.create({
    data: {
      taskId,
      userId: session.userId,
      fileName,
      fileUrl
    }
  })

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
  revalidatePath('/admin/projects/[id]/board', 'page')
}

export async function deleteAttachment(attachmentId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.attachment.delete({
    where: { id: attachmentId }
  })

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
  revalidatePath('/admin/projects/[id]/board', 'page')
}
