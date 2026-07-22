import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AdminUser, UserRole } from '@/lib/types';
import { prisma } from '@/lib/prisma';

async function authenticateSuperAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/edgesys_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'superadmin') return null;
  return payload;
}

export async function POST(request: Request) {
  try {
    const superAdmin = await authenticateSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { username, name, email, role, password } = body;

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields (username, name, password)' }, { status: 400 });
    }

    const newUser: AdminUser & { passwordHash: string } = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      username: String(username).trim().toLowerCase(),
      name: String(name).trim(),
      email: String(email || `${username}@example.edu`).trim(),
      role: (role === 'superadmin' ? 'superadmin' : 'admin') as UserRole,
      createdAt: new Date().toISOString(),
      passwordHash: String(password)
    };

    const hasDb = !!(process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL);
    if (hasDb) {
      try {
        await prisma.adminUser.create({
          data: {
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            passwordHash: newUser.passwordHash
          }
        });
      } catch (dbError) {
        console.warn('Failed to insert user into Prisma database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      fullUserRecord: newUser,
      usingDatabase: hasDb
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
