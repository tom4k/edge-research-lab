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
      className={`person-visual ${!src ? 'has-fallback' : ''} ${className || ''}`}
      style={style}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
        />
      ) : (
        <div className="avatar-fallback">{initials(name)}</div>
      )}
    </div>
  );
}
