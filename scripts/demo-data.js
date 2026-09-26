const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addDemoData() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@company.com' } })
  const emp = await prisma.user.findUnique({ where: { email: 'emp@company.com' } })
  const fb = await prisma.platform.findFirst({ where: { name: 'Facebook' } })
  const tiktok = await prisma.platform.findFirst({ where: { name: 'TikTok' } })

  const now = new Date()
  
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  
  const tomorrow = new Date()
  tomorrow.setDate(now.getDate() + 1)

  // Clear existing tasks to avoid duplicates on multiple runs
  await prisma.task.deleteMany({})

  await prisma.task.createMany({
    data: [
      {
        title: 'ລົງໂພສຂາຍເຄື່ອງຕອນເຊົ້າ',
        userId: emp.id,
        platformId: fb.id,
        dueDate: new Date(now.setHours(9, 0, 0, 0)),
        status: 'DONE',
        proofUrl: 'https://facebook.com/post/1234',
        completedAt: new Date(now.setHours(8, 45, 0, 0))
      },
      {
        title: 'ລົງຄລິບເຕັ້ນ TikTok ສິນຄ້າໃໝ່',
        userId: emp.id,
        platformId: tiktok.id,
        dueDate: new Date(now.setHours(12, 0, 0, 0)),
        status: 'DONE',
        proofUrl: 'https://tiktok.com/@company/video/5678',
        completedAt: new Date(now.setHours(11, 30, 0, 0))
      },
      {
        title: 'ໂພສໃຫ້ຄວາມຮູ້ກ່ຽວກັບສິນຄ້າ',
        userId: emp.id,
        platformId: fb.id,
        dueDate: new Date(now.setHours(17, 0, 0, 0)),
        status: 'PENDING',
      },
      {
        title: 'ໂພສໂປຣໂມຊັ່ນທ້າຍອາທິດ (ຊ້າແລ້ວ)',
        userId: emp.id,
        platformId: fb.id,
        dueDate: new Date(yesterday.setHours(15, 0, 0, 0)),
        status: 'LATE',
      },
      {
        title: 'ລົງຄລິບຣີວິວຈາກລູກຄ້າ',
        userId: emp.id,
        platformId: tiktok.id,
        dueDate: new Date(tomorrow.setHours(10, 0, 0, 0)),
        status: 'PENDING',
      }
    ]
  })

  // Add auto-task configs
  await prisma.dailyTaskConfig.deleteMany({})
  await prisma.dailyTaskConfig.createMany({
    data: [
      {
        title: 'ໂພສສະບາຍດີຕອນເຊົ້າ',
        userId: emp.id,
        platformId: fb.id,
        timeOfDay: '08:00',
        isActive: true
      },
      {
        title: 'ອັບເດດສະຕໍຣີ (Story)',
        userId: emp.id,
        platformId: tiktok.id,
        timeOfDay: '12:30',
        isActive: true
      }
    ]
  })

  console.log("Demo data added successfully!")
}

addDemoData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
