import { logout } from '@/app/actions/auth'
import Link from 'next/link'

export default function Navbar({ role }: { role: string }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={role === 'ADMIN' ? '/admin' : '/employee'} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                WorkTracker
              </span>
            </Link>
            
            {role === 'ADMIN' && (
              <div className="ml-10 flex space-x-1">
                <Link href="/admin" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">ພາບລວມ (Dashboard)</Link>
                <Link href="/admin/users" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">ພະນັກງານ</Link>
                <Link href="/admin/tasks" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">ມອບໝາຍວຽກ</Link>
                <Link href="/admin/auto-tasks" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">ວຽກອັດຕະໂນມັດ</Link>
              </div>
            )}
            {role === 'USER' && (
               <div className="ml-10 flex space-x-1">
                 <Link href="/employee" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">ໜ້າວຽກຂອງຂ້ອຍ</Link>
               </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">ບັນຊີທົດລອງ</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{role === 'ADMIN' ? 'ຜູ້ບໍລິຫານ' : 'ພະນັກງານ'}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors" title="ອອກຈາກລະບົບ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
