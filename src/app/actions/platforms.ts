'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

async function saveFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null
  
  // To avoid ephemeral disk issues on Render, we convert the image directly to base64
  // and store it as a data URL string in the database.
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const mimeType = file.type || 'image/png'
  const base64String = buffer.toString('base64')
  
  return `data:${mimeType};base64,${base64String}`
}

import { getSession } from './auth'

export async function createPlatform(formData: FormData) {
  const session = await getSession()
  const url = formData.get('url') as string
  const pageName = formData.get('pageName') as string
  const logoFile = formData.get('logoImage') as File | null
  
  let logoUrl = formData.get('logoUrl') as string

  if (!url || !pageName) {
    return { error: 'Please fill all fields' }
  }

  // Handle file upload if present (overrides logoUrl text)
  if (logoFile && logoFile.size > 0) {
    const uploadedPath = await saveFile(logoFile)
    if (uploadedPath) {
      logoUrl = uploadedPath
    }
  }

  // Auto-detect platform name from URL
  let name = 'Other'
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) name = 'Facebook'
  else if (lowerUrl.includes('tiktok.com')) name = 'TikTok'
  else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) name = 'YouTube'
  else if (lowerUrl.includes('instagram.com')) name = 'Instagram'

  await prisma.platform.create({
    data: {
      name,
      pageName,
      url,
      logoUrl: logoUrl || null,
      userId: session?.userRole === 'ADMIN' ? null : session?.userId // Admin = global, Employee = private
    }
  })

  redirect(session?.userRole === 'ADMIN' ? '/admin/platforms' : '/employee/platforms')
}

export async function updatePlatform(id: string, formData: FormData) {
  const session = await getSession()
  const url = formData.get('url') as string
  const pageName = formData.get('pageName') as string
  const logoFile = formData.get('logoImage') as File | null
  
  let logoUrl = formData.get('logoUrl') as string

  if (!url || !pageName) {
    return { error: 'Please fill all fields' }
  }
  
  // Handle file upload if present
  if (logoFile && logoFile.size > 0) {
    const uploadedPath = await saveFile(logoFile)
    if (uploadedPath) {
      logoUrl = uploadedPath
    }
  }

  // Auto-detect platform name from URL
  let name = 'Other'
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) name = 'Facebook'
  else if (lowerUrl.includes('tiktok.com')) name = 'TikTok'
  else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) name = 'YouTube'
  else if (lowerUrl.includes('instagram.com')) name = 'Instagram'

  await prisma.platform.update({
    where: { id },
    data: {
      name,
      pageName,
      url,
      ...(logoUrl ? { logoUrl } : {}) // Only update logoUrl if a new one is provided or file uploaded
    }
  })

  redirect(session?.userRole === 'ADMIN' ? '/admin/platforms' : '/employee/platforms')
}

export async function deletePlatform(id: string) {
  const session = await getSession()
  // First delete any tasks associated with this platform to prevent foreign key errors
  await prisma.task.deleteMany({
    where: { platformId: id }
  })
  
  // Also delete auto task configs
  await prisma.dailyTaskConfig.deleteMany({
    where: { platformId: id }
  })

  await prisma.platform.delete({
    where: { id }
  })

  redirect(session?.userRole === 'ADMIN' ? '/admin/platforms' : '/employee/platforms')
}
