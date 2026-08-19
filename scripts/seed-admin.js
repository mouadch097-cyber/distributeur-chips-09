const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedRequestedAdmin() {
  const email = 'depotchips81@gmail.com';
  const password = 'chipsblida09.7';
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'مدير المنصة',
      role: 'admin',
      active: true,
      passwordHash: hashedPassword,
    },
    create: {
      email,
      name: 'مدير المنصة',
      role: 'admin',
      active: true,
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Admin user created/updated successfully in database:', admin.email);
  await prisma.$disconnect();
}

seedRequestedAdmin().catch(console.error);
