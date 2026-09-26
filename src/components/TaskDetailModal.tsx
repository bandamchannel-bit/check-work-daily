'use client'

import { useState, useRef } from 'react'
import { createSubTask, toggleSubTask, deleteSubTask, addComment, deleteComment, addAttachment, deleteAttachment } from '@/app/actions/task-details'

type TaskDetailProps = {
  isOpen: boolean
  onClose: () => void
  task: any
  currentUserId: string
  isAdmin?: boolean
}

export default function TaskDetailModal({ isOpen, onClose, task, currentUserId, isAdmin }: TaskDetailProps) {
  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments' | 'attachments'>('subtasks')
  
  const [newSubTask, setNewSubTask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !task) return null

  // Ensure task properties exist (to prevent crashes if they weren't fetched)
  const subTasks = task.subTasks || []
  const comments = task.comments || []
  const attachments = task.attachments || []

  const handleAddSubTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubTask.trim()) return
    await createSubTask(task.id, newSubTask)
    setNewSubTask('')
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await addComment(task.id, newComment)
    setNewComment('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // In a real app, you'd upload this to an S3 bucket or API endpoint.
      // For this prototype, we'll convert it to base64.
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        await addAttachment(task.id, file.name, base64String)
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error(err)
      setIsUploading(false)
    }
  }

  const completedSubTasks = subTasks.filter((s: any) => s.isCompleted).length
  const progress = subTasks.length > 0 ? Math.round((completedSubTasks / subTasks.length) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${
                task.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                task.status === 'LATE' ? 'bg-red-50 text-red-700 border-red-200' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                task.status === 'REVIEW' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                {task.status}
              </span>
              <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(task.dueDate).toLocaleDateString('lo-LA')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-snug">{task.title}</h2>
            {task.description && <p className="text-gray-500 mt-2 text-sm">{task.description}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('subtasks')} 
            className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'subtasks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            ວຽກຍ່ອຍ ({subTasks.length})
          </button>
          <button 
            onClick={() => setActiveTab('comments')} 
            className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            ຄອມເມັ້ນ ({comments.length})
          </button>
          <button 
            onClick={() => setActiveTab('attachments')} 
            className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'attachments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            ໄຟລ໌ແນບ ({attachments.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          
          {/* SubTasks Tab */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              {subTasks.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                    <span>ຄວາມຄືບໜ້າ</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {subTasks.map((st: any) => (
                  <div key={st.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow group">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input 
                        type="checkbox" 
                        checked={st.isCompleted} 
                        onChange={(e) => toggleSubTask(st.id, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-sm font-medium transition-all ${st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {st.title}
                      </span>
                    </label>
                    {(isAdmin || currentUserId === task.userId) && (
                      <button onClick={() => deleteSubTask(st.id)} className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                {subTasks.length === 0 && <p className="text-center text-sm text-gray-400 py-4">ຍັງບໍ່ມີວຽກຍ່ອຍ</p>}
              </div>

              {(isAdmin || currentUserId === task.userId) && (
                <form onSubmit={handleAddSubTask} className="mt-4 flex gap-2">
                  <input 
                    type="text" 
                    value={newSubTask} 
                    onChange={e => setNewSubTask(e.target.value)} 
                    placeholder="ເພີ່ມວຽກຍ່ອຍໃໝ່..." 
                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button type="submit" disabled={!newSubTask.trim()} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50">
                    ເພີ່ມ
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {comments.map((c: any) => (
                  <div key={c.id} className={`flex gap-3 ${c.userId === currentUserId ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {c.user?.name?.charAt(0) || '?'}
                    </div>
                    <div className={`flex flex-col ${c.userId === currentUserId ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      <span className="text-xs text-gray-400 mb-1">{c.user?.name} &bull; {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm group relative ${c.userId === currentUserId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                        {c.content}
                        {(isAdmin || c.userId === currentUserId) && (
                          <button onClick={() => deleteComment(c.id)} className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 ${c.userId === currentUserId ? '-left-8 text-red-400 hover:text-red-600' : '-right-8 text-gray-400 hover:text-red-500'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && <div className="text-center text-gray-400 py-10 text-sm">ຍັງບໍ່ມີຄອມເມັ້ນ ເລີ່ມການສົນທະນາເລີຍ</div>}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                <input 
                  type="text" 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)} 
                  placeholder="ພິມຄອມເມັ້ນ..." 
                  className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                />
                <button type="submit" disabled={!newComment.trim()} className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50">
                  <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </form>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {attachments.map((a: any) => (
                  <div key={a.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm aspect-square flex items-center justify-center">
                    {a.fileUrl.startsWith('data:image') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.fileUrl} alt={a.fileName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="text-xs truncate w-24 text-center">{a.fileName}</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <a href={a.fileUrl} download={a.fileName} className="px-3 py-1.5 bg-white/90 text-gray-900 text-xs font-bold rounded-lg hover:bg-white transition-colors">ດາວໂຫຼດ</a>
                      {(isAdmin || a.userId === currentUserId) && (
                        <button onClick={() => deleteAttachment(a.id)} className="px-3 py-1.5 bg-red-500/90 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">ລຶບໄຟລ໌</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {attachments.length === 0 && <p className="text-center text-sm text-gray-400 py-10">ຍັງບໍ່ມີໄຟລ໌ແນບ</p>}

              {(isAdmin || currentUserId === task.userId) && (
                <div className="mt-6">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer">
                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-sm font-semibold">{isUploading ? 'ກຳລັງອັບໂຫຼດ...' : 'ຄລິກເພື່ອອັບໂຫຼດໄຟລ໌'}</span>
                    <span className="text-xs text-gray-400 mt-1">ຮອງຮັບຮູບພາບ ແລະ ເອກະສານທົ່ວໄປ (ສູງສຸດ 10MB)</span>
                  </label>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
