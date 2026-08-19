import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { email: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error('Admin drivers fetch error:', error);
    return NextResponse.json({ drivers: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { name, phone, vehicle } = await request.json();
    if (!name || !phone)
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });

    // Create user account for driver
    const driverUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: `driver_${Date.now()}@chips09.local`,
        role: 'driver',
        phone: phone.trim(),
        active: true,
      },
    });

    const driver = await prisma.driver.create({
      data: {
        userId: driverUser.id,
        name: name.trim(),
        phone: phone.trim(),
        vehicle: vehicle?.trim() || null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, driver });
  } catch (error) {
    console.error('Admin create driver error:', error);
    return NextResponse.json({ error: 'فشل إضافة السائق' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id, name, phone, vehicle, active } = await request.json();
    if (!id) return NextResponse.json({ error: 'معرف السائق مطلوب' }, { status: 400 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (vehicle !== undefined) updateData.vehicle = vehicle?.trim() || null;
    if (active !== undefined) updateData.active = active;

    const driver = await prisma.driver.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, driver });
  } catch (error) {
    console.error('Admin update driver error:', error);
    return NextResponse.json({ error: 'فشل تحديث السائق' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'معرف السائق مطلوب' }, { status: 400 });

    await prisma.driver.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete driver error:', error);
    return NextResponse.json({ error: 'فشل حذف السائق' }, { status: 500 });
  }
}
