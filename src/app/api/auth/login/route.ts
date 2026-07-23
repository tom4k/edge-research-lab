import { NextResponse } from 'next/server';
import { signToken, verifyPassword } from '@/lib/auth';
import { initialAdminUsers } from '@/lib/seedData';
import { AdminUser } from '@/lib/types';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, customUsers } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    let userToAuth: { id: string; username: string; name: string; email: string; role: any; passwordHash: string } | null = null;

    const hasDb = !!(process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL);

    if (hasDb) {
      try {
        const dbUser = await prisma.adminUser.findUnique({
          where: { username: String(username).toLowerCase() }
        });
        if (dbUser) {
          userToAuth = {
            id: dbUser.id,
            username: dbUser.username,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            passwordHash: dbUser.passwordHash
          };
        }
      } catch (dbError) {
        console.warn('Database user query failed, falling back to local list:', dbError);
      }
    }

    if (!userToAuth) {
      const allUsers: (AdminUser & { passwordHash: string })[] = Array.isArray(customUsers) && customUsers.length > 0
        ? customUsers
        : initialAdminUsers;

      const found = allUsers.find(
        (u) => u.username.toLowerCase() === String(username).toLowerCase()
      );
      if (found) {
        userToAuth = found;
      }
    }

    const isPasswordValid = userToAuth ? await verifyPassword(password, userToAuth.passwordHash) : false;
    if (!userToAuth || !isPasswordValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const payload = {
      id: userToAuth.id,
      username: userToAuth.username,
      name: userToAuth.name,
      email: userToAuth.email,
      role: userToAuth.role
    };

    const token = await signToken(payload);

    const response = NextResponse.json({
      success: true,
      token,
      user: payload,
      usingDatabase: hasDb
    });

    response.cookies.set('edgesys_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
