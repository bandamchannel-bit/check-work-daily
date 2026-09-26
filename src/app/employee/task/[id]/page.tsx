import { updateTaskStatus } from '@/app/actions/tasks'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SubmitTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const task = await prisma.task.findUnique({
    where: { id: resolvedParams.id },
    include: { platform: true }
  })

  if (!task) redirect('/employee')

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">ອັບເດດສະຖານະວຽກ</h1>
        <Link href="/employee" className="text-blue-600 hover:underline">
          ກັບຄືນ
        </Link>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 max-w-2xl">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">{task.title}</h2>
          <p className="mt-1 text-sm text-gray-500">
            ຕ້ອງລົງໃນເພຈ: {task.platform.name} ({task.platform.pageName})
          </p>
          <p className="mt-1 text-sm text-gray-500">
            ກຳນົດເວລາ: {new Date(task.dueDate).toLocaleString()}
          </p>
        </div>

        <form action={async (formData: FormData) => {
          'use server'
          await updateTaskStatus(formData)
        }} className="space-y-6">
          <input type="hidden" name="taskId" value={task.id} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Link ໂພສທີ່ລົງແລ້ວ (Proof URL)</label>
            <input
              type="url"
              name="proofUrl"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              ບັນທຶກວ່າສຳເລັດແລ້ວ (Mark as Done)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
