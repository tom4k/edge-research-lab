'use client';

import React from 'react';

interface ThemeAvatarProps {
  src?: string;
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ThemeAvatar({ src, name, className, style }: ThemeAvatarProps) {
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

  return (
    <div
      className={`person-visual ${className || ''}`}
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        background: 'var(--surface-soft, rgba(255, 255, 255, 0.04))',
        ...style
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      ) : (
        <div className="avatar-fallback">{initials(name)}</div>
      )}
    </div>
  );
}
