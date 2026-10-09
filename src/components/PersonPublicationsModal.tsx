'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Publication } from '@/lib/types';
import { useToast } from '@/context/ToastContext';

interface PersonPublicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  publications: Publication[];
}

export function PersonPublicationsModal({
  isOpen,
  onClose,
  personName,
  publications
}: PersonPublicationsModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const years = useMemo(() => {
    const list = Array.from(new Set(publications.map((p) => p.year).filter(Boolean))).sort().reverse();
    return ['All', ...list];
  }, [publications]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return [...publications]
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
      .filter((p) => {
        const matchesYear = selectedYear === 'All' || p.year === selectedYear;
        const matchesQuery = !q || `${p.title} ${p.authors} ${p.venue}`.toLowerCase().includes(q);
        return matchesYear && matchesQuery;
      });
  }, [publications, searchTerm, selectedYear]);

  const copyCitation = (pub: Publication) => {
    const yearStr = pub.year ? ` (${pub.year})` : '';
    const citation = `${pub.authors}${yearStr}. ${pub.title}. ${pub.venue}.${
      pub.doi ? ` https://doi.org/${pub.doi}` : ''
    }`;
    navigator.clipboard.writeText(citation).then(() => {
      toast('Citation copied to clipboard');
    });
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'rgba(2, 8, 20, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: '24px'
      }}
    >
      <div
        className="modal"
        style={{
          width: 'min(820px, 95%)',
          maxHeight: '85vh',
          overflowY: 'auto',
          zIndex: 100000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
          <div>
            <span className="eyebrow">Author Publications</span>
            <h2 style={{ margin: '0.25rem 0 0 0' }}>{personName}</h2>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
              Showing {filtered.length} of {publications.length} total publications
            </p>
          </div>
          <button className="icon-button" onClick={onClose} style={{ fontSize: '1.25rem' }}>
            ×
          </button>
        </div>

        <div className="toolbar" style={{ marginBottom: '1.5rem', gap: '0.75rem' }}>
          <input
            className="input"
            type="search"
            placeholder="Search papers, venues, topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            className="select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ width: '120px' }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((pub) => (
              <article key={pub.id} className="publication-item" style={{ margin: 0 }}>
                <div className="publication-year">{pub.year || '—'}</div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="tag">{pub.type}</span>
                    {pub.isLabRelevant && (
                      <span className="tag" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                        Lab Research
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.05rem', lineHeight: '1.4' }}>
                    {pub.title}
                  </h4>
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
        ) : (
          <div className="empty-state">No publications found for this person.</div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
