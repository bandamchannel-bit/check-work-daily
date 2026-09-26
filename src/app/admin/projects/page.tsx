import prisma from '@/lib/prisma'
import Link from 'next/link'
import ProjectCountdownBadge from './ProjectCountdownBadge'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { tasks: true }
      },
      tasks: {
        where: { status: { not: 'DONE' } },
        orderBy: { dueDate: 'asc' },
        take: 1,
        select: { id: true, title: true, dueDate: true }
      }
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ໂປຣເຈັກທັງໝົດ (Projects)</h1>
            <p className="mt-1 text-sm text-gray-500">ຈັດກຸ່ມໜ້າວຽກຕ່າງໆເຂົ້າເປັນໂປຣເຈັກ ເພື່ອງ່າຍຕໍ່ການຕິດຕາມ ແລະ ວິເຄາະຜົນ</p>
          </div>
        </div>
        <Link href="/admin/projects/new" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          + ສ້າງໂປຣເຈັກໃໝ່
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => {
          const nextTask = project.tasks[0]
          return (
            <Link key={project.id} href={`/admin/projects/${project.id}/board`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300 group flex flex-col relative overflow-hidden">
              
              {/* Top decorative gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${project.status === 'ACTIVE' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gray-200'}`}></div>

              <div className="flex justify-between items-start mb-4 mt-2">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{project.name}</h3>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  project.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {project.status === 'ACTIVE' ? 'ກຳລັງດຳເນີນການ' : 'ສຳເລັດແລ້ວ'}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                {project.description || 'ບໍ່ມີລາຍລະອຽດ...'}
              </p>

              {/* Countdown for Project's next task */}
              {nextTask ? (
                <div className="mb-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100/80 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-950 flex items-center gap-1">
                      <span>⏰ ນັບຖອຍຫຼັງວຽກຕໍ່ໄປ:</span>
                    </span>
                    <ProjectCountdownBadge dueDate={nextTask.dueDate.toISOString()} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {nextTask.title}
                  </p>
                </div>
              ) : project._count.tasks > 0 ? (
                <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center text-xs font-bold text-emerald-700">
                  🎉 ສຳເລັດທຸກວຽກໃນໂປຣເຈັກແລ້ວ!
                </div>
              ) : null}

              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  <span className="font-semibold text-gray-700">{project._count.tasks}</span> ວຽກ
                </div>
                <div className="font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  ເປີດ Board 
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          )
        })}

        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">ຍັງບໍ່ມີໂປຣເຈັກ</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">ລະບົບກຳລັງລໍຖ້າໃຫ້ທ່ານສ້າງໂປຣເຈັກທຳອິດ ເພື່ອເລີ່ມຕົ້ນການມອບໝາຍໜ້າວຽກ.</p>
            <Link href="/admin/projects/new" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              + ສ້າງໂປຣເຈັກທຳອິດ
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
