'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';

import { usePathname } from 'next/navigation';

export const SiteFooter: React.FC = () => {
  const pathname = usePathname();
  const { data } = useData();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const s = data.settings;
  const active = s.activePages || {
    research: true,
    people: true,
    publications: true,
    projects: true,
    news: true,
    contact: true
  };

  return (
    <footer className="site-footer">
      <div>
        <Link className="brand footer-brand" href="/" aria-label={`${s.labName} home`}>
          <img
            src="/images/logo.png"
            alt={s.labName}
            className="site-logo site-logo-dark"
            style={{ height: '52px' }}
          />
          <img
            src="/images/logo-light.png"
            alt={s.labName}
            className="site-logo site-logo-light"
            style={{ height: '52px' }}
          />
        </Link>
        <p>{s.description}</p>
      </div>

      <div>
        <h3>Explore</h3>
        {active.research && <Link href="/research">Research areas</Link>}
        {active.publications && <Link href="/publications">Publications</Link>}
        {active.patents !== false && <Link href="/patents">Patents</Link>}
        {active.projects && <Link href="/projects">Projects</Link>}
        {active.people && <Link href="/people">People</Link>}
        {active.news && <Link href="/news">News & Events</Link>}
      </div>

      <div>
        <h3>Connect</h3>
        <a href={`mailto:${s.email}`}>{s.email}</a>
        <span>{s.location}</span>
        {active.contact && <Link href="/contact">Contact the lab</Link>}
      </div>

      <p className="copyright">
        © {new Date().getFullYear()} {s.labName}. All rights reserved.
      </p>
    </footer>
  );
};
