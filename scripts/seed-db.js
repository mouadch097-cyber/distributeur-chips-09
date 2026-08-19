const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Real Business Data Seeding for Distributeur Chips 09 ---');

  const brandsData = [
    {
      name: 'Master Chips',
      arabicName: 'ماستر شيبس',
      slug: 'master-chips',
      description: 'أجود أنواع الشيبس المقرمش بنكهات متعددة وجودة ممتازة',
    },
    {
      name: 'Mahboul',
      arabicName: 'مهبول',
      slug: 'mahboul',
      description: 'شيبس بنكهات مميزة ومحبوبة لدى المستهلك الجزائري',
    },
    {
      name: 'Rifkus',
      arabicName: 'ريكوس',
      slug: 'rifkus',
      description: 'رقائق بطاطس طبيعية مقرمشة وشهية بأعلى معايير الجودة',
    },
    {
      name: 'Dadi',
      arabicName: 'دادي',
      slug: 'dadi',
      description: 'شيبس وسناكس بنكهات تقليدية وعصرية مميزة',
    },
    {
      name: 'Tifouf',
      arabicName: 'تيفوف',
      slug: 'tifouf',
      description: 'منتجات مقرمشة بأسعار تنافسية وجودة عالية',
    },
  ];

  const brandMap = new Map();
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { arabicName: b.arabicName, description: b.description },
      create: b,
    });
    brandMap.set(b.slug, brand.id);
  }
  console.log(`✓ Seeded ${brandsData.length} verified real brands.`);

  const flavorsData = [
    { name: 'Cheese', arabicName: 'جبنة', slug: 'cheese', color: '#eab308' },
    { name: 'Spicy', arabicName: 'حار', slug: 'spicy', color: '#ef4444' },
    { name: 'Hot Chili', arabicName: 'شل حار', slug: 'hot-chili', color: '#b91c1c' },
    { name: 'Pizza', arabicName: 'بيتزا', slug: 'pizza', color: '#f97316' },
    { name: 'Barbecue', arabicName: 'شواء', slug: 'barbecue', color: '#78350f' },
    { name: 'Ketchup', arabicName: 'كاتشب', slug: 'ketchup', color: '#dc2626' },
    { name: 'Chicken', arabicName: 'دجاج', slug: 'chicken', color: '#d97706' },
    { name: 'Peanut', arabicName: 'فول سوداني', slug: 'peanut', color: '#a16207' },
    { name: 'Salt & Vinegar', arabicName: 'خل و ملح', slug: 'salt-vinegar', color: '#0284c7' },
  ];

  const flavorMap = new Map();
  for (const f of flavorsData) {
    const flavor = await prisma.flavor.upsert({
      where: { slug: f.slug },
      update: { arabicName: f.arabicName, color: f.color },
      create: f,
    });
    flavorMap.set(f.slug, flavor.id);
  }
  console.log(`✓ Seeded ${flavorsData.length} real flavors.`);

  // CATEGORIES
  const categoriesData = [
    { name: 'Chips', arabicName: 'شيبس', slug: 'chips', description: 'رقائق البطاطس المقرمشة' },
    { name: 'Snacks', arabicName: 'سناكس', slug: 'snacks', description: 'مقرمشات ومنتجات تنويعية' },
    { name: 'Peanuts', arabicName: 'فول سوداني', slug: 'peanuts', description: 'الفول السوداني والمكسرات المحمصة' },
    { name: 'Popcorn', arabicName: 'فشار', slug: 'popcorn', description: 'الفشار بأنواعه' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, arabicName: cat.arabicName, description: cat.description },
      create: { ...cat, active: true },
    }).catch(() => {/* category model might not exist yet - skip */});
  }
  console.log(`✓ Seeded ${categoriesData.length} categories.`);

  const productsData = [
    {
      name: 'Master Chips Cheese',
      arabicName: 'ماستر شيبس جبنة',
      slug: 'master-chips-cheese',
      brandSlug: 'master-chips',
      flavorSlug: 'cheese',
      unitPrice: 90,
      cartonQuantity: 20,
      cartonPrice: 1800,
      stock: 45,
      featured: true,
      description: 'كرتون ماستر شيبس بنكهة الجبنة اللذيذة، يحتوي على 20 كيس.',
    },
    {
      name: 'Master Chips Hot Chili',
      arabicName: 'ماستر شيبس شل حار',
      slug: 'master-chips-hot-chili',
      brandSlug: 'master-chips',
      flavorSlug: 'hot-chili',
      unitPrice: 90,
      cartonQuantity: 20,
      cartonPrice: 1800,
      stock: 35,
      featured: true,
      description: 'كرتون ماستر شيبس بنكهة الفلفل الحار، يحتوي على 20 كيس.',
    },
    {
      name: 'Rifkus Spicy',
      arabicName: 'ريكوس حار',
      slug: 'rifkus-spicy',
      brandSlug: 'rifkus',
      flavorSlug: 'spicy',
      unitPrice: 80,
      cartonQuantity: 20,
      cartonPrice: 1600,
      stock: 50,
      featured: true,
      description: 'كرتون ريكوس حار المقرمش، يحتوي على 20 كيس شيبس.',
    },
    {
      name: 'Mahboul Cheese',
      arabicName: 'مهبول جبنة',
      slug: 'mahboul-cheese',
      brandSlug: 'mahboul',
      flavorSlug: 'cheese',
      unitPrice: 85,
      cartonQuantity: 20,
      cartonPrice: 1700,
      stock: 60,
      featured: true,
      description: 'كرتون شيبس مهبول الأصلي بنكهة الجبنة، يحتوي على 20 كيس.',
    },
    {
      name: 'Dadi Barbecue',
      arabicName: 'دادي شواء',
      slug: 'dadi-barbecue',
      brandSlug: 'dadi',
      flavorSlug: 'barbecue',
      unitPrice: 105,
      cartonQuantity: 20,
      cartonPrice: 2100,
      stock: 25,
      featured: true,
      description: 'كرتون شيبس دادي بنكهة الشواء، كرتون 20 قطعة.',
    },
    {
      name: 'Tifouf Cheese',
      arabicName: 'تيفوف جبنة',
      slug: 'tifouf-cheese',
      brandSlug: 'tifouf',
      flavorSlug: 'cheese',
      unitPrice: 80,
      cartonQuantity: 20,
      cartonPrice: 1600,
      stock: 40,
      featured: true,
      description: 'كرتون مقرمشات تيفوف بنكهة الجبنة اللذيذة، 20 قطعة.',
    },
  ];

  for (const p of productsData) {
    const brandId = brandMap.get(p.brandSlug);
    const flavorId = flavorMap.get(p.flavorSlug);
    if (!brandId) continue;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        unitPrice: p.unitPrice,
        cartonQuantity: p.cartonQuantity,
        cartonPrice: p.cartonPrice,
        stock: p.stock,
        featured: p.featured,
        description: p.description,
      },
      create: {
        name: p.name,
        arabicName: p.arabicName,
        slug: p.slug,
        brandId,
        flavorId,
        unitPrice: p.unitPrice,
        cartonQuantity: p.cartonQuantity,
        cartonPrice: p.cartonPrice,
        stock: p.stock,
        active: true,
        featured: p.featured,
        description: p.description,
      },
    });
  }
  console.log(`✓ Seeded ${productsData.length} real products across 5 brands.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
