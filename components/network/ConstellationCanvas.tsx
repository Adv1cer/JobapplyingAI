'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
  pulseSpeed: number;
  depth: number; // 0.4–1.0 — simulates z-depth (slower = farther)
}

export default function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const pts: Particle[] = [];
    const N = 95;
    const LINK_DIST = 160;
    const MOUSE_DIST = 200;
    const MOUSE_REPEL = 55; // radius where particles get pushed away

    function init() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
      pts.length = 0;
      for (let i = 0; i < N; i++) {
        const depth = 0.35 + Math.random() * 0.65;
        pts.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * 0.45 * depth,
          vy: (Math.random() - 0.5) * 0.45 * depth,
          r: (Math.random() * 1.2 + 0.5) * depth,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.014,
          depth,
        });
      }
    }

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      ctx!.clearRect(0, 0, W, H);

      // Update positions + soft mouse repulsion
      for (const p of pts) {
        const dxm = p.x - mx;
        const dym = p.y - my;
        const dm  = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < MOUSE_REPEL && dm > 0) {
          const force = (1 - dm / MOUSE_REPEL) * 0.6;
          p.vx += (dxm / dm) * force;
          p.vy += (dym / dm) * force;
        }

        // Velocity cap to keep it smooth
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = 1.8 * p.depth;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        // Wrap edges (seamless)
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }

      // Particle–particle lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const avgDepth = (pts[i].depth + pts[j].depth) * 0.5;
            const alpha = (1 - d / LINK_DIST) * 0.45 * avgDepth;
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            ctx!.strokeStyle = `rgba(80,140,255,${alpha})`;
            ctx!.lineWidth = 0.6 * avgDepth;
            ctx!.stroke();
          }
        }
      }

      // Mouse–particle lines (Plexus highlight)
      for (const p of pts) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_DIST) {
          const alpha = (1 - d / MOUSE_DIST) * 0.55 * p.depth;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(mx, my);
          ctx!.strokeStyle = `rgba(120,180,255,${alpha})`;
          ctx!.lineWidth = 0.7 * p.depth;
          ctx!.stroke();
        }
      }

      // Draw particles
      for (const p of pts) {
        const breathe = 0.78 + 0.22 * Math.sin(p.pulse);
        const glowR   = p.r * 6 * breathe;

        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        g.addColorStop(0,   `rgba(160,200,255,${0.6  * breathe * p.depth})`);
        g.addColorStop(0.4, `rgba(80,140,255,${0.22 * breathe * p.depth})`);
        g.addColorStop(1,   'rgba(40,90,200,0)');
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx!.fillStyle = g;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * breathe, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(210,230,255,${0.85 * breathe * p.depth})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    init();
    draw();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    const onResize = () => init();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
