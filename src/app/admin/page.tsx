import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const usersCount = await prisma.user.count({ where: { role: 'USER' } })
  const platformsCount = await prisma.platform.count()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)
  
  const tasksToday = await prisma.task.count({
    where: {
      dueDate: {
        gte: today,
        lte: endOfDay
      }
    }
  })
  
  const completedToday = await prisma.task.count({
    where: {
      dueDate: {
        gte: today,
        lte: endOfDay
      },
      status: 'DONE'
    }
  })
  
  const completionRate = tasksToday > 0 ? Math.round((completedToday / tasksToday) * 100) : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 overflow-hidden shadow-xl shadow-blue-900/10 text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl transform -translate-y-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ຍິນດີຕ້ອນຮັບກັບມາ, Admin 👋</h1>
          <p className="text-blue-100 max-w-lg leading-relaxed">
            ນີ້ຄືພາບລວມການເຮັດວຽກຂອງທີມງານທັງໝົດ. ມື້ນີ້ມີວຽກທີ່ຕ້ອງຈັດການທັງໝົດ {tasksToday} ໜ້າວຽກ, ຂໍໃຫ້ເປັນມື້ທີ່ດີໃນການເຮັດວຽກ!
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link href="/admin/projects/new" className="bg-white text-blue-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-sm text-sm">
              + ສ້າງໂປຣເຈັກໃໝ່
            </Link>
            <Link href="/admin/tasks" className="bg-blue-700/50 hover:bg-blue-700/70 text-white border border-blue-400/30 px-5 py-2.5 rounded-xl font-medium transition-colors backdrop-blur-sm text-sm">
              ເບິ່ງວຽກທັງໝົດ
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Stat 1 */}
        <Link href="/admin/users" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
             <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">ພະນັກງານທັງໝົດ</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-gray-800">{usersCount}</p>
            <span className="text-xs font-semibold text-blue-600">ຈັດການ &rarr;</span>
          </div>
        </Link>
        
        {/* Stat 2 */}
        <Link href="/admin/platforms" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
             <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">ຈຳນວນ ເພຈ/ຊ່ອງ</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-gray-800">{platformsCount}</p>
            <span className="text-xs font-semibold text-purple-600">ຈັດການ &rarr;</span>
          </div>
        </Link>
        
        {/* Stat 3 */}
        <Link href="/admin/tasks" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
             <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">ກຳນົດສົ່ງມື້ນີ້ (Tasks)</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-gray-800">{tasksToday}</p>
            <span className="text-xs font-semibold text-orange-600">ເບິ່ງ &rarr;</span>
          </div>
        </Link>

        {/* Stat 4 - Enhanced Progress */}
        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bottom-0 w-1 bg-green-500"></div>
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Today</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">ວຽກສຳເລັດແລ້ວມື້ນີ້</p>
          </div>
          
          <div>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-black text-gray-800 leading-none">{completionRate}%</p>
              <p className="text-xs text-gray-400 mb-0.5 font-medium">{completedToday} / {tasksToday} ວຽກ</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h2 className="text-base font-bold text-gray-900">ຄວາມເຄື່ອນໄຫວລ່າສຸດ (Recent Activity)</h2>
          </div>
          <Link href="/admin/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
            ເບິ່ງວຽກທັງໝົດ &rarr;
          </Link>
        </div>
        <div className="p-8 text-center bg-white flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">ເລີ່ມມອບໝາຍວຽກໃໝ່</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">ເຂົ້າໄປທີ່ໜ້າ "ໂປຣເຈັກ" ຫຼື "ມອບໝາຍວຽກ" ເພື່ອເລີ່ມຕົ້ນການເຮັດວຽກຂອງມື້ນີ້.</p>
        </div>
      </div>
    </div>
  )
}
