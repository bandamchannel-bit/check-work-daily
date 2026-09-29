const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    if (u.email !== u.email.toLowerCase()) {
      await prisma.user.update({
        where: { id: u.id },
        data: { email: u.email.toLowerCase() }
      });
      console.log(`Updated: ${u.email} -> ${u.email.toLowerCase()}`);
    }
  }
  console.log('Done downcasing emails.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
