import { NextRequest, NextResponse } from 'next/server';
import { getFullCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Allowed MIME types and corresponding safe extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح: رفع الصور مخصص للمدير فقط' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'يرجى اختيار ملف صورة صالح' }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'حجم الصورة يتجاوز الحد الأقصى المسموح به (5 ميغابايت).' },
        { status: 400 }
      );
    }

    // Validate MIME type
    const mimeType = file.type.toLowerCase();
    const extension = ALLOWED_MIME_TYPES[mimeType];

    if (!extension) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. الأنواع المسموح بها هي: JPG, JPEG, PNG, WEBP فقط.' },
        { status: 400 }
      );
    }

    // Determine safe subfolder
    const subfolder = requestedFolder === 'brands' ? 'brands' : 'products';
    const prefix = subfolder === 'brands' ? 'brand' : 'prod';

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate random, collision-resistant, secure file name
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const safeFileName = `${prefix}-${Date.now()}-${randomSuffix}${extension}`;
    const filePath = path.join(uploadsDir, safeFileName);

    // Convert to Buffer and write file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${subfolder}/${safeFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: safeFileName,
      size: file.size,
      folder: subfolder,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع وحفظ الصورة' },
      { status: 500 }
    );
  }
}
