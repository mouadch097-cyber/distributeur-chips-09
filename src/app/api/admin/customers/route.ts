import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const wilaya = searchParams.get('wilaya') || '';

    const where: any = { role: 'customer' };
    if (wilaya) where.wilaya = wilaya;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        wilaya: true,
        address: true,
        merchantType: true,
        verificationStatus: true,
        commercialRegisterUrl: true,
        active: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Admin customers fetch error:', error);
    return NextResponse.json({ customers: [] }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id, active } = await request.json();
    if (!id) return NextResponse.json({ error: 'معرف العميل مطلوب' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id, role: 'customer' },
      data: { active },
      select: { id: true, name: true, active: true },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error('Admin toggle customer error:', error);
    return NextResponse.json({ error: 'فشل تحديث حالة العميل' }, { status: 500 });
  }
}
