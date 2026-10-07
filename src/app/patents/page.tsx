'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';
import { Patent } from '@/lib/types';

export default function PatentsPage() {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const patents: Patent[] = data.patents || [];

  const statusOptions = useMemo(() => {
    const list = Array.from(new Set(patents.map((p) => p.status)));
    return ['All', ...list];
  }, [patents]);

  const filteredPatents = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return [...patents]
      .sort((a, b) => Number(b.year) - Number(a.year))
      .filter((p) => {
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesQuery =
          !q ||
          `${p.title} ${p.inventors} ${p.patentNumber} ${p.jurisdiction} ${p.summary || ''}`
            .toLowerCase()
            .includes(q);
        return matchesStatus && matchesQuery;
      });
  }, [patents, searchTerm, statusFilter]);

  return (
    <PageGuard pageKey="patents" title="Patents">
      <div className="page">
        <section className="page-heading">
          <span className="eyebrow">Intellectual Property</span>
          <h1>Patents & Innovations</h1>
          <p>
            Key technological breakthroughs, intellectual property, and patented systems designed and developed by the lab.
          </p>
        </section>

        <section className="section">
          <div className="toolbar">
            <input
              type="text"
              className="input"
              placeholder="Search by title, inventor, or patent number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>

          {filteredPatents.length === 0 ? (
            <div className="empty-state">
              <p>No patents found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {filteredPatents.map((pat) => (
                <article key={pat.id} className="card project-card" style={{ gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <span
                      className={`status ${
                        pat.status === 'Granted' ? '' : 'completed'
                      }`}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: pat.status === 'Granted' ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--primary) 15%, transparent)',
                        color: pat.status === 'Granted' ? 'var(--success)' : 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 800
                      }}
                    >
                      {pat.status.toUpperCase()} ({pat.year})
                    </span>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--muted)' }}>
                      {pat.patentNumber}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginTop: '8px' }}>{pat.title}</h3>
                  
                  <div style={{ fontSize: '0.92rem', color: 'var(--muted)' }}>
                    <strong>Inventors:</strong> {pat.inventors}
                  </div>

                  {pat.summary && (
                    <p style={{ fontSize: '0.92rem', lineHeight: '1.5', marginTop: '4px' }}>
                      {pat.summary}
                    </p>
                  )}

                  <div className="card-meta" style={{ marginTop: 'auto' }}>
                    <span className="tag">{pat.jurisdiction}</span>
                    {pat.url && (
                      <a
                        href={pat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-link"
                        style={{ marginLeft: 'auto', fontSize: '0.88rem' }}
                      >
                        View Patent details ↗
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageGuard>
  );
}
