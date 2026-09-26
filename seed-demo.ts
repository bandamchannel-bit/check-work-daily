import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  // 1. Ensure we have at least one employee
  let employee = await prisma.user.findFirst({ where: { role: 'USER' } })
  if (!employee) {
    employee = await prisma.user.create({
      data: {
        name: 'ນາງ ພອນສະຫວັນ',
        email: 'employee1@demo.com',
        password: 'password123', // In a real app this would be hashed
        role: 'USER'
      }
    })
    console.log('Created demo employee')
  }

  // 2. Ensure we have platforms
  let fb = await prisma.platform.findFirst({ where: { name: 'Facebook' } })
  if (!fb) {
    fb = await prisma.platform.create({
      data: { name: 'Facebook', pageName: 'ຮ້ານຂາຍເຄື່ອງ Demo', url: 'https://facebook.com/demo' }
    })
  }

  let tt = await prisma.platform.findFirst({ where: { name: 'TikTok' } })
  if (!tt) {
    tt = await prisma.platform.create({
      data: { name: 'TikTok', pageName: 'Demo Shop TikTok', url: 'https://tiktok.com/@demo' }
    })
  }

  // 3. Create a Demo Project
  const project = await prisma.project.create({
    data: {
      name: '🔥 ແຄມເປນ 10.10 Mega Sale',
      description: 'ໂປຣເຈັກສຳລັບກະກຽມໂປຣໂມຊັ່ນໃຫຍ່ປະຈຳເດືອນ 10 ທຸກຊ່ອງທາງ.',
      status: 'ACTIVE',
      progress: 25,
      tasks: {
        create: [
          {
            title: 'ຄິດຄອນເທັນວິດີໂອ 10.10',
            description: 'ຂຽນສະຄຣິບ 3 ວິດີໂອສຳລັບລົງ TikTok',
            status: 'DONE',
            dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
            userId: employee.id,
            platformId: tt.id,
          },
          {
            title: 'ຕັດຕໍ່ວິດີໂອ 10.10 (Part 1)',
            description: 'ຕັດຕໍ່ວິດີໂອທຳອິດ ແລະ ໃສ່ຊັບໄຕເຕີ້ນ',
            status: 'REVIEW',
            dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
            userId: employee.id,
            platformId: tt.id,
          },
          {
            title: 'ອອກແບບປ້າຍໂຄສະນາ (Banner)',
            description: 'ເຮັດຮູບພາບໂປຣໂມຊັ່ນ 10.10 ສຳລັບໜ້າເພຈ Facebook',
            status: 'IN_PROGRESS',
            dueDate: new Date(),
            userId: employee.id,
            platformId: fb.id,
          },
          {
            title: 'ຍິງແອດ Facebook (Ads)',
            description: 'ຕັ້ງຄ່າກຸ່ມເປົ້າໝາຍ ແລະ ປ່ອຍແອດ',
            status: 'TODO',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
            userId: employee.id,
            platformId: fb.id,
          },
          {
            title: 'ຕອບຄອມເມັ້ນລູກຄ້າ',
            description: 'ຕອບແຊັດ ແລະ ຄອມເມັ້ນທີ່ຖາມເລື່ອງໂປຣໂມຊັ່ນ',
            status: 'TODO',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
            userId: employee.id,
            platformId: fb.id,
          }
        ]
      }
    }
  })

  // 4. Create another smaller project
  await prisma.project.create({
    data: {
      name: '📱 ປັບປຸງຄອນເທັນປະຈຳອາທິດ',
      description: 'ວຽກໂພສປະຈຳວັນເພື່ອຮັກສາການເຂົ້າເຖິງ',
      status: 'ACTIVE',
      tasks: {
        create: [
          {
            title: 'ໂພສຮູບສິນຄ້າໃໝ່ລົງ Facebook',
            status: 'IN_PROGRESS',
            dueDate: new Date(),
            userId: employee.id,
            platformId: fb.id,
          }
        ]
      }
    }
  })

  console.log('✅ Demo data seeded successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
