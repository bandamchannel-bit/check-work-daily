'use client'

import { useState, useEffect, useRef } from 'react'
import { updateTaskStatus, addComment } from './actions'

type Task = any // Use specific type based on prisma in production

const columns = [
  { id: 'TODO', title: '📋 ລໍຖ້າເຮັດ', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: '⏳ ກຳລັງເຮັດ', color: 'bg-blue-50' },
  { id: 'REVIEW', title: '🔍 ລໍຖ້າກວດ', color: 'bg-yellow-50' },
  { id: 'DONE', title: '✅ ສຳເລັດແລ້ວ', color: 'bg-green-50' }
]

export default function BoardClient({ initialTasks, projectId }: { initialTasks: Task[], projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (selectedTaskId) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [tasks, selectedTaskId])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    await updateTaskStatus(taskId, newStatus)
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTaskId) return
    
    setIsSubmittingComment(true)
    try {
      const newComment = await addComment(selectedTaskId, commentText.trim())
      setTasks(prev => prev.map(t => {
        if (t.id === selectedTaskId) {
          return {
            ...t,
            comments: [...(t.comments || []), newComment],
            _count: { ...t._count, comments: (t._count?.comments || 0) + 1 }
          }
        }
        return t
      }))
      setCommentText('')
    } catch (error) {
      console.error('Failed to add comment', error)
      alert('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຄອມເມັ້ນ')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Derived metrics
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => (t.status || 'TODO') === 'DONE').length
  const todoTasks = tasks.filter(t => (t.status || 'TODO') === 'TODO').length
  const doingTasks = tasks.filter(t => (t.status || 'TODO') === 'IN_PROGRESS').length
  const reviewTasks = tasks.filter(t => (t.status || 'TODO') === 'REVIEW').length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
  
  const latestDueDate = tasks.length > 0 ? new Date(Math.max(...tasks.map(t => new Date(t.dueDate).getTime()))) : null
  let timeRemainingLabel = 'ບໍ່ມີກຳນົດເວລາ'
  let timeRemainingColor = 'text-blue-100 bg-black/25'
  
  if (latestDueDate) {
    const due = new Date(latestDueDate)
    due.setHours(23, 59, 59, 999)
    const diffTime = due.getTime() - now.getTime()
    
    if (diffTime > 0) {
      const d = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const h = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diffTime % (1000 * 60)) / 1000)
      timeRemainingLabel = d > 0 ? `ເຫຼືອເວລາ: ${d} ມື້ ${h} ຊມ ${m} ນາທີ ${s} ວິ` : `ເຫຼືອເວລາ: ${h} ຊມ ${m} ນາທີ ${s} ວິ`
      timeRemainingColor = d < 1 ? 'text-amber-100 bg-amber-500/40 border border-amber-300/30' : 'text-blue-50 bg-black/25'
    } else {
      const pd = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24))
      timeRemainingLabel = `ຊ້າໄປແລ້ວ ${pd} ມື້`
      timeRemainingColor = 'text-red-100 bg-red-500/40 border border-red-300/30'
    }
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Concept 1: All-in-One Gradient Hero Banner */}
      <div className="space-y-3.5 flex-shrink-0">
        {/* Full-Width Gradient Hero Card */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-blue-900/15 relative overflow-hidden border border-blue-500/20">
          {/* Ambient Glow Orbs */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            {/* Left: Project Progress Tag & Subtitle */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-100 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>ຄວາມຄືບໜ້າໂປຣເຈັກ</span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200/90 font-medium">
                ວຽກທັງໝົດ {totalTasks} ໜ້າວຽກ • ສຳເລັດແລ້ວ {doneTasks} ວຽກ
              </p>
            </div>

            {/* Right: Spacious Countdown Timer Glass Badge */}
            <div className="flex-shrink-0">
              <div 
                suppressHydrationWarning
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl shadow-lg border backdrop-blur-md flex items-center gap-2.5 sm:gap-3 transition-all ${
                mounted && latestDueDate && (new Date(latestDueDate).getTime() - now.getTime()) < 1000 * 60 * 60 * 24
                  ? 'bg-amber-500/25 border-amber-300/40 text-amber-100 shadow-amber-900/20'
                  : 'bg-white/15 border-white/25 text-white shadow-black/10'
              }`}>
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">ກຳນົດເວລາສົ່ງ</span>
                  <span suppressHydrationWarning className="text-sm sm:text-base font-bold tabular-nums tracking-tight whitespace-nowrap">
                    {mounted ? timeRemainingLabel : '...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="relative z-10 space-y-2">
            <div className="flex justify-between items-baseline">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
                  {progressPercent}%
                </span>
                <span className="text-xs font-semibold text-blue-200">ຄວາມສຳເລັດຂອງວຽກ</span>
              </div>
              <span className="text-xs font-medium text-blue-200/90 tabular-nums">
                {doneTasks} ຈາກ {totalTasks} ສຳເລັດ
              </span>
            </div>

            {/* Glowing Smooth Progress Bar */}
            <div className="w-full bg-black/25 backdrop-blur-sm rounded-full h-3 overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div 
                className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 h-full rounded-full transition-all duration-700 shadow-md"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Status Indicator Cards (Directly Aligned with 4 Columns) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. TODO */}
          <div className="bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md flex items-center justify-between group">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                TODO
              </div>
              <div className="text-sm font-bold text-gray-800">ລໍຖ້າເຮັດ</div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-800 tabular-nums bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              {todoTasks}
            </div>
          </div>

          {/* 2. DOING */}
          <div className="bg-white hover:bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md flex items-center justify-between group">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                DOING
              </div>
              <div className="text-sm font-bold text-blue-700">ກຳລັງເຮັດ</div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 tabular-nums bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
              {doingTasks}
            </div>
          </div>

          {/* 3. REVIEW */}
          <div className="bg-white hover:bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md flex items-center justify-between group">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                REVIEW
              </div>
              <div className="text-sm font-bold text-amber-700">ລໍຖ້າກວດ</div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tabular-nums bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
              {reviewTasks}
            </div>
          </div>

          {/* 4. DONE */}
          <div className="bg-white hover:bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md flex items-center justify-between group">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                DONE
              </div>
              <div className="text-sm font-bold text-emerald-700">ສຳເລັດແລ້ວ</div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
              {doneTasks}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board Area with Split View */}
      <div className="flex gap-4 items-start min-w-0">
        {/* Columns Container */}
        <div className="flex flex-1 gap-4 items-start overflow-x-auto pb-6">
          {columns.map(col => (
            <div 
              key={col.id} 
              className={`w-72 sm:w-80 lg:w-auto lg:flex-1 min-w-[260px] rounded-2xl p-3.5 flex flex-col ${col.color} border border-gray-200/50 shadow-xs flex-shrink-0 lg:flex-shrink min-h-[350px]`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 px-1 flex-shrink-0">
                <h3 className="font-bold text-gray-900 text-sm tracking-tight">{col.title}</h3>
                <span className="bg-white/90 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200/70 shadow-xs">
                  {tasks.filter(t => (t.status || 'TODO') === col.id).length}
                </span>
              </div>

              {/* Tasks List - expands naturally with full-page scroll */}
              <div className="space-y-2.5">
                {tasks.filter(t => (t.status || 'TODO') === col.id).map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`bg-white p-3.5 rounded-xl shadow-xs border transition-all duration-200 cursor-pointer group flex flex-col hover:shadow-md hover:border-blue-200 ${
                      selectedTaskId === task.id ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-gray-100/90'
                    }`}
                  >
                    {/* Tag & Status Picker */}
                    <div className="flex justify-between items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-100/60">
                        {task.platform?.name || 'Task'}
                      </span>
                      <select 
                        value={task.status || 'TODO'}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-md py-0.5 px-2 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer transition-colors"
                      >
                        <option value="TODO">📋 ລໍຖ້າເຮັດ</option>
                        <option value="IN_PROGRESS">⏳ ກຳລັງເຮັດ</option>
                        <option value="REVIEW">🔍 ລໍຖ້າກວດ</option>
                        <option value="DONE">✅ ສຳເລັດແລ້ວ</option>
                      </select>
                    </div>
                    
                    {/* Title */}
                    <h4 className="font-semibold text-gray-900 text-sm mb-1.5 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {task.title}
                    </h4>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-gray-500 mb-2.5 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Subtasks Progress */}
                    {task._count?.subTasks > 0 && (
                      <div className="mb-2.5 flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-xs">
                        <span className="text-gray-500 text-[11px] font-medium flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                          ຂັ້ນຕອນຍ່ອຍ
                        </span>
                        <span className="font-semibold text-slate-700 text-[11px] tabular-nums">
                          {task.subTasks?.filter((s:any) => s.isCompleted).length || 0}/{task._count.subTasks}
                        </span>
                      </div>
                    )}
                    
                    {/* Footer: User, Comments & Due Date */}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2.5 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                          {task.user?.name.charAt(0) || '?'}
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium truncate max-w-[85px]">
                          {task.user?.name || 'ບໍ່ໄດ້ມອບໝາຍ'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {(task._count?.comments > 0 || (task.comments?.length || 0) > 0) && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <span className="text-[11px] font-semibold">{task.comments?.length || task._count?.comments || 0}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium text-[10px]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {tasks.filter(t => (t.status || 'TODO') === col.id).length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-gray-200/70 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">ບໍ່ມີໜ້າວຽກ</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Side Panel (Variant C) */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 md:sticky md:top-4 md:z-30 w-full md:w-96 lg:w-[390px] xl:w-[410px] bg-white md:border md:border-gray-200 md:rounded-2xl shadow-2xl flex-shrink-0 flex flex-col h-[calc(100vh-2rem)] overflow-hidden animate-in slide-in-from-right-8 duration-300">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-700">
                {selectedTask.platform?.name || 'Task Details'}
              </span>
              <button onClick={() => setSelectedTaskId(null)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-1.5 rounded-full transition-colors border border-gray-200 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900 leading-snug">{selectedTask.title}</h2>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  {columns.find(c => c.id === (selectedTask.status || 'TODO'))?.title}
                </div>
              </div>

              {selectedTask.description && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
                  {selectedTask.description}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                  <div className="text-[10px] text-gray-400 font-medium uppercase mb-1.5">ຜູ້ຮັບຜິດຊອບ (Assignee)</div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {selectedTask.user?.name.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{selectedTask.user?.name || 'ບໍ່ໄດ້ມອບໝາຍ'}</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                  <div className="text-[10px] text-gray-400 font-medium uppercase mb-1.5">ກຳນົດສົ່ງ (Due Date)</div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {selectedTask.subTasks && selectedTask.subTasks.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    ຂັ້ນຕອນຍ່ອຍ (Sub-tasks)
                  </h3>
                  <div className="space-y-2">
                    {selectedTask.subTasks.map((sub: any) => (
                      <div key={sub.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <input type="checkbox" checked={sub.isCompleted} readOnly className="mt-1 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <span className={`text-sm ${sub.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="flex-1 flex flex-col border-t border-gray-100 pt-6">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  ຄວາມຄິດເຫັນ ({selectedTask.comments?.length || 0})
                </h3>
                
                <div className="flex-1 space-y-4 min-h-[150px]">
                  {selectedTask.comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {comment.user?.name?.charAt(0) || '?'}
                      </div>
                      <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-100 flex-1">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-bold text-gray-900">{comment.user?.name}</span>
                          <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      ຍັງບໍ່ມີຄອມເມັ້ນ ເລີ່ມຕົ້ນພິມເລີຍ...
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div>
              </div>
            </div>
            
            {/* Comment Input Area */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="relative">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder="ພິມຄອມເມັ້ນຂອງທ່ານຢູ່ທີ່ນີ້..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none shadow-sm transition-all min-h-[60px]"
                  rows={2}
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                  className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
                    commentText.trim() && !isSubmittingComment 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmittingComment ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  )}
                </button>
              </div>
              <div className="text-[10px] text-gray-400 mt-2 flex justify-between">
                <span>ກົດ <strong>Enter</strong> ເພື່ອສົ່ງ, <strong>Shift + Enter</strong> ເພື່ອລົງແຖວໃໝ່</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
