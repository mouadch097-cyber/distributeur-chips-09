import { NextRequest, NextResponse } from 'next/server';
import { getFullCurrentUser } from '@/lib/auth';
import { put } from '@vercel/blob';

// Allowed MIME types for public images
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Admin
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح لك برفع الصور' }, { status: 403 });
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار أي ملف' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, WebP, SVG)' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت' },
        { status: 400 }
      );
    }

    // 3. Convert File to Buffer for reliable serverless upload
    const cleanFolderName = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blobPathname = `${cleanFolderName}/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Vercel Blob (reads token from process.env.BLOB_READ_WRITE_TOKEN)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      console.error('[Vercel Blob Config Error]: BLOB_READ_WRITE_TOKEN is missing in environment variables.');
      return NextResponse.json(
        { error: 'خدمة تخزين الصور غير مهيأة في بيئة الإنتاج. يرجى التأكد من ربط Vercel Blob.' },
        { status: 500 }
      );
    }

    const blob = await put(blobPathname, buffer, {
      access: 'public',
      contentType: file.type,
      token: blobToken,
      addRandomSuffix: true,
    });

    console.log(`[Vercel Blob] Upload success: ${blob.url}`);
    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error: any) {
    console.error(`[Vercel Blob Upload Error]: name=${error?.name} | message=${error?.message}`);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع وحفظ الصورة. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}