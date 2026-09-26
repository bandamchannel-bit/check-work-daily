'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcrypt'
import { getSession } from './auth'

export async function createUser(formData: FormData) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  if (!name || !email || !password || !role) {
    return { error: 'Please fill all fields' }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: 'Email already exists' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role
    }
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUser(formData: FormData) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  if (!id || !name || !email || !role) {
    return { error: 'Please fill all required fields' }
  }

  const updateData: any = { name, email, role }
  if (password) {
    updateData.password = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  if (session.userId === id) {
    return { error: 'Cannot delete yourself' }
  }

  await prisma.user.delete({
    where: { id }
  })

  revalidatePath('/admin/users')
  return { success: true }
}
