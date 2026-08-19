const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  console.log('CURRENT USERS IN DB:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
