'use client'

import { useState, useEffect } from 'react'

export default function ProjectCountdownBadge({ dueDate }: { dueDate: string }) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    setNow(Date.now())
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (now === 0) {
    return <span className="text-gray-400 text-xs font-mono tabular-nums">--:--:--</span>
  }

  const diff = new Date(dueDate).getTime() - now
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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-bold border border-red-200 animate-pulse">
        <span>⚠️ ກາຍ</span>
        <span className="font-mono tabular-nums font-black">{timeStr}</span>
      </span>
    )
  }

  if (diff < 3600000) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black shadow-sm shadow-orange-500/20 animate-pulse">
        <span>🔥 ດ່ວນ!</span>
        <span className="font-mono tabular-nums">{timeStr}</span>
      </span>
    )
  }

  if (diff < 3 * 3600000) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
        <span>⚡ ເຫຼືອ</span>
        <span className="font-mono tabular-nums">{timeStr}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
      <span>⏳ ເຫຼືອ</span>
      <span className="font-mono tabular-nums">{timeStr}</span>
    </span>
  )
}
