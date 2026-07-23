'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { PageGuard } from '@/components/PageGuard';
import { Publication } from '@/lib/types';

export default function PublicationsPage() {
  const { data } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const years = useMemo(() => {
    const list = Array.from(new Set(data.publications.map((p) => p.year))).sort().reverse();
    return ['All', ...list];
  }, [data.publications]);

  const types = useMemo(() => {
    const list = Array.from(new Set(data.publications.map((p) => p.type)));
    return ['All', ...list];
  }, [data.publications]);

  const filteredPublications = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return [...data.publications]
      .sort((a, b) => Number(b.year) - Number(a.year))
      .filter((p) => {
        const matchesYear = selectedYear === 'All' || p.year === selectedYear;
        const matchesType = selectedType === 'All' || p.type === selectedType;
        const matchesQuery = !q || `${p.title} ${p.authors} ${p.venue}`.toLowerCase().includes(q);
        return matchesYear && matchesType && matchesQuery;
      });
  }, [data.publications, searchTerm, selectedYear, selectedType]);

  const copyCitation = (pub: Publication) => {
    const citation = `${pub.authors} (${pub.year}). ${pub.title}. ${pub.venue}.${
      pub.doi ? ` https://doi.org/${pub.doi}` : ''
    }`;
    navigator.clipboard.writeText(citation).then(() => {
      toast('Citation copied to clipboard');
    });
  };

  return (
    <PageGuard pageKey="publications" title="Publications">
      <div className="page">
        <section className="page-heading">
          <span className="eyebrow">Publications</span>
          <h1>Research contributions and scholarly outputs.</h1>
          <p>
            Search journal articles, conference papers, reports, preprints, and other research outputs.
          </p>
        </section>

        <section className="section">
          <div className="toolbar">
            <input
              className="input"
              type="search"
              placeholder="Search title, author, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {filteredPublications.length > 0 ? (
            <div>
              {filteredPublications.map((pub) => (
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
          ) : (
            <div className="empty-state">No publications match your search.</div>
          )}
        </section>
      </div>
    </PageGuard>
  );
}
