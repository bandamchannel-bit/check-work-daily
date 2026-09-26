import { createProject } from '@/app/actions/projects'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import ProjectForm from './ProjectForm'

export default async function NewProjectPage() {
  const users = await prisma.user.findMany({ where: { role: 'USER' } })
  const platforms = await prisma.platform.findMany()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ສ້າງໂປຣເຈັກໃໝ່</h1>
          <p className="mt-2 text-gray-600">ສ້າງພື້ນທີ່ລວມສຳລັບຈັດການກຸ່ມໜ້າວຽກ ຫຼື ເລືອກ Template ເພື່ອສ້າງວຽກອັດຕະໂນມັດ</p>
        </div>
        <Link href="/admin/projects" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-medium">
          ຍົກເລີກ
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-8">
        <ProjectForm 
          createProjectAction={createProject} 
          users={users} 
          platforms={platforms} 
        />
      </div>
    </div>
  )
}
