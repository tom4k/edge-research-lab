'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';
import { GalleryItem } from '@/lib/types';

export default function GalleryPage() {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const galleryItems: GalleryItem[] = data.gallery || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const list = Array.from(
      new Set(galleryItems.map((item) => item.category?.trim()).filter(Boolean) as string[])
    );
    return ['All', ...list];
  }, [galleryItems]);

  // Filter gallery items
  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return galleryItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category?.trim() === selectedCategory;
      const matchesQuery =
        !q ||
        `${item.title} ${item.caption || ''} ${item.category || ''} ${item.date || ''}`
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [galleryItems, searchTerm, selectedCategory]);

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

  const activeItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  return (
    <PageGuard pageKey="gallery" title="Gallery">
      <div className="page">
        {/* Page Heading */}
        <section className="page-heading">
          <span className="eyebrow">Lab Moments & Infrastructure</span>
          <h1>Research Gallery</h1>
          <p>
            Visual highlights of our hardware testbeds, field deployments, student life, research demonstrations, and academic conferences.
          </p>
        </section>

        {/* Gallery Content Section */}
        <section className="section">
          {/* Controls: Search and Category Filter */}
          <div className="toolbar" style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Search gallery by title, category, or caption..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '240px' }}
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: 'auto', minWidth: '160px' }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills Bar */}
          {categories.length > 2 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '1.75rem'
              }}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`button button-small ${isSelected ? '' : 'button-outline'}`}
                    style={{
                      borderRadius: '999px',
                      padding: '5px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 650,
                      borderColor: isSelected ? 'var(--primary)' : 'var(--line)',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--muted)'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Gallery Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No photos found</h3>
              <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                No gallery entries matched your current search or category filter. Try clearing the filter or search term.
              </p>
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                >
                  Reset filters
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
                  aria-label={`View photo: ${item.title}`}
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
                      alt={item.title}
                      className="gallery-thumb-img"
                      loading="lazy"
                    />
                    <div className="gallery-overlay">
                      <span style={{ transform: 'scale(1.2)' }}>🔍</span>
                    </div>
                    {item.category && (
                      <span className="gallery-badge">{item.category}</span>
                    )}
                    {item.date && (
                      <span className="gallery-date-badge">{item.date}</span>
                    )}
                  </div>

                  <div className="gallery-body">
                    <h3 className="gallery-title">{item.title}</h3>
                    {item.caption && (
                      <p className="gallery-caption">{item.caption}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Lightbox Modal */}
        {activeItem && activeLightboxIndex !== null && (
          <div
            className="lightbox-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveLightboxIndex(null);
              }
            }}
          >
            <div className="lightbox-topbar">
              <div>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  {activeLightboxIndex + 1} of {filteredItems.length}
                </span>
                {activeItem.category && (
                  <span
                    style={{
                      marginLeft: '12px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {activeItem.category}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="button button-small button-outline"
                onClick={() => setActiveLightboxIndex(null)}
                style={{
                  color: '#fff',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  padding: '4px 12px',
                  borderRadius: '6px'
                }}
                aria-label="Close lightbox"
              >
                ✕ Close (Esc)
              </button>
            </div>

            <div className="lightbox-content">
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
                >
                  ‹
                </button>
              )}

              <div className="lightbox-img-wrapper">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="lightbox-img"
                />
              </div>

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
                >
                  ›
                </button>
              )}
            </div>

            <div className="lightbox-footer">
              <h3 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.2rem' }}>
                {activeItem.title}
              </h3>
              {activeItem.date && (
                <div style={{ color: '#9fb0c8', fontSize: '0.8rem', marginBottom: '8px' }}>
                  📅 {activeItem.date}
                </div>
              )}
              {activeItem.caption && (
                <p style={{ color: '#dbe3ee', margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
                  {activeItem.caption}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </PageGuard>
  );
}
