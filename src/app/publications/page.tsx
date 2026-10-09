'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const topListRef = useRef<HTMLDivElement>(null);

  const years = useMemo(() => {
    const list = Array.from(new Set(data.publications.map((p) => p.year).filter(Boolean))).sort().reverse();
    return ['All', ...list];
  }, [data.publications]);

  const types = useMemo(() => {
    const list = Array.from(new Set(data.publications.map((p) => p.type)));
    return ['All', ...list];
  }, [data.publications]);

  const filteredPublications = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return [...data.publications]
      .filter((p) => p.isLabRelevant !== false)
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
      .filter((p) => {
        const matchesYear = selectedYear === 'All' || p.year === selectedYear;
        const matchesType = selectedType === 'All' || p.type === selectedType;
        const matchesQuery = !q || `${p.title} ${p.authors} ${p.venue}`.toLowerCase().includes(q);
        return matchesYear && matchesType && matchesQuery;
      });
  }, [data.publications, searchTerm, selectedYear, selectedType]);

  // Reset to first page when search, filters, or items-per-page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, selectedType, itemsPerPage]);

  const totalItems = filteredPublications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedPublications = filteredPublications.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) return;
    setCurrentPage(page);
    if (topListRef.current) {
      topListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate pagination buttons with smart ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) {
        pages.push('ellipsis-start');
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safeCurrentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const copyCitation = (pub: Publication) => {
    const yearStr = pub.year ? ` (${pub.year})` : '';
    const citation = `${pub.authors}${yearStr}. ${pub.title}. ${pub.venue}.${
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

        <section className="section" ref={topListRef}>
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
                  {y === 'All' ? 'All Years' : y}
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
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>
          </div>

          {totalItems > 0 ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  color: 'var(--muted)',
                  fontSize: '0.88rem',
                  fontWeight: 500
                }}
              >
                <span>
                  Showing {startIndex + 1}–{endIndex} of {totalItems} publications
                </span>
                <div className="pagination-size-select">
                  <span>Per page:</span>
                  <select
                    className="select"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    style={{ width: 'auto', minWidth: '70px', padding: '4px 8px' }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div>
                {paginatedPublications.map((pub) => (
                  <article key={pub.id} className="publication-item">
                    <div className="publication-year">{pub.year || '—'}</div>
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
                      {pub.url && (
                        <a
                          className="button button-small button-outline"
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Paper
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

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Page {safeCurrentPage} of {totalPages}
                  </div>

                  <div className="pagination-controls">
                    <nav className="pagination-nav" aria-label="Publications pagination">
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => goToPage(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        aria-label="Previous page"
                      >
                        ‹ Prev
                      </button>

                      {getPageNumbers().map((p, idx) => {
                        if (typeof p === 'string') {
                          return (
                            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                              …
                            </span>
                          );
                        }

                        const isActive = p === safeCurrentPage;
                        return (
                          <button
                            key={p}
                            type="button"
                            className={`pagination-btn ${isActive ? 'active' : ''}`}
                            onClick={() => goToPage(p)}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {p}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => goToPage(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        aria-label="Next page"
                      >
                        Next ›
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">No publications match your search.</div>
          )}
        </section>
      </div>
    </PageGuard>
  );
}
