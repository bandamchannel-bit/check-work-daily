import prisma from '@/lib/prisma'
import UsersClient from './UsersClient'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') redirect('/')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { tasks: true }
      }
    }
  })

  // Serialize dates
  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString()
  }))

  return <UsersClient initialUsers={serializedUsers} currentUserId={session.userId} />
}
