import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';
import { sanitizeProductForUser } from '@/lib/pricing';

// GET - load user's cart with product and flavor details & tier pricing
export async function GET() {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: { include: { brand: true, flavor: true } },
          flavor: true,
          productFlavor: { include: { flavor: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const sanitizedItems = (cart?.items ?? []).map((item) => ({
    ...item,
    product: sanitizeProductForUser(item.product, user),
  }));

  return NextResponse.json({
    items: sanitizedItems,
    userVerificationStatus: user.verificationStatus,
    userMerchantType: user.merchantType,
  });
}

// POST - add item to cart (upsert with flavor differentiation)
export async function POST(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const { productId, cartonsCount, flavorId, productFlavorId } = await request.json();
  if (!productId || !cartonsCount || cartonsCount < 1)
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });

  // Validate product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      flavor: true,
      flavors: { include: { flavor: true } },
    },
  });

  if (!product || !product.active)
    return NextResponse.json({ error: 'المنتج غير متوفر' }, { status: 404 });

  let effectiveFlavorId = flavorId || product.flavorId || null;
  let effectiveProductFlavor: any = null;

  // If flavorId or productFlavorId provided, check specific flavor stock
  if (productFlavorId) {
    effectiveProductFlavor = await prisma.productFlavor.findUnique({
      where: { id: productFlavorId },
      include: { flavor: true },
    });
  } else if (flavorId) {
    effectiveProductFlavor = await prisma.productFlavor.findUnique({
      where: { productId_flavorId: { productId, flavorId } },
      include: { flavor: true },
    });
  }

  if (effectiveProductFlavor) {
    if (!effectiveProductFlavor.active || (effectiveProductFlavor.flavor && !effectiveProductFlavor.flavor.active)) {
      return NextResponse.json({ error: 'هذه النكهة غير متوفرة حالياً للطلب' }, { status: 400 });
    }
    if (effectiveProductFlavor.stock < cartonsCount) {
      return NextResponse.json(
        { error: `المخزون المتوفر لنكهة ${effectiveProductFlavor.flavor.arabicName} هو ${effectiveProductFlavor.stock} كرتون فقط` },
        { status: 400 }
      );
    }
    effectiveFlavorId = effectiveProductFlavor.flavorId;
  } else {
    // Check fallback or overall product stock
    if (product.flavor && !product.flavor.active) {
      return NextResponse.json({ error: 'هذه النكهة غير متوفرة حالياً للطلب' }, { status: 400 });
    }
    if (product.stock < cartonsCount) {
      return NextResponse.json({ error: `المخزون المتوفر ${product.stock} كرتون فقط` }, { status: 400 });
    }
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } });

  // Upsert cart item with flavorId
  const item = await prisma.cartItem.upsert({
    where: {
      cartId_productId_flavorId: {
        cartId: cart.id,
        productId,
        flavorId: effectiveFlavorId,
      },
    },
    update: {
      cartonsCount,
      productFlavorId: effectiveProductFlavor?.id || null,
    },
    create: {
      cartId: cart.id,
      productId,
      flavorId: effectiveFlavorId,
      productFlavorId: effectiveProductFlavor?.id || null,
      cartonsCount,
    },
    include: {
      product: { include: { brand: true, flavor: true } },
      flavor: true,
      productFlavor: { include: { flavor: true } },
    },
  });

  return NextResponse.json({
    success: true,
    item: {
      ...item,
      product: sanitizeProductForUser(item.product, user),
    },
  });
}

// PUT - update quantity
export async function PUT(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const { productId, cartonsCount, flavorId, productFlavorId } = await request.json();
  if (!productId) return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) return NextResponse.json({ error: 'السلة فارغة' }, { status: 404 });

  const effectiveFlavorId = flavorId || null;

  if (cartonsCount <= 0) {
    if (effectiveFlavorId) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId, flavorId: effectiveFlavorId },
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    }
    return NextResponse.json({ success: true });
  }

  // Check stock
  if (productFlavorId || effectiveFlavorId) {
    const pf = productFlavorId
      ? await prisma.productFlavor.findUnique({ where: { id: productFlavorId } })
      : await prisma.productFlavor.findUnique({
          where: { productId_flavorId: { productId, flavorId: effectiveFlavorId! } },
        });

    if (pf && pf.stock < cartonsCount) {
      return NextResponse.json(
        { error: `المخزون المتوفر ${pf.stock} كرتون فقط` },
        { status: 400 }
      );
    }
  }

  const item = await prisma.cartItem.update({
    where: {
      cartId_productId_flavorId: {
        cartId: cart.id,
        productId,
        flavorId: effectiveFlavorId,
      },
    },
    data: { cartonsCount },
    include: {
      product: { include: { brand: true, flavor: true } },
      flavor: true,
      productFlavor: { include: { flavor: true } },
    },
  });

  return NextResponse.json({
    success: true,
    item: {
      ...item,
      product: sanitizeProductForUser(item.product, user),
    },
  });
}

// DELETE - remove item or clear cart
export async function DELETE(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const flavorId = searchParams.get('flavorId');
  const clearAll = searchParams.get('clear') === 'true';

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) return NextResponse.json({ success: true });

  if (clearAll) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  } else if (productId && flavorId) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId, flavorId } });
  } else if (productId) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  }

  return NextResponse.json({ success: true });
}
