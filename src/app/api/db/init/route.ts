import { NextResponse } from 'next/server';
import { initDbTables } from '@/lib/db';

export async function GET() {
  try {
    const success = await initDbTables();
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Vercel Postgres tables (admin_users, lab_settings, lab_collections) initialized successfully!'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'DATABASE_URL or POSTGRES_URL environment variable missing. Connect database in Vercel Storage tab first.'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initialize database tables' },
      { status: 500 }
    );
  }
}
