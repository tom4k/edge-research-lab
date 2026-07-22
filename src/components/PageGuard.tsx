'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { PageVisibilityMap } from '@/lib/types';

interface PageGuardProps {
  pageKey: keyof PageVisibilityMap;
  title: string;
  children: React.ReactNode;
}

export const PageGuard: React.FC<PageGuardProps> = ({ pageKey, title, children }) => {
  const { data } = useData();
  const activePages = data.settings.activePages || {
    research: true,
    people: true,
    publications: true,
    projects: true,
    news: true,
    contact: true
  };

  if (!activePages[pageKey]) {
    return (
      <div className="page">
        <section className="section">
          <div className="empty-state">
            <span className="eyebrow">Notice</span>
            <h1 style={{ fontSize: '2.4rem', margin: '16px 0 8px' }}>{title} Section Currently Offline</h1>
            <p style={{ maxWidth: '540px', margin: '0 auto 24px' }}>
              This section has been temporarily deactivated by the lab administrator. Please check back later or contact the lab directly.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/" className="button">
                Return Home
              </Link>
              <Link href="/admin" className="button button-secondary">
                Admin Console
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return <>{children}</>;
};
