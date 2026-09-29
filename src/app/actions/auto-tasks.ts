'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth'

export async function createAutoTask(formData: FormData) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const timeOfDay = formData.get('timeOfDay') as string
  const daysOfWeek = formData.getAll('daysOfWeek') as string[]

  const platformIds = formData.getAll('platformIds') as string[]
  const singlePlatformId = formData.get('platformId') as string
  const targetPlatformIds = platformIds.length > 0 ? platformIds : (singlePlatformId ? [singlePlatformId] : [])

  const userIds = formData.getAll('userIds') as string[]
  const singleUserId = formData.get('userId') as string
  const targetUserIds = userIds.length > 0 ? userIds : (singleUserId ? [singleUserId] : [])

  if (!title || targetUserIds.length === 0 || targetPlatformIds.length === 0 || !timeOfDay || daysOfWeek.length === 0) {
    return { error: 'Please fill all fields and select at least one day, one user, and one platform' }
  }

  for (const userId of targetUserIds) {
    for (const platformId of targetPlatformIds) {
      await prisma.dailyTaskConfig.create({
        data: {
          title,
          userId,
          platformId,
          timeOfDay,
          daysOfWeek: daysOfWeek.join(',')
        }
      })
    }
  }

  redirect('/admin/auto-tasks')
}

export async function toggleAutoTask(id: string, currentStatus: boolean) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.dailyTaskConfig.update({
    where: { id },
    data: { isActive: !currentStatus }
  })
  revalidatePath('/admin/auto-tasks')
}

export async function deleteAutoTask(id: string) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.dailyTaskConfig.delete({
    where: { id }
  })
  revalidatePath('/admin/auto-tasks')
}

export async function updateAutoTask(formData: FormData) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const userId = formData.get('userId') as string
  const platformId = formData.get('platformId') as string
  const timeOfDay = formData.get('timeOfDay') as string
  const daysOfWeek = formData.getAll('daysOfWeek') as string[]

  if (!id || !title || !userId || !platformId || !timeOfDay || daysOfWeek.length === 0) {
    return { error: 'Please fill all fields and select at least one day' }
  }

  await prisma.dailyTaskConfig.update({
    where: { id },
    data: {
      title,
      userId,
      platformId,
      timeOfDay,
      daysOfWeek: daysOfWeek.join(',')
    }
  })

  redirect('/admin/auto-tasks')
}
