'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import NotificationBell from './NotificationBell'

export default function Sidebar({ role, userEmail = 'admin@company.com', userName = 'Admin' }: { role: string, userEmail?: string, userName?: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const adminLinks = [
    { name: 'ພາບລວມ (Dashboard)', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'ໂປຣເຈັກ (Projects)', href: '/admin/projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'ພະນັກງານ (Users)', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'ເພຈ/ຊ່ອງ (Platforms)', href: '/admin/platforms', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { name: 'ໜ້າວຽກ (Tasks)', href: '/admin/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'ປະຕິທິນ (Calendar)', href: '/admin/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'ວຽກອັດຕະໂນມັດ (Auto)', href: '/admin/auto-tasks', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  ]

  const employeeLinks = [
    { name: 'ໜ້າວຽກຂອງຂ້ອຍ', href: '/employee', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'ເພຈ/ຊ່ອງ (My Platforms)', href: '/employee/platforms', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ]

  const isEmployeeView = pathname.startsWith('/employee')
  const links = role === 'ADMIN' ? (isEmployeeView ? employeeLinks : adminLinks) : employeeLinks

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0f172a] flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-bold text-white tracking-tight">WorkTracker</span>
          {role === 'ADMIN' && isEmployeeView && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium ml-1">
              Employee View
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {role === 'ADMIN' && (
            <Link
              href={isEmployeeView ? '/admin' : '/employee'}
              className="text-xs bg-slate-800 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <span>{isEmployeeView ? 'Admin' : 'Employee'}</span>
            </Link>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Content */}
      <div className={`flex flex-col w-64 bg-[#0f172a] h-screen fixed top-0 left-0 text-gray-300 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 bg-[#0f172a] border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">WorkTracker</span>
          </div>
        </div>

        {/* Admin <-> Employee Mode Switcher Banner (If Admin) */}
        {role === 'ADMIN' && (
          <div className="p-3 border-b border-gray-800/80 bg-slate-900/60">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>ສະຫຼັບມຸມມອງ (View)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isEmployeeView ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {isEmployeeView ? 'Employee' : 'Admin'}
              </span>
            </div>
            {isEmployeeView ? (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all border border-blue-400/30 group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm group-hover:rotate-180 transition-transform duration-500">🔄</span>
                  <span>ກັບໄປໜ້າ Admin</span>
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">Admin</span>
              </Link>
            ) : (
              <Link
                href="/employee"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 font-semibold text-xs border border-amber-500/30 shadow-sm transition-all group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm group-hover:scale-110 transition-transform">👤</span>
                  <span>ມຸມມອງ ພະນັກງານ</span>
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded-full font-bold">Preview</span>
              </Link>
            )}
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            {isEmployeeView ? 'Employee Menu (ວຽກພະນັກງານ)' : 'Admin Menu (ເມນູຫຼັກ)'}
          </div>
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin' && link.href !== '/employee')
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between px-2 mb-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{userName}</span>
                <span className="text-[10px] text-gray-400">
                  {role === 'ADMIN' ? (isEmployeeView ? 'Admin (Preview)' : 'Admin') : 'Employee'}
                </span>
              </div>
            </div>
            <NotificationBell />
          </div>
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ອອກຈາກລະບົບ
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
