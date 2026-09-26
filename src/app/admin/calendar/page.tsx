import prisma from '@/lib/prisma'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export default async function AdminCalendarPage() {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') redirect('/login')

  const tasks = await prisma.task.findMany({
    include: {
      user: {
        select: { name: true }
      },
      platform: {
        select: { name: true, pageName: true }
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

  // Serialize dates
  const serializedTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status,
    dueDate: t.dueDate.toISOString(),
    completedAt: t.completedAt?.toISOString() || null,
    userName: t.user.name,
    platformName: t.platform.name,
    pageName: t.platform.pageName
  }))

  return (
    <CalendarClient initialTasks={serializedTasks} />
  )
}
