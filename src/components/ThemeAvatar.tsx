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
          'radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--primary) 22%, var(--surface-soft)), color-mix(in srgb, var(--navy) 45%, var(--surface-soft)))',
        ...style
      }}
    >
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
              transform: 'scale(1.02)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
          {/* Subtle bottom vignette to blend seamlessly into card surface */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(to top, var(--surface) 0%, transparent 35%)'
            }}
          />
        </>
      ) : (
        <div className="avatar-fallback">{initials(name)}</div>
      )}
    </div>
  );
}
