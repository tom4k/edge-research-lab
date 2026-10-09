'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';

export default function ContactPage() {
  const { data } = useData();
  const s = data.settings;

  return (
    <PageGuard pageKey="contact" title="Contact">
      <div className="page">
        <section className="page-heading">
          <span className="eyebrow">Contact</span>
          <h1>Start a research conversation.</h1>
          <p>
            Contact us regarding collaboration, doctoral research, internships, funded projects, invited talks, or access to research outputs.
          </p>
        </section>

        <section className="section">
          <div className="contact-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span className="eyebrow">Lab information</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem', marginBottom: '1.5rem', color: '#fff' }}>
              {s.labName}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#fff', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                  Location
                </strong>
                <p style={{ margin: 0, lineHeight: '1.6' }}>{s.location}</p>
              </div>

              <div>
                <strong style={{ display: 'block', color: '#fff', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                  Email
                </strong>
                <p style={{ margin: 0 }}>
                  <a
                    href={`mailto:${s.email}`}
                    style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}
                  >
                    {s.email}
                  </a>
                </p>
              </div>

              {s.phone && (
                <div>
                  <strong style={{ display: 'block', color: '#fff', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                    Phone
                  </strong>
                  <p style={{ margin: 0, lineHeight: '1.6' }}>
                    <a
                      href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}
                      style={{ color: '#b8c7db', textDecoration: 'none' }}
                    >
                      {s.phone}
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <strong style={{ display: 'block', color: '#fff', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                Research focus
              </strong>
              <p style={{ margin: 0, lineHeight: '1.7' }}>
                Edge computing, fog computing, distributed systems, intelligent orchestration, IoT, and vehicular computing.
              </p>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                className="button button-primary"
                href={`mailto:${s.email}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Send Email
              </a>
              {s.website && (
                <a
                  className="button button-outline"
                  href={s.website.startsWith('http') ? s.website : `https://${s.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
                >
                  Institute website
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </PageGuard>
  );
}
