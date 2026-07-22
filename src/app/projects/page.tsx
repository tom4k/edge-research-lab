'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';

export default function ProjectsPage() {
  const { data } = useData();

  return (
    <PageGuard pageKey="projects" title="Projects">
      <div className="page">
        <section className="page-heading">
          <span className="eyebrow">Projects</span>
          <h1>Research translated into focused programmes.</h1>
          <p>
            Explore ongoing and completed projects across edge intelligence, distributed systems, mobility, and cloud–edge infrastructure.
          </p>
        </section>

        <section className="section">
          <div className="grid grid-3">
            {data.projects.map((p, index) => (
              <article key={p.id} className="card project-card">
                <div className="project-number">{String(index + 1).padStart(2, '0')}</div>
                <div className={`status ${p.status === 'Completed' ? 'completed' : ''}`}>{p.status}</div>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                <div className="card-meta">
                  {(p.tags || []).map((t, i) => (
                    <span key={i} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="card-link">
                  {p.start}–{p.end} · {p.lead}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageGuard>
  );
}
