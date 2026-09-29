import prisma from '@/lib/prisma'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import CalendarClient from '@/components/CalendarClient'

export default async function AdminCalendarPage() {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') redirect('/login')

  const tasks = await prisma.task.findMany({
    include: {
      user: { select: { id: true, name: true } },
      platform: { select: { id: true, name: true, pageName: true, logoUrl: true } },
      project: { select: { id: true, name: true } },
      subTasks: true,
      comments: { include: { user: { select: { name: true } } } },
      attachments: true
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

  // Serialize dates
  const serializedTasks = tasks.map((t: any) => ({
    ...t,
    dueDate: t.dueDate.toISOString(),
    completedAt: t.completedAt?.toISOString() || null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subTasks: t.subTasks.map((st: any) => ({
      ...st,
      createdAt: st.createdAt.toISOString()
    })),
    comments: t.comments.map((c: any) => ({
      ...c,
      createdAt: c.createdAt.toISOString()
    })),
    attachments: t.attachments.map((a: any) => ({
      ...a,
      createdAt: a.createdAt.toISOString()
    }))
  }))

  const autoTasks = await prisma.dailyTaskConfig.findMany({
    where: { isActive: true },
    include: {
      user: { select: { id: true, name: true } },
      platform: { select: { id: true, name: true, pageName: true, logoUrl: true } }
    }
  })

  const serializedAutoTasks = autoTasks.map((a: any) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString()
  }))

  return (
    <CalendarClient 
      initialTasks={serializedTasks} 
      initialAutoTasks={serializedAutoTasks}
      currentUserId={session.userId!} 
      isAdmin={true} 
    />
  )
}
