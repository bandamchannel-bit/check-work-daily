import { updateTaskStatus } from '@/app/actions/tasks'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SubmitTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const task = await prisma.task.findUnique({
    where: { id: resolvedParams.id },
    include: { 
      platform: true,
      attachments: true
    }
  })

  if (!task) redirect('/employee')

  return (
    <div className="font-['Noto_Sans_Lao',sans-serif]">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">ອັບເດດສະຖານະວຽກ</h1>
        <Link href="/employee" className="text-blue-600 hover:underline font-medium">
          ກັບຄືນ
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 px-4 py-5 sm:rounded-2xl sm:p-6 max-w-2xl space-y-6">
        {/* Task Details Header */}
        <div className="pb-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span className="font-medium text-gray-500">ເພຈ:</span> 
              <span className="font-semibold text-blue-600">{task.platform.name}</span> ({task.platform.pageName})
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium text-gray-500">ກຳນົດເວລາ:</span> 
              <span className="font-semibold text-orange-600">{new Date(task.dueDate).toLocaleString('lo-LA')}</span>
            </p>
          </div>

          {task.description && (
            <div className="mt-4 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
              <span className="font-bold text-gray-900 block mb-1">📋 ຄຳແນະນຳໜ້າວຽກ:</span>
              {task.description}
            </div>
          )}

          {/* Admin Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="mt-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                📎 ໄຟລ໌ວຽກທີ່ Admin ແນບມາໃຫ້ ({task.attachments.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {task.attachments.map((att: any) => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <span className="text-xs font-semibold text-gray-800 truncate mr-2">{att.fileName}</span>
                    <a
                      href={att.fileUrl}
                      download={att.fileName}
                      className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shrink-0"
                    >
                      ດາວໂຫຼດ
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Form */}
        <form action={async (formData: FormData) => {
          'use server'
          await updateTaskStatus(formData)
        }} className="space-y-6">
          <input type="hidden" name="taskId" value={task.id} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link ໂພສທີ່ລົງແລ້ວ (Proof URL)
            </label>
            <input
              type="url"
              name="proofUrl"
              className="mt-1 block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://facebook.com/... ຫຼື https://tiktok.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ຫຼື ອັບໂຫຼດໄຟລ໌ / ຮູບພາບຫຼັກຖານ (Proof File / Image)
            </label>
            <input
              type="file"
              name="proofFile"
              accept="image/*,.pdf,.doc,.docx,.zip"
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer border border-gray-200 rounded-xl p-2"
            />
            <p className="text-xs text-gray-400 mt-1">
              ສາມາດໃສ່ Link ຫຼື ອັບໂຫຼດຮູບພາບ/ໄຟລ໌ຜົນງານທີ່ເຮັດສຳເລັດແລ້ວ
            </p>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-600/20 transition-all cursor-pointer"
            >
              ບັນທຶກວ່າສຳເລັດແລ້ວ (Mark as Done)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
