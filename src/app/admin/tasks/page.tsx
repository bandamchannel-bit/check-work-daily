import prisma from '@/lib/prisma'
import TasksHubClient from './TasksHubClient'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function AdminTasksPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const tasks = await prisma.task.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      },
      platform: true,
      project: true,
      subTasks: true,
      comments: { include: { user: { select: { name: true } } } },
      attachments: true
    },
    orderBy: {
      dueDate: 'desc'
    }
  })

  const platforms = await prisma.platform.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true, name: true }
  })

  // Serialize dates to strings for client component
  const serializedTasks = tasks.map(t => ({
    ...t,
    dueDate: t.dueDate.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    completedAt: t.completedAt?.toISOString() ?? null,
    subTasks: t.subTasks.map(st => ({
      ...st,
      createdAt: st.createdAt.toISOString(),
      updatedAt: st.updatedAt.toISOString(),
    })),
    comments: t.comments.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    attachments: t.attachments.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    }))
  }))

  const serializedPlatforms = platforms.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  }))

  return (
    <TasksHubClient
      initialTasks={serializedTasks}
      initialPlatforms={serializedPlatforms}
      initialUsers={users}
      currentUserId={session.userId}
    />
  )
}
