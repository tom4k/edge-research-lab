'use client';

import React, { useEffect, useRef, useState } from 'react';

interface NodeItem {
  id: string;
  label: string;
  sub: string;
  orbit: 'inner' | 'outer';
  baseAngle: number;
  icon: string;
  accent: string;
}

export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Scroll & Mouse Interactivity States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  const nodes: NodeItem[] = [
    {
      id: 'v2x',
      label: 'V2X Mobility',
      sub: 'Sub-5ms Sync',
      orbit: 'outer',
      baseAngle: 0.15,
      icon: '🚗',
      accent: '#38bdf8'
    },
    {
      id: 'uav',
      label: 'UAV Aerial',
      sub: 'Dynamic Coverage',
      orbit: 'outer',
      baseAngle: 1.85,
      icon: '🛸',
      accent: '#10b981'
    },
    {
      id: 'cloud',
      label: 'Cloud Core',
      sub: 'Elastic Scaling',
      orbit: 'outer',
      baseAngle: 3.45,
      icon: '☁️',
      accent: '#8b5cf6'
    },
    {
      id: 'device',
      label: 'TinyML Device',
      sub: 'Resource-Efficient',
      orbit: 'inner',
      baseAngle: 4.85,
      icon: '⚡',
      accent: '#f59e0b'
    },
    {
      id: 'fog',
      label: 'Fog Server',
      sub: 'Decentralized',
      orbit: 'inner',
      baseAngle: 1.15,
      icon: '📡',
      accent: '#ec4899'
    }
  ];

  // Smooth Scroll & RAF Physics Listener
  useEffect(() => {
    let targetScroll = 0;
    let currentScroll = 0;
    let animId: number;

    const handleScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop;
      targetScroll = Math.min(Math.max(top / 450, 0), 1);
    };

    const updatePhysics = () => {
      // Lerp for liquid-smooth scroll interpolation
      currentScroll += (targetScroll - currentScroll) * 0.08;
      setScrollProgress(currentScroll);
      animId = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    animId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Mouse Parallax Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // -10 to +10 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20; // -10 to +10 deg
    setMouseTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setHoveredNode(null);
  };

  // Dimensions & Dynamic Radii based on Scroll
  const size = 520;
  const center = size / 2;

  // As user scrolls down, orbits expand outward dynamically!
  const innerRadius = 75 + scrollProgress * 55; // 75px -> 130px
  const outerRadius = 120 + scrollProgress * 88; // 120px -> 208px

  // Dynamic 3D tilt perspective (scroll + mouse interaction)
  const tiltX = mouseTilt.y + (16 - scrollProgress * 16);
  const tiltY = mouseTilt.x;
  const scale = 0.9 + scrollProgress * 0.15;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hero-scroll-visual-shell"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: `${size}px`,
        aspectRatio: '1',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
        userSelect: 'none'
      }}
    >
      {/* 3D TRANSFORM CONTAINER DRIVEN BY SCROLL */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`,
          transition: 'transform 0.1s cubic-bezier(0.1, 0.9, 0.2, 1)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* SVG Canvas for Orbit Rings & Dynamic Laser Beams */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="scrollCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
              <stop offset="70%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="scrollBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.85" />
              <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.25" />
            </linearGradient>

            <filter id="scrollGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Orbit Ring (Expands with Scroll) */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="rgba(13, 99, 255, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            style={{ transition: 'r 0.1s ease-out' }}
          />

          {/* Inner Orbit Ring (Expands with Scroll) */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke="rgba(19, 200, 194, 0.25)"
            strokeWidth="1.5"
            style={{ transition: 'r 0.1s ease-out' }}
          />

          {/* Core Atmosphere Pulse Rings */}
          <circle
            cx={center}
            cy={center}
            r={45 + scrollProgress * 25}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            opacity={0.3 + scrollProgress * 0.3}
            className="core-pulse-ring"
          />

          {/* Laser Beams & Pulsing Signal Packets to Orbit Nodes */}
          {nodes.map((node) => {
            const r = node.orbit === 'inner' ? innerRadius : outerRadius;
            // Scroll drives continuous rotation around orbits!
            const angle = node.baseAngle + scrollProgress * Math.PI * 0.75 * (node.orbit === 'outer' ? 1 : -1);
            const nx = center + r * Math.cos(angle);
            const ny = center + r * Math.sin(angle);
            const isHovered = hoveredNode === node.id;

            // Packet position along the beam ray (0 to 1)
            const packetProgress = (Date.now() / (isHovered ? 700 : 1800) + (node.id === 'v2x' ? 0.2 : node.id === 'uav' ? 0.55 : 0.85)) % 1;
            const px = center + (nx - center) * packetProgress;
            const py = center + (ny - center) * packetProgress;

            return (
              <g key={node.id}>
                {/* Connecting Laser Beam Line */}
                <line
                  x1={center}
                  y1={center}
                  x2={nx}
                  y2={ny}
                  stroke={isHovered ? node.accent : 'url(#scrollBeamGradient)'}
                  strokeWidth={isHovered ? '2.5' : '1.5'}
                  opacity={0.35 + scrollProgress * 0.55}
                  style={{ transition: 'stroke-width 0.2s ease, stroke 0.2s ease' }}
                />

                {/* Signal Packet Laser Dot */}
                <circle
                  cx={px}
                  cy={py}
                  r={isHovered ? '5' : '3.5'}
                  fill={node.accent}
                  filter="url(#scrollGlow)"
                />
              </g>
            );
          })}
        </svg>

        {/* CENTRAL GLOWING EDGE CORE */}
        <div
          className="hero-edge-core"
          style={{
            position: 'absolute',
            width: `${85 + scrollProgress * 25}px`,
            height: `${85 + scrollProgress * 25}px`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: `0 0 ${40 + scrollProgress * 30}px rgba(13, 99, 255, 0.7), inset 0 0 25px rgba(255,255,255,0.45)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 850,
            zIndex: 10,
            cursor: 'pointer',
            transition: 'width 0.1s ease, height 0.1s ease, box-shadow 0.1s ease'
          }}
        >
          <span style={{ fontSize: '1.05rem', letterSpacing: '0.08em', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            EDGE
          </span>
          <span style={{ fontSize: '0.64rem', opacity: 0.9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            INTELLIGENCE
          </span>
        </div>

        {/* SCROLL-EXPANDING SATELLITE NODES */}
        {nodes.map((node) => {
          const r = node.orbit === 'inner' ? innerRadius : outerRadius;
          const angle = node.baseAngle + scrollProgress * Math.PI * 0.75 * (node.orbit === 'outer' ? 1 : -1);
          const nx = center + r * Math.cos(angle);
          const ny = center + r * Math.sin(angle);
          const isHovered = hoveredNode === node.id;

          return (
            <div
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                position: 'absolute',
                left: `${nx}px`,
                top: `${ny}px`,
                transform: `translate(-50%, -50%) scale(${0.85 + scrollProgress * 0.15})`,
                opacity: 0.4 + scrollProgress * 0.6,
                zIndex: isHovered ? 25 : 12,
                cursor: 'pointer',
                transition: 'transform 0.15s ease-out, opacity 0.15s ease-out'
              }}
            >
              <div
                className="hero-orbital-node"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '16px',
                  background: isHovered
                    ? 'color-mix(in srgb, var(--surface) 96%, var(--primary))'
                    : 'color-mix(in srgb, var(--surface) 88%, transparent)',
                  border: `1.5px solid ${isHovered ? node.accent : 'var(--line)'}`,
                  boxShadow: isHovered
                    ? `0 12px 28px rgba(0,0,0,0.4), 0 0 18px ${node.accent}50`
                    : '0 4px 18px rgba(0,0,0,0.22)',
                  backdropFilter: 'blur(12px)',
                  color: 'var(--text)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '1.15rem' }}>{node.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, lineHeight: 1.1 }}>{node.label}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 600 }}>{node.sub}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* DYNAMIC SCROLL CHIPS */}
        <div
          className="hero-chip-badge chip-top-right"
          style={{
            position: 'absolute',
            right: '-15px',
            top: `${10 - scrollProgress * 15}px`,
            padding: '10px 16px',
            borderRadius: '14px',
            background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 35%, var(--line))',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
            fontSize: '0.78rem',
            fontWeight: 750,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text)',
            opacity: 0.6 + scrollProgress * 0.4,
            transform: `translateY(${-scrollProgress * 20}px)`,
            zIndex: 15
          }}
        >
          <span className="live-dot" />
          Distributed Intelligence
        </div>

        <div
          className="hero-chip-badge chip-bottom-left"
          style={{
            position: 'absolute',
            left: '-15px',
            bottom: `${20 - scrollProgress * 15}px`,
            padding: '10px 16px',
            borderRadius: '14px',
            background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 35%, var(--line))',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
            fontSize: '0.78rem',
            fontWeight: 750,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text)',
            opacity: 0.6 + scrollProgress * 0.4,
            transform: `translateY(${scrollProgress * 20}px)`,
            zIndex: 15
          }}
        >
          <span className="live-dot accent" />
          Adaptive Orchestration
        </div>
      </div>

      {/* SCROLL INDICATION BADGE AT BOTTOM OF HERO GRAPHIC */}
      <div
        style={{
          position: 'absolute',
          bottom: '-35px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          opacity: Math.max(1 - scrollProgress * 2.5, 0),
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none'
        }}
      >
        <span>Scroll to expand network topology</span>
        <span style={{ fontSize: '0.9rem', animation: 'bounceDown 1.5s infinite' }}>↓</span>
      </div>
    </div>
  );
}
