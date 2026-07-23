import { NextResponse } from 'next/server';
import { requestPasswordReset, resetPasswordWithToken } from '@/lib/neonAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, emailOrUsername, resetToken, newPassword } = body;

    if (action === 'request') {
      if (!emailOrUsername) {
        return NextResponse.json({ error: 'Email or Username is required' }, { status: 400 });
      }

      const result = await requestPasswordReset(emailOrUsername);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message
        });
      } else {
        return NextResponse.json({ error: result.message }, { status: 404 });
      }
    }

    if (action === 'reset') {
      if (!emailOrUsername || !resetToken || !newPassword) {
        return NextResponse.json({ error: 'All fields (email/username, reset code, new password) are required' }, { status: 400 });
      }

      const result = await resetPasswordWithToken(emailOrUsername, resetToken, newPassword);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message
        });
      } else {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
