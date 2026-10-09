'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';
import { GalleryItem } from '@/lib/types';

export default function GalleryPage() {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const galleryItems: GalleryItem[] = data.gallery || [];

  // Filter gallery items by search query (matching caption or date)
  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return galleryItems;
    return galleryItems.filter((item) => {
      return `${item.caption || ''} ${item.date || ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [galleryItems, searchTerm]);

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      }
    },
    [activeLightboxIndex, filteredItems.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (activeLightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeLightboxIndex]);

  const activeItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  return (
    <PageGuard pageKey="gallery" title="Gallery">
      <div className="page">
        {/* Page Heading */}
        <section className="page-heading">
          <span className="eyebrow">Visual Moments</span>
          <h1>Gallery</h1>
          <p>
            Photographs and visual highlights from our lab testbeds, experiments, field trials, and events.
          </p>
        </section>

        {/* Gallery Content Section */}
        <section className="section">
          {/* Search Toolbar */}
          <div className="toolbar" style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Search gallery by caption or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, maxWidth: '420px' }}
            />
            {filteredItems.length > 0 && (
              <span style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 600 }}>
                {filteredItems.length} {filteredItems.length === 1 ? 'photo' : 'photos'}
              </span>
            )}
          </div>

          {/* Gallery Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No photos found</h3>
              <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                No gallery photos match your search. Try clearing the search term.
              </p>
              {searchTerm && (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredItems.map((item, index) => (
                <article
                  key={item.id}
                  className="gallery-card"
                  onClick={() => setActiveLightboxIndex(index)}
                  tabIndex={0}
                  role="button"
                  aria-label="View photo"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveLightboxIndex(index);
                    }
                  }}
                >
                  <div className="gallery-thumb-container">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || 'Gallery photo'}
                      className="gallery-thumb-img"
                      loading="lazy"
                    />
                    <div className="gallery-overlay">
                      <span style={{ transform: 'scale(1.2)' }}>🔍</span>
                    </div>
                    {item.date && (
                      <span className="gallery-date-badge">{item.date}</span>
                    )}
                  </div>

                  {item.caption && (
                    <div className="gallery-body">
                      <p className="gallery-caption">{item.caption}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Lightbox Modal — Always visible top-right close button without scrolling */}
        {activeItem && activeLightboxIndex !== null && (
          <div
            className="lightbox-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveLightboxIndex(null);
              }
            }}
          >
            {/* Top-Right Fixed Close Button (Always visible on any screen size) */}
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setActiveLightboxIndex(null)}
              aria-label="Close photo viewer"
              title="Close (Esc)"
            >
              ✕
            </button>

            {/* Top-Left Fixed Photo Counter */}
            <div className="lightbox-counter">
              {activeLightboxIndex + 1} / {filteredItems.length}
            </div>

            {/* Previous Button */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn lightbox-prev"
                onClick={() =>
                  setActiveLightboxIndex(
                    activeLightboxIndex > 0
                      ? activeLightboxIndex - 1
                      : filteredItems.length - 1
                  )
                }
                aria-label="Previous photo"
                title="Previous photo (Left arrow)"
              >
                ‹
              </button>
            )}

            {/* Centered Image Content */}
            <div
              className="lightbox-content"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActiveLightboxIndex(null);
                }
              }}
            >
              <div className="lightbox-img-wrapper">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.caption || 'Gallery photo view'}
                  className="lightbox-img"
                />
              </div>
            </div>

            {/* Next Button */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn lightbox-next"
                onClick={() =>
                  setActiveLightboxIndex(
                    activeLightboxIndex < filteredItems.length - 1
                      ? activeLightboxIndex + 1
                      : 0
                  )
                }
                aria-label="Next photo"
                title="Next photo (Right arrow)"
              >
                ›
              </button>
            )}

            {/* Bottom Caption Overlay (if available) */}
            {activeItem.caption && (
              <div className="lightbox-footer">
                <p>{activeItem.caption}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageGuard>
  );
}
