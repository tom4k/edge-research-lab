'use client';

import React, { useEffect, useRef } from 'react';

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
  label?: string;
}

interface DataPacket {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

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

    // Mouse Tracking
    const mouse = { x: -1000, y: -1000, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Scroll Tracking for Field Shift
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Generate Edge Computing Mesh Nodes
    const count = Math.min(Math.floor((width * height) / 18000), 75);
    const colors = ['#0d63ff', '#13c8c2', '#38bdf8', '#8b5cf6', '#10b981'];

    const nodes: ParticleNode[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2.5 + 2,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      color: colors[i % colors.length],
      label: i % 8 === 0 ? ['UAV', 'V2X', 'TinyML', 'Edge AI', 'Fog', 'Cloud'][i % 6] : undefined
    }));

    // Data Packets traversing the mesh
    const packets: DataPacket[] = [];
    const maxPackets = 18;

    const spawnPacket = () => {
      if (packets.length >= maxPackets) return;
      const fromIdx = Math.floor(Math.random() * nodes.length);
      // Find a nearby node to send packet to
      let toIdx = (fromIdx + 1) % nodes.length;
      let minDist = Infinity;

      for (let j = 0; j < nodes.length; j++) {
        if (j === fromIdx) continue;
        const dx = nodes[j].x - nodes[fromIdx].x;
        const dy = nodes[j].y - nodes[fromIdx].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist < minDist) {
          minDist = dist;
          toIdx = j;
        }
      }

      if (minDist < 180) {
        packets.push({
          fromNode: fromIdx,
          toNode: toIdx,
          progress: 0,
          speed: 0.008 + Math.random() * 0.012,
          color: nodes[fromIdx].color
        });
      }
    };

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Periodically spawn data packets
      if (Math.random() < 0.1) {
        spawnPacket();
      }

      const scrollOffset = scrollY * 0.15;

      // Update and Draw Connections
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // Move Nodes
        n1.x += n1.vx;
        n1.y += n1.vy;
        n1.pulsePhase += n1.pulseSpeed;

        // Bounce from Boundaries
        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        // Mouse Interactivity (Mild Repulsion/Glow)
        if (mouse.active) {
          const mdx = n1.x - mouse.x;
          const mdy = n1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const force = (140 - mdist) / 140;
            n1.x += (mdx / mdist) * force * 1.5;
            n1.y += (mdy / mdist) * force * 1.5;
          }
        }

        const renderY1 = (n1.y - scrollOffset + height * 5) % height;

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const renderY2 = (n2.y - scrollOffset + height * 5) % height;
          const dx = n2.x - n1.x;
          const dy = renderY2 - renderY1;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.25;
            ctx.beginPath();
            ctx.moveTo(n1.x, renderY1);
            ctx.lineTo(n2.x, renderY2);
            ctx.strokeStyle = `rgba(13, 99, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw Data Packets
      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p];
        pkt.progress += pkt.speed;

        if (pkt.progress >= 1) {
          packets.splice(p, 1);
          continue;
        }

        const n1 = nodes[pkt.fromNode];
        const n2 = nodes[pkt.toNode];
        if (!n1 || !n2) continue;

        const y1 = (n1.y - scrollOffset + height * 5) % height;
        const y2 = (n2.y - scrollOffset + height * 5) % height;

        const px = n1.x + (n2.x - n1.x) * pkt.progress;
        const py = y1 + (y2 - y1) * pkt.progress;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = pkt.color;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const renderY = (n.y - scrollOffset + height * 5) % height;
        const pulse = Math.sin(n.pulsePhase) * 0.8;
        const currentRadius = Math.max(1, n.radius + pulse);

        // Node Glow Outer Ring
        ctx.beginPath();
        ctx.arc(n.x, renderY, currentRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}20`;
        ctx.fill();

        // Core Node
        ctx.beginPath();
        ctx.arc(n.x, renderY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label if present
        if (n.label) {
          ctx.font = '700 10px Inter, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(n.label, n.x + 10, renderY + 4);
        }
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
        opacity: 0.65
      }}
    />
  );
}
