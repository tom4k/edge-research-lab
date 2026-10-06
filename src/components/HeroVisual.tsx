'use client';

import React, { useEffect, useRef, useState } from 'react';

interface NodeItem {
  id: string;
  label: string;
  sub: string;
  orbit: 'inner' | 'outer';
  angle: number; // initial angle in radians
  speed: number; // rotational speed rad/frame
  icon: string;
  accent: string;
}

export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Nodes configuration
  const [nodes, setNodes] = useState<NodeItem[]>([
    {
      id: 'v2x',
      label: 'V2X Mobility',
      sub: 'Sub-5ms Sync',
      orbit: 'outer',
      angle: 0.2,
      speed: 0.004,
      icon: '🚗',
      accent: '#38bdf8'
    },
    {
      id: 'uav',
      label: 'UAV Aerial',
      sub: 'Dynamic Coverage',
      orbit: 'outer',
      angle: 1.8,
      speed: 0.004,
      icon: '🛸',
      accent: '#10b981'
    },
    {
      id: 'cloud',
      label: 'Cloud Core',
      sub: 'Elastic Scaling',
      orbit: 'outer',
      angle: 3.4,
      speed: 0.004,
      icon: '☁️',
      accent: '#8b5cf6'
    },
    {
      id: 'device',
      label: 'TinyML Device',
      sub: 'Resource-Efficient',
      orbit: 'inner',
      angle: 4.8,
      speed: -0.006,
      icon: '⚡',
      accent: '#f59e0b'
    },
    {
      id: 'fog',
      label: 'Fog Server',
      sub: 'Decentralized',
      orbit: 'inner',
      angle: 1.2,
      speed: -0.006,
      icon: '📡',
      accent: '#ec4899'
    }
  ]);

  // Animation Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          angle: (node.angle + node.speed) % (Math.PI * 2)
        }))
      );
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Dimensions
  const size = 520;
  const center = size / 2;
  const innerRadius = 125;
  const outerRadius = 205;

  return (
    <div
      ref={containerRef}
      className="hero-orbital-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: `${size}px`,
        aspectRatio: '1',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* SVG Canvas for Orbit Rings & Laser Beam Connections */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <defs>
          {/* Radial Glow Gradient for Core */}
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Linear Gradients for Beam Connections */}
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="rgba(13, 99, 255, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />

        {/* Inner Orbit Circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="rgba(19, 200, 194, 0.2)"
          strokeWidth="1.5"
        />

        {/* Core Atmosphere Outer Pulse Ring */}
        <circle
          cx={center}
          cy={center}
          r="72"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1"
          opacity="0.3"
          className="core-pulse-ring"
        />

        {/* Dynamic Beam Connections & Signal Packets */}
        {nodes.map((node) => {
          const r = node.orbit === 'inner' ? innerRadius : outerRadius;
          const nx = center + r * Math.cos(node.angle);
          const ny = center + r * Math.sin(node.angle);
          const isHovered = hoveredNode === node.id;

          // Packet position along the beam (0 to 1)
          const packetProgress = (Date.now() / (isHovered ? 800 : 2000) + (node.id === 'v2x' ? 0.2 : node.id === 'uav' ? 0.5 : 0.8)) % 1;
          const px = center + (nx - center) * packetProgress;
          const py = center + (ny - center) * packetProgress;

          return (
            <g key={node.id}>
              {/* Beam Ray Line */}
              <line
                x1={center}
                y1={center}
                x2={nx}
                y2={ny}
                stroke={isHovered ? node.accent : 'url(#beamGradient)'}
                strokeWidth={isHovered ? '2.5' : '1.5'}
                opacity={isHovered ? 1 : 0.45}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Travelling Data Packet Dot */}
              <circle
                cx={px}
                cy={py}
                r={isHovered ? '4.5' : '3.5'}
                fill={node.accent}
                filter="url(#glow)"
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
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          boxShadow: '0 0 50px rgba(13, 99, 255, 0.6), inset 0 0 20px rgba(255,255,255,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 850,
          zIndex: 10,
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '1rem', letterSpacing: '0.08em', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
          EDGE
        </span>
        <span style={{ fontSize: '0.62rem', opacity: 0.9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          CORE
        </span>
      </div>

      {/* ORBITING NODES CARDS */}
      {nodes.map((node) => {
        const r = node.orbit === 'inner' ? innerRadius : outerRadius;
        const nx = center + r * Math.cos(node.angle);
        const ny = center + r * Math.sin(node.angle);
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
              transform: 'translate(-50%, -50%)',
              zIndex: isHovered ? 20 : 12,
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
                  ? 'color-mix(in srgb, var(--surface) 95%, var(--primary))'
                  : 'color-mix(in srgb, var(--surface) 88%, transparent)',
                border: `1.5px solid ${isHovered ? node.accent : 'var(--line)'}`,
                boxShadow: isHovered
                  ? `0 10px 25px rgba(0,0,0,0.4), 0 0 15px ${node.accent}40`
                  : '0 4px 16px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(12px)',
                color: 'var(--text)',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>{node.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, lineHeight: 1.1 }}>{node.label}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 600 }}>{node.sub}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* FLOATING GLASSMorphism CHIPS */}
      <div
        className="hero-chip-badge chip-top-right"
        style={{
          position: 'absolute',
          right: '-10px',
          top: '15px',
          padding: '10px 16px',
          borderRadius: '14px',
          background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
          border: '1px solid color-mix(in srgb, var(--primary) 30%, var(--line))',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          fontSize: '0.78rem',
          fontWeight: 750,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text)',
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
          left: '-10px',
          bottom: '25px',
          padding: '10px 16px',
          borderRadius: '14px',
          background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, var(--line))',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          fontSize: '0.78rem',
          fontWeight: 750,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text)',
          zIndex: 15
        }}
      >
        <span className="live-dot accent" />
        Adaptive Orchestration
      </div>
    </div>
  );
}
