'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Publication } from '@/lib/types';

export default function HomePage() {
  const { data } = useData();
  const { toast } = useToast();
  const s = data.settings;

  const copyCitation = (pub: Publication) => {
    const citation = `${pub.authors} (${pub.year}). ${pub.title}. ${pub.venue}.${
      pub.doi ? ` https://doi.org/${pub.doi}` : ''
    }`;
    navigator.clipboard.writeText(citation).then(() => {
      toast('Citation copied to clipboard');
    });
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{s.subtitle}</span>
          <h1>
            Building intelligence at the <span>edge</span> of the network.
          </h1>
          <p>{s.heroDescription}</p>
          <div className="hero-actions">
            <Link className="button" href="/research">
              Explore our research
            </Link>
            <Link className="button button-secondary" href="/publications">
              View publications
            </Link>
          </div>
          <div className="hero-note">
            <span>Low-latency systems</span>
            <span>Resource-efficient intelligence</span>
            <span>Real-world testbeds</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Animated edge computing network">
          <div className="network-orb">
            <div className="orb-core">EDGE</div>
            <div className="node">DEVICE</div>
            <div className="node">UAV</div>
            <div className="node">CLOUD</div>
            <div className="node">V2X</div>
            <span className="connection c1" />
            <span className="connection c2" />
            <span className="connection c3" />
            <span className="connection c4" />
          </div>
          <div className="hero-chip a">Adaptive orchestration</div>
          <div className="hero-chip b">Distributed intelligence</div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="stats-grid">
          {data.stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Research themes</span>
            <h2>Systems that respond, adapt, and scale.</h2>
            <p>
              Our work connects algorithm design with realistic computing environments, mobility patterns, energy limits, and deployment constraints.
            </p>
          </div>
          <Link className="button button-outline" href="/research">
            All research areas
          </Link>
        </div>

        <div className="grid grid-3">
          {data.research.slice(0, 6).map((item) => (
            <article key={item.id} className="card">
              <div className="card-icon">{item.icon || 'R'}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="card-meta">
                {(item.tags || []).map((t, i) => (
                  <span key={i} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Featured work</span>
            <h2>From foundational models to deployable platforms.</h2>
            <p>We combine optimization, reinforcement learning, systems engineering, and empirical evaluation.</p>
          </div>
        </div>

        <div className="grid grid-3">
          {data.projects.slice(0, 3).map((p, index) => (
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

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Latest publications</span>
            <h2>Recent research outputs.</h2>
          </div>
          <Link className="button button-outline" href="/publications">
            Publication archive
          </Link>
        </div>

        <div>
          {data.publications.slice(0, 3).map((pub) => (
            <article key={pub.id} className="publication-item">
              <div className="publication-year">{pub.year}</div>
              <div>
                <span className="tag">{pub.type}</span>
                <h3>{pub.title}</h3>
                <div className="publication-authors">{pub.authors}</div>
                <div className="publication-venue">{pub.venue}</div>
              </div>
              <div className="publication-actions">
                {pub.doi && (
                  <a
                    className="button button-small button-outline"
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    DOI
                  </a>
                )}
                <button
                  className="button button-small button-secondary"
                  onClick={() => copyCitation(pub)}
                >
                  Copy citation
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-tight">
        <div
          className="card"
          style={{
            padding: '42px',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--surface)), color-mix(in srgb, var(--accent) 10%, var(--surface)))'
          }}
        >
          <span className="eyebrow">Collaborate</span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', margin: 0, maxWidth: '850px', letterSpacing: '-.05em', lineHeight: 1.05 }}>
            Interested in edge intelligence, distributed systems, or joint research?
          </h2>
          <p style={{ maxWidth: '650px', marginTop: '16px' }}>
            We welcome academic collaborations, student researchers, research internships, and industry-supported projects.
          </p>
          <Link className="button" href="/contact" style={{ marginTop: '20px' }}>
            Start a conversation
          </Link>
        </div>
      </section>
    </div>
  );
}
