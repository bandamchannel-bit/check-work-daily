import Sidebar from '@/components/Sidebar'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (!session || (session.userRole !== 'USER' && session.userRole !== 'ADMIN')) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const isAdminPreview = session.userRole === 'ADMIN'

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar role={session.userRole} userEmail={user?.email} userName={user?.name} />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
        {/* Admin Preview Floating/Top Banner */}
        {isAdminPreview && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm sticky top-14 md:top-0 z-30">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>ທ່ານກຳລັງຢູ່ໃນ <strong>ມຸມມອງພະນັກງານ (Employee Preview)</strong> ສຳລັບການທົດສອບ & ກວດວຽກ</span>
            </div>
            <a 
              href="/admin" 
              className="bg-white/20 hover:bg-white text-white hover:text-amber-700 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
            >
              🔄 ກັບໄປໜ້າ Admin
            </a>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 py-14 md:py-6 px-3 sm:px-5 md:px-6 w-full max-w-7xl mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
