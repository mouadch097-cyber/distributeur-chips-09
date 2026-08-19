import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const currentUser = await getFullCurrentUser();

    // 1. Must be logged in
    if (!currentUser) {
      return new NextResponse('Unauthorized: يرجى تسجيل الدخول', { status: 401 });
    }

    // 2. IDOR Protection: Only Admin or the Document Owner can access
    const isOwner = currentUser.id === userId;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      return new NextResponse('Forbidden: غير مصرح لك بالوصول إلى وثائق هذا المستخدم', { status: 403 });
    }

    // 3. Find user and document file name in DB
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { commercialRegisterName: true },
    });

    if (!targetUser || !targetUser.commercialRegisterName) {
      return new NextResponse('وثيقة السجل التجاري غير موجودة', { status: 404 });
    }

    const safeFileName = path.basename(targetUser.commercialRegisterName);
    const filePath = path.join(process.cwd(), 'private_uploads', 'commercial_registers', safeFileName);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('الملف غير موجود على الخادم', { status: 404 });
    }

    const stat = await fs.promises.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Content-Disposition': `inline; filename="${safeFileName}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Secure document serve error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
