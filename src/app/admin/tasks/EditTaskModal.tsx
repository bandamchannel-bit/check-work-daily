'use client'

import { useState, useEffect, useRef } from 'react'
import { updateTask } from '@/app/actions/tasks'

type Task = any
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
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setFiles([])
    }
  }, [task])

  if (!isOpen || !task) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

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

    // Append any uploaded files
    files.forEach(f => {
      data.append('files', f)
    })

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in font-['Noto_Sans_Lao',sans-serif]">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">ແກ້ໄຂໜ້າວຽກ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
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

          {/* Work file upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ອັບໂຫຼດໄຟລ໌ວຽກເພີ່ມ (Upload Files)
            </label>
            <input 
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-lg p-1.5"
            />
            {files.length > 0 && (
              <p className="text-xs text-blue-600 font-semibold mt-1">
                ເລືອກແລ້ວ {files.length} ໄຟລ໌ໃໝ່
              </p>
            )}
          </div>

          {/* Existing attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-500 block mb-1.5">
                ໄຟລ໌ແນບທີ່ມີຢູ່ແລ້ວ ({task.attachments.length}):
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {task.attachments.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs border border-gray-100">
                    <span className="truncate max-w-[200px] font-medium text-gray-700">{a.fileName}</span>
                    <a href={a.fileUrl} download={a.fileName} className="text-blue-600 hover:underline shrink-0 ml-2">ດາວໂຫຼດ</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
              ຍົກເລີກ
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-bold text-sm">
              {isLoading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
