import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { initialAdminUsers } from '@/lib/seedData';
import { AdminUser } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, customUsers } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const allUsers: (AdminUser & { passwordHash: string })[] = Array.isArray(customUsers) && customUsers.length > 0
      ? customUsers
      : initialAdminUsers;

    const user = allUsers.find(
      (u) => u.username.toLowerCase() === String(username).toLowerCase()
    );

    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = await signToken(payload);

    const response = NextResponse.json({
      success: true,
      token,
      user: payload
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
