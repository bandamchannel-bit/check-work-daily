'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const templateId = formData.get('templateId') as string
  const userIds = formData.getAll('userIds') as string[]
  const platformId = formData.get('platformId') as string
  const startDateStr = formData.get('startDate') as string
  const projectDurationStr = formData.get('projectDuration') as string

  if (!name) {
    return { error: 'Please enter a project name' }
  }

  // Calculate project due date if duration is provided
  let projectDueDate: Date | undefined = undefined;
  if (startDateStr && projectDurationStr) {
    projectDueDate = new Date(startDateStr);
    projectDueDate.setDate(projectDueDate.getDate() + parseInt(projectDurationStr));
  }

  // Create the project first
  const project = await prisma.project.create({
    data: {
      name,
      description,
      dueDate: projectDueDate
    }
  })

  const customTasksData = formData.get('customTasksData') as string

  // If a template is selected, generate tasks from customTasksData
  if (templateId && templateId !== 'blank' && userIds.length > 0 && platformId && startDateStr && customTasksData) {
    const startDate = new Date(startDateStr)
    const parsedTasks = JSON.parse(customTasksData)

    for (const userId of userIds) {
      for (const t of parsedTasks) {
        if (!t.enabled) continue // Skip disabled tasks

        const dueDate = new Date(startDate)
        dueDate.setDate(dueDate.getDate() + t.dayOffset)
        
        // Filter enabled subtasks
        const enabledSubtasks = t.subtasks?.filter((st: any) => st.enabled) || []
        const subTasksData = enabledSubtasks.map((st: any) => ({ title: st.title }))

        await prisma.task.create({
          data: {
            title: t.title,
            description: t.description,
            status: 'TODO',
            dueDate: dueDate,
            userId: userId,
            platformId,
            projectId: project.id,
            subTasks: {
              create: subTasksData
            }
          }
        })
      }
    }
  }

  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  // First, delete all tasks inside this project (Cascade will handle comments, subtasks, etc)
  await prisma.task.deleteMany({
    where: { projectId: id }
  })

  // Then delete the project itself
  await prisma.project.delete({
    where: { id }
  })
  
  revalidatePath('/admin/projects')
}
