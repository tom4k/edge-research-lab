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
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M24 5 40 14v20L24 43 8 34V14L24 5Z" />
              <circle cx="24" cy="24" r="5" />
            </svg>
          </span>
          <span>
            <strong>{s.shortName}</strong>
            <small>{s.tagline}</small>
          </span>
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
