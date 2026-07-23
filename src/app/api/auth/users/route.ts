import { NextResponse } from 'next/server';
import { verifyToken, hashPassword } from '@/lib/auth';
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

    const hashedPassword = await hashPassword(String(password));

    const newUser: AdminUser & { passwordHash: string } = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      username: String(username).trim().toLowerCase(),
      name: String(name).trim(),
      email: String(email || `${username}@example.edu`).trim(),
      role: (role === 'superadmin' ? 'superadmin' : 'admin') as UserRole,
      createdAt: new Date().toISOString(),
      passwordHash: hashedPassword
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

export async function PUT(request: Request) {
  try {
    const superAdmin = await authenticateSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, role, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = String(name).trim();
    if (email) updateData.email = String(email).trim();
    if (role) updateData.role = (role === 'superadmin' ? 'superadmin' : 'admin') as UserRole;
    if (password) updateData.passwordHash = await hashPassword(String(password));

    const hasDb = !!(process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL);
    if (hasDb) {
      try {
        await prisma.adminUser.update({
          where: { id },
          data: updateData
        });
      } catch (dbError) {
        console.warn('Failed to update user in Prisma database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      updatedFields: updateData
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
