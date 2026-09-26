'use client'
import { login } from '@/app/actions/auth'
import { useState } from 'react'

export default function Home() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const res = await login(formData)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-xl z-10 mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
            <span className="text-white font-bold text-3xl">W</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ເຂົ້າສູ່ລະບົບ</h1>
          <p className="mt-2 text-sm text-gray-500">ລະບົບຕິດຕາມວຽກ WorkTracker</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ອີເມວ (Email)</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
                defaultValue="admin@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ລະຫັດຜ່ານ (Password)</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm pr-12"
                  defaultValue="password123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ (Login)'}
            </button>
          </div>
        </form>

        <div className="text-xs text-gray-500 mt-6 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
          <p className="font-semibold text-gray-700 mb-2">ບັນຊີທົດລອງ (Demo Accounts):</p>
          <div className="space-y-1">
            <p className="flex justify-between"><span>Admin:</span> <span className="font-mono text-blue-600">admin@company.com</span></p>
            <p className="flex justify-between"><span>Employee:</span> <span className="font-mono text-blue-600">emp@company.com</span></p>
            <p className="flex justify-between pt-2 border-t border-gray-200 mt-2"><span>ລະຫັດຜ່ານທັງໝົດ:</span> <span className="font-mono text-gray-900">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
