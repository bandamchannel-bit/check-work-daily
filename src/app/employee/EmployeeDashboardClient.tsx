'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { completeTask, changeTaskStatus } from '@/app/actions/tasks'
import TaskDetailModal from '@/components/TaskDetailModal'

type Task = {
  id: string
  title: string
  description?: string | null
  dueDate: string
  status: string
  proofUrl?: string | null
  proofImage?: string | null
  platform: {
    id: string
    name: string
    pageName: string
    logoUrl?: string | null
    url?: string | null
  }
  project?: {
    id: string
    name: string
    description?: string | null
  } | null
}

type Employee = { id: string; name: string }

function getPlatformColors(name: string) {
  const n = name.toLowerCase()
  if (n.includes('facebook'))  return { bg: 'bg-blue-600',   ring: 'ring-blue-500',   light: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    grad: 'from-blue-600 to-blue-500' }
  if (n.includes('tiktok'))    return { bg: 'bg-gray-900',   ring: 'ring-gray-700',   light: 'bg-gray-50',    border: 'border-gray-200',    text: 'text-gray-700',    grad: 'from-gray-900 to-gray-700' }
  if (n.includes('youtube'))   return { bg: 'bg-red-600',    ring: 'ring-red-500',    light: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     grad: 'from-red-600 to-red-500' }
  if (n.includes('instagram')) return { bg: 'bg-pink-600',   ring: 'ring-pink-500',   light: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700',    grad: 'from-pink-600 to-purple-600' }
  if (n.includes('twitter') || n.includes('x.com')) return { bg: 'bg-sky-500', ring: 'ring-sky-400', light: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', grad: 'from-sky-500 to-sky-400' }
  return { bg: 'bg-indigo-600', ring: 'ring-indigo-500', light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', grad: 'from-indigo-600 to-violet-600' }
}

// ─── Real-Time Live Countdown Badge ───────────────────────────────────────────
function LiveCountdown({ dueDate, nowTs }: { dueDate: string; nowTs: number }) {
  if (nowTs === 0) {
    return <span className="text-gray-400 text-xs font-mono tabular-nums">--:--:--</span>
  }

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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-bold border border-red-200 animate-pulse shadow-sm">
        <span>⚠️ ກາຍ</span>
        <span className="font-mono tabular-nums font-black">{timeStr}</span>
      </span>
    )
  }

  if (diff < 3600000) { // < 1 hour: Flame urgent state
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-red-500 text-white text-xs font-black shadow-md shadow-orange-500/20 animate-pulse">
        <span>🔥 ດ່ວນ!</span>
        <span className="font-mono tabular-nums tracking-wider">{timeStr}</span>
      </span>
    )
  }

  if (diff < 3 * 3600000) { // 1 - 3 hours: Warning amber
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 shadow-sm">
        <span>⚡ ເຫຼືອ</span>
        <span className="font-mono tabular-nums font-black">{timeStr}</span>
      </span>
    )
  }

  // > 3 hours: Calm blue
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 shadow-sm">
      <span>⏳ ເຫຼືອ</span>
      <span className="font-mono tabular-nums font-black">{timeStr}</span>
    </span>
  )
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const MAX_WIDTH = 1280
        const MAX_HEIGHT = 1280
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height)
            height = MAX_HEIGHT
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', 0.82)
        resolve(compressed)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// ─── Proof Modal ──────────────────────────────────────────────────────────────
function ProofModal({ task, onClose, onSuccess }: { task: Task; onClose: () => void; onSuccess: (taskId: string, proofUrl: string | null, proofImage: string | null) => void }) {
  const [proofUrl, setProofUrl]       = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64]   = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError]             = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setCompressing(true)
    try {
      const compressed = await compressImage(file)
      setImagePreview(compressed)
      setImageBase64(compressed)
    } catch {
      setError('ບໍ່ສາມາດອ່ານໄຟລ໌ຮູບພາບໄດ້')
    } finally {
      setCompressing(false)
    }
  }

  const handleSubmit = async () => {
    if (!proofUrl.trim() && !imageBase64) { setError('ກະລຸນາໃສ່ Link ໂພສ ຫຼື ອັບໂຫຼດຮູບໜ້າຈໍ'); return }
    setLoading(true); setError('')
    try {
      await completeTask(task.id, proofUrl.trim() || null, imageBase64 || null)
      onSuccess(task.id, proofUrl.trim() || null, imageBase64 || null); onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ເກີດຂໍ້ຜິດພາດ')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5"><span className="text-xl">✅</span><h3 className="text-base font-bold">ຢືນຢັນສຳເລັດວຽກ</h3></div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <p className="text-xs text-emerald-100 line-clamp-1">{task.title}</p>
          <p className="text-xs text-emerald-200 mt-0.5">{task.platform.name} · {task.platform.pageName}</p>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 font-medium">ໃສ່ <strong>Link ໂພສ</strong> ຫຼື <strong>ຮູບໜ້າຈໍ</strong> ເພື່ອຢືນຢັນ</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
              Link ໂພສ / URL ຫຼັກຖານ
            </label>
            <input type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)} placeholder="https://facebook.com/..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"/>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400"><div className="flex-1 h-px bg-gray-100"/><span className="font-semibold">ຫຼື</span><div className="flex-1 h-px bg-gray-100"/></div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">2</span>
              ຮູບໜ້າຈໍ Screenshot
            </label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="proof" className="w-full max-h-44 object-cover"/>
                <button onClick={() => { setImagePreview(null); setImageBase64(null); if (fileRef.current) fileRef.current.value = '' }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={compressing}
                className="w-full border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50/50 rounded-2xl py-7 flex flex-col items-center gap-2 transition-all group disabled:opacity-50"
              >
                {compressing ? (
                  <div className="flex items-center gap-2 text-purple-600 text-xs font-bold">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span>ກຳລັງຍໍ່ຂະໜາດຮູບພາບ...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-7 h-7 text-gray-300 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span className="text-xs text-gray-400 group-hover:text-purple-600 font-medium">ກົດເພື່ອເລືອກຮູບ (PNG, JPG ≤15MB ລະບົບຍໍ່ຂະໜາດອັດຕະໂນມັດ)</span>
                  </>
                )}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-700 font-medium">{error}</div>}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">ຍົກເລີກ</button>
          <button onClick={handleSubmit} disabled={loading || (!proofUrl.trim() && !imageBase64)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>ບັນທຶກ...</> : <><span>✅</span>ຢືນຢັນສຳເລັດ</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Deadline Alert Bottom Bar ─────────────────────────────────────────────────
function DeadlineAlertBar({ tasks, nowTs }: { tasks: Task[]; nowTs: number }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const alertTasks = useMemo(() => tasks.filter(t => {
    if (t.status === 'DONE' || dismissed.has(t.id)) return false
    if (nowTs === 0) return false
    return new Date(t.dueDate).getTime() - nowTs < 2 * 3600000
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [tasks, nowTs, dismissed])

  if (alertTasks.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:left-64">
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-base animate-bounce">⚠️</span>
            <span className="text-white text-xs font-bold whitespace-nowrap hidden sm:block">ໃກ້ຮອດກຳນົດ:</span>
          </div>
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {alertTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 animate-ping"/>
                <span className="max-w-[130px] truncate">{task.title}</span>
                <LiveCountdown dueDate={task.dueDate} nowTs={nowTs} />
                <button onClick={() => setDismissed(prev => new Set(prev).add(task.id))} className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors flex-shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setDismissed(new Set(alertTasks.map(t => t.id)))} className="text-white/70 hover:text-white text-xs flex-shrink-0 underline whitespace-nowrap">ປິດທັງໝົດ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Platform Card (Hub View) ─────────────────────────────────────────────────
function PlatformCard({ platform, tasks, nowTs, onClick }: { platform: Task['platform']; tasks: Task[]; nowTs: number; onClick: () => void }) {
  const colors = getPlatformColors(platform.name)
  const done = tasks.filter(t => t.status === 'DONE').length
  const late = nowTs > 0 ? tasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate).getTime() < nowTs).length : 0
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const pending = tasks.filter(t => t.status === 'TODO').length
  const progress = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100)
  const nextTask = tasks.filter(t => t.status !== 'DONE').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group relative cursor-pointer flex flex-col justify-between`}
    >
      <div>
        {/* Card top color strip */}
        <div className={`bg-gradient-to-r ${colors.grad} h-1.5 w-full`}/>

        <div className="p-5">
          {/* Platform header */}
          <div className="flex items-start gap-3 mb-4">
            {platform.logoUrl ? (
              <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={platform.logoUrl} alt={platform.pageName} className="w-full h-full object-cover"/>
              </div>
            ) : (
              <div className={`w-11 h-11 rounded-2xl ${colors.bg} flex items-center justify-center font-extrabold text-white text-base shadow-md flex-shrink-0`}>
                {platform.pageName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-gray-900 text-sm leading-tight truncate group-hover:text-blue-700 transition-colors">{platform.pageName}</h3>
              <p className={`text-xs font-semibold ${colors.text} mt-0.5`}>{platform.name}</p>
            </div>
            {/* Arrow indicator */}
            <div className={`w-7 h-7 rounded-xl ${colors.light} ${colors.text} flex items-center justify-center flex-shrink-0 group-hover:translate-x-0.5 transition-transform`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-semibold">ຄວາມຄືບໜ້າ</span>
              <span className={`font-bold ${progress === 100 ? 'text-emerald-600' : colors.text}`}>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${progress === 100 ? 'from-emerald-500 to-teal-500' : colors.grad}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-lg text-[11px] font-bold text-gray-600">
              📋 {tasks.length} ວຽກ
            </span>
            {done > 0 && <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-lg text-[11px] font-bold text-emerald-700">✅ {done}</span>}
            {inProgress > 0 && <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-lg text-[11px] font-bold text-blue-700">⏳ {inProgress}</span>}
            {pending > 0 && <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-lg text-[11px] font-bold text-gray-500">🔲 {pending}</span>}
            {late > 0 && <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-lg text-[11px] font-bold text-red-700 animate-pulse">⚠️ {late} ຊ້າ</span>}
          </div>

          {/* Live Countdown & Upcoming Task Box */}
          {nextTask ? (
            <div className={`mt-3 rounded-2xl p-3 border transition-all ${
              nowTs > 0 && new Date(nextTask.dueDate).getTime() < nowTs
                ? 'bg-red-50/90 border-red-200 text-red-950'
                : nowTs > 0 && (new Date(nextTask.dueDate).getTime() - nowTs) < 3600000
                ? 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-orange-300 shadow-sm'
                : `${colors.light} ${colors.border}`
            }`}>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-black text-gray-700 flex items-center gap-1">
                  <span>⏰ ນັບຖອຍຫຼັງ</span>
                </span>
                <LiveCountdown dueDate={nextTask.dueDate} nowTs={nowTs} />
              </div>
              <p className={`text-xs font-extrabold truncate ${colors.text}`}>
                {nextTask.title}
              </p>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <span>🕐 ກຳນົດ:</span>
                  <span className="font-bold text-gray-700">{new Date(nextTask.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
                {nextTask.project && (
                  <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full font-bold text-gray-600 truncate max-w-[120px]">
                    📁 {nextTask.project.name}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
              <p className="text-xs font-bold text-emerald-700">🎉 ທຸກວຽກສຳເລັດແລ້ວ!</p>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Project Card (Grouped by Project) ─────────────────────────────────────────
function ProjectCard({ project, tasks, nowTs, onClick }: { project: { id: string; name: string }; tasks: Task[]; nowTs: number; onClick: () => void }) {
  const done = tasks.filter(t => t.status === 'DONE').length
  const late = nowTs > 0 ? tasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate).getTime() < nowTs).length : 0
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const progress = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100)
  const nextTask = tasks.filter(t => t.status !== 'DONE').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden group relative cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top gradient line */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1.5 w-full"/>

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-md flex-shrink-0">
              📁
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-gray-900 text-sm leading-tight truncate group-hover:text-indigo-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs font-semibold text-indigo-600 mt-0.5">{tasks.length} ໜ້າວຽກໃນໂປຣເຈັກ</p>
            </div>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-semibold">ຄວາມຄືບໜ້າໂປຣເຈັກ</span>
              <span className="font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="px-2 py-0.5 bg-gray-50 rounded-lg text-[11px] font-bold text-gray-600">
              📋 {tasks.length} ວຽກ
            </span>
            {done > 0 && <span className="px-2 py-0.5 bg-emerald-50 rounded-lg text-[11px] font-bold text-emerald-700">✅ {done}</span>}
            {inProgress > 0 && <span className="px-2 py-0.5 bg-blue-50 rounded-lg text-[11px] font-bold text-blue-700">⏳ {inProgress}</span>}
            {late > 0 && <span className="px-2 py-0.5 bg-red-50 rounded-lg text-[11px] font-bold text-red-700 animate-pulse">⚠️ {late} ຊ້າ</span>}
          </div>

          {/* Live Countdown for Project */}
          {nextTask ? (
            <div className="mt-3 rounded-2xl p-3 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-black text-indigo-900 flex items-center gap-1">
                  <span>⏰ ນັບຖອຍຫຼັງສົ່ງວຽກ</span>
                </span>
                <LiveCountdown dueDate={nextTask.dueDate} nowTs={nowTs} />
              </div>
              <p className="text-xs font-extrabold text-indigo-950 truncate">
                {nextTask.title}
              </p>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5">
                <span>📱 {nextTask.platform.pageName}</span>
                <span className="font-bold text-indigo-600">ກົດເບິ່ງ →</span>
              </div>
            </div>
          ) : (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
              <p className="text-xs font-bold text-emerald-700">🎉 ສຳເລັດທຸກວຽກໃນໂປຣເຈັກນີ້!</p>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Focused Task List (Platform or Project) ──────────────────────────────────
function FocusedTaskList({ title, subtitle, description, icon, tasks, nowTs, onBack, onMarkDone, onStatusChange, changingStatus, onViewDetail }: {
  title: string
  subtitle: string
  description?: string | null
  icon?: React.ReactNode
  tasks: Task[]
  nowTs: number
  onBack?: () => void
  onMarkDone: (task: Task) => void
  onStatusChange: (taskId: string, status: string) => void
  changingStatus: string | null
  onViewDetail: (task: Task) => void
}) {
  const [filter, setFilter] = useState('ALL')

  const filtered = useMemo(() => {
    if (filter === 'ALL') return tasks
    if (filter === 'LATE') return tasks.filter(t => t.status !== 'DONE' && (nowTs > 0 ? new Date(t.dueDate).getTime() < nowTs : false))
    return tasks.filter(t => t.status === filter)
  }, [tasks, filter, nowTs])

  const done = tasks.filter(t => t.status === 'DONE').length
  const late = nowTs > 0 ? tasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate).getTime() < nowTs).length : 0

  return (
    <div className="space-y-4">
      {/* Back button + Header */}
      <div className="flex items-start sm:items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="mt-1 sm:mt-0 w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
          </button>
        )}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-3.5">
          {icon}
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-gray-900 text-base truncate">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line leading-relaxed">{description}</p>
            )}
            <p className="text-xs font-semibold text-gray-500 mt-1.5">{subtitle} · {tasks.length} ວຽກ · {done} ສຳເລັດ{late > 0 ? ` · ⚠️ ${late} ຊ້າ` : ''}</p>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL',         label: '🗂️ ທັງໝົດ',      count: tasks.length },
          { key: 'TODO',        label: '📋 ລໍຖ້າ',        count: tasks.filter(t=>t.status==='TODO').length },
          { key: 'IN_PROGRESS', label: '⏳ ກຳລັງ',        count: tasks.filter(t=>t.status==='IN_PROGRESS').length },
          { key: 'REVIEW',      label: '🔍 ກວດ',          count: tasks.filter(t=>t.status==='REVIEW').length },
          { key: 'LATE',        label: '⚠️ ຊ້າ',          count: late },
          { key: 'DONE',        label: '✅ ສຳເລັດ',       count: done },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === key
                ? key === 'LATE' ? 'bg-red-600 text-white shadow-md' : key === 'DONE' ? 'bg-emerald-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 shadow-sm'
            }`}>
            {label}
            <span className={`px-1.5 rounded-full text-[10px] font-black ${filter === key ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-2">{filter === 'DONE' ? '🎉' : '📭'}</p>
          <p className="font-bold text-gray-800 text-sm">{filter === 'DONE' ? 'ຍອດຫຍ​ຽ​ວ! ສຳເລັດໝົດ' : 'ບໍ່ມີໜ້າວຽກໃນໝວດນີ້'}</p>
          <button onClick={() => setFilter('ALL')} className="mt-3 text-xs text-blue-600 font-semibold hover:underline">← ກັບໄປດູທັງໝົດ</button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {filtered.map(task => {
              const isLate = task.status !== 'DONE' && (nowTs > 0 ? new Date(task.dueDate).getTime() < nowTs : false)
              return (
                <li key={task.id} className={`transition-colors ${isLate ? 'bg-red-50/30' : 'hover:bg-gray-50/60'}`}>
                  <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    {/* Left: task info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${task.status === 'DONE' ? 'bg-emerald-500' : isLate ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`}/>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold text-sm leading-snug ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h3>
                          {task.project && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.2 rounded-full font-bold">
                              📁 {task.project.name}
                            </span>
                          )}
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded-full font-bold">
                            📱 {task.platform.pageName}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {/* Status badge */}
                          {task.status === 'DONE' && <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">✅ ສຳເລັດ</span>}
                          {isLate && <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse">⚠️ ຊັກຊ້າ</span>}
                          {task.status === 'IN_PROGRESS' && !isLate && <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">⏳ ກຳລັງເຮັດ</span>}
                          {task.status === 'REVIEW' && <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-purple-100 text-purple-700 border border-purple-200">🔍 ລໍຖ້າກວດ</span>}
                          {task.status === 'TODO' && !isLate && <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200">📋 ລໍຖ້າ</span>}

                          {/* Live Countdown Pill for this task */}
                          {task.status !== 'DONE' && (
                            <LiveCountdown dueDate={task.dueDate} nowTs={nowTs} />
                          )}

                          <span className="text-[11px] text-gray-500 font-medium">
                            🕐 ກຳນົດ: {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {task.proofUrl && <a href={task.proofUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 font-bold hover:underline">🔗 ດູໂພສ</a>}
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button onClick={() => onViewDetail(task)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200" title="ລາຍລະອຽດ, ຄອມເມັ້ນ, ໄຟລ໌ແນບ">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      {task.status !== 'DONE' ? (
                        <>
                          <select
                            value={task.status}
                            disabled={changingStatus === task.id}
                            onChange={e => onStatusChange(task.id, e.target.value)}
                            className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="TODO">📋 ລໍຖ້າ</option>
                            <option value="IN_PROGRESS">⏳ ກຳລັງເຮັດ</option>
                            <option value="REVIEW">🔍 ລໍຖ້າກວດ</option>
                            <option value="DONE">✅ ສຳເລັດ...</option>
                          </select>
                          <button onClick={() => onMarkDone(task)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap active:scale-95">
                            ✅ ສຳເລັດ
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          {task.proofImage && (
                            <button onClick={() => {
                              const w = window.open();
                              if (w) {
                                w.document.body.style.margin = '0';
                                w.document.body.style.background = '#0f172a';
                                w.document.body.style.display = 'flex';
                                w.document.body.style.justifyContent = 'center';
                                const img = w.document.createElement('img');
                                img.src = task.proofImage || '';
                                img.style.maxWidth = '100%';
                                img.style.objectFit = 'contain';
                                w.document.body.appendChild(img);
                              }
                            }} className="text-xs text-purple-600 hover:underline font-semibold flex items-center gap-1">📸 ຮູບຫຼັກຖານ</button>
                          )}
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">ສຳເລັດ 🎉</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function EmployeeDashboardClient({
  initialTasks,
  userName,
  isAdmin,
  employees,
  targetUserId,
  activeEmployeeName,
  currentUserId,
}: {
  initialTasks: Task[]
  userName: string
  isAdmin: boolean
  employees: Employee[]
  targetUserId: string
  activeEmployeeName: string | null
  currentUserId: string
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [detailModalTask, setDetailModalTask] = useState<Task | null>(null)
  const [viewGrouping, setViewGrouping] = useState<'ALL' | 'PLATFORM' | 'PROJECT'>('ALL')
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [proofTask, setProofTask] = useState<Task | null>(null)
  const [changingStatus, setChangingStatus] = useState<string | null>(null)
  const [now, setNow] = useState(0)

  // Real-time ticking clock (ticks every 1,000ms = 1 second)
  useEffect(() => {
    setNow(Date.now())
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const total = tasks.length
  const done  = tasks.filter(t => t.status === 'DONE').length
  const late  = now > 0 ? tasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate).getTime() < now).length : 0
  const pending = total - done

  const greeting = now > 0
    ? (new Date(now).getHours() < 12 ? 'ອາລຸນສະຫວັດ ☀️' : new Date(now).getHours() < 17 ? 'ສະບາຍດີ 👋' : 'ສະບາຍດີຕອນແລງ 🌙')
    : 'ສະບາຍດີ 👋'
  const today = now > 0
    ? new Date(now).toLocaleDateString('lo-LA', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  // Group tasks by platform
  const platformGroups = useMemo(() => {
    const map: Record<string, { platform: Task['platform']; tasks: Task[] }> = {}
    tasks.forEach(t => {
      if (!map[t.platform.id]) map[t.platform.id] = { platform: t.platform, tasks: [] }
      map[t.platform.id].tasks.push(t)
    })
    return Object.values(map).sort((a, b) => {
      const aLate = a.tasks.filter(t => t.status !== 'DONE' && (now > 0 ? new Date(t.dueDate).getTime() < now : false)).length
      const bLate = b.tasks.filter(t => t.status !== 'DONE' && (now > 0 ? new Date(t.dueDate).getTime() < now : false)).length
      if (bLate !== aLate) return bLate - aLate
      return b.tasks.filter(t => t.status !== 'DONE').length - a.tasks.filter(t => t.status !== 'DONE').length
    })
  }, [tasks, now])

  // Group tasks by project
  const projectGroups = useMemo(() => {
    const map: Record<string, { id: string; name: string; description?: string | null; tasks: Task[] }> = {}
    tasks.forEach(t => {
      const pid = t.project?.id || 'none'
      const pname = t.project?.name || 'ວຽກທົ່ວໄປ (General Tasks)'
      const pdesc = t.project?.description || null
      if (!map[pid]) map[pid] = { id: pid, name: pname, description: pdesc, tasks: [] }
      map[pid].tasks.push(t)
    })
    return Object.values(map).sort((a, b) => {
      const aLate = a.tasks.filter(t => t.status !== 'DONE' && (now > 0 ? new Date(t.dueDate).getTime() < now : false)).length
      const bLate = b.tasks.filter(t => t.status !== 'DONE' && (now > 0 ? new Date(t.dueDate).getTime() < now : false)).length
      if (bLate !== aLate) return bLate - aLate
      return b.tasks.filter(t => t.status !== 'DONE').length - a.tasks.filter(t => t.status !== 'DONE').length
    })
  }, [tasks, now])

  const selectedPlatformGroup = selectedPlatformId ? platformGroups.find(g => g.platform.id === selectedPlatformId) : null
  const selectedProjectGroup = selectedProjectId ? projectGroups.find(g => g.id === selectedProjectId) : null

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (newStatus === 'DONE') {
      const task = tasks.find(t => t.id === taskId)
      if (task) { setProofTask(task); return }
    }
    setChangingStatus(taskId)
    try {
      await changeTaskStatus(taskId, newStatus)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch { alert('ເກີດຂໍ້ຜິດພາດ') }
    finally { setChangingStatus(null) }
  }

  const handleProofSuccess = (taskId: string, proofUrl: string | null, proofImage: string | null) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'DONE', proofUrl, proofImage } : t))
  }

  return (
    <>
      <div className="space-y-5 pb-20">

        {/* ── Admin Switcher ── */}
        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-base">👤</div>
              <div>
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Admin Preview Mode</div>
                <div className="text-sm text-amber-950 font-medium">ກຳລັງເບິ່ງ: <span className="font-black underline">{activeEmployeeName ?? 'Admin'}</span></div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-800 font-semibold">ສະຫຼັບ:</span>
              {employees.map(emp => (
                <Link key={emp.id} href={`/employee?userId=${emp.id}`}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${targetUserId === emp.id ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-100'}`}>
                  {emp.name}
                </Link>
              ))}
              <Link href={`/employee?userId=${currentUserId}`}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${targetUserId === currentUserId ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-100'}`}>
                Admin
              </Link>
            </div>
          </div>
        )}

        {/* ── Hero Header ── */}
        <div className="bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-950 rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden shadow-xl border border-indigo-900/30">
          <div className="absolute -right-12 -top-12 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"/>
          <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"/>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p suppressHydrationWarning className="text-blue-300 text-[11px] font-semibold mb-1">{today}</p>
              <h1 suppressHydrationWarning className="text-xl sm:text-2xl font-extrabold tracking-tight">{greeting}, <span className="text-blue-300">{isAdmin && activeEmployeeName ? activeEmployeeName : userName}</span></h1>
              <p className="text-blue-200/70 text-xs mt-1">ຕິດຕາມເວລານັບຖອຍຫຼັງສົ່ງວຽກ ⏰ ຢ່າປ່ອຍໃຫ້ກາຍກຳນົດ!</p>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
              {[
                { value: total,   label: 'ທັງໝົດ', cls: 'bg-white/10 border-white/10' },
                { value: done,    label: 'ສຳເລັດ', cls: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' },
                { value: pending, label: 'ຄ້າງ',   cls: 'bg-amber-500/20 border-amber-400/30 text-amber-300' },
                ...(late > 0 ? [{ value: late, label: 'ຊ້າ!', cls: 'bg-red-500/30 border-red-400/40 text-red-300 animate-pulse' }] : []),
              ].map(({ value, label, cls }) => (
                <div key={label} className={`text-center px-4 py-3 rounded-2xl backdrop-blur-sm border min-w-[58px] ${cls}`}>
                  <div className="text-xl font-black font-mono tabular-nums">{value}</div>
                  <div className="text-[10px] opacity-80 font-semibold">{label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Progress bar */}
          <div className="relative z-10 mt-4">
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-blue-300">ຄວາມຄືບໜ້າລວມ</span>
              <span className="text-white font-mono tabular-nums">{total === 0 ? 0 : Math.round((done / total) * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-700" style={{ width: `${total === 0 ? 0 : Math.round((done / total) * 100)}%` }}/>
            </div>
          </div>
        </div>

        {/* ── View Mode Switcher ── */}
        {!selectedPlatformId && !selectedProjectId && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200 overflow-x-auto">
              <button
                onClick={() => setViewGrouping('ALL')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewGrouping === 'ALL'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>📋</span>
                <span>ລວມວຽກທັງໝົດ</span>
              </button>
              <button
                onClick={() => setViewGrouping('PLATFORM')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewGrouping === 'PLATFORM'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>🗂️</span>
                <span>ແຍກຕາມເພຈ ({platformGroups.length})</span>
              </button>
              <button
                onClick={() => setViewGrouping('PROJECT')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewGrouping === 'PROJECT'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>🚀</span>
                <span>ແຍກຕາມໂປຣເຈັກ ({projectGroups.length})</span>
              </button>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">
              ⏳ ເວລານັບຖອຍຫຼັງອັບເດດແບບ Real-time ທຸກວິນາທີ
            </span>
          </div>
        )}

        {/* ── Content Area ── */}
        {selectedPlatformGroup ? (
          // ── Focused Platform Task List ──
          <FocusedTaskList
            title={selectedPlatformGroup.platform.pageName}
            subtitle={selectedPlatformGroup.platform.name}
            icon={
              selectedPlatformGroup.platform.logoUrl ? (
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedPlatformGroup.platform.logoUrl} alt="" className="w-full h-full object-cover"/>
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-2xl ${getPlatformColors(selectedPlatformGroup.platform.name).bg} flex items-center justify-center font-bold text-white flex-shrink-0`}>
                  {selectedPlatformGroup.platform.pageName.charAt(0)}
                </div>
              )
            }
            tasks={selectedPlatformGroup.tasks}
            nowTs={now}
            onBack={() => setSelectedPlatformId(null)}
            onMarkDone={task => setProofTask(task)}
            onStatusChange={handleStatusChange}
            changingStatus={changingStatus}
            onViewDetail={setDetailModalTask}
          />
        ) : selectedProjectGroup ? (
          // ── Focused Project Task List ──
          <FocusedTaskList
            title={selectedProjectGroup.name}
            subtitle="ໂປຣເຈັກ"
            description={selectedProjectGroup.description}
            icon={
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                📁
              </div>
            }
            tasks={selectedProjectGroup.tasks}
            nowTs={now}
            onBack={() => setSelectedProjectId(null)}
            onMarkDone={task => setProofTask(task)}
            onStatusChange={handleStatusChange}
            changingStatus={changingStatus}
            onViewDetail={setDetailModalTask}
          />
        ) : viewGrouping === 'ALL' ? (
          // ── All Tasks List ──
          <FocusedTaskList
            title="ລວມວຽກທັງໝົດ"
            subtitle="ລາຍການໜ້າວຽກທັງໝົດຂອງທ່ານ"
            icon={
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white text-lg flex-shrink-0 shadow-sm">
                📋
              </div>
            }
            tasks={tasks}
            nowTs={now}
            onMarkDone={task => setProofTask(task)}
            onStatusChange={handleStatusChange}
            changingStatus={changingStatus}
            onViewDetail={setDetailModalTask}
          />
        ) : viewGrouping === 'PROJECT' ? (
          // ── Project Cards Grid ──
          <>
            {projectGroups.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">ຍັງບໍ່ມີວຽກໃນໂປຣເຈັກໃດ</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectGroups.map(grp => (
                  <ProjectCard
                    key={grp.id}
                    project={{ id: grp.id, name: grp.name }}
                    tasks={grp.tasks}
                    nowTs={now}
                    onClick={() => setSelectedProjectId(grp.id)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // ── Platform Cards Grid ──
          <>
            {platformGroups.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">ວັນນີ້ບໍ່ມີໜ້າວຽກ 🎈</h3>
                <p className="text-gray-500 text-sm">ທ່ານໄດ້ພັກຜ່ອນໄດ້ — ບໍ່ມີໜ້າວຽກທີ່ຕ້ອງຮັບຜິດຊອບ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformGroups.map(({ platform, tasks: pTasks }) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    tasks={pTasks}
                    nowTs={now}
                    onClick={() => setSelectedPlatformId(platform.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Proof Modal ── */}
      {proofTask && (
        <ProofModal task={proofTask} onClose={() => setProofTask(null)} onSuccess={handleProofSuccess}/>
      )}

      {/* ── Deadline Alert Bottom Bar ── */}
      <DeadlineAlertBar tasks={tasks} nowTs={now}/>

      {/* Task Details Modal */}
      <TaskDetailModal
        isOpen={!!detailModalTask}
        onClose={() => setDetailModalTask(null)}
        task={detailModalTask}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
    </>
  )
}
