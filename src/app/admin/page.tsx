'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { PageVisibilityMap, UserRole } from '@/lib/types';
import { seedData } from '@/lib/seedData';
import { PersonImageUploadField } from '@/components/PersonImageUploadField';

export default function AdminPage() {
  const { user, isAuthenticated, isSuperAdmin, login, logout, usersList, addAdminUser, updateAdminUser, removeAdminUser } = useAuth();
  const { data, updateSettings, togglePageActive, addItem, updateItem, deleteItem, setPersonPublications, importJSON, exportJSON, resetDemoData } = useData();
  const { toast } = useToast();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [adminSection, setAdminSection] = useState<'dashboard' | 'pages' | 'users' | 'theme' | 'settings' | 'research' | 'people' | 'publications' | 'patents' | 'projects' | 'news' | 'data'>('dashboard');

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
  const [curatingPerson, setCuratingPerson] = useState<any>(null);
  const [syncingPersonId, setSyncingPersonId] = useState<string | null>(null);

  // Table Filter & Search States
  const [tableSearch, setTableSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [relevanceFilter, setRelevanceFilter] = useState('All');
  const [patentStatusFilter, setPatentStatusFilter] = useState('All');
  
  // Modal State for Adding User (Super Admin)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');

  const handleSyncPublications = async (personId: string, scholarUrl: string, personName: string) => {
    if (!scholarUrl) {
      toast('Please provide a Google Scholar profile URL for ' + personName);
      return;
    }
    setSyncingPersonId(personId);
    toast(`Syncing publications from Google Scholar for ${personName}...`);
    try {
      const res = await fetch('/api/publications/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, scholarUrl, personName })
      });
      const resData = await res.json();
      if (resData.success && Array.isArray(resData.publications)) {
        setPersonPublications(personId, personName, resData.publications);
      } else {
        toast(resData.error || 'Failed to fetch publications from Google Scholar');
      }
    } catch {
      toast('Error connecting to publication sync service');
    } finally {
      setSyncingPersonId(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(usernameInput, passwordInput);
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
          <span className="eyebrow">Authentication</span>
          <h1>Content Dashboard</h1>
          <p>Sign in with your admin credentials to manage the lab console.</p>
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
              <label htmlFor="admin-pass">Password</label>
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
              Sign In
            </button>
            <div className="credentials-note">
              <strong>Super Admin:</strong> superadmin / super123!
              <br />
              <strong>Admin:</strong> admin / admin123
            </div>
          </form>
        </div>
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
          <button className={adminSection === 'patents' ? 'active' : ''} onClick={() => setAdminSection('patents')}>
            Patents
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
                <strong>{data.publications.filter((p) => p.isLabRelevant !== false).length}</strong>
                <span>Lab Relevant Publications</span>
              </div>
              <div className="stat-card">
                <strong>{(data.patents || []).length}</strong>
                <span>Patents</span>
              </div>
              <div className="stat-card">
                <strong>{data.projects.length}</strong>
                <span>Projects</span>
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

              {(['research', 'people', 'publications', 'patents', 'projects', 'news', 'contact'] as (keyof PageVisibilityMap)[]).map((key) => (
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
                + Add Admin User
              </button>
            </div>

            {(() => {
              const q = tableSearch.toLowerCase().trim();
              const filteredUsers = usersList.filter(
                (u) => !q || `${u.name} ${u.username} ${u.email} ${u.role}`.toLowerCase().includes(q)
              );

              return (
                <div className="admin-table-wrapper">
                  <div className="admin-filter-bar">
                    <input
                      className="input"
                      type="search"
                      placeholder="Search users by name, username, or email..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      style={{ maxWidth: '360px' }}
                    />
                    <span style={{ fontSize: '0.86rem', color: 'var(--muted)', fontWeight: 600 }}>
                      Showing {filteredUsers.length} of {usersList.length} admin accounts
                    </span>
                  </div>

                  {filteredUsers.length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User Profile</th>
                          <th>Email Address</th>
                          <th>Role Permission</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const userInitials = u.name.split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || 'AD';
                          return (
                            <tr key={u.id}>
                              <td>
                                <div className="table-user-cell">
                                  <div className="table-user-avatar">{userInitials}</div>
                                  <div>
                                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>{u.name}</strong>
                                    <small style={{ color: 'var(--muted)' }}>@{u.username}</small>
                                  </div>
                                </div>
                              </td>
                              <td style={{ color: 'var(--muted)', fontWeight: 500 }}>{u.email}</td>
                              <td>
                                <span className={`role-badge ${u.role}`}>
                                  {u.role === 'superadmin' ? '🛡️ Super Admin' : '👤 Admin'}
                                </span>
                              </td>
                              <td>
                                <div className="row-actions">
                                  <button onClick={() => setEditingUser(u)}>
                                    ✏️ Edit
                                  </button>
                                  {u.id !== user.id && (
                                    <button
                                      className="button-danger"
                                      onClick={() => {
                                        if (confirm(`Remove admin account for ${u.name}?`)) {
                                          removeAdminUser(u.id);
                                        }
                                      }}
                                    >
                                      🗑️ Remove
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state" style={{ padding: '3rem 1rem' }}>
                      No admin users match "{tableSearch}".
                    </div>
                  )}
                </div>
              );
            })()}
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
              <div className="field">
                <label>Theme Preset</label>
                <select className="select" name="themePreset" defaultValue={data.settings.themePreset || 'cyber-blue'}>
                  {themePresets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
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

        {/* COLLECTION CRUD SECTIONS (RESEARCH, PEOPLE, PUBLICATIONS, PATENTS, PROJECTS, NEWS) */}
        {['research', 'people', 'publications', 'patents', 'projects', 'news'].includes(adminSection) && (
          <div>
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">Collection Management</span>
                <h1 style={{ textTransform: 'capitalize' }}>{adminSection}</h1>
              </div>
              <button
                className="button"
                onClick={() => setEditingItem({ collection: adminSection, data: {} })}
              >
                + Add {adminSection === 'people' ? 'Person' : adminSection === 'patents' ? 'Patent' : adminSection.slice(0, -1)}
              </button>
            </div>

            {(() => {
              const rawItems = ((data[adminSection as keyof typeof data] as any[]) || (adminSection === 'patents' ? (seedData.patents || []) : [])) || [];
              const q = tableSearch.toLowerCase().trim();

              const filteredItems = rawItems.filter((item) => {
                // Text search across common fields
                const textMatch =
                  !q ||
                  `${item.title || item.name || ''} ${item.role || ''} ${item.venue || ''} ${item.authors || ''} ${item.inventors || ''} ${item.patentNumber || ''} ${item.jurisdiction || ''} ${item.lead || ''} ${item.summary || ''} ${item.interests || ''}`
                    .toLowerCase()
                    .includes(q);

                // Group filter for People
                if (adminSection === 'people' && groupFilter !== 'All') {
                  if (item.group !== groupFilter) return false;
                }

                // Relevance filter for Publications
                if (adminSection === 'publications' && relevanceFilter !== 'All') {
                  if (relevanceFilter === 'Lab Relevant' && !item.isLabRelevant) return false;
                  if (relevanceFilter === 'Non-Lab' && item.isLabRelevant) return false;
                }

                // Status filter for Patents
                if (adminSection === 'patents' && patentStatusFilter !== 'All') {
                  if (item.status !== patentStatusFilter) return false;
                }

                return textMatch;
              });

              return (
                <div className="admin-table-wrapper">
                  <div className="admin-filter-bar">
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
                      <input
                        className="input"
                        type="search"
                        placeholder={`Search ${adminSection} by title, author, description...`}
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        style={{ maxWidth: '340px' }}
                      />

                      {adminSection === 'people' && (
                        <select
                          className="select"
                          value={groupFilter}
                          onChange={(e) => setGroupFilter(e.target.value)}
                          style={{ width: '160px' }}
                        >
                          <option value="All">All Groups</option>
                          <option value="Faculty">Faculty</option>
                          <option value="Researchers">Researchers</option>
                          <option value="Project Staff">Project Staff</option>
                          <option value="Students">Students</option>
                          <option value="Alumni">Alumni</option>
                        </select>
                      )}

                      {adminSection === 'publications' && (
                        <select
                          className="select"
                          value={relevanceFilter}
                          onChange={(e) => setRelevanceFilter(e.target.value)}
                          style={{ width: '180px' }}
                        >
                          <option value="All">All Publications</option>
                          <option value="Lab Relevant">✓ Lab Relevant Only</option>
                          <option value="Non-Lab">✕ Non-Lab Papers</option>
                        </select>
                      )}

                      {adminSection === 'patents' && (
                        <select
                          className="select"
                          value={patentStatusFilter}
                          onChange={(e) => setPatentStatusFilter(e.target.value)}
                          style={{ width: '160px' }}
                        >
                          <option value="All">All Statuses</option>
                          <option value="Granted">Granted</option>
                          <option value="Published">Published</option>
                          <option value="Filed">Filed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      )}
                    </div>

                    <span style={{ fontSize: '0.86rem', color: 'var(--muted)', fontWeight: 600 }}>
                      Showing {filteredItems.length} of {rawItems.length} {adminSection}
                    </span>
                  </div>

                  {filteredItems.length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          {adminSection === 'people' && (
                            <>
                              <th>Researcher Profile</th>
                              <th>Contact & Scholar</th>
                              <th>Publications</th>
                              <th>Actions</th>
                            </>
                          )}

                          {adminSection === 'publications' && (
                            <>
                              <th>Publication Title & Type</th>
                              <th>Authors</th>
                              <th>Venue & Year</th>
                              <th>Lab Relevant</th>
                              <th>Actions</th>
                            </>
                          )}

                          {adminSection === 'patents' && (
                            <>
                              <th>Patent Title & Status</th>
                              <th>Inventors & Jurisdiction</th>
                              <th>Patent No & Year</th>
                              <th>Actions</th>
                            </>
                          )}

                          {adminSection === 'projects' && (
                            <>
                              <th>Project Title & Status</th>
                              <th>Lead & Funding</th>
                              <th>Timeline & Tags</th>
                              <th>Actions</th>
                            </>
                          )}

                          {adminSection === 'news' && (
                            <>
                              <th>News Update & Category</th>
                              <th>Publish Date</th>
                              <th>Summary</th>
                              <th>Actions</th>
                            </>
                          )}

                          {adminSection === 'research' && (
                            <>
                              <th>Research Theme</th>
                              <th>Description</th>
                              <th>Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => {
                          const initials = (name: string) =>
                            name
                              .split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((x) => x[0])
                              .join('')
                              .toUpperCase() || 'RL';

                          return (
                            <tr key={item.id}>
                              {/* PEOPLE TABLE CELLS */}
                              {adminSection === 'people' && (
                                <>
                                  <td>
                                    <div className="table-user-cell">
                                      <div
                                        className="table-user-avatar"
                                        style={{
                                          overflow: 'hidden',
                                          padding: 0,
                                          background: 'var(--surface-soft)'
                                        }}
                                      >
                                        {item.image ? (
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                              objectPosition: 'center top'
                                            }}
                                          />
                                        ) : (
                                          initials(item.name)
                                        )}
                                      </div>
                                      <div>
                                        <strong style={{ fontSize: '0.95rem', display: 'block' }}>{item.name}</strong>
                                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                                          <span className="tag" style={{ fontSize: '0.72rem' }}>{item.group}</span>
                                          <small style={{ color: 'var(--muted)' }}>· {item.role}</small>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <a className="card-link" href={`mailto:${item.email}`} style={{ fontSize: '0.85rem' }}>
                                      {item.email}
                                    </a>
                                    <div style={{ marginTop: '0.25rem' }}>
                                      {item.scholarUrl ? (
                                        <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', fontSize: '0.7rem' }}>
                                          ✓ Scholar Linked
                                        </span>
                                      ) : (
                                        <span className="tag" style={{ opacity: 0.6, fontSize: '0.7rem' }}>
                                          No Scholar Link
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    {(() => {
                                      const lastName = item.name.split(/\s+/).pop() || item.name;
                                      const pubCount = data.publications.filter(
                                        (p) => p.personId === item.id || p.authors.toLowerCase().includes(lastName.toLowerCase())
                                      ).length;
                                      return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                                          <span className="tag" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                                            📚 {pubCount} Papers
                                          </span>
                                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                                            <button
                                              className="button button-small button-outline"
                                              disabled={syncingPersonId === item.id}
                                              onClick={() => handleSyncPublications(item.id, item.scholarUrl, item.name)}
                                              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                                            >
                                              {syncingPersonId === item.id ? 'Syncing...' : '🔄 Sync'}
                                            </button>
                                            <button
                                              className="button button-small button-secondary"
                                              onClick={() => setCuratingPerson(item)}
                                              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                                            >
                                              🎯 Curate
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </td>
                                </>
                              )}

                              {/* PUBLICATIONS TABLE CELLS */}
                              {adminSection === 'publications' && (
                                <>
                                  <td style={{ maxWidth: '300px' }}>
                                    <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.25rem' }}>
                                      <span className="tag">{item.type}</span>
                                      {item.doi && (
                                        <a
                                          className="tag"
                                          href={`https://doi.org/${item.doi}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', textDecoration: 'none' }}
                                        >
                                          DOI
                                        </a>
                                      )}
                                    </div>
                                    <strong style={{ fontSize: '0.95rem', lineHeight: '1.3', display: 'block' }}>
                                      {item.title}
                                    </strong>
                                  </td>
                                  <td style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{item.authors}</td>
                                  <td>
                                    <strong style={{ fontSize: '0.88rem', display: 'block' }}>{item.venue}</strong>
                                    <span className="tag" style={{ marginTop: '0.2rem' }}>{item.year}</span>
                                  </td>
                                  <td>
                                    <button
                                      className={`button button-small ${item.isLabRelevant ? 'button-secondary' : 'button-outline'}`}
                                      style={{
                                        background: item.isLabRelevant ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                        color: item.isLabRelevant ? '#60a5fa' : 'var(--muted)',
                                        borderColor: item.isLabRelevant ? 'rgba(59, 130, 246, 0.4)' : 'var(--line)',
                                        fontSize: '0.78rem'
                                      }}
                                      onClick={() => {
                                        updateItem('publications', item.id, { isLabRelevant: !item.isLabRelevant });
                                      }}
                                    >
                                      {item.isLabRelevant ? '✓ Lab Relevant' : '+ Mark Relevant'}
                                    </button>
                                  </td>
                                </>
                              )}

                              {/* PATENTS TABLE CELLS */}
                              {adminSection === 'patents' && (
                                <>
                                  <td>
                                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>{item.title}</strong>
                                    <span
                                      className="tag"
                                      style={{
                                        fontSize: '0.72rem',
                                        marginTop: '4px',
                                        background: item.status === 'Granted' ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--primary) 15%, transparent)',
                                        color: item.status === 'Granted' ? 'var(--success)' : 'var(--primary)'
                                      }}
                                    >
                                      {item.status} ({item.year})
                                    </span>
                                  </td>
                                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                                    <div><strong>Inventors:</strong> {item.inventors}</div>
                                    <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>{item.jurisdiction}</div>
                                  </td>
                                  <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                    {item.patentNumber}
                                  </td>
                                </>
                              )}

                              {/* PROJECTS TABLE CELLS */}
                              {adminSection === 'projects' && (
                                <>
                                  <td>
                                    <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem' }}>
                                      {item.title}
                                    </strong>
                                    <span
                                      className="tag"
                                      style={{
                                        background: item.status === 'Ongoing' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                        color: item.status === 'Ongoing' ? '#34d399' : '#94a3b8'
                                      }}
                                    >
                                      {item.status}
                                    </span>
                                  </td>
                                  <td>
                                    <strong style={{ fontSize: '0.88rem', display: 'block' }}>Lead: {item.lead}</strong>
                                    <small style={{ color: 'var(--muted)' }}>{item.funding || 'Institutional'}</small>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                      {item.start} – {item.end}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                      {(item.tags || []).slice(0, 3).map((t: string, i: number) => (
                                        <span key={i} className="tag" style={{ fontSize: '0.7rem' }}>
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </>
                              )}

                              {/* NEWS TABLE CELLS */}
                              {adminSection === 'news' && (
                                <>
                                  <td>
                                    <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem' }}>
                                      {item.title}
                                    </strong>
                                    <span className="tag" style={{ fontSize: '0.72rem' }}>{item.category}</span>
                                  </td>
                                  <td style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--muted)' }}>
                                    {item.date}
                                  </td>
                                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem', maxWidth: '320px' }}>
                                    {item.summary}
                                  </td>
                                </>
                              )}

                              {/* RESEARCH TABLE CELLS */}
                              {adminSection === 'research' && (
                                <>
                                  <td>
                                    <div className="table-user-cell">
                                      <div className="table-user-avatar" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>
                                        {item.icon}
                                      </div>
                                      <div>
                                        <strong style={{ fontSize: '0.95rem', display: 'block' }}>{item.title}</strong>
                                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem' }}>
                                          {(item.tags || []).slice(0, 3).map((t: string, i: number) => (
                                            <span key={i} className="tag" style={{ fontSize: '0.7rem' }}>
                                              {t}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem', maxWidth: '360px' }}>
                                    {item.description}
                                  </td>
                                </>
                              )}

                              {/* COMMON ACTIONS COLUMN */}
                              <td>
                                <div className="row-actions">
                                  <button
                                    onClick={() => setEditingItem({ collection: adminSection, id: item.id, data: item })}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    className="button-danger"
                                    onClick={() => {
                                      if (adminSection === 'people') {
                                        const lastName = (item.name || '').trim().split(/\s+/).filter(Boolean).pop()?.toLowerCase();
                                        const matchingPubs = (data.publications || []).filter((p) =>
                                          p.personId === item.id || (!p.personId && lastName && lastName.length >= 2 && p.authors?.toLowerCase().includes(lastName))
                                        );
                                        const count = matchingPubs.length;
                                        const confirmMsg = count > 0
                                          ? `Delete "${item.name}" and their ${count} corresponding publication(s)?`
                                          : `Delete "${item.name}"?`;
                                        if (confirm(confirmMsg)) {
                                          deleteItem('people', item.id);
                                        }
                                      } else {
                                        if (confirm(`Delete "${item.title || item.name}"?`)) {
                                          deleteItem(adminSection as any, item.id);
                                        }
                                      }
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state" style={{ padding: '3rem 1rem' }}>
                      No {adminSection} items match your search.
                    </div>
                  )}
                </div>
              );
            })()}
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
                {editingItem.id ? 'Edit' : 'Add'} {editingItem.collection === 'people' ? 'Person' : editingItem.collection === 'patents' ? 'Patent' : editingItem.collection.slice(0, -1)}
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
                  } else if (key === 'isLabRelevant') {
                    values[key] = val === 'true';
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
                  <div className="field span-2"><label>Research Area Title</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field">
                    <label>Badge Icon / Category</label>
                    <select className="select" name="icon" defaultValue={editingItem.data?.icon || 'EI'}>
                      <option value="EI">EI — Edge Intelligence</option>
                      <option value="FD">FD — Fog & Distributed Computing</option>
                      <option value="VE">VE — Vehicular Edge Computing</option>
                      <option value="RO">RO — Resource Orchestration</option>
                      <option value="UA">UA — UAV-Assisted Computing</option>
                      <option value="CE">CE — Cloud–Edge Systems</option>
                      <option value="AI">AI — Artificial Intelligence</option>
                      <option value="ML">ML — TinyML / Machine Learning</option>
                      <option value="5G">5G — 5G / 6G Edge Networks</option>
                      <option value="IOT">IOT — Internet of Things</option>
                      <option value="SEC">SEC — Security & Privacy</option>
                      <option value="SYS">SYS — Embedded Systems</option>
                    </select>
                  </div>
                  <div className="field span-2"><label>Description</label><textarea className="textarea" name="description" defaultValue={editingItem.data?.description || ''} required /></div>
                  <div className="field span-2"><label>Tags (comma-separated)</label><input className="input" name="tags" defaultValue={(editingItem.data?.tags || []).join(', ')} /></div>
                </>
              )}

              {editingItem.collection === 'people' && (
                <>
                  <div className="field"><label>Full Name</label><input className="input" name="name" defaultValue={editingItem.data?.name || ''} required /></div>
                  <div className="field">
                    <label>Role / Designation</label>
                    <select className="select" name="role" defaultValue={editingItem.data?.role || 'Research Scholar'}>
                      <option value="Lab Director">Lab Director</option>
                      <option value="Principal Investigator">Principal Investigator</option>
                      <option value="Co-Principal Investigator">Co-Principal Investigator</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Postdoctoral Fellow">Postdoctoral Fellow</option>
                      <option value="Senior Research Fellow (SRF)">Senior Research Fellow (SRF)</option>
                      <option value="Junior Research Fellow (JRF)">Junior Research Fellow (JRF)</option>
                      <option value="Research Scholar">Research Scholar</option>
                      <option value="Project Associate">Project Associate</option>
                      <option value="Project Staff">Project Staff</option>
                      <option value="Graduate Researcher">Graduate Researcher</option>
                      <option value="Undergraduate Researcher">Undergraduate Researcher</option>
                      <option value="Research Intern">Research Intern</option>
                      <option value="Alumnus">Alumnus</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Group Affiliation</label>
                    <select className="select" name="group" defaultValue={editingItem.data?.group || 'Researchers'} required>
                      <option value="Faculty">Faculty</option>
                      <option value="Researchers">Researchers</option>
                      <option value="Project Staff">Project Staff</option>
                      <option value="Students">Students</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                  </div>
                  <div className="field"><label>Email Address</label><input className="input" name="email" type="email" defaultValue={editingItem.data?.email || ''} required /></div>
                  <div className="field span-2">
                    <label>Google Scholar Profile URL (Compulsory)</label>
                    <input
                      className="input"
                      name="scholarUrl"
                      type="url"
                      placeholder="https://scholar.google.com/citations?user=..."
                      defaultValue={editingItem.data?.scholarUrl || ''}
                      required
                    />
                  </div>
                  <div className="field span-2"><label>Research Interests</label><input className="input" name="interests" defaultValue={editingItem.data?.interests || ''} /></div>
                  <PersonImageUploadField
                    initialUrl={editingItem.data?.image || ''}
                    name={editingItem.data?.name || 'Researcher'}
                  />
                </>
              )}

              {editingItem.collection === 'publications' && (
                <>
                  <div className="field span-2"><label>Publication Title</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field span-2"><label>Authors (comma-separated)</label><input className="input" name="authors" defaultValue={editingItem.data?.authors || ''} required /></div>
                  <div className="field"><label>Venue (Journal / Conference / Workshop)</label><input className="input" name="venue" defaultValue={editingItem.data?.venue || ''} required /></div>
                  <div className="field">
                    <label>Publication Year</label>
                    <select className="select" name="year" defaultValue={editingItem.data?.year || '2026'} required>
                      {Array.from({ length: 16 }, (_, i) => String(2027 - i)).map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Publication Type</label>
                    <select className="select" name="type" defaultValue={editingItem.data?.type || 'Journal'} required>
                      <option value="Journal">Journal Article</option>
                      <option value="Conference">Conference Paper</option>
                      <option value="Workshop">Workshop Paper</option>
                      <option value="Book Chapter">Book Chapter</option>
                      <option value="Preprint">Preprint (arXiv)</option>
                      <option value="Patent">Patent / Standard</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Lab Relevance</label>
                    <select className="select" name="isLabRelevant" defaultValue={editingItem.data?.isLabRelevant !== false ? 'true' : 'false'}>
                      <option value="true">✓ Lab Relevant (Public on /publications)</option>
                      <option value="false">✕ Non-Lab Paper (Internal Archive)</option>
                    </select>
                  </div>
                  <div className="field span-2"><label>DOI URL / Identifier (Optional)</label><input className="input" name="doi" defaultValue={editingItem.data?.doi || ''} placeholder="e.g. 10.1109/TMC.2025.1234567" /></div>
                </>
              )}

              {editingItem.collection === 'patents' && (
                <>
                  <div className="field span-2"><label>Patent Title</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field span-2"><label>Inventors (comma-separated)</label><input className="input" name="inventors" defaultValue={editingItem.data?.inventors || ''} required /></div>
                  <div className="field"><label>Patent Number</label><input className="input" name="patentNumber" defaultValue={editingItem.data?.patentNumber || ''} placeholder="e.g. US 11,842,109 B2" required /></div>
                  <div className="field">
                    <label>Patent Status</label>
                    <select className="select" name="status" defaultValue={editingItem.data?.status || 'Granted'} required>
                      <option value="Granted">Granted</option>
                      <option value="Published">Published</option>
                      <option value="Filed">Filed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Jurisdiction / Patent Office</label>
                    <select className="select" name="jurisdiction" defaultValue={editingItem.data?.jurisdiction || 'United States Patent and Trademark Office (USPTO)'} required>
                      <option value="United States Patent and Trademark Office (USPTO)">United States Patent and Trademark Office (USPTO)</option>
                      <option value="Indian Patent Office (IPO)">Indian Patent Office (IPO)</option>
                      <option value="European Patent Office (EPO)">European Patent Office (EPO)</option>
                      <option value="World Intellectual Property Organization (WIPO / PCT)">World Intellectual Property Organization (WIPO / PCT)</option>
                      <option value="Japan Patent Office (JPO)">Japan Patent Office (JPO)</option>
                      <option value="China National Intellectual Property Administration (CNIPA)">China National Intellectual Property Administration (CNIPA)</option>
                      <option value="International / Other">International / Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Filing / Grant Year</label>
                    <select className="select" name="year" defaultValue={editingItem.data?.year || '2026'} required>
                      {Array.from({ length: 15 }, (_, i) => String(2027 - i)).map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field span-2"><label>Summary / Abstract</label><textarea className="textarea" name="summary" defaultValue={editingItem.data?.summary || ''} /></div>
                  <div className="field span-2"><label>Patent Official URL (Optional)</label><input className="input" name="url" type="url" defaultValue={editingItem.data?.url || ''} placeholder="https://patents.google.com/patent/..." /></div>
                </>
              )}

              {editingItem.collection === 'projects' && (
                <>
                  <div className="field span-2"><label>Project Title</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field span-2"><label>Summary</label><textarea className="textarea" name="summary" defaultValue={editingItem.data?.summary || ''} required /></div>
                  <div className="field">
                    <label>Project Status</label>
                    <select className="select" name="status" defaultValue={editingItem.data?.status || 'Ongoing'} required>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Planned">Planned</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Lead Investigator</label>
                    {data.people && data.people.length > 0 ? (
                      <select
                        className="select"
                        name="lead"
                        defaultValue={
                          editingItem.data?.lead ||
                          data.people.find((p) => p.role?.toLowerCase().includes('principal investigator') || p.role?.toLowerCase().includes('director'))?.name ||
                          data.people[0]?.name ||
                          ''
                        }
                        required
                      >
                        <option value="" disabled>-- Select Lead Investigator --</option>
                        {editingItem.data?.lead && !data.people.some((p) => p.name === editingItem.data.lead) && (
                          <option value={editingItem.data.lead}>
                            {editingItem.data.lead} (External / Previous)
                          </option>
                        )}
                        {data.people.map((person) => (
                          <option key={person.id} value={person.name}>
                            {person.name}{person.role ? ` (${person.role})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="input"
                        name="lead"
                        defaultValue={editingItem.data?.lead || ''}
                        placeholder="Lead Investigator name"
                        required
                      />
                    )}
                  </div>
                  <div className="field"><label>Funding Body / Grant</label><input className="input" name="funding" defaultValue={editingItem.data?.funding || ''} /></div>
                  <div className="field">
                    <label>Start Year</label>
                    <select className="select" name="start" defaultValue={editingItem.data?.start || '2025'} required>
                      {Array.from({ length: 15 }, (_, i) => String(2027 - i)).map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>End Year (or Expected)</label>
                    <select className="select" name="end" defaultValue={editingItem.data?.end || '2027'} required>
                      {Array.from({ length: 15 }, (_, i) => String(2030 - i)).map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field span-2"><label>Tags (comma-separated)</label><input className="input" name="tags" defaultValue={(editingItem.data?.tags || []).join(', ')} /></div>
                </>
              )}

              {editingItem.collection === 'news' && (
                <>
                  <div className="field span-2"><label>News Headline</label><input className="input" name="title" defaultValue={editingItem.data?.title || ''} required /></div>
                  <div className="field"><label>Publish Date (YYYY-MM-DD)</label><input className="input" name="date" type="date" defaultValue={editingItem.data?.date || new Date().toISOString().slice(0, 10)} required /></div>
                  <div className="field">
                    <label>Category</label>
                    <select className="select" name="category" defaultValue={editingItem.data?.category || 'Lab Update'} required>
                      <option value="Lab Update">Lab Update</option>
                      <option value="Publication">Publication</option>
                      <option value="Presentation">Presentation / Talk</option>
                      <option value="Award">Award & Recognition</option>
                      <option value="Opportunity">Opportunity / Hiring</option>
                      <option value="Event">Event / Workshop</option>
                    </select>
                  </div>
                  <div className="field span-2"><label>Summary & Highlights</label><textarea className="textarea" name="summary" defaultValue={editingItem.data?.summary || ''} required /></div>
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

      {/* MODAL FOR CURATING LAB PUBLICATIONS PER PERSON */}
      {curatingPerson && (
        <div
          className="modal-backdrop"
          onClick={() => setCuratingPerson(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            background: 'rgba(2, 8, 20, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            padding: '24px'
          }}
        >
          <div
            className="modal"
            style={{ maxWidth: '850px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">Publication Relevance Curation</span>
                <h2 style={{ margin: '0.25rem 0 0 0' }}>{curatingPerson.name}</h2>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>
                  Select which publications authored by {curatingPerson.name} should be published on the main /publications page.
                </p>
              </div>
              <button className="icon-button" onClick={() => setCuratingPerson(null)}>
                ×
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="button button-small button-outline"
                disabled={syncingPersonId === curatingPerson.id}
                onClick={() => handleSyncPublications(curatingPerson.id, curatingPerson.scholarUrl, curatingPerson.name)}
              >
                {syncingPersonId === curatingPerson.id ? 'Syncing...' : '🔄 Re-Sync Google Scholar'}
              </button>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(() => {
                const lastName = curatingPerson.name.split(/\s+/).pop() || curatingPerson.name;
                const personPubs = data.publications.filter(
                  (p) => p.personId === curatingPerson.id || p.authors.toLowerCase().includes(lastName.toLowerCase())
                );

                if (personPubs.length === 0) {
                  return (
                    <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                      No publications stored for this researcher yet. Click "Re-Sync Google Scholar" to fetch their papers.
                    </div>
                  );
                }

                return personPubs.map((pub) => (
                  <div
                    key={pub.id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '1rem',
                      borderColor: pub.isLabRelevant ? 'rgba(59, 130, 246, 0.4)' : 'var(--line)',
                      background: pub.isLabRelevant ? 'rgba(59, 130, 246, 0.05)' : 'var(--surface)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="tag">{pub.type}</span>
                        <span className="tag">{pub.year}</span>
                      </div>
                      <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>
                        {pub.title}
                      </strong>
                      <small style={{ color: 'var(--muted)', display: 'block' }}>{pub.authors} · {pub.venue}</small>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        className={`button button-small ${pub.isLabRelevant ? 'button-secondary' : 'button-outline'}`}
                        onClick={() => {
                          updateItem('publications', pub.id, { isLabRelevant: !pub.isLabRelevant });
                        }}
                      >
                        {pub.isLabRelevant ? '✓ Lab Relevant' : '+ Mark as Lab Relevant'}
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
