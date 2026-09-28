'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth'
import { sendLineNotify } from '@/lib/line-notify'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

/** Helper to save uploaded files to public/uploads */
async function processUploadedFiles(files: File[]) {
  const savedAttachments: { fileName: string; fileUrl: string }[] = []
  if (!files || files.length === 0) return savedAttachments

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadsDir, { recursive: true })

  for (const file of files) {
    if (file && typeof file === 'object' && file.size > 0 && file.name) {
      try {
        const ext = path.extname(file.name)
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_\-\u0E80-\u0EFF]/g, '_')
        const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${baseName}${ext}`
        const filePath = path.join(uploadsDir, uniqueName)
        const buffer = Buffer.from(await file.arrayBuffer())
        await fs.writeFile(filePath, buffer)
        savedAttachments.push({
          fileName: file.name,
          fileUrl: `/uploads/${uniqueName}`
        })
      } catch (err) {
        console.error('Error saving file:', file.name, err)
      }
    }
  }
  return savedAttachments
}

export async function createTask(formData: FormData) {
  const session = await getSession()
  if (!session || !session.userId || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const platformId = formData.get('platformId') as string
  const projectId = (formData.get('projectId') as string) || null
  const dateStr = formData.get('date') as string
  const timeStr = formData.get('time') as string

  // Support multiple employee selection (userIds) or single fallback (userId)
  const userIds = formData.getAll('userIds') as string[]
  const singleUserId = formData.get('userId') as string
  const targetUserIds = userIds.length > 0 ? userIds : (singleUserId ? [singleUserId] : [])

  if (!title || targetUserIds.length === 0 || !platformId || !dateStr || !timeStr) {
    return { error: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ ແລະ ເລືອກພະນັກງານຢ່າງໜ້ອຍ 1 ຄົນ' }
  }
  
  const dueDate = new Date(`${dateStr}T${timeStr}`)

  // Process any uploaded work files
  const files = formData.getAll('files') as File[]
  const savedAttachments = await processUploadedFiles(files)

  // Create task for EACH selected employee
  for (const userId of targetUserIds) {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        userId,
        platformId,
        projectId,
        dueDate
      },
      include: {
        user: true,
        platform: true
      }
    })

    // Attach uploaded files to this task
    for (const att of savedAttachments) {
      await prisma.attachment.create({
        data: {
          taskId: newTask.id,
          userId: session.userId,
          fileName: att.fileName,
          fileUrl: att.fileUrl
        }
      })
    }

    // Send Line Notify
    await sendLineNotify(
      `🔔 ມີໜ້າວຽກໃໝ່ຖືກມອບໝາຍ!\n\n` +
      `📌 ຫົວຂໍ້: ${newTask.title}\n` +
      `👤 ຮັບຜິດຊອບໂດຍ: ${newTask.user.name}\n` +
      `📄 ເພຈ: ${newTask.platform.name}\n` +
      `⏰ ກຳນົດສົງ: ${dateStr} ເວລາ ${timeStr}` +
      (savedAttachments.length > 0 ? `\n📎 ໄຟລ໌ແນບ: ${savedAttachments.length} ໄຟລ໌` : '')
    )

    // In-App Notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'ວຽກໃໝ່ຖືກມອບໝາຍ',
        message: `ວຽກ "${newTask.title}" ສຳລັບເພຈ ${newTask.platform.name}`,
        link: '/employee'
      }
    })
  }

  revalidatePath('/admin/tasks')
  revalidatePath('/employee')
  redirect('/admin/tasks')
}

export async function createAutoTask(formData: FormData) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const platformId = formData.get('platformId') as string
  const timeOfDay = formData.get('timeOfDay') as string
  const daysOfWeek = formData.getAll('daysOfWeek') as string[]

  // Support multiple employee selection (userIds) or single fallback (userId)
  const userIds = formData.getAll('userIds') as string[]
  const singleUserId = formData.get('userId') as string
  const targetUserIds = userIds.length > 0 ? userIds : (singleUserId ? [singleUserId] : [])

  if (!title || targetUserIds.length === 0 || !platformId || !timeOfDay || daysOfWeek.length === 0) {
    return { error: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ ແລະ ເລືອກພະນັກງານຢ່າງໜ້ອຍ 1 ຄົນ' }
  }

  for (const userId of targetUserIds) {
    await prisma.dailyTaskConfig.create({
      data: {
        title,
        userId,
        platformId,
        timeOfDay,
        daysOfWeek: daysOfWeek.join(',')
      }
    })
  }

  revalidatePath('/admin/auto-tasks')
  redirect('/admin/auto-tasks')
}

export async function updateTaskStatus(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const proofUrl = (formData.get('proofUrl') as string) || null
  const proofFile = formData.get('proofFile') as File | null

  if (!taskId) {
    return { error: 'Task ID required' }
  }

  let savedProofImageUrl: string | null = null

  if (proofFile && typeof proofFile === 'object' && proofFile.size > 0 && proofFile.name) {
    const saved = await processUploadedFiles([proofFile])
    if (saved.length > 0) {
      savedProofImageUrl = saved[0].fileUrl
      // Also add as an attachment for permanent record
      const session = await getSession()
      if (session?.userId) {
        await prisma.attachment.create({
          data: {
            taskId,
            userId: session.userId,
            fileName: saved[0].fileName,
            fileUrl: saved[0].fileUrl
          }
        })
      }
    }
  }

  if (!proofUrl && !savedProofImageUrl) {
    return { error: 'ກະລຸນາໃສ່ Link ໂພສ ຫຼື ອັບໂຫຼດໄຟລ໌/ຮູບພາບຫຼັກຖານ' }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'DONE',
      proofUrl: proofUrl || null,
      proofImage: savedProofImageUrl || undefined,
      completedAt: new Date()
    },
    include: {
      user: true,
      platform: true
    }
  })

  // Send Line Notify
  await sendLineNotify(
    `✅ ວຽກສຳເລັດແລ້ວ!\n\n` +
    `📌 ຫົວຂໍ້: ${updatedTask.title}\n` +
    `👤 ຜູ້ສຳເລັດ: ${updatedTask.user.name}\n` +
    `📄 ເພຈ: ${updatedTask.platform.name}\n` +
    `🔗 ຫຼັກຖານ: ${proofUrl ? proofUrl : 'ອັບໂຫຼດເປັນໄຟລ໌'}`
  )

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
  redirect('/employee')
}

/** Complete a task with proof — supports URL link, image (base64 or url), or both */
export async function completeTask(taskId: string, proofUrl: string | null, proofImage: string | null) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  if (!taskId) throw new Error('Task ID required')
  if (!proofUrl && !proofImage) throw new Error('ກະລຸນາໃສ່ Link ໂພສ ຫຼື ອັບໂຫຼດຮູບຫຼັກຖານ')

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'DONE',
      proofUrl: proofUrl || null,
      proofImage: proofImage || null,
      completedAt: new Date()
    },
    include: {
      user: true,
      platform: true
    }
  })

  // Send Line Notify
  await sendLineNotify(
    `✅ ວຽກສຳເລັດແລ້ວ!\n\n` +
    `📌 ຫົວຂໍ້: ${updatedTask.title}\n` +
    `👤 ຜູ້ສຳເລັດ: ${updatedTask.user.name}\n` +
    `📄 ເພຈ: ${updatedTask.platform.name}\n` +
    `🔗 ຫຼັກຖານ: ${proofUrl ? proofUrl : 'ອັບໂຫຼດເປັນຮູບພາບ'}`
  )

  // In-App Notification for Admins
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
  await Promise.all(admins.map(admin => 
    prisma.notification.create({
      data: {
        userId: admin.id,
        title: 'ວຽກສຳເລັດແລ້ວ!',
        message: `${updatedTask.user.name} ໄດ້ສົ່ງວຽກ "${updatedTask.title}" ແລ້ວ`,
        link: '/admin/tasks'
      }
    })
  ))

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
}

export async function deleteTask(id: string) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.task.delete({
    where: { id }
  })

  revalidatePath('/admin/tasks')
}

export async function changeTaskStatus(id: string, status: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw new Error('Task not found')
  if (session.userRole !== 'ADMIN' && task.userId !== session.userId) throw new Error('Unauthorized')

  await prisma.task.update({
    where: { id },
    data: {
      status,
      completedAt: status === 'DONE' ? new Date() : null
    }
  })

  revalidatePath('/employee')
  revalidatePath('/admin/tasks')
}

export async function updateTask(formData: FormData) {
  const session = await getSession()
  if (!session || !session.userId || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const userId = formData.get('userId') as string
  const platformId = formData.get('platformId') as string
  const dateStr = formData.get('date') as string
  const timeStr = formData.get('time') as string

  if (!id || !title || !userId || !platformId || !dateStr || !timeStr) {
    return { error: 'Please fill all fields' }
  }

  const dueDate = new Date(`${dateStr}T${timeStr}`)

  await prisma.task.update({
    where: { id },
    data: {
      title,
      userId,
      platformId,
      dueDate
    }
  })

  // Handle newly uploaded files during task edit
  const files = formData.getAll('files') as File[]
  if (files && files.length > 0) {
    const saved = await processUploadedFiles(files)
    for (const att of saved) {
      await prisma.attachment.create({
        data: {
          taskId: id,
          userId: session.userId,
          fileName: att.fileName,
          fileUrl: att.fileUrl
        }
      })
    }
  }

  revalidatePath('/admin/tasks')
  return { success: true }
}