import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: urlPath } = await params;
    if (!urlPath || urlPath.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Sanitize path segments to prevent directory traversal
    const safeSegments = urlPath.map((seg) => seg.replace(/[^a-zA-Z0-9._-]/g, ''));
    if (safeSegments.some((seg) => seg === '..' || seg === '.' || seg === '')) {
      return new NextResponse('Invalid Path', { status: 400 });
    }

    const safeRelativePath = safeSegments.join(path.sep);
    const filePath = path.join(process.cwd(), 'public', 'uploads', safeRelativePath);

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Static upload serve error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
