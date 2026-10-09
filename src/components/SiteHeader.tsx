'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';

export const SiteHeader: React.FC = () => {
  const { data } = useData();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const s = data.settings;
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const activePages = s.activePages || {
    research: true,
    people: true,
    publications: true,
    projects: true,
    news: true,
    contact: true
  };

  const navItems = [
    { href: '/', label: 'Home', active: pathname === '/' },
    ...(activePages.research ? [{ href: '/research', label: 'Research', active: pathname === '/research' }] : []),
    ...(activePages.people ? [{ href: '/people', label: 'People', active: pathname === '/people' }] : []),
    ...(activePages.publications ? [{ href: '/publications', label: 'Publications', active: pathname === '/publications' }] : []),
    ...(activePages.patents !== false ? [{ href: '/patents', label: 'Patents', active: pathname === '/patents' }] : []),
    ...(activePages.projects ? [{ href: '/projects', label: 'Projects', active: pathname === '/projects' }] : []),
    ...(activePages.news ? [{ href: '/news', label: 'News', active: pathname === '/news' }] : []),
    ...(activePages.contact ? [{ href: '/contact', label: 'Contact', active: pathname === '/contact' }] : [])
  ];

  return (
    <header className="site-header" id="site-header">
      <Link className="brand" href="/" aria-label={`${s.labName} home`}>
        <img
          src="/images/logo.png"
          alt={s.labName}
          className="site-logo site-logo-dark"
        />
        <img
          src="/images/logo-light.png"
          alt={s.labName}
          className="site-logo site-logo-light"
        />
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
    </header>
  );
};
