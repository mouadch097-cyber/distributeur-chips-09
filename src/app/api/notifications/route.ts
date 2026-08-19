import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const { id, markAllRead } = await request.json();

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
  } else if (id) {
    // IDOR: only mark own notifications
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
}
