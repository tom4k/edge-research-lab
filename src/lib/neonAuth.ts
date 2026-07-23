import { prisma } from '@/lib/prisma';
import { initialAdminUsers } from '@/lib/seedData';
import { saveAdminUsersList, getAdminUsersList, hashPassword } from '@/lib/auth';
import nodemailer from 'nodemailer';

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL || process.env.VITE_NEON_AUTH_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export interface ResetRequestRecord {
  token: string;
  userId: string;
  email: string;
  expiresAt: number;
}

// In-memory reset tokens store for active requests
const resetTokens = new Map<string, ResetRequestRecord>();

export async function requestPasswordReset(emailOrUsername: string): Promise<{ success: boolean; message: string; isDemoEmail?: boolean }> {
  try {
    if (!emailOrUsername || typeof emailOrUsername !== 'string') {
      return { success: false, message: 'Invalid username or email provided.' };
    }

    const query = emailOrUsername.trim().toLowerCase();
    const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);

    let targetUser: { id: string; username: string; email: string; name: string } | null = null;

    if (hasDb) {
      try {
        const dbUser = await prisma.adminUser.findFirst({
          where: {
            OR: [
              { username: query },
              { email: query }
            ]
          }
        });
        if (dbUser) {
          targetUser = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            name: dbUser.name
          };
        }
      } catch (err) {
        console.warn('Neon DB reset query warning:', err);
      }
    }

    if (!targetUser) {
      try {
        const list = getAdminUsersList();
        const found = list.find(u => u && (u.username.toLowerCase() === query || u.email.toLowerCase() === query));
        if (found) {
          targetUser = {
            id: found.id,
            username: found.username,
            email: found.email,
            name: found.name
          };
        }
      } catch (err) {
        console.warn('Local admin users list query warning:', err);
      }
    }

    if (!targetUser) {
      return {
        success: false,
        message: 'No admin account found matching that email or username.'
      };
    }

    // Generate 6-digit secure reset code / token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    resetTokens.set(targetUser.id, {
      token: resetToken,
      userId: targetUser.id,
      email: targetUser.email,
      expiresAt
    });

    let emailSent = false;

    // 1. Dispatch email via Nodemailer SMTP if credentials configured
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_PORT === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: `"EdgeSys Lab Auth" <${SMTP_USER}>`,
          to: targetUser.email,
          subject: 'Your Admin Password Reset Code',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
              <h2 style="color: #0d63ff; margin-top: 0;">Password Reset Verification</h2>
              <p>Hello ${targetUser.name},</p>
              <p>You requested to reset your password for the EdgeSys Admin Console.</p>
              <div style="background: #f4f6f8; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #0d63ff;">${resetToken}</span>
              </div>
              <p style="color: #666; font-size: 14px;">This 6-digit code will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
            </div>
          `
        });
        emailSent = true;
        console.log(`[SMTP Mailer] Successfully sent reset email to ${targetUser.email}`);
      } catch (smtpErr) {
        console.error('[SMTP Mailer Error]:', smtpErr);
      }
    }

    // 3. Dispatch email via Neon Auth recovery API endpoint
    if (!emailSent && NEON_AUTH_BASE_URL) {
      try {
        await fetch(`${NEON_AUTH_BASE_URL}/recover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: targetUser.email,
            code: resetToken,
            subject: 'Your EdgeSys Admin Password Reset Code'
          })
        }).catch(() => {});
      } catch (e) {
        console.warn('Neon Auth email API warning:', e);
      }
    }

    // 4. Log mail dispatch event to local terminal console
    console.log(`\n======================================================`);
    console.log(`📧 [NEON AUTH MAIL DISPATCH LOG]`);
    console.log(`User: ${targetUser.name} (@${targetUser.username})`);
    console.log(`Target Email: ${targetUser.email}`);
    console.log(`Reset Code: ${resetToken}`);
    console.log(`Expires In: 15 minutes`);
    console.log(`======================================================\n`);

    const isDemoEmail = targetUser.email.endsWith('@example.edu');

    return {
      success: true,
      message: `A 6-digit password reset code has been generated for ${targetUser.email}.`,
      isDemoEmail
    };
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    return { success: false, message: 'Server error processing password reset request.' };
  }
}

export async function resetPasswordWithToken(
  emailOrUsername: string,
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!emailOrUsername || !resetToken || !newPassword) {
      return { success: false, message: 'Missing required parameters.' };
    }

    const query = emailOrUsername.trim().toLowerCase();
    const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);

    let targetUserId = '';

    if (hasDb) {
      try {
        const dbUser = await prisma.adminUser.findFirst({
          where: {
            OR: [
              { username: query },
              { email: query }
            ]
          }
        });
        if (dbUser) targetUserId = dbUser.id;
      } catch (err) {
        console.warn('Neon DB user reset find error:', err);
      }
    }

    if (!targetUserId) {
      try {
        const list = getAdminUsersList();
        const found = list.find(u => u && (u.username.toLowerCase() === query || u.email.toLowerCase() === query));
        if (found) targetUserId = found.id;
      } catch (err) {
        console.warn('Local admin users list find error:', err);
      }
    }

    if (!targetUserId) {
      return { success: false, message: 'Account not found.' };
    }

    const record = resetTokens.get(targetUserId);
    if (!record || record.token !== resetToken.trim()) {
      return { success: false, message: 'Invalid or expired password reset code.' };
    }

    if (Date.now() > record.expiresAt) {
      resetTokens.delete(targetUserId);
      return { success: false, message: 'Password reset code has expired. Please request a new code.' };
    }

    const hashedPassword = await hashPassword(newPassword);

    // Update password securely in Prisma Database
    if (hasDb) {
      try {
        await prisma.adminUser.update({
          where: { id: targetUserId },
          data: { passwordHash: hashedPassword }
        });
      } catch (err) {
        console.warn('Neon DB password update warning:', err);
      }
    }

    // Update password in local fallback list
    try {
      const list = getAdminUsersList();
      const updatedList = list.map(u => {
        if (u.id === targetUserId) {
          return { ...u, passwordHash: hashedPassword };
        }
        return u;
      });
      saveAdminUsersList(updatedList);
    } catch (err) {
      console.warn('Local list password update warning:', err);
    }

    // Consume token
    resetTokens.delete(targetUserId);

    return {
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.'
    };
  } catch (error) {
    console.error('Error in resetPasswordWithToken:', error);
    return { success: false, message: 'Server error updating password.' };
  }
}
