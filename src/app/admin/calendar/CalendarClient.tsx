'use client'

import { useState, useMemo } from 'react'

type TaskLite = {
  id: string
  title: string
  status: string
  dueDate: string
  completedAt: string | null
  userName: string
  platformName: string
  pageName: string
}

export default function CalendarClient({ initialTasks }: { initialTasks: TaskLite[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() // 0 = Sunday
  
  const monthNames = [
    "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
    "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"
  ]
  const dayNames = ["ອາທິດ", "ຈັນ", "ອັງຄານ", "ພຸດ", "ພະຫັດ", "ສຸກ", "ເສົາ"]

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Group tasks by YYYY-MM-DD
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskLite[]>()
    initialTasks.forEach(task => {
      // Assuming dueDate is stored in UTC but we want local day string
      // Just take the date part
      const dateObj = new Date(task.dueDate)
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
      if (!map.has(dateStr)) map.set(dateStr, [])
      map.get(dateStr)!.push(task)
    })
    return map
  }, [initialTasks])

  const renderCells = () => {
    const cells = []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
    const todayDate = today.getDate()

    // Empty cells before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[120px] bg-gray-50/50 border border-gray-100 rounded-xl"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayTasks = tasksByDate.get(dateStr) || []
      const isToday = isCurrentMonth && day === todayDate

      cells.push(
        <div key={day} className={`min-h-[140px] flex flex-col bg-white border ${isToday ? 'border-blue-400 shadow-sm ring-1 ring-blue-400' : 'border-gray-200'} rounded-xl overflow-hidden transition-all hover:border-blue-300`}>
          {/* Header */}
          <div className={`px-3 py-2 flex items-center justify-between border-b ${isToday ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-gray-50/50 border-gray-100 text-gray-500'}`}>
            <span className={`text-sm font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>{day}</span>
            {dayTasks.length > 0 && (
              <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{dayTasks.length} ວຽກ</span>
            )}
          </div>
          
          {/* Tasks List */}
          <div className="p-2 flex-1 overflow-y-auto space-y-1.5 custom-scrollbar max-h-[140px]">
            {dayTasks.map(task => (
              <div 
                key={task.id} 
                className={`text-[11px] px-2 py-1.5 rounded-lg border leading-tight truncate ${
                  task.status === 'DONE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 line-through' :
                  task.status === 'LATE' ? 'bg-red-50 border-red-200 text-red-700 font-semibold' :
                  'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                }`}
                title={`${task.title} - ${task.userName}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="truncate flex-1">{task.title}</span>
                </div>
                <div className="text-[9px] opacity-70 flex justify-between">
                  <span>{task.userName}</span>
                  <span>{new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return cells
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">ປະຕິທິນໜ້າວຽກ (Calendar)</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">ເບິ່ງພາບລວມຂອງໜ້າວຽກທັງໝົດໃນແຕ່ລະເດືອນ</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex items-center justify-center min-w-[140px]">
            <span className="font-bold text-gray-800 text-base">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          </div>

          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          
          <button onClick={goToToday} className="px-3 py-1.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            ມື້ນີ້
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex-1">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2">
          {dayNames.map((day, idx) => (
            <div key={day} className={`text-center text-xs font-bold uppercase tracking-wider py-2 ${idx === 0 || idx === 6 ? 'text-red-400' : 'text-gray-500'}`}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {renderCells()}
        </div>
      </div>
      
      {/* CSS for custom scrollbar within day cells */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  )
}
