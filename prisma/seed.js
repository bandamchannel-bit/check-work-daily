const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create employee
  const employee = await prisma.user.upsert({
    where: { email: 'emp@company.com' },
    update: {},
    create: {
      email: 'emp@company.com',
      name: 'Test Employee',
      password: hashedPassword,
      role: 'USER',
    },
  })

  // Create platforms
  const fb = await prisma.platform.create({
    data: {
      name: 'Facebook',
      pageName: 'Company FB Page',
      url: 'https://facebook.com/company',
    }
  })

  const tiktok = await prisma.platform.create({
    data: {
      name: 'TikTok',
      pageName: 'Company TikTok',
      url: 'https://tiktok.com/@company',
    }
  })

  console.log({ admin, employee, fb, tiktok })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
