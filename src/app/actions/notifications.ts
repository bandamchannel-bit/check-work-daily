'use server'

import prisma from '@/lib/prisma'
import { getSession } from './auth'

export async function getMyNotifications() {
  const session = await getSession()
  if (!session || !session.userId) return []

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  return notifications.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString()
  }))
}

export async function markNotificationAsRead(id: string) {
  const session = await getSession()
  if (!session || !session.userId) return

  await prisma.notification.update({
    where: { id, userId: session.userId }, // Ensure they only mark their own
    data: { isRead: true }
  })
}

export async function markAllNotificationsAsRead() {
  const session = await getSession()
  if (!session || !session.userId) return

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true }
  })
}
