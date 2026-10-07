'use client';

import React, { useEffect, useRef } from 'react';

export function EdgeMeshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    interface Beam {
      x: number;
      y: number;
      speed: number;
      length: number;
      axis: 'horizontal' | 'vertical';
      color: string;
    }

    const beams: Beam[] = [];
    const colors = ['rgba(13, 99, 255, ', 'rgba(19, 200, 194, ', 'rgba(139, 92, 246, ', 'rgba(56, 189, 248, '];

    const initBeams = () => {
      beams.length = 0;
      const count = 14;
      for (let i = 0; i < count; i++) {
        const isHoriz = Math.random() > 0.5;
        beams.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
          length: Math.random() * 180 + 100,
          axis: isHoriz ? 'horizontal' : 'vertical',
          color: colors[i % colors.length]
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

        const alpha = 0.05 + w * 0.02;
        ctx.strokeStyle = colors[w % colors.length] + `${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 2. Dynamic Matrix Grid
      const gridSize = 70;
      const startY = - (currentScroll % gridSize);

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';

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
      for (let i = 0; i < beams.length; i++) {
        const b = beams[i];
        const grad = b.axis === 'horizontal' 
          ? ctx.createLinearGradient(b.x, b.y, b.x + b.length, b.y)
          : ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.length);

        grad.addColorStop(0, b.color + '0)');
        grad.addColorStop(0.5, b.color + '0.5)');
        grad.addColorStop(1, b.color + '0)');

        ctx.beginPath();
        if (b.axis === 'horizontal') {
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x + b.length, b.y);
          b.x += b.speed;
          if (b.x > width + b.length) b.x = -b.length;
          if (b.x < -b.length) b.x = width + b.length;
        } else {
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x, b.y + b.length);
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
        ctx.strokeStyle = `rgba(19, 200, 194, ${rip.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 5. Mouse Ambient Interactive Glow
      if (mouse.active) {
        const mGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
        mGlow.addColorStop(0, 'rgba(13, 99, 255, 0.14)');
        mGlow.addColorStop(0.5, 'rgba(19, 200, 194, 0.05)');
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
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0, currentAlpha)})`;
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
        opacity: 0.75
      }}
    />
  );
}
