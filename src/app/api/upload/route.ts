import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cleanName = (file.name || 'avatar.png').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${Date.now()}-${cleanName}`;

    // 1. Primary: Upload to Vercel Storage (Vercel Blob)
    try {
      const blob = await put(`avatars/${filename}`, file, {
        access: 'public'
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        storage: 'vercel-blob'
      });
    } catch (blobError: any) {
      console.warn('Vercel Blob upload failed, falling back to local file storage:', blobError?.message);

      // 2. Fallback for local development if BLOB_READ_WRITE_TOKEN is not yet linked
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        storage: 'local-fallback'
      });
    }
  } catch (error: any) {
    console.error('Image Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
