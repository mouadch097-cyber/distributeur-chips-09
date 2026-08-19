import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';
import { productSchema } from '@/lib/validations';

export async function GET() {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const [products, brands, flavors, categories] = await Promise.all([
      prisma.product.findMany({
        include: {
          brand: true,
          flavor: true,
          categoryRef: true,
          flavors: {
            include: { flavor: true },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.brand.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      prisma.flavor.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({ products, brands, flavors, categories });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    return NextResponse.json({ products: [], brands: [], flavors: [], categories: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'بيانات المنتج غير صالحة';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { categoryId, flavorIds = [], ...data } = validation.data;

    // Use transaction to create product and its linked flavors
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...data,
          categoryId: categoryId || null,
          flavorId: data.flavorId || (flavorIds.length > 0 ? flavorIds[0] : null),
        },
      });

      // Create ProductFlavor relation records if flavors selected
      if (flavorIds && flavorIds.length > 0) {
        // Distribute stock across selected flavors or set default stock
        const initialFlavorStock = Math.floor(data.stock / flavorIds.length);
        for (const fId of flavorIds) {
          await tx.productFlavor.create({
            data: {
              productId: created.id,
              flavorId: fId,
              stock: initialFlavorStock,
              active: true,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: created.id },
        include: {
          brand: true,
          flavor: true,
          categoryRef: true,
          flavors: { include: { flavor: true } },
        },
      });
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Admin create product error:', error);
    return NextResponse.json({ error: 'فشل إنشاء المنتج' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { id, flavorIds, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    const validation = productSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: 'بيانات التحديث غير صالحة' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        data: validation.data,
      });

      // Sync multi-select flavors if provided
      if (Array.isArray(flavorIds)) {
        const existingFlavors = await tx.productFlavor.findMany({
          where: { productId: id },
        });
        const existingFlavorIds = existingFlavors.map((ef) => ef.flavorId);

        // Add newly selected flavors
        for (const fId of flavorIds) {
          if (!existingFlavorIds.includes(fId)) {
            await tx.productFlavor.create({
              data: {
                productId: id,
                flavorId: fId,
                stock: 0,
                active: true,
              },
            });
          }
        }

        // Deactivate or remove unselected flavors (if not linked to past orders)
        for (const ef of existingFlavors) {
          if (!flavorIds.includes(ef.flavorId)) {
            const hasOrders = await tx.orderItem.count({ where: { productFlavorId: ef.id } });
            if (hasOrders > 0) {
              await tx.productFlavor.update({ where: { id: ef.id }, data: { active: false } });
            } else {
              await tx.productFlavor.delete({ where: { id: ef.id } });
            }
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          brand: true,
          flavor: true,
          categoryRef: true,
          flavors: { include: { flavor: true } },
        },
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Admin update product error:', error);
    return NextResponse.json({ error: 'فشل تحديث المنتج' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });

    // Check if product has historical order items
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });

    if (orderItemsCount > 0) {
      // Historical orders exist: safe soft-delete to preserve invoice & order integrity
      await prisma.product.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        success: true,
        message: 'تم إيقاف وتعطيل المنتج بنجاح للحفاظ على سجل الطلبيات والفواتير السابقة.',
        softDeleted: true,
      });
    } else {
      // No order items: safe to clean up related records and hard-delete
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { productId: id } }),
        prisma.favorite.deleteMany({ where: { productId: id } }),
        prisma.inventoryLog.deleteMany({ where: { productId: id } }),
        prisma.productFlavor.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ]);
      return NextResponse.json({
        success: true,
        message: 'تم حذف المنتج نهائياً من قاعدة البيانات.',
        deleted: true,
      });
    }
  } catch (error) {
    console.error('Admin delete product error:', error);
    return NextResponse.json({ error: 'فشل حذف المنتج' }, { status: 500 });
  }
}
