import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';
import { sanitizeProductForUser } from '@/lib/pricing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getFullCurrentUser();

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        active: true,
      },
      include: {
        brand: true,
        flavor: true,
        categoryRef: true,
        flavors: {
          where: {
            active: true,
            flavor: { active: true },
          },
          include: { flavor: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    // Find all active variants for the same brand where flavor is active
    const availableVariants = await prisma.product.findMany({
      where: {
        brandId: product.brandId,
        active: true,
        OR: [
          { flavorId: null },
          { flavor: { active: true } },
        ],
      },
      include: {
        flavor: true,
        flavors: {
          where: { active: true, flavor: { active: true } },
          include: { flavor: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const sanitizedProduct = sanitizeProductForUser(product, user);
    const sanitizedVariants = availableVariants.map((v) => sanitizeProductForUser(v, user));

    return NextResponse.json({
      product: sanitizedProduct,
      availableVariants: sanitizedVariants,
      userVerificationStatus: user?.verificationStatus || 'UNAUTHENTICATED',
      userMerchantType: user?.merchantType || null,
    });
  } catch (error) {
    console.error('Product details error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب تفاصيل المنتج' }, { status: 500 });
  }
}
