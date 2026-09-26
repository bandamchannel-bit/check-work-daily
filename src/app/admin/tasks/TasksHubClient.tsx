'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { deleteTask, changeTaskStatus } from '@/app/actions/tasks'
import EditTaskModal from './EditTaskModal'
import TaskDetailModal from '@/components/TaskDetailModal'

// ─── Real-Time Live Countdown Badge ───────────────────────────────────────────
function LiveCountdown({ dueDate, nowTs }: { dueDate: string | Date; nowTs: number }) {
  if (nowTs === 0) return <span className="font-mono tabular-nums text-gray-400">--:--:--</span>
  const diff = new Date(dueDate).getTime() - nowTs
  const isLate = diff < 0
  const absDiff = Math.abs(diff)

  const days = Math.floor(absDiff / 86400000)
  const hours = Math.floor((absDiff % 86400000) / 3600000)
  const minutes = Math.floor((absDiff % 3600000) / 60000)
  const seconds = Math.floor((absDiff % 60000) / 1000)

  const pad = (n: number) => n.toString().padStart(2, '0')
  const timeStr = `${days > 0 ? `${days}ວ ` : ''}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  if (isLate) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold border border-red-200 animate-pulse">
        <span>⚠️ ກາຍ</span>
        <span className="font-mono tabular-nums font-black">{timeStr}</span>
      </span>
    )
  }

  if (diff < 3600000) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black shadow-sm shadow-orange-500/20 animate-pulse">
        <span>🔥 ດ່ວນ!</span>
        <span className="font-mono tabular-nums font-black">{timeStr}</span>
      </span>
    )
  }

  if (diff < 3 * 3600000) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
        <span>⚡ ເຫຼືອ</span>
        <span className="font-mono tabular-nums font-black">{timeStr}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
      <span>⏳ ເຫຼືອ</span>
      <span className="font-mono tabular-nums font-black">{timeStr}</span>
    </span>
  )
}

type Task = {
  id: string
  title: string
  description?: string | null
  dueDate: string | Date
  status: string
  proofUrl?: string | null
  userId: string
  platformId: string
  user: {
    id: string
    name: string
    email?: string
  }
  platform: {
    id: string
    name: string
    pageName: string
    url?: string | null
    logoUrl?: string | null
  }
}

type Platform = {
  id: string
  name: string
  pageName: string
  url?: string | null
  logoUrl?: string | null
}

const PLATFORM_THEMES: Record<string, { bg: string, text: string, border: string, iconBg: string }> = {
  facebook: {
    bg: 'bg-blue-50/50 hover:bg-blue-50/80',
    text: 'text-blue-700',
    border: 'border-blue-100 hover:border-blue-300',
    iconBg: 'bg-[#1877F2] text-white shadow-blue-500/30'
  },
  tiktok: {
    bg: 'bg-slate-50/70 hover:bg-slate-50',
    text: 'text-slate-900',
    border: 'border-slate-200 hover:border-slate-400',
    iconBg: 'bg-black text-white shadow-slate-900/30'
  },
  youtube: {
    bg: 'bg-red-50/40 hover:bg-red-50/70',
    text: 'text-red-700',
    border: 'border-red-100 hover:border-red-300',
    iconBg: 'bg-[#FF0000] text-white shadow-red-500/30'
  },
  instagram: {
    bg: 'bg-pink-50/40 hover:bg-pink-50/70',
    text: 'text-pink-700',
    border: 'border-pink-100 hover:border-pink-300',
    iconBg: 'bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] text-white shadow-pink-500/30'
  }
}

function getPlatformTheme(name: string) {
  const n = name.toLowerCase()
  for (const key of Object.keys(PLATFORM_THEMES)) {
    if (n.includes(key)) return PLATFORM_THEMES[key]
  }
  return {
    bg: 'bg-indigo-50/40 hover:bg-indigo-50/70',
    text: 'text-indigo-700',
    border: 'border-indigo-100 hover:border-indigo-300',
    iconBg: 'bg-indigo-600 text-white shadow-indigo-500/30'
  }
}

export default function TasksHubClient({
  initialTasks,
  initialPlatforms,
  initialUsers,
  currentUserId,
  initialSelectedPlatformId = null
}: {
  initialTasks: Task[]
  initialPlatforms: Platform[]
  initialUsers: any[]
  currentUserId: string
  initialSelectedPlatformId?: string | null
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [detailModalTask, setDetailModalTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(initialSelectedPlatformId)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [platformTypeFilter, setPlatformTypeFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'CARDS' | 'ALL_TASKS'>('CARDS')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)
  const [now, setNow] = useState(0)

  useEffect(() => {
    setNow(Date.now())
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Derive platforms if not already in initialPlatforms
  const platforms = useMemo(() => {
    const map = new Map<string, Platform>()
    initialPlatforms.forEach(p => map.set(p.id, p))
    tasks.forEach(t => {
      if (t.platform && !map.has(t.platform.id)) {
        map.set(t.platform.id, t.platform)
      }
    })
    return Array.from(map.values())
  }, [initialPlatforms, tasks])

  // Overall statistics
  const totalTasksCount = tasks.length
  const totalDoneCount = tasks.filter(t => t.status === 'DONE').length
  const totalInProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length
  const totalLateCount = tasks.filter(t => {
    if (t.status === 'LATE') return true
    if (t.status !== 'DONE' && new Date(t.dueDate).getTime() < new Date().getTime()) return true
    return false
  }).length

  // Calculate metrics per platform
  const platformMetrics = useMemo(() => {
    return platforms.map(platform => {
      const pTasks = tasks.filter(t => t.platformId === platform.id)
      const done = pTasks.filter(t => t.status === 'DONE').length
      const inProgress = pTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length
      const late = pTasks.filter(t => {
        if (t.status === 'LATE') return true
        if (t.status !== 'DONE' && new Date(t.dueDate).getTime() < new Date().getTime()) return true
        return false
      }).length
      const total = pTasks.length
      const progress = total === 0 ? 0 : Math.round((done / total) * 100)

      // Unique assignees
      const userMap = new Map<string, { id: string, name: string }>()
      pTasks.forEach(t => {
        if (t.user) userMap.set(t.user.id, { id: t.user.id, name: t.user.name })
      })
      const assignees = Array.from(userMap.values())

      return {
        platform,
        tasks: pTasks,
        total,
        done,
        inProgress,
        late,
        progress,
        assignees
      }
    })
  }, [platforms, tasks])

  // Filtered platforms for Cards view
  const filteredPlatformMetrics = useMemo(() => {
    return platformMetrics.filter(m => {
      const matchesSearch = 
        m.platform.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.platform.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = 
        platformTypeFilter === 'ALL' ||
        m.platform.name.toLowerCase().includes(platformTypeFilter.toLowerCase())
      
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'LATE' && m.late > 0) ||
        (statusFilter === 'IN_PROGRESS' && m.inProgress > 0) ||
        (statusFilter === 'DONE' && m.done === m.total && m.total > 0)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [platformMetrics, searchQuery, platformTypeFilter, statusFilter])

  // Selected platform data for Focused View
  const selectedPlatformData = useMemo(() => {
    if (!selectedPlatformId) return null
    return platformMetrics.find(m => m.platform.id === selectedPlatformId) || null
  }, [platformMetrics, selectedPlatformId])

  // Filtered tasks inside Focused View
  const focusedPlatformTasks = useMemo(() => {
    if (!selectedPlatformData) return []
    return selectedPlatformData.tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.user?.name && t.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const isLate = t.status === 'LATE' || (t.status !== 'DONE' && new Date(t.dueDate).getTime() < new Date().getTime())
      
      if (statusFilter === 'ALL') return matchesSearch
      if (statusFilter === 'DONE') return matchesSearch && t.status === 'DONE'
      if (statusFilter === 'LATE') return matchesSearch && isLate
      if (statusFilter === 'IN_PROGRESS') return matchesSearch && (t.status === 'IN_PROGRESS' || t.status === 'REVIEW')
      if (statusFilter === 'TODO') return matchesSearch && t.status === 'TODO'
      return matchesSearch
    })
  }, [selectedPlatformData, searchQuery, statusFilter])

  // Handle Quick Status Change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setIsUpdatingStatus(taskId)
    try {
      await changeTaskStatus(taskId, newStatus)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (err) {
      console.error(err)
      alert('ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ')
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  const exportTasksToCSV = () => {
    const headers = ['ID', 'ຫົວຂໍ້', 'ພະນັກງານ', 'ເພຈ', 'ສະຖານະ', 'ກຳນົດສົ່ງ', 'ສຳເລັດເວລາ']
    const csvContent = [
      headers.join(','),
      ...tasks.map(t => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.user.name}"`,
        `"${t.platform.name}"`,
        t.status,
        new Date(t.dueDate).toLocaleString('lo-LA'),
        t.completedAt ? new Date(t.completedAt).toLocaleString('lo-LA') : ''
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
  }

  // Handle Delete Task
  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໜ້າວຽກ "${title}"?`)) return
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      console.error(err)
      alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບໜ້າວຽກ')
    }
  }

  return (
    <div className="space-y-6">

      {/* TOP HEADER & HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        {/* Glow background circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>ລະບົບມອບໝາຍວຽກແຍກຕາມເພຈ (Platform Hub)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {selectedPlatformData 
                ? `ໜ້າວຽກຂອງ: ${selectedPlatformData.platform.pageName}` 
                : 'ລາຍການມອບໝາຍວຽກ (Tasks by Platform)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal">
              {selectedPlatformData
                ? `ກຳລັງສະແດງລາຍລະອຽດວຽກທັງໝົດຂອງເພຈ ${selectedPlatformData.platform.name} (${selectedPlatformData.platform.pageName})`
                : 'ຈັດການ ແລະ ຕິດຕາມຄວາມຄືບໜ້າວຽກຂອງແຕ່ລະເພຈ/ຊ່ອງທາງ Social Media ຢ່າງເປັນລະບົບ'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {selectedPlatformId && (
              <button
                onClick={() => {
                  setSelectedPlatformId(null)
                  setSearchQuery('')
                  setStatusFilter('ALL')
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 shadow-sm"
              >
                <span>←</span>
                <span>ກັບໄປໜ້າລວມທຸກເພຈ</span>
              </button>
            )}
            <Link
              href={selectedPlatformId ? `/admin/tasks/new?platformId=${selectedPlatformId}` : '/admin/tasks/new'}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>{selectedPlatformId ? '+ ສ້າງວຽກໃສ່ເພຈນີ້' : '+ ສ້າງໜ້າວຽກໃໝ່'}</span>
            </Link>
          </div>
        </div>

        {/* Global Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300 font-medium">ເພຈທັງໝົດ</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{platforms.length}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300 font-medium">ໜ້າວຽກທັງໝົດ</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-200 mt-0.5">{totalTasksCount}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-300 font-medium">ສຳເລັດແລ້ວ</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">{totalDoneCount}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-300 font-medium">ກຳລັງເຮັດ</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-0.5">{totalInProgressCount}</div>
          </div>
          <div className={`backdrop-blur-md rounded-2xl p-3 border ${
            totalLateCount > 0 ? 'bg-red-500/20 border-red-400/30' : 'bg-white/5 border-white/10'
          }`}>
            <div className="text-[11px] text-red-200 font-medium">ຊັກຊ້າ (Late)</div>
            <div className={`text-xl sm:text-2xl font-bold mt-0.5 ${totalLateCount > 0 ? 'text-red-300' : 'text-slate-400'}`}>
              {totalLateCount}
            </div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={selectedPlatformId ? "ຄົ້ນຫາຊື່ວຽກ ຫຼື ພະນັກງານ..." : "ຄົ້ນຫາຊື່ເພຈ ຫຼື ແພລັດຟອມ..."}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ທັງໝົດ
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'IN_PROGRESS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ກຳລັງເຮັດ
            </button>
            <button
              onClick={() => setStatusFilter('DONE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'DONE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ສຳເລັດ
            </button>
            <button
              onClick={() => setStatusFilter('LATE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'LATE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ຊັກຊ້າ
            </button>
          </div>

          {/* Export & View Mode Toggle */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <button
              onClick={exportTasksToCSV}
              className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Excel
            </button>
            {!selectedPlatformId && (
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold ml-auto sm:ml-0">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'CARDS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="ມຸມມອງກາດແຍກຕາມເພຈ"
              >
                <span>🗂️</span>
                <span>ແຍກຕາມເພຈ (Cards)</span>
              </button>
              <button
                onClick={() => setViewMode('ALL_TASKS')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'ALL_TASKS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="ມຸມມອງຕາຕະລາງລວມທຸກວຽກ"
              >
                <span>📋</span>
                <span>ວຽກທັງໝົດ (List)</span>
              </button>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {selectedPlatformId && selectedPlatformData ? (
        /* FOCUSED PLATFORM VIEW (ເມື່ອກົດ "ເບິ່ງໜ້າວຽກ") */
        <div className="space-y-6">
          {/* Platform Detail Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {selectedPlatformData.platform.logoUrl ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md flex-shrink-0 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedPlatformData.platform.logoUrl} alt={selectedPlatformData.platform.pageName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md ${
                  getPlatformTheme(selectedPlatformData.platform.name).iconBg
                }`}>
                  {selectedPlatformData.platform.name.charAt(0)}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedPlatformData.platform.pageName}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
                    {selectedPlatformData.platform.name}
                  </span>
                </div>
                {selectedPlatformData.platform.url && (
                  <a
                    href={selectedPlatformData.platform.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>🔗 {selectedPlatformData.platform.url}</span>
                  </a>
                )}
                <div className="text-xs text-gray-500 font-medium pt-1">
                  ຜູ້ຮັບຜິດຊອບ: {selectedPlatformData.assignees.map(a => a.name).join(', ') || 'ຍັງບໍ່ມີພະນັກງານ'}
                </div>
              </div>
            </div>

            {/* Quick Metrics & Progress */}
            <div className="flex flex-col sm:flex-row items-center gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
              <div className="text-center sm:text-right">
                <div className="text-2xl font-black text-gray-900">{selectedPlatformData.progress}%</div>
                <div className="text-xs text-gray-500">ຄວາມຄືບໜ້າວຽກ</div>
                <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${selectedPlatformData.progress}%` }} />
                </div>
              </div>
              <div className="flex gap-2 text-center text-xs">
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 font-semibold">
                  <div>{selectedPlatformData.done}</div>
                  <div className="text-[10px] text-emerald-600">ສຳເລັດ</div>
                </div>
                <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 font-semibold">
                  <div>{selectedPlatformData.inProgress}</div>
                  <div className="text-[10px] text-blue-600">ກຳລັງເຮັດ</div>
                </div>
                <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-800 font-semibold">
                  <div>{selectedPlatformData.late}</div>
                  <div className="text-[10px] text-red-600">ຊັກຊ້າ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Task List of Focused Platform */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                ລາຍການໜ້າວຽກທັງໝົດ ({focusedPlatformTasks.length} ວຽກ)
              </h3>
              <Link
                href={`/admin/tasks/new?platformId=${selectedPlatformId}`}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                + ເພີ່ມວຽກໃໝ່
              </Link>
            </div>

            {focusedPlatformTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                ບໍ່ພົບໜ້າວຽກຕາມເງື່ອນໄຂທີ່ເລືອກ
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {focusedPlatformTasks.map(task => {
                  const isLate = task.status === 'LATE' || (task.status !== 'DONE' && new Date(task.dueDate).getTime() < new Date().getTime())
                  return (
                    <div key={task.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{task.title}</h4>
                          {isLate && task.status !== 'DONE' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 border border-red-200">
                              ກາຍກຳນົດ
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1 text-gray-700 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                              {task.user?.name?.charAt(0) || 'U'}
                            </span>
                            <span>{task.user?.name}</span>
                          </span>
                          <span>•</span>
                          <span>ກຳນົດ: {new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          {task.proofUrl && (
                            <>
                              <span>•</span>
                              <a href={task.proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-bold">
                                <span>🔗 ເບິ່ງຫຼັກຖານໂພສ</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                        <select
                          value={task.status}
                          disabled={isUpdatingStatus === task.id}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`text-xs font-bold rounded-xl px-3 py-1.5 border shadow-sm cursor-pointer transition-all focus:outline-none ${
                            task.status === 'DONE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : task.status === 'LATE'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <option value="TODO">📋 TODO (ລໍຖ້າເຮັດ)</option>
                          <option value="IN_PROGRESS">⏳ IN_PROGRESS (ກຳລັງເຮັດ)</option>
                          <option value="REVIEW">🔍 REVIEW (ລໍຖ້າກວດ)</option>
                          <option value="DONE">✅ DONE (ສຳເລັດ)</option>
                          <option value="LATE">⚠️ LATE (ຊັກຊ້າ)</option>
                        </select>

                        <button onClick={() => setDetailModalTask(task)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="ລາຍລະອຽດ, ຄອມເມັ້ນ"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                        <button onClick={() => handleEditTask(task)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="ແກ້ໄຂ"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="ລຶບໜ້າວຽກນີ້"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* CONCEPT 1: PAGE HUB GRID CARDS (Default View) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlatformMetrics.map(({ platform, tasks: pTasks, total, done, inProgress, late, progress, assignees }) => {
            const theme = getPlatformTheme(platform.name)
            return (
              <div
                key={platform.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {platform.logoUrl ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={platform.logoUrl} alt={platform.pageName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md ${theme.iconBg}`}>
                          {platform.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {platform.pageName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-500 font-medium">{platform.name}</span>
                          {platform.url && (
                            <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.2 rounded font-medium truncate max-w-[120px]">
                              Online
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/admin/tasks/new?platformId=${platform.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex-shrink-0"
                      title="ສ້າງວຽກໃສ່ເພຈນີ້"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Link>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-100">
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-gray-600">ຄວາມຄືບໜ້າວຽກ</span>
                      <span className="text-blue-600 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 3 Pill Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2.5">
                      <div className="font-extrabold text-emerald-700 text-sm">{done}</div>
                      <div className="text-[10px] text-emerald-600 font-medium">ສຳເລັດ</div>
                    </div>
                    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-2.5">
                      <div className="font-extrabold text-blue-700 text-sm">{inProgress}</div>
                      <div className="text-[10px] text-blue-600 font-medium">ກຳລັງເຮັດ</div>
                    </div>
                    <div className={`border rounded-2xl p-2.5 ${
                      late > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className={`font-extrabold text-sm ${late > 0 ? 'text-red-700 font-black' : 'text-gray-400'}`}>
                        {late}
                      </div>
                      <div className={`text-[10px] font-medium ${late > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        ຊັກຊ້າ
                      </div>
                    </div>
                  </div>

                  {/* Team Members Working on Page */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-500 font-medium">ພະນັກງານຮັບຜິດຊອບ:</span>
                    {assignees.length === 0 ? (
                      <span className="text-gray-400 text-[11px]">ຍັງບໍ່ມີວຽກ</span>
                    ) : (
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {assignees.slice(0, 3).map((assignee, idx) => (
                          <div
                            key={assignee.id}
                            title={assignee.name}
                            className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                              idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-indigo-600' : 'bg-emerald-600'
                            }`}
                          >
                            {assignee.name.charAt(0)}
                          </div>
                        ))}
                        {assignees.length > 3 && (
                          <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center">
                            +{assignees.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Live Countdown for Next Upcoming Task */}
                  {(() => {
                    const nextTask = pTasks.filter(t => t.status !== 'DONE').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
                    if (!nextTask) return (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2.5 text-center text-xs font-bold text-emerald-700">
                        🎉 ທຸກວຽກສຳເລັດແລ້ວ!
                      </div>
                    )
                    return (
                      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 rounded-2xl p-2.5 space-y-1">
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="font-bold text-blue-900 flex items-center gap-1">
                            <span>⏰ ນັບຖອຍຫຼັງ</span>
                          </span>
                          <LiveCountdown dueDate={nextTask.dueDate} nowTs={now} />
                        </div>
                        <p className="text-xs font-extrabold text-gray-900 truncate">{nextTask.title}</p>
                      </div>
                    )
                  })()}
                </div>

                {/* Primary Card Button */}
                <div className="pt-4 mt-1">
                  <button
                    onClick={() => {
                      setSelectedPlatformId(platform.id)
                      setSearchQuery('')
                      setStatusFilter('ALL')
                    }}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white text-xs sm:text-sm font-bold py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 group-hover:bg-blue-600 hover:shadow-blue-500/20"
                  >
                    <span>ເບິ່ງ {total} ໜ້າວຽກ</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ALL TASKS LIST TABLE (ມຸມມອງຕາຕະລາງລວມທຸກວຽກ) */
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs font-semibold">
                <tr>
                  <th className="py-4 px-6">ໜ້າວຽກ</th>
                  <th className="py-4 px-6">ເພຈ/ຊ່ອງ</th>
                  <th className="py-4 px-6">ພະນັກງານ</th>
                  <th className="py-4 px-6">ກຳນົດເວລາ</th>
                  <th className="py-4 px-6">ສະຖານະ</th>
                  <th className="py-4 px-6 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map(task => {
                  const isLate = task.status === 'LATE' || (task.status !== 'DONE' && new Date(task.dueDate).getTime() < new Date().getTime())
                  return (
                    <tr key={task.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{task.title}</div>
                        {task.proofUrl && (
                          <a href={task.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                            🔗 ເບິ່ງຫຼັກຖານ
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {task.platform?.name} - {task.platform?.pageName}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-700">
                        {task.user?.name}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${
                          task.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                          isLate ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => setDetailModalTask(task)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors" title="ລາຍລະອຽດ, ຄອມເມັ້ນ"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                        <button onClick={() => handleEditTask(task)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors" title="ແກ້ໄຂ"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="ລຶບວຽກ"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditTaskModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={editingTask}
        platforms={platforms}
        users={initialUsers}
      />
      <TaskDetailModal
        isOpen={!!detailModalTask}
        onClose={() => setDetailModalTask(null)}
        task={detailModalTask}
        currentUserId={currentUserId}
        isAdmin={true}
      />
    </div>
  )
}
