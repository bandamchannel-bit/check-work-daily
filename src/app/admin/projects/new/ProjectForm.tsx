'use client'

import { useState } from 'react'
import { PROJECT_TEMPLATES } from '@/lib/templates'

export default function ProjectForm({
  createProjectAction,
  users,
  platforms
}: {
  createProjectAction: (formData: FormData) => void
  users: any[]
  platforms: any[]
}) {
  const [template, setTemplate] = useState('blank')
  const [selectedTasks, setSelectedTasks] = useState<any[]>([])

  const handleTemplateChange = (val: string) => {
    setTemplate(val)
    if (val !== 'blank') {
      // Deep copy to allow independent toggling
      const templateTasks = JSON.parse(JSON.stringify(PROJECT_TEMPLATES[val as keyof typeof PROJECT_TEMPLATES]))
      // Add 'enabled' field to all tasks and subtasks
      const initialTasks = templateTasks.map((t: any) => ({
        ...t,
        enabled: true,
        subtasks: t.subtasks.map((st: any) => ({ ...st, enabled: true }))
      }))
      setSelectedTasks(initialTasks)
    } else {
      setSelectedTasks([])
    }
  }

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, enabled: !t.enabled } : t
    ))
  }

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setSelectedTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map((st: any) => 
            st.id === subtaskId ? { ...st, enabled: !st.enabled } : st
          )
        }
      }
      return t
    }))
  }

  const updateTaskOffset = (taskId: string, days: number) => {
    setSelectedTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, dayOffset: days } : t
    ))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (template !== 'blank') {
      const formData = new FormData(e.currentTarget)
      const userIds = formData.getAll('userIds')
      if (userIds.length === 0) {
        e.preventDefault()
        alert('ກະລຸນາເລືອກພະນັກງານຢ່າງໜ້ອຍ 1 ຄົນ')
        return
      }
    }
  }

  return (
    <form action={createProjectAction} onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden input to pass customized tasks to server action */}
      <input type="hidden" name="customTasksData" value={JSON.stringify(selectedTasks)} />

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">ຊື່ໂປຣເຈັກ (Project Name)</label>
        <input
          type="text"
          name="name"
          required
          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
          placeholder="ເຊັ່ນ: ແຄມເປນປີໃໝ່, ໂປຣໂມຊັ່ນເດືອນ 10..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">ລາຍລະອຽດ (Description)</label>
        <textarea
          name="description"
          rows={3}
          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm resize-none"
          placeholder="ອະທິບາຍກ່ຽວກັບໂປຣເຈັກນີ້ (ທາງເລືອກ)..."
        ></textarea>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">ເລືອກແມ່ແບບ (Template)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'blank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="blank" checked={template === 'blank'} onChange={() => handleTemplateChange('blank')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">📄 ໂປຣເຈັກເປົ່າ (Blank)</div>
            <div className="text-xs text-gray-500">ສ້າງໂປຣເຈັກເປົ່າ ແລ້ວຄ່ອຍເພີ່ມວຽກເອງພາຍຫຼັງ</div>
          </label>

          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'new_page' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="new_page" checked={template === 'new_page'} onChange={() => handleTemplateChange('new_page')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">🚀 ເປີດເພຈໃໝ່ (New Page Setup)</div>
            <div className="text-xs text-gray-500">ສ້າງ 4 ໜ້າວຽກອັດຕະໂນມັດສຳລັບການເປີດເພຈໃໝ່</div>
          </label>

          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'page_setup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="page_setup" checked={template === 'page_setup'} onChange={() => handleTemplateChange('page_setup')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">🛠️ ປັບປຸງຄຸນນະພາບເພຈ (Page Setup)</div>
            <div className="text-xs text-gray-500">ສ້າງ 3 ໜ້າວຽກ: ອອກແບບ, ຕັ້ງຄ່າຂໍ້ມູນ, ໂພສເປີດຕົວ</div>
          </label>

          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'follower_growth' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="follower_growth" checked={template === 'follower_growth'} onChange={() => handleTemplateChange('follower_growth')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">📈 ເພີ່ມຜູ້ຕິດຕາມ (Follower Growth)</div>
            <div className="text-xs text-gray-500">ສ້າງ 3 ໜ້າວຽກ: ແຈກລາງວັນ, ແຊຣ໌ລົງກຸ່ມ, ຍິງແອດເພີ່ມໄລ້</div>
          </label>
          
          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'monthly_content' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="monthly_content" checked={template === 'monthly_content'} onChange={() => handleTemplateChange('monthly_content')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">🗓️ ວາງແຜນຄອນເທັນ (Monthly Plan)</div>
            <div className="text-xs text-gray-500">ສ້າງ 3 ໜ້າວຽກ: ຫາໄອເດຍ, ຜະລິດຊິ້ນງານ, ຕັ້ງເວລາໂພສ</div>
          </label>
          
          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'competitor_analysis' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="competitor_analysis" checked={template === 'competitor_analysis'} onChange={() => handleTemplateChange('competitor_analysis')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">🕵️ ວິເຄາະຄູ່ແຂ່ງ (Competitor Analysis)</div>
            <div className="text-xs text-gray-500">ສ້າງ 3 ໜ້າວຽກ: ຫາເພຈຄູ່ແຂ່ງ, ສ່ອງແອດ, ສະຫຼຸບຈຸດອ່ອນ</div>
          </label>

          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'ads' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="ads" checked={template === 'ads'} onChange={() => handleTemplateChange('ads')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">🎯 ຍິງໂຄສະນາ (Ads Campaign)</div>
            <div className="text-xs text-gray-500">ສ້າງ 3 ໜ້າວຽກ: ວິເຄາະເປົ້າໝາຍ, ເຮັດຮູບ, ປ່ອຍແອດ</div>
          </label>

          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'video' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="video" checked={template === 'video'} onChange={() => handleTemplateChange('video')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">🎬 ຜະລິດວິດີໂອ (Video Production)</div>
            <div className="text-xs text-gray-500">ສ້າງ 3 ໜ້າວຽກ: ຂຽນສະຄຣິບ, ຖ່າຍທຳ, ຕັດຕໍ່</div>
          </label>

          <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${template === 'live' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input type="radio" name="templateId" value="live" checked={template === 'live'} onChange={() => handleTemplateChange('live')} className="hidden" />
            <div className="font-bold text-gray-900 mb-1">🛍️ ໄລຟ໌ສົດ (Live Stream Sale)</div>
            <div className="text-xs text-gray-500">ສ້າງ 3 ໜ້າວຽກ: ກຽມສິນຄ້າ, ໄລຟ໌, ຈັດສົ່ງ</div>
          </label>
        </div>
      </div>

      {template !== 'blank' && (
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
          <h4 className="font-semibold text-blue-900 mb-2">ຕັ້ງຄ່າ ແລະ ປັບແຕ່ງໜ້າວຽກສຳລັບ Template ນີ້</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ມອບໃຫ້ (ເລືອກໄດ້ຫຼາຍຄົນ)</label>
              <div className="w-full max-h-32 overflow-y-auto bg-white border border-gray-200 rounded-lg p-2 space-y-1">
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded cursor-pointer transition-colors">
                    <input type="checkbox" name="userIds" value={u.id} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">{u.name}</span>
                  </label>
                ))}
                {users.length === 0 && <span className="text-xs text-gray-500 p-1">ບໍ່ມີພະນັກງານ</span>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ເພຈ/ຊ່ອງ (Platform)</label>
              <select name="platformId" required={template !== 'blank'} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                <option value="">-- ເລືອກເພຈ --</option>
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name} - {p.pageName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ວັນທີເລີ່ມຕົ້ນ (Start Date)</label>
              <input type="date" name="startDate" required={template !== 'blank'} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ເວລາລວມໂປຣເຈັກ (Project Duration)</label>
              <div className="flex items-center">
                <input type="number" name="projectDuration" min="1" placeholder="ຕົວຢ່າງ: 30" required={template !== 'blank'} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-l-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-600 whitespace-nowrap">ມື້ (Days)</span>
              </div>
            </div>
          </div>

          {/* Checklist Editor */}
          <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm mt-4">
            <h5 className="text-sm font-bold text-gray-800 mb-4">ເລືອກໜ້າວຽກທີ່ຈະສ້າງ (Checklist)</h5>
            <div className="space-y-4">
              {selectedTasks.map(task => (
                <div key={task.id} className={`p-4 rounded-lg border transition-all ${task.enabled ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={task.enabled}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                    />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{task.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-blue-700 font-medium bg-blue-100/50 w-max px-2 py-1.5 rounded-lg border border-blue-200">
                        <span>👉 ກຳນົດສົ່ງພາຍໃນ</span>
                        <input 
                          type="number" 
                          min="0"
                          value={task.dayOffset}
                          onChange={(e) => updateTaskOffset(task.id, parseInt(e.target.value) || 0)}
                          onClick={(e) => e.stopPropagation()} 
                          className="w-14 px-1 py-0.5 text-center border border-blue-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span>ມື້ ນັບຈາກມື້ເລີ່ມຕົ້ນ</span>
                      </div>
                    </div>
                  </label>

                  {task.enabled && task.subtasks?.length > 0 && (
                    <div className="mt-3 ml-7 space-y-2 border-l-2 border-blue-100 pl-3 py-1">
                      {task.subtasks.map((st: any) => (
                        <label key={st.id} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={st.enabled}
                            onChange={() => toggleSubtask(task.id, st.id)}
                            className="w-3.5 h-3.5 text-blue-500 rounded border-gray-300 focus:ring-blue-500" 
                          />
                          <span className={`text-xs transition-colors ${st.enabled ? 'text-gray-700 group-hover:text-blue-700' : 'text-gray-400 line-through'}`}>{st.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedTasks.length === 0 && (
              <p className="text-xs text-gray-500 italic text-center py-4">ກະລຸນາເລືອກ Template ດ້ານເທິງເພື່ອເບິ່ງໜ້າວຽກ</p>
            )}
          </div>
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all shadow-lg shadow-blue-600/20"
        >
          ບັນທຶກໂປຣເຈັກໃໝ່
        </button>
      </div>
    </form>
  )
}
