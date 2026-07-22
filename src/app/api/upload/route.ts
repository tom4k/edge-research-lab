import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public'
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl
    });
  } catch (error) {
    console.error('Vercel Blob Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to Vercel Blob' },
      { status: 500 }
    );
  }
}
