import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BoardClient from './BoardClient'

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          platform: true,
          subTasks: true,
          comments: {
            include: { user: { select: { id: true, name: true, email: true, role: true } } },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { comments: true, attachments: true, subTasks: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }
    }
  })

  if (!project) notFound()

  return (
    <div className="space-y-4 min-w-0 pb-16">
      <div className="flex justify-between items-center bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/projects" className="text-gray-500 hover:text-blue-600 transition-colors text-xs font-medium">ໂປຣເຈັກທັງໝົດ</Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-semibold text-gray-700">Kanban Board</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
        </div>
        
        <Link href={`/admin/tasks/new?projectId=${project.id}`} className="bg-blue-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">ເພີ່ມວຽກເຂົ້າໂປຣເຈັກ</span>
          <span className="sm:hidden">+ ວຽກໃໝ່</span>
        </Link>
      </div>

      <div>
        <BoardClient initialTasks={project.tasks} projectId={project.id} />
      </div>
    </div>
  )
}
