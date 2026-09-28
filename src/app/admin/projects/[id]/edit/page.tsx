import { updateProject } from '@/app/actions/projects'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!project) {
    notFound()
  }

  const updateProjectWithId = updateProject.bind(null, project.id)

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ແກ້ໄຂໂປຣເຈັກ</h1>
            <p className="mt-1 text-sm text-gray-500">ແກ້ໄຂຂໍ້ມູນຂອງ {project.name}</p>
          </div>
        </div>
        <Link href="/admin/projects" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors font-medium border border-transparent hover:border-gray-200">
          ຍົກເລີກ
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8">
        <form action={async (formData: FormData) => {
          'use server'
          await updateProjectWithId(formData)
        }} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">ຊື່ໂປຣເຈັກ (Project Name) <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              defaultValue={project.name}
              required
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
              placeholder="ໃສ່ຊື່ໂປຣເຈັກ..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">ລາຍລະອຽດ (Description)</label>
            <textarea
              name="description"
              defaultValue={project.description || ''}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm resize-none"
              placeholder="ອະທິບາຍໂປຣເຈັກ..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">ສະຖານະ (Status)</label>
              <select
                name="status"
                defaultValue={project.status}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm appearance-none"
              >
                <option value="ACTIVE">ກຳລັງດຳເນີນການ (ACTIVE)</option>
                <option value="COMPLETED">ສຳເລັດແລ້ວ (COMPLETED)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">ວັນທີສຳເລັດ (Due Date)</label>
              <input
                type="date"
                name="dueDate"
                defaultValue={project.dueDate ? project.dueDate.toISOString().split('T')[0] : ''}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all shadow-lg shadow-blue-600/20"
            >
              ບັນທຶກການແກ້ໄຂ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
