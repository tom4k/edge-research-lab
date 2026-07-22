'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';

export default function ResearchPage() {
  const { data } = useData();

  return (
    <PageGuard pageKey="research" title="Research">
      <div className="page">
        <section className="page-heading">
          <span className="eyebrow">Research</span>
          <h1>Computing across the continuum.</h1>
          <p>
            Our research spans intelligent edge systems, distributed platforms, mobility-aware computing, and resource orchestration.
          </p>
        </section>

        <section className="section">
          <div className="grid grid-3">
            {data.research.map((item) => (
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
              <span className="eyebrow">Methodology</span>
              <h2>Rigorous models. Practical systems.</h2>
              <p>
                We formulate constrained optimization problems, design online and learning-based algorithms, develop testbeds, and evaluate methods using real workloads and mobility traces.
              </p>
            </div>
          </div>
          <div className="grid grid-4">
            {[
              {
                title: 'System modelling',
                desc: 'Translate real deployment constraints into measurable objectives and formal decision models.'
              },
              {
                title: 'Algorithm design',
                desc: 'Develop optimization, heuristic, and reinforcement-learning methods with clear baselines.'
              },
              {
                title: 'Prototype development',
                desc: 'Implement reproducible platforms spanning edge boards, servers, containers, and network emulators.'
              },
              {
                title: 'Empirical evaluation',
                desc: 'Measure latency, energy, utilization, service quality, scalability, and robustness.'
              }
            ].map((method, idx) => (
              <div key={idx} className="card">
                <div className="card-icon">0{idx + 1}</div>
                <h3>{method.title}</h3>
                <p>{method.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageGuard>
  );
}
