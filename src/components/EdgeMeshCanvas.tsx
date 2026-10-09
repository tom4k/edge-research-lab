'use client';

import React, { useEffect, useRef } from 'react';
import { useData } from '@/context/DataContext';

const PRESET_COLORS: Record<string, { dark: [number, number, number][]; light: [number, number, number][] }> = {
  'cyber-blue': {
    dark: [[13, 99, 255], [19, 200, 194], [139, 92, 246], [56, 189, 248]],
    light: [[13, 99, 255], [15, 160, 155], [99, 102, 241], [2, 132, 199]]
  },
  'emerald-green': {
    dark: [[5, 150, 105], [16, 185, 129], [52, 211, 153], [132, 204, 22]],
    light: [[4, 120, 87], [5, 150, 105], [16, 185, 129], [22, 101, 52]]
  },
  'violet-nebula': {
    dark: [[139, 92, 246], [244, 63, 94], [192, 132, 252], [251, 113, 133]],
    light: [[124, 58, 237], [225, 29, 72], [109, 40, 217], [190, 18, 60]]
  },
  'amber-gold': {
    dark: [[217, 119, 6], [245, 158, 11], [251, 191, 36], [234, 88, 12]],
    light: [[180, 83, 9], [217, 119, 6], [194, 65, 12], [245, 158, 11]]
  },
  'ruby-crimson': {
    dark: [[225, 29, 72], [251, 113, 133], [244, 63, 94], [239, 68, 68]],
    light: [[190, 18, 60], [225, 29, 72], [159, 18, 57], [244, 63, 94]]
  },
  'midnight-cyan': {
    dark: [[6, 182, 212], [56, 189, 248], [14, 165, 233], [45, 212, 191]],
    light: [[8, 145, 178], [2, 132, 199], [13, 148, 136], [56, 189, 248]]
  },
  'forest-pine': {
    dark: [[21, 128, 61], [132, 204, 22], [34, 197, 94], [163, 230, 53]],
    light: [[22, 101, 52], [101, 163, 13], [21, 128, 61], [77, 124, 15]]
  },
  'sunset-coral': {
    dark: [[249, 115, 22], [251, 191, 36], [244, 63, 94], [234, 88, 12]],
    light: [[234, 88, 12], [217, 119, 6], [225, 29, 72], [194, 65, 12]]
  },
  'mono-obsidian': {
    dark: [[56, 189, 248], [148, 163, 184], [203, 213, 225], [94, 234, 212]],
    light: [[2, 132, 199], [71, 85, 105], [100, 116, 139], [15, 118, 110]]
  },
  'synth-indigo': {
    dark: [[79, 70, 229], [236, 72, 153], [129, 140, 248], [244, 114, 182]],
    light: [[67, 56, 202], [219, 39, 119], [79, 70, 229], [190, 24, 93]]
  }
};

function getThemePalette(mode: 'dark' | 'light', preset: string) {
  const presetKey = PRESET_COLORS[preset] ? preset : 'cyber-blue';
  const modeKey = mode === 'light' ? 'light' : 'dark';
  const rgbList = PRESET_COLORS[presetKey][modeKey] || PRESET_COLORS['cyber-blue'][modeKey];
  const colorStrings = rgbList.map(([r, g, b]) => `rgba(${r}, ${g}, ${b}, `);

  const isDark = modeKey === 'dark';
  return {
    isDark,
    colorStrings,
    gridColor: isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(16, 33, 63, 0.055)',
    glowColor: colorStrings[0],
    rippleColor: colorStrings[1] || colorStrings[0],
    particleColor: colorStrings[3] || colorStrings[0],
    canvasOpacity: isDark ? 0.75 : 0.6
  };
}

export function EdgeMeshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data } = useData();

  const currentMode = (data.settings?.themeMode as 'light' | 'dark') || 'dark';
  const currentPreset = data.settings?.themePreset || 'cyber-blue';

  const paletteRef = useRef(getThemePalette(currentMode, currentPreset));
  const beamsRef = useRef<Array<{
    x: number;
    y: number;
    speed: number;
    length: number;
    axis: 'horizontal' | 'vertical';
    colorIndex: number;
  }>>([]);

  // Sync palette whenever mode or preset changes
  useEffect(() => {
    const nextPalette = getThemePalette(currentMode, currentPreset);
    paletteRef.current = nextPalette;
    if (canvasRef.current) {
      canvasRef.current.style.opacity = String(nextPalette.canvasOpacity);
    }
  }, [currentMode, currentPreset]);

  // Also listen to document attribute changes (e.g. for instant theme changes)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const observer = new MutationObserver(() => {
      const mode = (document.documentElement.dataset.theme as 'light' | 'dark') || 'dark';
      const preset = document.documentElement.dataset.themePreset || 'cyber-blue';
      const nextPalette = getThemePalette(mode, preset);
      paletteRef.current = nextPalette;
      if (canvasRef.current) {
        canvasRef.current.style.opacity = String(nextPalette.canvasOpacity);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-theme-preset']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse Tracking with smooth interpolation
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, active: false };
    const ripples: Array<{ x: number; y: number; r: number; maxR: number; opacity: number }> = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      // Spawn subtle pulse ripple on mouse move intermittently
      if (Math.random() < 0.12) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          r: 5,
          maxR: 120 + Math.random() * 80,
          opacity: 0.5
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Scroll Tracking
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Grid / Wave Signal Beams
    const initBeams = () => {
      beamsRef.current = [];
      const count = 14;
      for (let i = 0; i < count; i++) {
        const isHoriz = Math.random() > 0.5;
        beamsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
          length: Math.random() * 180 + 100,
          axis: isHoriz ? 'horizontal' : 'vertical',
          colorIndex: i
        });
      }
    };

    initBeams();

    // Floating Quantum Micro-Particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      vy: -(Math.random() * 0.4 + 0.1),
      vx: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const palette = paletteRef.current;
      const colors = palette.colorStrings;

      // Smooth mouse position
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const currentScroll = scrollY * 0.2;

      // 1. Organic Wave Field (Signal Frequencies)
      const numWaves = 4;
      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        const baseLine = height * (0.25 + w * 0.2) + Math.sin(time + w) * 20;
        const amplitude = 28 + w * 14;
        const frequency = 0.002 + w * 0.001;
        const speed = time * (0.8 + w * 0.3);

        for (let x = 0; x <= width; x += 15) {
          const mDist = Math.hypot(x - mouse.x, baseLine - mouse.y);
          const mFactor = mouse.active && mDist < 200 ? (1 - mDist / 200) * 35 : 0;
          const y = baseLine + Math.sin(x * frequency + speed) * amplitude + Math.cos(x * 0.003 - speed * 0.5) * 15 - mFactor - (currentScroll % 30);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const alpha = palette.isDark ? (0.05 + w * 0.02) : (0.06 + w * 0.025);
        ctx.strokeStyle = colors[w % colors.length] + `${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 2. Dynamic Matrix Grid
      const gridSize = 70;
      const startY = - (currentScroll % gridSize);

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = palette.gridColor;

      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = startY; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Grid Beams (Traveling Energy Pulses)
      const beams = beamsRef.current;
      for (let i = 0; i < beams.length; i++) {
        const b = beams[i];
        const beamColor = colors[b.colorIndex % colors.length];
        const grad = b.axis === 'horizontal' 
          ? ctx.createLinearGradient(b.x, b.y, b.x + b.length, b.y)
          : ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.length);

        grad.addColorStop(0, beamColor + '0)');
        grad.addColorStop(0.5, beamColor + (palette.isDark ? '0.55)' : '0.45)'));
        grad.addColorStop(1, beamColor + '0)');

        ctx.beginPath();
        if (b.axis === 'horizontal') {
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x + b.length, b.y);
          b.x += b.speed;
          if (b.x > width + b.length) b.x = -b.length;
          if (b.x < -b.length) b.x = width + b.length;
        } else {
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x + b.length, b.y);
          b.y += b.speed;
          if (b.y > height + b.length) b.y = -b.length;
          if (b.y < -b.length) b.y = height + b.length;
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 4. Interactive Pulse Ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.r += 2.5;
        rip.opacity -= 0.012;

        if (rip.opacity <= 0 || rip.r >= rip.maxR) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = palette.rippleColor + `${rip.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 5. Mouse Ambient Interactive Glow
      if (mouse.active) {
        const mGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
        mGlow.addColorStop(0, palette.glowColor + (palette.isDark ? '0.14)' : '0.09)'));
        mGlow.addColorStop(0.5, palette.rippleColor + (palette.isDark ? '0.05)' : '0.03)'));
        mGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = mGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Floating Micro-Particles
      for (let p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.pulse += 0.03;

        if (p.y < -10) p.y = height + 10;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = palette.particleColor + `${Math.max(0, currentAlpha)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: paletteRef.current.canvasOpacity,
        transition: 'opacity 0.4s ease'
      }}
    />
  );
}
