import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';
import { sanitizeProductForUser } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();

    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const flavor = searchParams.get('flavor');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const inStock = searchParams.get('inStock') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const where: any = {
      active: true,
      OR: [
        { flavorId: null },
        { flavor: { active: true } },
      ],
    };

    if (featured) where.featured = true;
    if (inStock) where.stock = { gt: 0 };
    if (brand) where.brand = { slug: brand };
    if (flavor) where.flavor = { slug: flavor, active: true };
    if (category) where.categoryRef = { slug: category };
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { arabicName: { contains: search, mode: 'insensitive' } },
            { brand: { name: { contains: search, mode: 'insensitive' } } },
            { brand: { arabicName: { contains: search, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          flavor: true,
          categoryRef: true,
          flavors: {
            where: { active: true, flavor: { active: true } },
            include: { flavor: true },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Sanitize prices strictly server-side based on user's verification status and merchant type
    const sanitizedProducts = products.map((p) => sanitizeProductForUser(p, user));

    return NextResponse.json({
      products: sanitizedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      userVerificationStatus: user?.verificationStatus || 'UNAUTHENTICATED',
      userMerchantType: user?.merchantType || null,
    });
  } catch (error) {
    console.error('Products route error:', error);
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 0 }, { status: 500 });
  }
}
