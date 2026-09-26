'use server'

import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createSession, deleteSession, verifySession } from '@/lib/session'
import bcrypt from 'bcrypt'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please provide email and password' }
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.password) {
    return { error: 'Invalid email or password' }
  }

  const isValidPassword = await bcrypt.compare(password, user.password)
  
  if (!isValidPassword) {
    return { error: 'Invalid email or password' }
  }

  await createSession(user.id, user.role)

  if (user.role === 'ADMIN') {
    redirect('/admin')
  } else {
    redirect('/employee')
  }
}

export async function logout() {
  await deleteSession()
  redirect('/')
}

export async function getSession() {
  const session = await verifySession()
  if (!session.isAuth) return null
  return { userId: session.userId, userRole: session.userRole }
}
