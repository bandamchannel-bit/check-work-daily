import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendLineNotify } from '@/lib/line-notify'

// This endpoint should be called once a day (e.g. 08:00 AM) using cron-job.org or similar
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    // Optional: secure this endpoint if needed, but since it only reads data and sends notifications, it's fairly safe.
    
    const now = new Date()

    // Find all tasks that are not done
    const unfinishedTasks = await prisma.task.findMany({
      where: {
        status: { notIn: ['DONE'] }
      },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        platform: { select: { id: true, name: true, pageName: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    if (unfinishedTasks.length === 0) {
      return NextResponse.json({ success: true, message: 'No unfinished tasks to remind about' })
    }

    // Group tasks by Project, then by User
    const projects: Record<string, { projectName: string, users: Record<string, typeof unfinishedTasks> }> = {};
    const noProjectTasks: typeof unfinishedTasks = [];

    for (const t of unfinishedTasks) {
      if (t.project) {
        if (!projects[t.project.id]) {
          projects[t.project.id] = { projectName: t.project.name, users: {} };
        }
        if (!projects[t.project.id].users[t.user.name]) {
          projects[t.project.id].users[t.user.name] = [];
        }
        projects[t.project.id].users[t.user.name].push(t);
      } else {
        noProjectTasks.push(t);
      }
    }

    let message = '📋 **ແຈ້ງເຕືອນອັບເດດວຽກປະຈຳວັນ** 📋\n(ກະລຸນາເຂົ້າລະບົບເພື່ອອັບເດດສະຖານະວຽກ)\n';
    
    const isLate = (dueDate: Date) => dueDate.getTime() < now.getTime()

    // 1. Project-based tasks
    for (const [projectId, projectData] of Object.entries(projects)) {
      message += `\n📁 ໂປຣເຈັກ: ${projectData.projectName}\n`;
      for (const [userName, tasks] of Object.entries(projectData.users)) {
        message += `  👤 ${userName}:\n`;
        tasks.forEach(t => {
          const lateFlag = isLate(t.dueDate) ? '🔴(ຊ້າ)' : '🟡';
          message += `    - ${lateFlag} ${t.title} [${t.platform.name}]\n`;
        });
      }
    }

    // 2. Individual Tasks (No Project)
    if (noProjectTasks.length > 0) {
      message += `\n📌 ວຽກທົ່ວໄປ:\n`;
      // Group by user
      const users: Record<string, typeof unfinishedTasks> = {};
      for (const t of noProjectTasks) {
        if (!users[t.user.name]) users[t.user.name] = [];
        users[t.user.name].push(t);
      }
      for (const [userName, tasks] of Object.entries(users)) {
        message += `  👤 ${userName}:\n`;
        tasks.forEach(t => {
          const lateFlag = isLate(t.dueDate) ? '🔴(ຊ້າ)' : '🟡';
          message += `    - ${lateFlag} ${t.title} [${t.platform.name}]\n`;
        });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://check-work-daily.onrender.com'
    message += `\n👉 ກົດເຂົ້າໄປອັບເດດໄດ້ທີ່:\n${appUrl}/employee`;

    // Send Line message
    await sendLineNotify(message);

    return NextResponse.json({ 
      success: true, 
      sent: true,
      remindedTasksCount: unfinishedTasks.length
    })

  } catch (error: any) {
    console.error('Cron Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
