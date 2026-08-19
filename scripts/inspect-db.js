const fs = require('fs');

if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) process.env[match[1]] = match[2]?.trim().replace(/^['"]|['"]$/g, '');
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const [products, flavors, brands] = await Promise.all([
    prisma.product.findMany({ include: { brand: true, flavor: true } }),
    prisma.flavor.findMany(),
    prisma.brand.findMany(),
  ]);
  console.log('Current DB Status:');
  console.log('Products:', products.length, products.map(p => ({ id: p.id, name: p.name, arabicName: p.arabicName, brand: p.brand?.name })));
  console.log('Flavors:', flavors.length, flavors.map(f => ({ id: f.id, name: f.name, arabicName: f.arabicName, active: f.active })));
  console.log('Brands:', brands.length, brands.map(b => b.name));
}

check().catch(console.error).finally(() => prisma.$disconnect());
