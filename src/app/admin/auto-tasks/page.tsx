import prisma from '@/lib/prisma'
import Link from 'next/link'
import { toggleAutoTask, deleteAutoTask } from '@/app/actions/auto-tasks'

export default async function AutoTasksPage() {
  const configs = await prisma.dailyTaskConfig.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      platform: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ລະບົບສ້າງວຽກອັດຕະໂນມັດ (Auto-Tasks)</h1>
          <p className="text-sm text-gray-500 mt-1">ຕັ້ງຄ່າວຽກປະຈຳວັນ ທີ່ຈະຖືກສ້າງຂຶ້ນໃໝ່ທຸກໆມື້ອັດຕະໂນມັດ</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Link 
            href="/api/cron/generate-tasks" 
            target="_blank"
            className="flex-1 sm:flex-none text-center bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 font-semibold transition-colors text-sm border border-gray-200"
          >
            ▶️ Run Cron ເອງ
          </Link>
          <Link 
            href="/admin/auto-tasks/new" 
            className="flex-1 sm:flex-none text-center bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-md shadow-blue-600/20 text-sm"
          >
            + ເພີ່ມວຽກປະຈຳ
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {configs.length === 0 ? (
            <li className="px-6 py-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-gray-500 font-medium text-sm">ຍັງບໍ່ມີການຕັ້ງຄ່າວຽກປະຈຳວັນເທື່ອ</p>
            </li>
          ) : (
            configs.map((config) => (
              <li key={config.id} className="hover:bg-gray-50/50 transition-colors">
                <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{config.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {config.user.name}
                      </span>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <span className="flex items-center gap-1 font-medium text-gray-600">
                        🗂️ {config.platform.name}
                      </span>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <span className="flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                        ⏰ ກຳນົດສົ່ງ: {config.timeOfDay}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider flex-shrink-0 ${
                      config.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {config.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                    </span>
                    
                    <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                      <form action={async () => {
                        'use server'
                        await toggleAutoTask(config.id, config.isActive)
                      }}>
                        <button type="submit" className={`text-sm font-semibold transition-colors ${config.isActive ? 'text-gray-400 hover:text-gray-700' : 'text-emerald-600 hover:text-emerald-700'}`}>
                          {config.isActive ? 'ປິດ' : 'ເປີດ'}
                        </button>
                      </form>
                      <Link href={`/admin/auto-tasks/edit/${config.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        ແກ້ໄຂ
                      </Link>
                      <form action={async () => {
                        'use server'
                        await deleteAutoTask(config.id)
                      }}>
                        <button type="submit" className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">ລຶບ</button>
                      </form>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
