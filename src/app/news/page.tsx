'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';

export default function NewsPage() {
  const { data } = useData();

  const sortedNews = [...data.news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <PageGuard pageKey="news" title="News & Events">
      <div className="page">
        <section className="page-heading">
          <span className="eyebrow">News & events</span>
          <h1>Updates from the lab.</h1>
          <p>
            Announcements, research milestones, events, opportunities, talks, and achievements.
          </p>
        </section>

        <section className="section">
          <div className="grid grid-3">
            {sortedNews.map((n) => {
              const formattedDate = new Date(`${n.date}T00:00:00`).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <article key={n.id} className="card">
                  <span className="tag">{n.category}</span>
                  <h3>{n.title}</h3>
                  <p>{n.summary}</p>
                  <div className="card-meta">
                    <span className="tag">{formattedDate}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </PageGuard>
  );
}
