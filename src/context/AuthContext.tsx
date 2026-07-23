'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser, UserRole } from '@/lib/types';
import { initialAdminUsers } from '@/lib/seedData';
import { getAdminUsersList, saveAdminUsersList } from '@/lib/auth';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  usersList: (AdminUser & { passwordHash?: string })[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addAdminUser: (newUser: { username: string; name: string; email: string; role: UserRole; password: string }) => Promise<boolean>;
  updateAdminUser: (userId: string, updatedFields: { name?: string; email?: string; role?: UserRole; password?: string }) => Promise<boolean>;
  removeAdminUser: (userId: string) => Promise<boolean>;
}

const AUTH_STORAGE_KEY = 'edgesys-admin-jwt-token';

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  usersList: [],
  login: async () => false,
  logout: () => {},
  addAdminUser: async () => false,
  updateAdminUser: async () => false,
  removeAdminUser: async () => false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<(AdminUser & { passwordHash?: string })[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load users list
    const loadedUsers = getAdminUsersList();
    setUsersList(loadedUsers);

    // Restore JWT session
    const savedToken = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setUser(data.user);
            setToken(savedToken);
          } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
          }
        })
        .catch(() => {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        });
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        const currentUsersList = getAdminUsersList();
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            customUsers: currentUsersList
          })
        });

        const data = await res.json();
        if (res.ok && data.success && data.token) {
          setToken(data.token);
          setUser(data.user);
          sessionStorage.setItem(AUTH_STORAGE_KEY, data.token);
          toast(`Welcome back, ${data.user.name}`);
          return true;
        } else {
          toast(data.error || 'Invalid credentials');
          return false;
        }
      } catch (err) {
        toast('Login network request failed');
        return false;
      }
    },
    [toast]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    toast('Signed out successfully');
  }, [toast]);

  const addAdminUser = useCallback(
    async (newUser: { username: string; name: string; email: string; role: UserRole; password: string }): Promise<boolean> => {
      if (user?.role !== 'superadmin') {
        toast('Only Super Admin can add new admin users');
        return false;
      }

      try {
        const res = await fetch('/api/auth/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newUser)
        });

        const resData = await res.json();
        if (res.ok && resData.success && resData.fullUserRecord) {
          const updated = [...usersList, resData.fullUserRecord];
          setUsersList(updated);
          saveAdminUsersList(updated);
          toast(`User ${newUser.username} created successfully`);
          return true;
        } else {
          toast(resData.error || 'Failed to add user');
          return false;
        }
      } catch (e) {
        toast('Error creating admin user');
        return false;
      }
    },
    [user, token, usersList, toast]
  );

  const updateAdminUser = useCallback(
    async (
      userId: string,
      updatedFields: { name?: string; email?: string; role?: UserRole; password?: string }
    ): Promise<boolean> => {
      if (user?.role !== 'superadmin') {
        toast('Only Super Admin can edit user roles & details');
        return false;
      }

      if (updatedFields.role === 'admin') {
        const targetUser = usersList.find((u) => u.id === userId);
        if (targetUser?.role === 'superadmin') {
          const superAdminCount = usersList.filter((u) => u.role === 'superadmin').length;
          if (superAdminCount <= 1) {
            toast('Cannot demote the only Super Admin account');
            return false;
          }
        }
      }

      try {
        const res = await fetch('/api/auth/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ id: userId, ...updatedFields })
        });

        const resData = await res.json();
        if (res.ok && resData.success) {
          const updated = usersList.map((u) => {
            if (u.id === userId) {
              return {
                ...u,
                ...(updatedFields.name ? { name: updatedFields.name } : {}),
                ...(updatedFields.email ? { email: updatedFields.email } : {}),
                ...(updatedFields.role ? { role: updatedFields.role } : {}),
                ...(updatedFields.password ? { passwordHash: updatedFields.password } : {})
              };
            }
            return u;
          });
          setUsersList(updated);
          saveAdminUsersList(updated);

          if (user && user.id === userId) {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    ...(updatedFields.name ? { name: updatedFields.name } : {}),
                    ...(updatedFields.email ? { email: updatedFields.email } : {}),
                    ...(updatedFields.role ? { role: updatedFields.role } : {})
                  }
                : null
            );
          }

          toast('User updated successfully');
          return true;
        } else {
          toast(resData.error || 'Failed to update user');
          return false;
        }
      } catch (e) {
        toast('Error updating user');
        return false;
      }
    },
    [user, token, usersList, toast]
  );

  const removeAdminUser = useCallback(
    async (userId: string): Promise<boolean> => {
      if (user?.role !== 'superadmin') {
        toast('Only Super Admin can remove admin users');
        return false;
      }

      if (userId === user.id) {
        toast('Cannot remove your own logged-in account');
        return false;
      }

      const targetUser = usersList.find((u) => u.id === userId);
      if (targetUser?.role === 'superadmin') {
        const superAdminCount = usersList.filter((u) => u.role === 'superadmin').length;
        if (superAdminCount <= 1) {
          toast('Cannot remove the only Super Admin account');
          return false;
        }
      }

      const updated = usersList.filter((u) => u.id !== userId);
      setUsersList(updated);
      saveAdminUsersList(updated);
      toast(`User removed successfully`);
      return true;
    },
    [user, usersList, toast]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin',
        usersList,
        login,
        logout,
        addAdminUser,
        updateAdminUser,
        removeAdminUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
