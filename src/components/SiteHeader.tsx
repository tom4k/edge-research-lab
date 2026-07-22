'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';

export const SiteHeader: React.FC = () => {
  const { data } = useData();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const s = data.settings;
  const activePages = s.activePages || {
    research: true,
    people: true,
    publications: true,
    projects: true,
    news: true,
    contact: true
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem('edgesys-theme') as 'light' | 'dark') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('edgesys-theme', nextTheme);
  };

  const navItems = [
    { href: '/', label: 'Home', active: pathname === '/' },
    ...(activePages.research ? [{ href: '/research', label: 'Research', active: pathname === '/research' }] : []),
    ...(activePages.people ? [{ href: '/people', label: 'People', active: pathname === '/people' }] : []),
    ...(activePages.publications ? [{ href: '/publications', label: 'Publications', active: pathname === '/publications' }] : []),
    ...(activePages.projects ? [{ href: '/projects', label: 'Projects', active: pathname === '/projects' }] : []),
    ...(activePages.news ? [{ href: '/news', label: 'News', active: pathname === '/news' }] : []),
    ...(activePages.contact ? [{ href: '/contact', label: 'Contact', active: pathname === '/contact' }] : [])
  ];

  return (
    <header className="site-header" id="site-header">
      <Link className="brand" href="/" aria-label={`${s.labName} home`}>
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="img">
            <path d="M24 5 40 14v20L24 43 8 34V14L24 5Z" />
            <circle cx="24" cy="24" r="5" />
            <path d="M24 9v10M24 29v10M12 16l8 5M28 27l8 5M36 16l-8 5M20 27l-8 5" />
          </svg>
        </span>
        <span>
          <strong id="brand-name">{s.shortName}</strong>
          <small id="brand-subtitle">{s.subtitle}</small>
        </span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-expanded={mobileMenuOpen}
        aria-label="Open navigation"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`primary-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.active ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.7 14.1A8.3 8.3 0 0 1 9.9 3.3 8.7 8.7 0 1 0 20.7 14Z" />
          </svg>
        </button>
        <Link className="button button-small button-outline" href="/admin">
          Admin
        </Link>
      </div>
    </header>
  );
};
