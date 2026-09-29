const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  for (const u of users) {
    console.log(`- ${u.name} (${u.email}) Role: ${u.role}`);
    const isMatch = await bcrypt.compare('password123', u.password);
    console.log(`  Password is 'password123': ${isMatch}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
