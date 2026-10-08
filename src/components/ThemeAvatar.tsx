'use client';

import React, { useState, useEffect } from 'react';
import { removeBackgroundFromImage } from '@/lib/backgroundRemoval';

interface ThemeAvatarProps {
  src?: string;
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

// In-memory cache to prevent re-processing identical image URLs on page re-renders
const processedCache = new Map<string, string>();

export function ThemeAvatar({ src, name, className, style }: ThemeAvatarProps) {
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(src ? processedCache.get(src) || src : undefined);
  const [hasProcessed, setHasProcessed] = useState<boolean>(src ? processedCache.has(src) : false);

  const initials = (nameStr: string) => {
    return (
      nameStr
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join('')
        .toUpperCase() || 'RL'
    );
  };

  useEffect(() => {
    if (!src) {
      setDisplaySrc(undefined);
      return;
    }

    if (processedCache.has(src)) {
      setDisplaySrc(processedCache.get(src));
      setHasProcessed(true);
      return;
    }

    let isMounted = true;
    setDisplaySrc(src);

    // Auto-remove background on display
    removeBackgroundFromImage(src)
      .then(({ dataUrl }) => {
        if (isMounted) {
          processedCache.set(src, dataUrl);
          setDisplaySrc(dataUrl);
          setHasProcessed(true);
        }
      })
      .catch((err) => {
        // If image has CORS restriction or cannot be read on canvas, keep original src
        console.debug('Background removal notice (using original image):', err?.message);
        if (isMounted) {
          setDisplaySrc(src);
          setHasProcessed(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div
      className={`person-visual ${className || ''}`}
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 50% 38%, color-mix(in srgb, var(--primary) 32%, rgba(255, 255, 255, 0.14)) 0%, color-mix(in srgb, var(--primary) 18%, var(--navy)) 48%, var(--surface-soft) 85%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -12px 24px rgba(0, 0, 0, 0.25)',
        ...style
      }}
    >
      {/* Subtle ambient light rings for high-tech research aesthetic */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
          pointerEvents: 'none',
          opacity: 0.6
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '270px',
          height: '270px',
          borderRadius: '50%',
          border: '1px dashed color-mix(in srgb, var(--primary) 15%, transparent)',
          pointerEvents: 'none',
          opacity: 0.4
        }}
      />

      {displaySrc ? (
        <>
          <img
            src={displaySrc}
            alt={name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              transform: 'scale(1.04)',
              filter: 'drop-shadow(0 14px 24px rgba(0, 0, 0, 0.45))',
              transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
          {/* Minimal 8% soft base feather so suit connects cleanly to card */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '24px',
              pointerEvents: 'none',
              background: 'linear-gradient(to top, var(--surface) 0%, transparent 100%)'
            }}
          />
        </>
      ) : (
        <div className="avatar-fallback">{initials(name)}</div>
      )}
    </div>
  );
}
