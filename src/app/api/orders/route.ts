import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';
import { orderCreateSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { resolveUserPricing } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لإتمام الطلب' }, { status: 401 });
    }

    // Commercial verification check
    if (user.role !== 'admin' && user.verificationStatus !== 'APPROVED') {
      return NextResponse.json(
        {
          error: 'حسابك التجاري قيد المراجعة. يرجى توثيق نشاطك التجاري وانتظار الموافقة قبل إرسال الطلبيات.',
          verificationStatus: user.verificationStatus,
        },
        { status: 403 }
      );
    }

    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`order_${user.id}_${ip}`, 5, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'يرجى الانتظار دقيقة قبل إرسال طلبية أخرى' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = orderCreateSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'بيانات الطلبية غير صالحة';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { customerName, phone, wilaya, address, notes, items } = validation.data;

    // Fetch all products involved
    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        active: true,
      },
      include: {
        brand: true,
        flavor: true,
        flavors: { include: { flavor: true } },
      },
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'بعض المنتجات المحددة غير متوفرة أو تم إيقافها.' },
        { status: 400 }
      );
    }

    let calculatedTotal = 0;
    const validatedItems: any[] = [];

    // Validate each order item against DB stock and compute prices server-side
    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: 'منتج غير صالح' }, { status: 400 });
      }

      let flavorRecord: any = null;
      let effectiveFlavorName: string | null = null;
      let productFlavorId: string | null = null;

      if (item.productFlavorId || item.flavorId) {
        if (product.flavors && product.flavors.length > 0) {
          flavorRecord = item.productFlavorId
            ? product.flavors.find((pf) => pf.id === item.productFlavorId)
            : product.flavors.find((pf) => pf.flavorId === item.flavorId);
        }
      }

      if (flavorRecord) {
        if (!flavorRecord.active || (flavorRecord.flavor && !flavorRecord.flavor.active)) {
          return NextResponse.json(
            { error: `نكهة ${flavorRecord.flavor.arabicName} غير متوفرة حالياً للطلب.` },
            { status: 400 }
          );
        }

        if (flavorRecord.stock < item.cartonsCount) {
          return NextResponse.json(
            {
              error: `الكمية المطلوبة من ${product.arabicName} (نكهة: ${flavorRecord.flavor.arabicName}) غير متوفرة في المخزون (المتوفر: ${flavorRecord.stock} كرتون).`,
            },
            { status: 400 }
          );
        }

        effectiveFlavorName = flavorRecord.flavor.arabicName;
        productFlavorId = flavorRecord.id;
      } else {
        // Product general stock check
        if (product.flavor && !product.flavor.active) {
          return NextResponse.json(
            { error: `نكهة ${product.flavor.arabicName} غير متوفرة حالياً للطلب.` },
            { status: 400 }
          );
        }

        if (product.stock < item.cartonsCount) {
          return NextResponse.json(
            {
              error: `الكمية المطلوبة من ${product.arabicName} غير متوفرة في المخزون (المتوفر: ${product.stock} كرتون).`,
            },
            { status: 400 }
          );
        }

        effectiveFlavorName = product.flavor?.arabicName || null;
      }

      // Server-side tiered pricing calculation
      const pricing = resolveUserPricing(product, user);
      const effectiveCartonPrice = pricing.effectiveCartonPrice ?? product.cartonPrice;
      const effectiveUnitPrice = pricing.effectiveUnitPrice ?? product.unitPrice;
      const itemTotal = effectiveCartonPrice * item.cartonsCount;

      calculatedTotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        productFlavorId,
        productName: product.arabicName,
        brandName: product.brand.name,
        flavorName: effectiveFlavorName,
        merchantType: user.merchantType || 'RETAIL',
        cartonQuantity: product.cartonQuantity,
        cartonsCount: item.cartonsCount,
        unitPrice: effectiveUnitPrice,
        cartonPrice: effectiveCartonPrice,
        totalPrice: itemTotal,
        flavorRecord,
      });
    }

    // Generate unique order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Execute in transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: customerName.trim(),
          phone: phone.trim(),
          wilaya: wilaya.trim(),
          address: address.trim(),
          notes: notes?.trim() || null,
          status: 'pending',
          totalAmount: calculatedTotal,
          items: {
            create: validatedItems.map(({ flavorRecord, ...itemData }) => itemData),
          },
        },
      });

      // Create Invoice
      await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          userId: user.id,
          amount: calculatedTotal,
          status: 'issued',
        },
      });

      // Decrement flavor-specific stock and product total stock
      for (const item of validatedItems) {
        if (item.productFlavorId) {
          const pf = await tx.productFlavor.findUnique({
            where: { id: item.productFlavorId },
          });

          if (pf) {
            const newFlavorStock = Math.max(0, pf.stock - item.cartonsCount);
            await tx.productFlavor.update({
              where: { id: pf.id },
              data: { stock: newFlavorStock },
            });

            // Update total product stock
            const allFlavors = await tx.productFlavor.findMany({
              where: { productId: item.productId },
            });
            const totalStock = allFlavors.reduce((sum, f) => sum + f.stock, 0);

            await tx.product.update({
              where: { id: item.productId },
              data: { stock: totalStock },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                productFlavorId: pf.id,
                flavorName: item.flavorName,
                type: 'sale',
                quantityChange: -item.cartonsCount,
                remainingStock: newFlavorStock,
                note: `طلبية رقم ${orderNumber} (${item.flavorName} × ${item.cartonsCount} كرتون)`,
              },
            });
          }
        } else {
          // General product stock deduction
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          if (p) {
            const newStock = Math.max(0, p.stock - item.cartonsCount);
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: newStock },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                type: 'sale',
                quantityChange: -item.cartonsCount,
                remainingStock: newStock,
                note: `طلبية رقم ${orderNumber} (${item.cartonsCount} كرتون)`,
              },
            });
          }
        }
      }

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'تم استلام طلبكم بنجاح',
          message: `طلبكم رقم ${orderNumber} بمبلغ ${calculatedTotal.toLocaleString()} دج قيد المراجعة.`,
          type: 'order',
          link: `/orders/${order.id}`,
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      totalAmount: calculatedTotal,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الطلبية، يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (user.role !== 'admin') {
      where.userId = user.id; // Customer only sees their own orders
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        invoice: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            merchantType: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
