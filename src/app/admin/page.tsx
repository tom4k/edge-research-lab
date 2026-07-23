'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { PageVisibilityMap, UserRole } from '@/lib/types';

export default function AdminPage() {
  const { user, isAuthenticated, isSuperAdmin, login, logout, usersList, addAdminUser, updateAdminUser, removeAdminUser } = useAuth();
  const { data, updateSettings, togglePageActive, addItem, updateItem, deleteItem, importJSON, exportJSON, resetDemoData } = useData();
  const { toast } = useToast();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [adminSection, setAdminSection] = useState<'dashboard' | 'pages' | 'users' | 'theme' | 'settings' | 'research' | 'people' | 'publications' | 'projects' | 'news' | 'data'>('dashboard');

  const themePresets = [
    { id: 'cyber-blue', name: 'Cyber Edge Blue (Default)', primary: '#0d63ff', accent: '#13c8c2', navy: '#07152f' },
    { id: 'emerald-green', name: 'Emerald Quantum Green', primary: '#059669', accent: '#10b981', navy: '#064e3b' },
    { id: 'violet-nebula', name: 'Violet Nebula Purple', primary: '#8b5cf6', accent: '#f43f5e', navy: '#1e1b4b' },
    { id: 'amber-gold', name: 'Amber Solar Gold', primary: '#d97706', accent: '#f59e0b', navy: '#1c1917' },
    { id: 'ruby-crimson', name: 'Ruby Cyber Red', primary: '#e11d48', accent: '#fb7185', navy: '#1f0910' },
    { id: 'midnight-cyan', name: 'Midnight Cyan Glass', primary: '#06b6d4', accent: '#38bdf8', navy: '#082f49' },
    { id: 'forest-pine', name: 'Forest Pine Dark', primary: '#15803d', accent: '#84cc16', navy: '#052e16' },
    { id: 'sunset-coral', name: 'Sunset Coral Warm', primary: '#f97316', accent: '#fbbf24', navy: '#2a0800' },
    { id: 'mono-obsidian', name: 'Monochrome Obsidian', primary: '#38bdf8', accent: '#94a3b8', navy: '#090d16' },
    { id: 'synth-indigo', name: 'Electric Indigo Synth', primary: '#4f46e5', accent: '#ec4899', navy: '#111827' }
  ];

  // Modal State for CRUD
  const [editingItem, setEditingItem] = useState<{ collection: string; id?: string; data?: any } | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Modal State for Adding User (Super Admin)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotQuery, setForgotQuery] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(usernameInput, passwordInput);
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', emailOrUsername: forgotQuery })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast('Password reset code generated');
        setGeneratedResetCode(resData.resetToken || null);
        setResetStep(2);
      } else {
        toast(resData.error || 'Failed to generate reset code');
      }
    } catch {
      toast('Network error during reset request');
    }
  };

  const handlePerformReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          emailOrUsername: forgotQuery,
          resetToken: resetCodeInput,
          newPassword: newPasswordInput
        })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast('Password reset successfully! You can now sign in.');
        setShowForgotModal(false);
        setUsernameInput(forgotQuery);
        setPasswordInput(newPasswordInput);
        setForgotQuery('');
        setResetCodeInput('');
        setNewPasswordInput('');
        setGeneratedResetCode(null);
        setResetStep(1);
      } else {
        toast(resData.error || 'Failed to reset password');
      }
    } catch {
      toast('Network error during password reset');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addAdminUser({
      username: newUsername,
      name: newName,
      email: newEmail,
      role: newRole,
      password: newPassword
    });
    if (success) {
      setShowAddUserModal(false);
      setNewUsername('');
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('admin');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="page">
        <div className="login-card">
          <span className="eyebrow">Neon Auth & JWT</span>
          <h1>Content Dashboard</h1>
          <p>Sign in with your Neon Auth admin credentials to manage the lab console.</p>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="admin-user">Username</label>
              <input
                className="input"
                id="admin-user"
                autoComplete="username"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
            </div>
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="admin-pass">Password</label>
                <button
                  type="button"
                  className="text-button"
                  style={{ fontSize: '.82rem' }}
                  onClick={() => {
                    setForgotQuery(usernameInput);
                    setShowForgotModal(true);
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                className="input"
                id="admin-pass"
                type="password"
                autoComplete="current-password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
            <button className="button" type="submit">
              Sign in with Neon Auth
            </button>
            <div className="credentials-note">
              <strong>Super Admin:</strong> superadmin / super123!
              <br />
              <strong>Admin:</strong> admin / admin123
            </div>
          </form>
        </div>

        {/* FORGOT PASSWORD MODAL */}
        {showForgotModal && (
          <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Neon Auth Password Recovery</h2>
                <button className="icon-button" onClick={() => setShowForgotModal(false)}>
                  ×
                </button>
              </div>

              {resetStep === 1 ? (
                <form className="admin-form" onSubmit={handleRequestResetCode} style={{ marginTop: '20px' }}>
                  <div className="field span-2">
                    <label>Enter your Username or Email address</label>
                    <input
                      className="input"
                      required
                      placeholder="e.g. superadmin or superadmin@example.edu"
                      value={forgotQuery}
                      onChange={(e) => setForgotQuery(e.target.value)}
                    />
                  </div>
                  <div className="span-2">
                    <button className="button" type="submit">
                      Request Password Reset Code
                    </button>
                  </div>
                </form>
              ) : (
                <form className="admin-form" onSubmit={handlePerformReset} style={{ marginTop: '20px' }}>
                  {generatedResetCode && (
                    <div className="field span-2" style={{ padding: '14px', background: 'var(--surface-soft)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                      <strong>Reset Verification Code Generated:</strong>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '.15em', margin: '4px 0' }}>
                        {generatedResetCode}
                      </div>
                      <small style={{ color: 'var(--muted)' }}>Copy this verification code or enter it below to set your new password.</small>
                    </div>
                  )}

                  <div className="field">
                    <label>6-Digit Reset Code</label>
                    <input
                      className="input"
                      required
                      placeholder="e.g. 123456"
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>New Password</label>
                    <input
                      className="input"
                      type="password"
                      required
                      placeholder="Enter your new password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                    />
                  </div>

                  <div className="span-2" style={{ display: 'flex', gap: '12px' }}>
                    <button className="button" type="submit">
                      Reset Password Now
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setResetStep(1)}
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const activePages = data.settings.activePages || {
    research: true,
    people: true,
    publications: true,
    projects: true,
    news: true,
    contact: true
  };

  return (
    <div className="page admin-shell">
      <aside className="admin-sidebar">
        <h2>Lab CMS</h2>
        <div className="admin-user-profile">
          <strong>{user.name}</strong>
          <span className={`role-badge ${user.role}`}>
            {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        <nav className="admin-nav">
          <button className={adminSection === 'dashboard' ? 'active' : ''} onClick={() => setAdminSection('dashboard')}>
            Dashboard
          </button>
          <button className={adminSection === 'pages' ? 'active' : ''} onClick={() => setAdminSection('pages')}>
            Page Activation
          </button>
          {isSuperAdmin && (
            <>
              <button className={adminSection === 'users' ? 'active' : ''} onClick={() => setAdminSection('users')}>
                User Management
              </button>
              <button className={adminSection === 'theme' ? 'active' : ''} onClick={() => setAdminSection('theme')}>
                Website Theme
              </button>
            </>
          )}
          <button className={adminSection === 'settings' ? 'active' : ''} onClick={() => setAdminSection('settings')}>
            Site Settings
          </button>
          <button className={adminSection === 'research' ? 'active' : ''} onClick={() => setAdminSection('research')}>
            Research Areas
          </button>
          <button className={adminSection === 'people' ? 'active' : ''} onClick={() => setAdminSection('people')}>
            People
          </button>
          <button className={adminSection === 'publications' ? 'active' : ''} onClick={() => setAdminSection('publications')}>
            Publications
          </button>
          <button className={adminSection === 'projects' ? 'active' : ''} onClick={() => setAdminSection('projects')}>
            Projects
          </button>
          <button className={adminSection === 'news' ? 'active' : ''} onClick={() => setAdminSection('news')}>
            News & Events
          </button>
          <button className={adminSection === 'data' ? 'active' : ''} onClick={() => setAdminSection('data')}>
            Import / Export
          </button>
          <button id="admin-logout" onClick={logout} style={{ marginTop: '16px', color: 'var(--danger)' }}>
            Sign out
          </button>
        </nav>
      </aside>

      <section className="admin-content">
        {/* DASHBOARD SECTION */}
        {adminSection === 'dashboard' && (
          <div>
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">Overview</span>
                <h1>Dashboard</h1>
              </div>
              <Link className="button button-outline" href="/">
                View website
              </Link>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <strong>{data.people.length}</strong>
                <span>People</span>
              </div>
              <div className="stat-card">
                <strong>{data.publications.length}</strong>
                <span>Publications</span>
              </div>
              <div className="stat-card">
                <strong>{data.projects.length}</strong>
                <span>Projects</span>
              </div>
              <div className="stat-card">
                <strong>{data.news.length}</strong>
                <span>News Items</span>
              </div>
            </div>
            <div className="admin-panel" style={{ marginTop: '24px' }}>
              <h2>Content & Page Management</h2>
              <p>
                Manage lab information, page activation states, users, publications, and research themes. All changes take effect immediately on the live Next.js website.
              </p>
            </div>
          </div>
        )}

        {/* PAGE ACTIVATION SECTION */}
        {adminSection === 'pages' && (
          <div>
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">Console</span>
                <h1>Page Activation Control</h1>
              </div>
            </div>
            <div className="admin-panel">
              <p style={{ marginBottom: '20px' }}>
                Toggle pages on or off. Deactivated pages will hide from the header & footer navigation and display an offline guard notice if visited directly.
              </p>

              {(['research', 'people', 'publications', 'projects', 'news', 'contact'] as (keyof PageVisibilityMap)[]).map((key) => (
                <div key={key} className="page-toggle-row">
                  <div className="page-toggle-info">
                    <strong>{key} Page</strong>
                    <span>Status: {activePages[key] ? 'Active (Visible on public site)' : 'Inactive (Hidden & Guarded)'}</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!activePages[key]}
                      onChange={() => togglePageActive(key)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USER MANAGEMENT SECTION (SUPER ADMIN ONLY) */}
        {adminSection === 'users' && isSuperAdmin && (
          <div>
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">JWT Credentials</span>
                <h1>Admin User Management</h1>
              </div>
              <button className="button" onClick={() => setShowAddUserModal(true)}>
                Add Admin User
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username / Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      <br />
                      <small style={{ color: 'var(--muted)' }}>@{u.username}</small>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => setEditingUser(u)}>
                          Edit
                        </button>
                        {u.id !== user.id && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove admin account for ${u.name}?`)) {
                                removeAdminUser(u.id);
                              }
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* WEBSITE THEME SELECTION (SUPER ADMIN ONLY) */}
        {adminSection === 'theme' && isSuperAdmin && (
          <div>
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">Super Admin Exclusive</span>
                <h1>Website Theme Preset</h1>
              </div>
            </div>
            <div className="admin-panel">
              <p style={{ marginBottom: '24px' }}>
                Select a site-wide color palette theme for the website. The chosen theme will update CSS variables globally across all pages for every visitor.
              </p>

              <div className="grid grid-2">
                {themePresets.map((t) => {
                  const isSelected = (data.settings.themePreset || 'cyber-blue') === t.id;
                  return (
                    <div
                      key={t.id}
                      className="card"
                      style={{
                        borderColor: isSelected ? 'var(--primary)' : 'var(--line)',
                        borderWidth: isSelected ? '2px' : '1px',
                        background: isSelected ? 'color-mix(in srgb, var(--primary) 8%, var(--surface))' : 'var(--surface)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong>{t.name}</strong>
                        {isSelected && <span className="tag" style={{ background: 'var(--primary)', color: 'white' }}>Active Theme</span>}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: t.primary }} title={`Primary: ${t.primary}`} />
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: t.accent }} title={`Accent: ${t.accent}`} />
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: t.navy }} title={`Navy: ${t.navy}`} />
                      </div>

                      <button
                        className={`button button-small ${isSelected ? 'button-secondary' : ''}`}
                        disabled={isSelected}
                        onClick={() => updateSettings({ themePreset: t.id })}
                      >
                        {isSelected ? 'Currently Applied' : 'Apply Theme'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SITE SETTINGS SECTION */}
        {adminSection === 'settings' && (
          <div>
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">Brand & Details</span>
                <h1>Site Settings</h1>
              </div>
            </div>
            <form
              className="admin-panel admin-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const updated: any = {};
                form.forEach((value, key) => {
                  updated[key] = String(value).trim();
                });
                updateSettings(updated);
              }}
            >
              <div className="field">
                <label>Lab Name</label>
                <input className="input" name="labName" defaultValue={data.settings.labName} required />
              </div>
              <div className="field">
                <label>Short Name</label>
                <input className="input" name="shortName" defaultValue={data.settings.shortName} required />
              </div>
              <div className="field">
                <label>Subtitle</label>
                <input className="input" name="subtitle" defaultValue={data.settings.subtitle} />
              </div>
              <div className="field">
                <label>Tagline</label>
                <input className="input" name="tagline" defaultValue={data.settings.tagline} />
              </div>
              <div className="field span-2">
                <label>Hero Title</label>
                <input className="input" name="heroTitle" defaultValue={data.settings.heroTitle} />
              </div>
              <div className="field span-2">
                <label>Hero Description</label>
                <textarea className="textarea" name="heroDescription" defaultValue={data.settings.heroDescription} />
              </div>
              <div className="field span-2">
                <label>Footer Description</label>
                <textarea className="textarea" name="description" defaultValue={data.settings.description} />
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" name="email" defaultValue={data.settings.email} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input className="input" name="phone" defaultValue={data.settings.phone} />
              </div>
              <div className="field span-2">
                <label>Location</label>
                <input className="input" name="location" defaultValue={data.settings.location} />
              </div>
              <div className="span-2">
                <button className="button" type="submit">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* COLLECTION CRUD SECTIONS (RESEARCH, PEOPLE, PUBLICATIONS, PROJECTS, NEWS) */}
        {['research', 'people', 'publications', 'projects', 'news'].includes(adminSection) && (
          <div>
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">Collection</span>
                <h1 style={{ textTransform: 'capitalize' }}>{adminSection}</h1>
              </div>
              <button
                className="button"
                onClick={() => setEditingItem({ collection: adminSection, data: {} })}
              >
                Add {adminSection.slice(0, -1)}
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title / Name</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data[adminSection as keyof typeof data] as any[]).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title || item.name}</strong>
                    </td>
                    <td>{item.role || item.venue || item.status || item.category || item.description || ''}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          onClick={() => setEditingItem({ collection: adminSection, id: item.id, data: item })}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${item.title || item.name}"?`)) {
                              deleteItem(adminSection as any, item.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DATA IMPORT / EXPORT SECTION */}
        {adminSection === 'data' && (
          <div>
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">Backup & Maintenance</span>
                <h1>Import / Export Content</h1>
              </div>
            </div>

            <div className="admin-panel">
              <h2>Export Content</h2>
              <p>Download a complete JSON backup of the website content and settings.</p>
              <button className="button" onClick={exportJSON}>
                Download JSON Backup
              </button>
            </div>

            <div className="admin-panel">
              <h2>Import Content</h2>
              <p>Select a previously exported JSON file to restore website content.</p>
              <input
                className="input"
                type="file"
                accept="application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    importJSON(String(reader.result));
                  };
                  reader.readAsText(file);
                }}
              />
            </div>

            <div className="admin-panel">
              <h2>Reset Demo Data</h2>
              <p>Restore the original demonstration dataset.</p>
              <button
                className="button button-danger"
                onClick={() => {
                  if (confirm('Reset all website data to seed demonstration values?')) {
                    resetDemoData();
                  }
                }}
              >
                Reset All Content
              </button>
            </div>
          </div>
        )}
      </section>

      {/* MODAL FOR EDITING USER (SUPER ADMIN ONLY) */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Admin User (@{editingUser.username})</h2>
              <button className="icon-button" onClick={() => setEditingUser(null)}>
                ×
              </button>
            </div>
            <form
              className="admin-form"
              style={{ marginTop: '20px' }}
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = String(formData.get('name')).trim();
                const email = String(formData.get('email')).trim();
                const role = String(formData.get('role')) as UserRole;
                const password = String(formData.get('password')).trim();

                const success = await updateAdminUser(editingUser.id, {
                  name,
                  email,
                  role,
                  ...(password ? { password } : {})
                });

                if (success) {
                  setEditingUser(null);
                }
              }}
            >
              <div className="field">
                <label>Full Name</label>
                <input className="input" name="name" defaultValue={editingUser.name} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" name="email" type="email" defaultValue={editingUser.email} required />
              </div>
              <div className="field">
                <label>Role</label>
                <select className="select" name="role" defaultValue={editingUser.role}>
                  <option value="admin">Admin (Content & Settings)</option>
                  <option value="superadmin">Super Admin (Full Control + User Mgmt)</option>
                </select>
              </div>
              <div className="field">
                <label>New Password (Optional)</label>
                <input
                  className="input"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
              <div className="span-2">
                <button className="button" type="submit">
                  Update Admin Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOR ADDING USER (SUPER ADMIN ONLY) */}
      {showAddUserModal && (
        <div className="modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Admin User</h2>
              <button className="icon-button" onClick={() => setShowAddUserModal(false)}>
                ×
              </button>
            </div>
            <form className="admin-form" onSubmit={handleCreateUser} style={{ marginTop: '20px' }}>
              <div className="field">
                <label>Username</label>
                <input
                  className="input"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Full Name</label>
                <input
                  className="input"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="field span-2">
                <label>Role</label>
                <select
                  className="select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                >
                  <option value="admin">Admin (Content & Settings)</option>
                  <option value="superadmin">Super Admin (Content + User Management)</option>
                </select>
              </div>
              <div className="span-2">
                <button className="button" type="submit">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOR EDITING / ADDING CONTENT ITEMS */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ textTransform: 'capitalize' }}>
                {editingItem.id ? 'Edit' : 'Add'} {editingItem.collection.slice(0, -1)}
              </h2>
              <button className="icon-button" onClick={() => setEditingItem(null)}>
                ×
              </button>
            </div>
            <form
              className="admin-form"
              style={{ marginTop: '20px' }}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const values: any = {};
                formData.forEach((val, key) => {
                  if (key === 'tags') {
                    values[key] = String(val)
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);
                  } else {
                    values[key] = String(val).trim();
                  }
                });

                if (editingItem.id) {
                  updateItem(editingItem.collection as any, editingItem.id, values);
                } else {
                  addItem(editingItem.collection as any, values);
                }
                setEditingItem(null);
              }}
            >
              {editingItem.collection === 'research' && (
                <>
                  <div className="field"><label>Title</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field"><label>Icon (2 letters)</label><input className="input" name="icon" defaultValue={editingItem.data?.icon || 'EI'} required /></div>
                  <div className="field span-2"><label>Description</label><textarea className="textarea" name="description" defaultValue={editingItem.data?.description || ''} required /></div>
                  <div className="field span-2"><label>Tags (comma-separated)</label><input className="input" name="tags" defaultValue={(editingItem.data?.tags || []).join(', ')} /></div>
                </>
              )}

              {editingItem.collection === 'people' && (
                <>
                  <div className="field"><label>Name</label><input className="input" name="name" defaultValue={editingItem.data?.name || ''} required /></div>
                  <div className="field"><label>Role</label><input className="input" name="role" defaultValue={editingItem.data?.role || ''} required /></div>
                  <div className="field"><label>Group (e.g. Faculty, Researchers)</label><input className="input" name="group" defaultValue={editingItem.data?.group || 'Researchers'} required /></div>
                  <div className="field"><label>Email</label><input className="input" name="email" type="email" defaultValue={editingItem.data?.email || ''} required /></div>
                  <div className="field span-2"><label>Biography</label><textarea className="textarea" name="bio" defaultValue={editingItem.data?.bio || ''} required /></div>
                  <div className="field span-2"><label>Research Interests</label><input className="input" name="interests" defaultValue={editingItem.data?.interests || ''} /></div>
                  <div className="field span-2"><label>Image URL (Optional)</label><input className="input" name="image" defaultValue={editingItem.data?.image || ''} /></div>
                </>
              )}

              {editingItem.collection === 'publications' && (
                <>
                  <div className="field span-2"><label>Title</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field"><label>Authors</label><input className="input" name="authors" defaultValue={editingItem.data?.authors || ''} required /></div>
                  <div className="field"><label>Venue</label><input className="input" name="venue" defaultValue={editingItem.data?.venue || ''} required /></div>
                  <div className="field"><label>Year</label><input className="input" name="year" defaultValue={editingItem.data?.year || '2026'} required /></div>
                  <div className="field"><label>Type (Journal, Conference)</label><input className="input" name="type" defaultValue={editingItem.data?.type || 'Journal'} required /></div>
                  <div className="field span-2"><label>DOI (Optional)</label><input className="input" name="doi" defaultValue={editingItem.data?.doi || ''} /></div>
                </>
              )}

              {editingItem.collection === 'projects' && (
                <>
                  <div className="field span-2"><label>Title</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field span-2"><label>Summary</label><textarea className="textarea" name="summary" defaultValue={editingItem.data?.summary || ''} required /></div>
                  <div className="field"><label>Status (Ongoing, Completed)</label><input className="input" name="status" defaultValue={editingItem.data?.status || 'Ongoing'} required /></div>
                  <div className="field"><label>Lead Investigator</label><input className="input" name="lead" defaultValue={editingItem.data?.lead || ''} required /></div>
                  <div className="field"><label>Funding</label><input className="input" name="funding" defaultValue={editingItem.data?.funding || ''} /></div>
                  <div className="field"><label>Start Year</label><input className="input" name="start" defaultValue={editingItem.data?.start || '2025'} /></div>
                  <div className="field"><label>End Year</label><input className="input" name="end" defaultValue={editingItem.data?.end || '2027'} /></div>
                  <div className="field span-2"><label>Tags (comma-separated)</label><input className="input" name="tags" defaultValue={(editingItem.data?.tags || []).join(', ')} /></div>
                </>
              )}

              {editingItem.collection === 'news' && (
                <>
                  <div className="field span-2"><label>Title</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field"><label>Date (YYYY-MM-DD)</label><input className="input" name="date" type="date" defaultValue={editingItem.data?.date || new Date().toISOString().slice(0, 10)} required /></div>
                  <div className="field"><label>Category</label><input className="input" name="category" defaultValue={editingItem.data?.category || 'Lab Update'} required /></div>
                  <div className="field span-2"><label>Summary</label><textarea className="textarea" name="summary" defaultValue={editingItem.data?.summary || ''} required /></div>
                </>
              )}

              <div className="span-2">
                <button className="button" type="submit">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
