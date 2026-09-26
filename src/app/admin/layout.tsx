import Sidebar from '@/components/Sidebar'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (!session || session.userRole !== 'ADMIN') {
    redirect('/')
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar role={session.userRole} userEmail={user?.email} userName={user?.name} />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
        {/* Main Content */}
        <main className="flex-1 py-14 md:py-6 px-3 sm:px-5 md:px-6 w-full max-w-[1680px] mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
