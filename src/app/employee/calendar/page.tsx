import prisma from '@/lib/prisma'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import CalendarClient from '@/components/CalendarClient'
import Link from 'next/link'

export default async function EmployeeCalendarPage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ userId?: string }> 
}) {
  const session = await getSession()
  if (!session || !session.userId) redirect('/login')

  const resolvedSearchParams = searchParams ? await searchParams : {}
  const isAdmin = session.userRole === 'ADMIN'

  const employees = isAdmin 
    ? await prisma.user.findMany({ where: { role: 'USER' }, orderBy: { name: 'asc' } })
    : []

  const targetUserId: string = (isAdmin && resolvedSearchParams.userId)
    ? resolvedSearchParams.userId
    : (isAdmin && employees.length > 0 ? employees[0].id : session.userId)

  const tasks = await prisma.task.findMany({
    where: {
      userId: targetUserId
    },
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
    where: {
      userId: targetUserId,
      isActive: true
    },
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
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-6">
      <div className="mb-4">
        <Link href={`/employee${targetUserId !== session.userId ? `?userId=${targetUserId}` : ''}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 w-fit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ກັບຄືນໜ້າຫຼັກ (Back to Dashboard)
        </Link>
      </div>
      <div className="flex-1">
        <CalendarClient 
          initialTasks={serializedTasks} 
          initialAutoTasks={serializedAutoTasks}
          currentUserId={session.userId} 
          isAdmin={isAdmin}
          targetUserId={targetUserId}
          employees={employees}
        />
      </div>
    </div>
  )
}
