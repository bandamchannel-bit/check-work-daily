'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth'
import { sendLineNotify } from '@/lib/line-notify'

export async function createTask(formData: FormData) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const userId = formData.get('userId') as string
  const platformId = formData.get('platformId') as string
  const dateStr = formData.get('date') as string
  const timeStr = formData.get('time') as string

  if (!title || !userId || !platformId || !dateStr || !timeStr) {
    return { error: 'Please fill all fields' }
  }
  
  const dueDate = new Date(`${dateStr}T${timeStr}`)

  const newTask = await prisma.task.create({
    data: {
      title,
      userId,
      platformId,
      dueDate
    },
    include: {
      user: true,
      platform: true
    }
  })

  // Send Line Notify
  await sendLineNotify(
    `🔔 ມີໜ້າວຽກໃໝ່ຖືກມອບໝາຍ!\n\n` +
    `📌 ຫົວຂໍ້: ${newTask.title}\n` +
    `👤 ຮັບຜິດຊອບໂດຍ: ${newTask.user.name}\n` +
    `📄 ເພຈ: ${newTask.platform.name}\n` +
    `⏰ ກຳນົດສົງ: ${dateStr} ເວລາ ${timeStr}`
  )

  // In-App Notification
  await prisma.notification.create({
    data: {
      userId,
      title: 'ວຽກໃໝ່ຖືກມອບໝາຍ',
      message: `ວຽກ "${newTask.title}" ສຳລັບເພຈ ${newTask.platform.name}`,
      link: '/employee' // Link for employee to view their tasks
    }
  })

  redirect('/admin/tasks')
}

export async function createAutoTask(formData: FormData) {
  const session = await getSession()
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const userId = formData.get('userId') as string
  const platformId = formData.get('platformId') as string
  const timeOfDay = formData.get('timeOfDay') as string
  const daysOfWeek = formData.getAll('daysOfWeek') as string[]

  if (!title || !userId || !platformId || !timeOfDay || daysOfWeek.length === 0) {
    return { error: 'Please fill all fields and select at least one day' }
  }

  await prisma.dailyTaskConfig.create({
    data: {
      title,
      userId,
      platformId,
      timeOfDay,
      daysOfWeek: daysOfWeek.join(',')
    }
  })

  redirect('/admin/auto-tasks')
}

export async function updateTaskStatus(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const proofUrl = formData.get('proofUrl') as string

  if (!taskId || !proofUrl) {
    return { error: 'Please provide the post URL' }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'DONE',
      proofUrl: proofUrl,
      completedAt: new Date()
    }
  })

  redirect('/employee')
}

/** Complete a task with proof — supports URL link, image (base64), or both */
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
}

export async function changeTaskStatus(id: string, status: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // Ideally we should check if the task belongs to the user if they are not admin
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
  if (!session || session.userRole !== 'ADMIN') throw new Error('Unauthorized')

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

  revalidatePath('/admin/tasks')
  return { success: true }
}