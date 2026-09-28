'use client'

import { useState } from 'react'
import { deleteProject } from '@/app/actions/projects'

export default function DeleteProjectButton({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (confirm(`ທ່ານຕ້ອງການລຶບໂປຣເຈັກ "${projectName}" ແທ້ບໍ່?\n\nໝາຍເຫດ: ວຽກທັງໝົດໃນໂປຣເຈັກນີ້ຈະຖືກລຶບໄປພ້ອມ!`)) {
      setIsDeleting(true)
      try {
        await deleteProject(projectId)
      } catch (err) {
        alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບໂປຣເຈັກ')
        setIsDeleting(false)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50 border border-red-100 shadow-sm"
      title="ລຶບໂປຣເຈັກ"
    >
      {isDeleting ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  )
}
