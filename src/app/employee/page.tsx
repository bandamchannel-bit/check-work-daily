import { getSession } from '@/app/actions/auth'
import prisma from '@/lib/prisma'
import EmployeeDashboardClient from './EmployeeDashboardClient'

export default async function EmployeeDashboard({ 
  searchParams 
}: { 
  searchParams?: Promise<{ userId?: string }> 
}) {
  const session = await getSession()
  if (!session) return null

  const resolvedSearchParams = searchParams ? await searchParams : {}
  const isAdmin = session.userRole === 'ADMIN'

  const employees = isAdmin 
    ? await prisma.user.findMany({ where: { role: 'USER' }, orderBy: { name: 'asc' } })
    : []

  const targetUserId = (isAdmin && resolvedSearchParams.userId)
    ? resolvedSearchParams.userId
    : (isAdmin && employees.length > 0 ? employees[0].id : session.userId)

  const activeEmployee = isAdmin ? employees.find(e => e.id === targetUserId) : null

  // Fetch logged-in user's name
  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })

  const myTasks = await prisma.task.findMany({
    where: {
      userId: targetUserId,
      OR: [
        { status: { not: 'DONE' } },
        { dueDate: { gte: new Date(Date.now() - 24 * 3600 * 1000) } }
      ]
    },
    include: { 
      platform: true, 
      project: true,
      subTasks: true,
      comments: { include: { user: { select: { name: true } } } },
      attachments: true
    },
    orderBy: { dueDate: 'asc' }
  })

  // Serialize dates
  const serializedTasks = myTasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate.toISOString(),
    status: t.status,
    proofUrl: t.proofUrl,
    proofImage: t.proofImage,
    userId: t.userId,
    platform: {
      id: t.platform.id,
      name: t.platform.name,
      pageName: t.platform.pageName,
      logoUrl: t.platform.logoUrl,
      url: t.platform.url,
    },
    project: t.project ? {
      id: t.project.id,
      name: t.project.name,
    } : null,
    subTasks: t.subTasks.map(st => ({
      id: st.id,
      title: st.title,
      isCompleted: st.isCompleted,
    })),
    comments: t.comments.map(c => ({
      id: c.id,
      content: c.content,
      userId: c.userId,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    })),
    attachments: t.attachments.map(a => ({
      id: a.id,
      fileName: a.fileName,
      fileUrl: a.fileUrl,
      userId: a.userId,
    }))
  }))

  return (
    <EmployeeDashboardClient
      initialTasks={serializedTasks}
      userName={me?.name ?? 'ພະນັກງານ'}
      isAdmin={isAdmin}
      employees={employees.map(e => ({ id: e.id, name: e.name }))}
      targetUserId={targetUserId}
      activeEmployeeName={activeEmployee?.name ?? null}
      currentUserId={session.userId}
    />
  )
}
