import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  // Check an authorization header in a real app
  // const authHeader = request.headers.get('authorization')
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

  const configs = await prisma.dailyTaskConfig.findMany({
    where: { isActive: true }
  })

  let createdCount = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  for (const config of configs) {
    // Check if task is scheduled for today's day of the week
    const currentDayOfWeek = new Date().getDay().toString()
    const activeDays = (config.daysOfWeek || "").split(',')
    if (!activeDays.includes(currentDayOfWeek)) {
      continue
    }

    // Check if task already exists for today
    const existingTask = await prisma.task.findFirst({
      where: {
        userId: config.userId,
        platformId: config.platformId,
        title: config.title,
        dueDate: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (!existingTask) {
      // Parse timeOfDay (e.g., "10:00")
      const [hours, minutes] = config.timeOfDay.split(':').map(Number)
      const dueDate = new Date(today)
      dueDate.setHours(hours, minutes, 0, 0)

      await prisma.task.create({
        data: {
          title: config.title,
          userId: config.userId,
          platformId: config.platformId,
          dueDate: dueDate,
        }
      })
      createdCount++
    }
  }

  return NextResponse.json({ success: true, createdCount })
}
