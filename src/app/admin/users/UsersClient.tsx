'use client'

import { useState } from 'react'
import { createUser, updateUser, deleteUser } from '@/app/actions/users'

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { tasks: number }
}

export default function UsersClient({ initialUsers, currentUserId }: { initialUsers: User[], currentUserId: string }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({ name: user.name, email: user.email, password: '', role: user.role })
    } else {
      setEditingUser(null)
      setFormData({ name: '', email: '', password: '', role: 'USER' })
    }
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const data = new FormData()
    data.append('name', formData.name)
    data.append('email', formData.email)
    data.append('role', formData.role)
    if (formData.password) {
      data.append('password', formData.password)
    }

    try {
      let res;
      if (editingUser) {
        data.append('id', editingUser.id)
        res = await updateUser(data)
      } else {
        if (!formData.password) {
          setError('ກະລຸນາໃສ່ລະຫັດຜ່ານ')
          setIsLoading(false)
          return
        }
        res = await createUser(data)
      }

      if (res?.error) {
        setError(res.error)
      } else {
        closeModal()
        window.location.reload()
      }
    } catch (err) {
      setError('ເກີດຂໍ້ຜິດພາດ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUserId) {
      alert('ທ່ານບໍ່ສາມາດລຶບຕົວເອງໄດ້')
      return
    }
    if (confirm(`ທ່ານຕ້ອງການລຶບພະນັກງານ ${name} ແທ້ບໍ່?`)) {
      try {
        const res = await deleteUser(id)
        if (res?.error) {
          alert(res.error)
        } else {
          setUsers(users.filter(u => u.id !== id))
        }
      } catch (err) {
        alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບ')
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ພະນັກງານ (Users)</h1>
            <p className="mt-1 text-sm text-gray-500">ຈັດການລາຍຊື່ພະນັກງານທີ່ສາມາດເຂົ້າໃຊ້ງານລະບົບໄດ້</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          + ເພີ່ມພະນັກງານໃໝ່
        </button>
      </div>
      
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="ຄົ້ນຫາພະນັກງານ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <span className="text-sm text-gray-500 font-medium">ລວມທັງໝົດ {filteredUsers.length} ຄົນ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ຊື່ພະນັກງານ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ອີເມວ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ບົດບາດ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ວຽກທີ່ຮັບຜິດຊອບ</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">ບໍ່ພົບຂໍ້ມູນພະນັກງານ</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-700 font-bold shadow-inner">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">ເຂົ້າຮ່ວມ: {new Date(user.createdAt).toLocaleDateString('lo-LA')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {user._count?.tasks || 0} ໜ້າວຽກ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ແກ້ໄຂ">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(user.id, user.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ລຶບ">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? 'ແກ້ໄຂພະນັກງານ' : 'ເພີ່ມພະນັກງານໃໝ່'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ຊື່ ແລະ ນາມສະກຸນ</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ອີເມວ</label>
                <input 
                  type="email" required
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ລະຫັດຜ່ານ {editingUser && <span className="text-gray-400 font-normal">(ປະຫວ່າງໄວ້ຖ້າບໍ່ຕ້ອງການປ່ຽນ)</span>}
                </label>
                <input 
                  type="password" required={!editingUser}
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ບົດບາດ (Role)</label>
                <select 
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="USER">ພະນັກງານທົ່ວໄປ (USER)</option>
                  <option value="ADMIN">ຜູ້ບໍລິຫານ (ADMIN)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  ຍົກເລີກ
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {isLoading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
