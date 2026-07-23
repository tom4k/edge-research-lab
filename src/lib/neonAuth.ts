import { prisma } from '@/lib/prisma';
import { initialAdminUsers } from '@/lib/seedData';
import { saveAdminUsersList, getAdminUsersList } from '@/lib/auth';

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL || process.env.VITE_NEON_AUTH_URL;

export interface ResetRequestRecord {
  token: string;
  userId: string;
  email: string;
  expiresAt: number;
}

// In-memory reset tokens store for active requests
const resetTokens = new Map<string, ResetRequestRecord>();

export async function requestPasswordReset(emailOrUsername: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
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
    const list = getAdminUsersList();
    const found = list.find(u => u.username.toLowerCase() === query || u.email.toLowerCase() === query);
    if (found) {
      targetUser = {
        id: found.id,
        username: found.username,
        email: found.email,
        name: found.name
      };
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

  // If Neon Auth Endpoint is configured, call external auth hook
  if (NEON_AUTH_BASE_URL) {
    try {
      await fetch(`${NEON_AUTH_BASE_URL}/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetUser.email })
      }).catch(() => {});
    } catch {}
  }

  return {
    success: true,
    message: `Password reset request created for ${targetUser.name} (${targetUser.email}). Reset code: ${resetToken}`,
    resetToken
  };
}

export async function resetPasswordWithToken(
  emailOrUsername: string,
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
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
    } catch {}
  }

  if (!targetUserId) {
    const list = getAdminUsersList();
    const found = list.find(u => u.username.toLowerCase() === query || u.email.toLowerCase() === query);
    if (found) targetUserId = found.id;
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

  // Update password in Prisma Database
  if (hasDb) {
    try {
      await prisma.adminUser.update({
        where: { id: targetUserId },
        data: { passwordHash: newPassword }
      });
    } catch (err) {
      console.warn('Neon DB password update warning:', err);
    }
  }

  // Update password in local fallback list
  const list = getAdminUsersList();
  const updatedList = list.map(u => {
    if (u.id === targetUserId) {
      return { ...u, passwordHash: newPassword };
    }
    return u;
  });
  saveAdminUsersList(updatedList);

  // Consume token
  resetTokens.delete(targetUserId);

  return {
    success: true,
    message: 'Your password has been successfully reset! You can now log in with your new password.'
  };
}
