import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const [products, logs] = await Promise.all([
      prisma.product.findMany({
        include: {
          brand: { select: { id: true, name: true, arabicName: true } },
          flavor: { select: { id: true, name: true, arabicName: true } },
          flavors: {
            include: { flavor: true },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: [{ active: 'desc' }, { stock: 'asc' }],
      }),
      prisma.inventoryLog.findMany({
        take: 40,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { arabicName: true, brand: { select: { name: true } } } },
          productFlavor: { include: { flavor: true } },
        },
      }),
    ]);

    // Build flattened inventory items by flavor
    const flavorInventoryItems: any[] = [];

    for (const p of products) {
      if (p.flavors && p.flavors.length > 0) {
        for (const pf of p.flavors) {
          flavorInventoryItems.push({
            id: pf.id,
            productFlavorId: pf.id,
            productId: p.id,
            flavorId: pf.flavorId,
            productName: p.name,
            arabicName: p.arabicName,
            brandName: p.brand?.name || 'Master Chips',
            flavorName: pf.flavor?.arabicName || 'أصلي',
            flavorColor: pf.flavor?.color,
            stock: pf.stock,
            cartonQuantity: p.cartonQuantity,
            cartonPrice: p.cartonPrice,
            productActive: p.active,
            flavorActive: pf.active,
          });
        }
      } else {
        flavorInventoryItems.push({
          id: p.id,
          productFlavorId: null,
          productId: p.id,
          flavorId: p.flavorId || null,
          productName: p.name,
          arabicName: p.arabicName,
          brandName: p.brand?.name || 'Master Chips',
          flavorName: p.flavor?.arabicName || 'عام / بدون نكهة',
          flavorColor: null,
          stock: p.stock,
          cartonQuantity: p.cartonQuantity,
          cartonPrice: p.cartonPrice,
          productActive: p.active,
          flavorActive: true,
        });
      }
    }

    return NextResponse.json({
      products,
      flavorInventoryItems,
      logs,
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ products: [], flavorInventoryItems: [], logs: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { productId, flavorId, productFlavorId, quantityChange, exactStock, note } = body;

    if (!productId) {
      return NextResponse.json({ error: 'يرجى تحديد المنتج' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { flavors: { include: { flavor: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    // If product has linked flavors, flavor must be specified
    const hasFlavors = product.flavors && product.flavors.length > 0;
    if (hasFlavors && !flavorId && !productFlavorId) {
      return NextResponse.json(
        { error: 'هذا المنتج يحتوي على عدة أذواق، يرجى اختيار النكهة المراد إضافة المخزون لها.' },
        { status: 400 }
      );
    }

    // Execute within a single atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      let targetProductFlavor: any = null;

      if (hasFlavors) {
        if (productFlavorId) {
          targetProductFlavor = await tx.productFlavor.findUnique({
            where: { id: productFlavorId },
            include: { flavor: true },
          });
        } else if (flavorId) {
          targetProductFlavor = await tx.productFlavor.findUnique({
            where: { productId_flavorId: { productId, flavorId } },
            include: { flavor: true },
          });

          // Create ProductFlavor if it didn't exist yet
          if (!targetProductFlavor) {
            targetProductFlavor = await tx.productFlavor.create({
              data: { productId, flavorId, stock: 0, active: true },
              include: { flavor: true },
            });
          }
        }

        if (!targetProductFlavor) {
          throw new Error('النكهة المحددة غير موجودة في هذا المنتج.');
        }

        const newFlavorStock = typeof exactStock === 'number'
          ? Math.max(0, exactStock)
          : Math.max(0, targetProductFlavor.stock + (quantityChange || 0));

        const diff = newFlavorStock - targetProductFlavor.stock;

        await tx.productFlavor.update({
          where: { id: targetProductFlavor.id },
          data: { stock: newFlavorStock },
        });

        // Recalculate total product stock as sum of all its flavor stocks
        const allFlavors = await tx.productFlavor.findMany({
          where: { productId },
        });
        const totalStock = allFlavors.reduce((sum, f) => sum + f.stock, 0);

        await tx.product.update({
          where: { id: productId },
          data: { stock: totalStock },
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId,
            productFlavorId: targetProductFlavor.id,
            flavorName: targetProductFlavor.flavor.arabicName,
            type: typeof exactStock === 'number' ? 'adjustment' : (diff >= 0 ? 'restock' : 'adjustment'),
            quantityChange: diff,
            remainingStock: newFlavorStock,
            note: note || `تحديث مخزون نكهة ${targetProductFlavor.flavor.arabicName} (+${diff} كرتون)`,
          },
        });

        return {
          productId,
          productFlavorId: targetProductFlavor.id,
          flavorName: targetProductFlavor.flavor.arabicName,
          newStock: newFlavorStock,
          totalProductStock: totalStock,
        };
      } else {
        // Product without flavor relations
        const newStock = typeof exactStock === 'number'
          ? Math.max(0, exactStock)
          : Math.max(0, product.stock + (quantityChange || 0));

        const diff = newStock - product.stock;

        const updated = await tx.product.update({
          where: { id: productId },
          data: { stock: newStock },
        });

        await tx.inventoryLog.create({
          data: {
            productId,
            type: typeof exactStock === 'number' ? 'adjustment' : (diff >= 0 ? 'restock' : 'adjustment'),
            quantityChange: diff,
            remainingStock: newStock,
            note: note || `تحديث مخزون عام (+${diff} كرتون)`,
          },
        });

        return { productId, newStock, totalProductStock: newStock };
      }
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ error: error.message || 'فشل تحديث المخزون' }, { status: 500 });
  }
}
