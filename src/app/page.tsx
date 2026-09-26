import { login } from '@/app/actions/auth'

export default function Home() {
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
        
        <form action={async (formData: FormData) => {
          'use server'
          await login(formData)
        }} className="mt-8 space-y-6">
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
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
                defaultValue="password123"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all shadow-lg shadow-blue-600/20"
            >
              ເຂົ້າສູ່ລະບົບ (Login)
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
