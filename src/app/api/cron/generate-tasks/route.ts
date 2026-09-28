import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const configs = await prisma.dailyTaskConfig.findMany({
    where: { isActive: true }
  })

  let createdCount = 0

  // Get current date in Laos timezone (UTC+7)
  const laosDateString = new Date().toLocaleString("en-US", { timeZone: "Asia/Vientiane" })
  const laosDate = new Date(laosDateString)
  
  const year = laosDate.getFullYear()
  const month = String(laosDate.getMonth() + 1).padStart(2, '0')
  const day = String(laosDate.getDate()).padStart(2, '0')

  // Midnight in Laos for today and tomorrow (in UTC)
  const todayLaosMidnight = new Date(`${year}-${month}-${day}T00:00:00+07:00`)
  const tomorrowLaosMidnight = new Date(todayLaosMidnight)
  tomorrowLaosMidnight.setDate(tomorrowLaosMidnight.getDate() + 1)

  for (const config of configs) {
    // Check if task is scheduled for today's day of the week in Laos
    const laosDayOfWeek = laosDate.getDay().toString()
    const activeDays = (config.daysOfWeek || "").split(',')
    if (!activeDays.includes(laosDayOfWeek)) {
      continue
    }

    // Check if task already exists for today (in Laos time boundaries)
    const existingTask = await prisma.task.findFirst({
      where: {
        userId: config.userId,
        platformId: config.platformId,
        title: config.title,
        dueDate: {
          gte: todayLaosMidnight,
          lt: tomorrowLaosMidnight
        }
      }
    })

    if (!existingTask) {
      // Create due date precisely in Laos timezone
      // config.timeOfDay is like "18:58"
      const isoString = `${year}-${month}-${day}T${config.timeOfDay}:00+07:00`
      const dueDate = new Date(isoString)

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

  return NextResponse.json({ success: true, createdCount, laosTime: laosDateString })
}
