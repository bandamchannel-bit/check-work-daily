'use client'

import { useState, useEffect } from 'react'
import { updateTask } from '@/app/actions/tasks'

type Task = any // Minimal typing for brevity
type Platform = any

export default function EditTaskModal({ 
  isOpen, 
  onClose, 
  task, 
  platforms, 
  users 
}: { 
  isOpen: boolean
  onClose: () => void
  task: Task | null
  platforms: Platform[]
  users: any[] 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    userId: '',
    platformId: '',
    date: '',
    time: ''
  })

  useEffect(() => {
    if (task) {
      const d = new Date(task.dueDate)
      setFormData({
        title: task.title,
        userId: task.userId,
        platformId: task.platformId,
        date: d.toISOString().split('T')[0],
        time: d.toTimeString().slice(0, 5)
      })
    }
  }, [task])

  if (!isOpen || !task) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const data = new FormData()
    data.append('id', task.id)
    data.append('title', formData.title)
    data.append('userId', formData.userId)
    data.append('platformId', formData.platformId)
    data.append('date', formData.date)
    data.append('time', formData.time)

    try {
      const res = await updateTask(data)
      if (res?.error) {
        setError(res.error)
      } else {
        onClose()
        window.location.reload()
      }
    } catch (err) {
      setError('ເກີດຂໍ້ຜິດພາດ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">ແກ້ໄຂໜ້າວຽກ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ຫົວຂໍ້ວຽກ</label>
            <input 
              type="text" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ເພຈ / ຊ່ອງ</label>
            <select 
              required value={formData.platformId} onChange={e => setFormData({...formData, platformId: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ເລືອກເພຈ</option>
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.pageName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ມອບໝາຍໃຫ້</label>
            <select 
              required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ເລືອກພະນັກງານ</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ວັນທີ</label>
              <input 
                type="date" required
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ເວລາ</label>
              <input 
                type="time" required
                value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              ຍົກເລີກ
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              {isLoading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
