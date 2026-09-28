'use client'

import { useState, useRef } from 'react'

export default function TaskForm({
  users,
  platforms,
  defaultPlatformId,
  createTaskAction,
  createAutoTaskAction
}: {
  users: any[]
  platforms: any[]
  defaultPlatformId?: string
  createTaskAction: (formData: FormData) => void
  createAutoTaskAction: (formData: FormData) => void
}) {
  const [taskType, setTaskType] = useState<'ONCE' | 'RECURRING'>('ONCE')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Array of days for checkboxes
  const days = [
    { value: '1', label: 'ຈັນ' },
    { value: '2', label: 'ອັງຄານ' },
    { value: '3', label: 'ພຸດ' },
    { value: '4', label: 'ພະຫັດ' },
    { value: '5', label: 'ສຸກ' },
    { value: '6', label: 'ເສົາ' },
    { value: '0', label: 'ອາທິດ' }
  ]

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
  )

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    setSelectedUserIds(users.map(u => u.id))
  }

  const clearAllUsers = () => {
    setSelectedUserIds([])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => {
        // Avoid duplicate files by name and size
        const combined = [...prev]
        for (const nf of newFiles) {
          if (!combined.some(f => f.name === nf.name && f.size === nf.size)) {
            combined.push(nf)
          }
        }
        return combined
      })
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (selectedUserIds.length === 0) {
      e.preventDefault()
      alert('ກະລຸນາເລືອກພະນັກງານຢ່າງໜ້ອຍ 1 ຄົນ')
      return
    }

    // Attach current file state to the form before submit
    const dt = new DataTransfer()
    files.forEach(f => dt.items.add(f))
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files
    }
  }

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 max-w-2xl font-['Noto_Sans_Lao',sans-serif]">
      {/* Tabs for Task Type */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setTaskType('ONCE')}
          className={`pb-2 px-2 text-sm font-semibold transition-colors ${
            taskType === 'ONCE' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ມອບວຽກຄັ້ງດຽວ (One-time)
        </button>
        <button
          type="button"
          onClick={() => setTaskType('RECURRING')}
          className={`pb-2 px-2 text-sm font-semibold transition-colors ${
            taskType === 'RECURRING' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ມອບວຽກປະຈຳ (ອັດຕະໂນມັດ)
        </button>
      </div>

      <form 
        action={taskType === 'ONCE' ? createTaskAction : createAutoTaskAction} 
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Hidden inputs for selected users */}
        {selectedUserIds.map(uid => (
          <input key={uid} type="hidden" name="userIds" value={uid} />
        ))}
        {/* Legacy fallback */}
        {selectedUserIds.length > 0 && (
          <input type="hidden" name="userId" value={selectedUserIds[0]} />
        )}

        {/* Task Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">ຫົວຂໍ້ວຽກ (Task Title) *</label>
          <input
            type="text"
            name="title"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="ເຊັ່ນ: ລົງຄລິບ TikTok ຕອນເຊົ້າ"
          />
        </div>

        {/* Description / Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700">ລາຍລະອຽດ / ຄຳແນະນຳ (Description)</label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="ປ້ອນລາຍລະອຽດວຽກ ຫຼື ສິ່ງທີ່ຕ້ອງການໃຫ້ພະນັກງານເຮັດ..."
          />
        </div>

        {/* Employee Selection & Platform */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Multi-Employee Selector */}
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                ມອບໃຫ້ (Employee) *
              </label>
              {selectedUserIds.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  ເລືອກແລ້ວ {selectedUserIds.length} ຄົນ
                </span>
              )}
            </div>

            {/* Custom Multi-select trigger */}
            <div 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-between sm:text-sm min-h-[38px]"
            >
              <div className="flex-1 truncate">
                {selectedUserIds.length === 0 ? (
                  <span className="text-gray-400">-- ເລືອກພະນັກງານ (ເລືອກໄດ້ຫຼາຍຄົນ) --</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedUserIds.slice(0, 3).map(id => {
                      const u = users.find(user => user.id === id)
                      return (
                        <span key={id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md border border-blue-200">
                          {u?.name}
                        </span>
                      )
                    })}
                    {selectedUserIds.length > 3 && (
                      <span className="text-xs text-gray-500 self-center">
                        +{selectedUserIds.length - 3} ຄົນ
                      </span>
                    )}
                  </div>
                )}
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-200 p-3 space-y-2 animate-in fade-in zoom-in-95">
                {/* Search & Actions */}
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="ຄົ້ນຫາຊື່..."
                    className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    onClick={e => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); selectAllUsers() }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    ທັງໝົດ
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); clearAllUsers() }}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    ລ້າງ
                  </button>
                </div>

                {/* List of Users */}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">ບໍ່ພົບລາຍຊື່</p>
                  ) : (
                    filteredUsers.map(user => {
                      const isSelected = selectedUserIds.includes(user.id)
                      return (
                        <label
                          key={user.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                            isSelected ? 'bg-blue-50/80 text-blue-900 font-medium' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                          onClick={e => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleUser(user.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate flex-1">{user.name}</span>
                        </label>
                      )
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 text-right">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(false)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    ສຳເລັດ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ເພຈ/ຊ່ອງ (Platform) *</label>
            <select
              name="platformId"
              defaultValue={defaultPlatformId || ''}
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- ເລືອກເພຈ --</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name} - {platform.pageName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Work File Upload (ອັບໂຫຼດ file ວຽກ) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ໄຟລ໌ວຽກ / ໄຟລ໌ແນບ (Work Files & Attachments)
          </label>
          
          <input
            type="file"
            name="files"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            id="task-files-upload"
          />

          <label
            htmlFor="task-files-upload"
            className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-2 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              ຄລິກ ຫຼື ລາກໄຟລ໌ມາໃສ່ບ່ອນນີ້ເພື່ອອັບໂຫຼດ
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ຮອງຮັບຮູບພາບ, PDF, Word, Excel, ZIP, ວິດີໂອ ຫຼື ເອກະສານວຽກຕ່າງໆ (ເລືອກໄດ້ຫຼາຍໄຟລ໌)
            </p>
          </label>

          {/* Uploaded Files Preview List */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                <span>ໄຟລ໌ທີ່ເລືອກ ({files.length} ໄຟລ໌):</span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-red-500 hover:text-red-700"
                >
                  ລຶບທັງໝົດ
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg shadow-xs group"
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 text-xs font-bold uppercase">
                        {file.name.split('.').pop()?.slice(0, 3) || 'DOC'}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
                      title="ລຶບໄຟລ໌ນີ້"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deadline or Recurring Schedule */}
        {taskType === 'ONCE' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ກຳນົດເວລາ (Deadline) *</label>
            <div className="flex gap-4">
              <input
                type="date"
                name="date"
                required
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="time"
                name="time"
                required
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">ເລືອກມື້ ແລະ ເວລາທີ່ຕ້ອງການໃຫ້ພະນັກງານເຮັດສຳເລັດ.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ເວລາທີ່ຕ້ອງເຮັດທຸກມື້ (Time of Day) *</label>
              <input
                type="time"
                name="timeOfDay"
                required
                className="block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ມື້ທີ່ຕ້ອງເຮັດ (Days of the week) *</label>
              <div className="flex flex-wrap gap-3">
                {days.map((day) => (
                  <label key={day.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="daysOfWeek"
                      value={day.value}
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">ຕິກເລືອກມື້ທີ່ຕ້ອງການໃຫ້ລະບົບສ້າງວຽກນີ້ຂຶ້ນມາອັດຕະໂນມັດ.</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all cursor-pointer"
          >
            {taskType === 'ONCE' 
              ? (selectedUserIds.length > 1 ? `ບັນທຶກ ແລະ ມອບໝາຍວຽກໃຫ້ ${selectedUserIds.length} ຄົນ` : 'ບັນທຶກ ແລະ ມອບໝາຍວຽກ') 
              : (selectedUserIds.length > 1 ? `ສ້າງວຽກອັດຕະໂນມັດໃຫ້ ${selectedUserIds.length} ຄົນ` : 'ສ້າງວຽກອັດຕະໂນມັດ')}
          </button>
        </div>
      </form>
    </div>
  )
}
