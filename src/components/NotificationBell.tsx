'use client'

import { useState, useEffect } from 'react'
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications'
import Link from 'next/link'

type Notif = {
  id: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications()
      setNotifications(data as Notif[])
    } catch (e) {}
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAll = async () => {
    await markAllNotificationsAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-[#0f172a]"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-gray-900 transform origin-bottom-left transition-all">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-sm">ການແຈ້ງເຕືອນ ({unreadCount})</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-blue-600 hover:underline">
                  ອ່ານທັງໝົດ
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">ບໍ່ມີການແຈ້ງເຕືອນໃໝ່</div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {notifications.map(notif => (
                    <li key={notif.id} className={`p-3 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex gap-3">
                        {!notif.isRead && (
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                        )}
                        <div className="flex-1 min-w-0" onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}>
                          {notif.link ? (
                            <Link href={notif.link} className="block group">
                              <p className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{notif.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 group-hover:text-gray-700">{notif.message}</p>
                            </Link>
                          ) : (
                            <div>
                              <p className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString('lo-LA')}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
