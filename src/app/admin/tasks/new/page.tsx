import { createTask, createAutoTask } from '@/app/actions/tasks'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import TaskForm from './TaskForm'

export default async function NewTaskPage({
  searchParams
}: {
  searchParams?: Promise<{ platformId?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const users = await prisma.user.findMany({ where: { role: 'USER' } })
  const platforms = await prisma.platform.findMany()

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">ມອບໝາຍວຽກໃໝ່</h1>
        <Link href="/admin/tasks" className="text-blue-600 hover:underline">
          ກັບຄືນ
        </Link>
      </div>

      <TaskForm 
        users={users} 
        platforms={platforms} 
        defaultPlatformId={resolvedSearchParams.platformId}
        createTaskAction={createTask} 
        createAutoTaskAction={createAutoTask} 
      />
    </div>
  )
}
