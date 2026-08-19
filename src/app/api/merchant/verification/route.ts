import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';
import { merchantVerificationSchema } from '@/lib/validations';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

// Magic bytes signatures for each accepted file type
const MAGIC_BYTES: Record<string, number[][]> = {
  '.jpg': [[0xFF, 0xD8, 0xFF]],
  '.png': [[0x89, 0x50, 0x4E, 0x47]],
  '.webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP)
  '.pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validates file magic bytes against its declared extension.
 * Prevents disguised file uploads (e.g., .exe renamed to .jpg).
 */
function validateMagicBytes(buffer: Buffer, extension: string): boolean {
  const signatures = MAGIC_BYTES[extension];
  if (!signatures) return false;

  return signatures.some((sig) =>
    sig.every((byte, idx) => buffer[idx] === byte)
  );
}

/**
 * Sends a non-blocking Telegram notification to admin when a merchant submits verification.
 */
async function notifyTelegramMerchantVerification(payload: {
  name: string;
  email: string;
  phone?: string | null;
  companyName: string;
  wilaya: string;
  merchantType: string;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || botToken.includes('your-telegram') || !chatId) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID is not configured — skipping notification.');
    return;
  }

  const merchantTypeLabel =
    payload.merchantType === 'SUPER_WHOLESALE'
      ? 'سوبر جملة (Super Wholesale)'
      : payload.merchantType === 'WHOLESALE'
      ? 'جملة (Wholesale)'
      : 'تجزئة (Retail)';

  const text =
    '🔔 طلب توثيق تاجر جديد (New Merchant Verification)\n\n' +
    '👤 اسم التاجر: ' + payload.name + '\n' +
    '🏪 اسم المحل / الشركة: ' + payload.companyName + '\n' +
    '🏷️ نوع التاجر: ' + merchantTypeLabel + '\n' +
    '📍 الولاية: ' + payload.wilaya + '\n' +
    '📞 الهاتف: ' + (payload.phone || 'غير مسجل') + '\n' +
    '✉️ البريد: ' + payload.email + '\n' +
    '⏳ حالة الطلب: قيد المراجعة (Pending)\n' +
    '📄 السجل التجاري: تم رفع الوثيقة بنجاح ومتاحة للمراجعة.\n\n' +
    '🔗 رابط المعاينة: لوحة الإدارة > توثيق التجار والسجلات';

  const endpoint = 'https://api.telegram.org/bot' + botToken + '/sendMessage';

  try {
    console.log('[Telegram] Sending merchant verification notification to admin...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    if (!result.ok) {
      console.error('[Telegram] API error response:', result.description || 'Unknown error');
    } else {
      console.log('[Telegram] Merchant verification notification sent successfully.');
    }
  } catch (err: any) {
    console.error('[Telegram] Notification failed (non-blocking):', err.message || err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لتقديم طلب التوثيق' }, { status: 401 });
    }

    const formData = await request.formData();
    const merchantType = formData.get('merchantType') as string;
    const companyName = formData.get('companyName') as string;
    const wilaya = formData.get('wilaya') as string;
    const address = formData.get('address') as string;
    const file = formData.get('document') as File | null;

    // Validate inputs
    const validation = merchantVerificationSchema.safeParse({
      merchantType,
      companyName,
      wilaya,
      address,
    });

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json(
        { error: 'يرجى رفع صورة أو ملف السجل التجاري (JPG, PNG, WebP, PDF)' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميغابايت).' },
        { status: 400 }
      );
    }

    // Validate file type from declared MIME type
    const mimeType = file.type.toLowerCase();
    const extension = ALLOWED_MIME_TYPES[mimeType];

    if (!extension) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يرجى رفع ملف بصيغة JPG أو PNG أو WebP أو PDF فقط.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Magic Bytes validation — prevents disguised file uploads
    if (!validateMagicBytes(fileBuffer, extension)) {
      return NextResponse.json(
        { error: 'محتوى الملف لا يتطابق مع نوعه. يرجى رفع ملف صحيح.' },
        { status: 400 }
      );
    }

    // Save in private, non-public directory
    const privateDir = path.join(process.cwd(), 'private_uploads', 'commercial_registers');
    if (!fs.existsSync(privateDir)) {
      fs.mkdirSync(privateDir, { recursive: true });
    }

    const randomSuffix = crypto.randomBytes(12).toString('hex');
    const safeFileName = `cr-${user.id}-${Date.now()}-${randomSuffix}${extension}`;
    const filePath = path.join(privateDir, safeFileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    const secureDocumentUrl = `/api/merchant/documents/${user.id}`;

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        merchantType: validation.data.merchantType as any,
        companyName: validation.data.companyName.trim(),
        wilaya: validation.data.wilaya.trim(),
        address: validation.data.address.trim(),
        commercialRegisterUrl: secureDocumentUrl,
        commercialRegisterName: safeFileName,
        verificationStatus: 'PENDING',
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        wilaya: true,
        address: true,
        merchantType: true,
        verificationStatus: true,
      },
    });

    // Non-blocking Telegram notification — failure does NOT prevent registration
    await notifyTelegramMerchantVerification({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: user.phone || null,
      companyName: updatedUser.companyName || validation.data.companyName.trim(),
      wilaya: updatedUser.wilaya || validation.data.wilaya.trim(),
      merchantType: validation.data.merchantType,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلب توثيق نشاطك التجاري بنجاح. ستتم مراجعته وتفعيل الأسعار خلال 24 ساعة.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Merchant verification submission error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع وثائق السجل التجاري' },
      { status: 500 }
    );
  }
}
