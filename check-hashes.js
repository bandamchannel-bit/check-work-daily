const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log(`- ${u.name} (${u.email}) Role: ${u.role}`);
    console.log(`  Hash: ${u.password}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
