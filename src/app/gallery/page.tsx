'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';
import { GalleryItem } from '@/lib/types';

export default function GalleryPage() {
  const { data } = useData();
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const galleryItems: GalleryItem[] = data.gallery || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev !== null && prev < galleryItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : galleryItems.length - 1
        );
      }
    },
    [activeLightboxIndex, galleryItems.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox is open
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

  const activeItem = activeLightboxIndex !== null ? galleryItems[activeLightboxIndex] : null;

  return (
    <PageGuard pageKey="gallery" title="Gallery">
      <div className="page">
        {/* Page Heading */}
        <section className="page-heading">
          <span className="eyebrow">Visual Highlights</span>
          <h1>Gallery</h1>
          <p>
            Photographs from our lab testbeds, deployments, field trials, and events.
          </p>
        </section>

        {/* Pure Image Gallery Grid */}
        <section className="section">
          {galleryItems.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No photos available</h3>
              <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                The lab gallery has no images yet.
              </p>
            </div>
          ) : (
            <div className="gallery-grid">
              {galleryItems.map((item, index) => (
                <article
                  key={item.id}
                  className="gallery-card"
                  onClick={() => setActiveLightboxIndex(index)}
                  tabIndex={0}
                  role="button"
                  aria-label="View large photo"
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
                      alt="Gallery photograph"
                      className="gallery-thumb-img"
                      loading="lazy"
                    />
                    <div className="gallery-overlay">
                      <span>🔍</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Lightbox Modal — Rendered via Portal directly to body to bypass any ancestor stacking contexts */}
        {mounted &&
          activeItem &&
          activeLightboxIndex !== null &&
          createPortal(
            <div
              className="lightbox-backdrop"
              onClick={() => setActiveLightboxIndex(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Photo viewer"
            >
              {/* Close Button — Permanently visible at top right */}
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex(null);
                }}
                aria-label="Close photo viewer"
                title="Close (Esc)"
              >
                ✕
              </button>

              {/* Previous Button */}
              {galleryItems.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLightboxIndex(
                      activeLightboxIndex > 0
                        ? activeLightboxIndex - 1
                        : galleryItems.length - 1
                    );
                  }}
                  aria-label="Previous photo"
                  title="Previous (Left arrow)"
                >
                  ‹
                </button>
              )}

              {/* Centered Large Image */}
              <div
                className="lightbox-content"
                onClick={() => setActiveLightboxIndex(null)}
              >
                <div
                  className="lightbox-img-wrapper"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={activeItem.imageUrl}
                    alt="Gallery photo large view"
                    className="lightbox-img"
                  />
                </div>
              </div>

              {/* Next Button */}
              {galleryItems.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLightboxIndex(
                      activeLightboxIndex < galleryItems.length - 1
                        ? activeLightboxIndex + 1
                        : 0
                    );
                  }}
                  aria-label="Next photo"
                  title="Next (Right arrow)"
                >
                  ›
                </button>
              )}
            </div>,
            document.body
          )}
      </div>
    </PageGuard>
  );
}
