'use client';

import { useEffect, useRef } from 'react';

export type JobAccent = 'teal' | 'blue' | 'violet' | 'rose' | 'amber' | 'cyan';
export type JobType   = 'full-time' | 'remote' | 'hybrid' | 'contract';

export interface JobData {
  id: string;
  company: string;
  role: string;
  location: string;
  type: JobType;
  salary: string;
  tags: string[];
  postedAgo: string;
  accent: JobAccent;
  urgent?: boolean;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  pulse: number; pulseSpeed: number;
  depth: number;
}

interface JobParticle extends Particle {
  job: JobData;
}

interface Props {
  jobs: JobData[];
  onSelect: (job: JobData, sx: number, sy: number) => void;
}

const ACCENT_RGB: Record<JobAccent, [number, number, number]> = {
  teal:   [45,  212, 191],
  blue:   [96,  165, 250],
  violet: [167, 139, 250],
  rose:   [251, 113, 133],
  amber:  [251, 191, 36],
  cyan:   [34,  211, 238],
};

export default function PlexusNetwork({ jobs, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const dragRef   = useRef({ active: false, idx: -1, moved: false });
  // stable refs so event closures never go stale
  const jobsRef     = useRef(jobs);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { jobsRef.current     = jobs;     }, [jobs]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    let raf = 0;

    const BG_N       = 65;
    const BG_LINK    = 165;
    const JOB_LINK   = 260;
    const CROSS_LINK = 125;
    const M_DIST     = 210;
    const M_REPEL    = 65;

    let bg: Particle[]    = [];
    let jp: JobParticle[] = [];

    // ── init ────────────────────────────────────────────────────────────
    function initBg(W: number, H: number) {
      bg = [];
      for (let i = 0; i < BG_N; i++) {
        const d = 0.35 + Math.random() * 0.65;
        bg.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.38 * d,
          vy: (Math.random() - 0.5) * 0.38 * d,
          r: (Math.random() * 1.1 + 0.5) * d,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.014,
          depth: d,
        });
      }
    }

    function initJobs(W: number, H: number) {
      // grid-place so nodes spread across full canvas, not clumped
      const COLS = Math.ceil(Math.sqrt(jobsRef.current.length * (W / H)));
      const ROWS = Math.ceil(jobsRef.current.length / COLS);
      jp = jobsRef.current.map((job, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x   = ((col + 0.25 + Math.random() * 0.5) / COLS) * W;
        const y   = ((row + 0.25 + Math.random() * 0.5) / ROWS) * H;
        const d   = 0.72 + Math.random() * 0.28;
        return {
          x, y,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: 5.2 + Math.random() * 2.3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.007 + Math.random() * 0.012,
          depth: d,
          job,
        };
      });
    }

    function setup() {
      const W = (canvas.width  = window.innerWidth);
      const H = (canvas.height = window.innerHeight);
      initBg(W, H);
      if (jp.length === 0) initJobs(W, H);
    }
    setup();

    // ── physics helpers ─────────────────────────────────────────────────
    function repel(p: Particle) {
      const { x: mx, y: my } = mouseRef.current;
      const dx = p.x - mx, dy = p.y - my;
      const d  = Math.hypot(dx, dy);
      if (d < M_REPEL && d > 0) {
        const f = (1 - d / M_REPEL) * 0.72;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }

    function cap(p: Particle, max: number) {
      const s = Math.hypot(p.vx, p.vy);
      if (s > max) { p.vx = (p.vx / s) * max; p.vy = (p.vy / s) * max; }
    }

    function wrap(p: Particle, W: number, H: number) {
      if (p.x < -12) p.x = W + 12;  else if (p.x > W + 12) p.x = -12;
      if (p.y < -12) p.y = H + 12;  else if (p.y > H + 12) p.y = -12;
    }

    // ── draw loop ────────────────────────────────────────────────────────
    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // update bg
      for (const p of bg) {
        repel(p); cap(p, 0.55 * p.depth);
        p.x += p.vx; p.y += p.vy; p.pulse += p.pulseSpeed;
        wrap(p, W, H);
      }

      // update job particles — hover damping makes them stoppable for clicks
      const { x: hmx, y: hmy } = mouseRef.current;
      for (let i = 0; i < jp.length; i++) {
        const p = jp[i];
        if (dragRef.current.active && dragRef.current.idx === i) continue;
        // slow down nodes near the cursor so they're easy to click
        const hd = Math.hypot(p.x - hmx, p.y - hmy);
        if (hd < p.r * 4 + 12) {
          p.vx *= 0.78;
          p.vy *= 0.78;
        }
        cap(p, 0.48);
        p.x += p.vx; p.y += p.vy; p.pulse += p.pulseSpeed;
        wrap(p, W, H);
      }

      // ── lines: bg-bg ─────────────────────────────────────────────────
      for (let i = 0; i < bg.length; i++) {
        for (let j = i + 1; j < bg.length; j++) {
          const a = bg[i], b = bg[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d >= BG_LINK) continue;
          const alpha = (1 - d / BG_LINK) * 0.42 * (a.depth + b.depth) * 0.5;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(80,140,255,${alpha})`;
          ctx.lineWidth = 0.55; ctx.stroke();
        }
      }

      // ── lines: job–bg cross (makes jobs part of the web) ────────────
      for (const jp_ of jp) {
        for (const b of bg) {
          const d = Math.hypot(jp_.x - b.x, jp_.y - b.y);
          if (d >= CROSS_LINK) continue;
          const alpha = (1 - d / CROSS_LINK) * 0.28 * b.depth;
          ctx.beginPath(); ctx.moveTo(jp_.x, jp_.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(100,160,255,${alpha})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }

      // ── lines: job–job (bright) ───────────────────────────────────────
      for (let i = 0; i < jp.length; i++) {
        for (let j = i + 1; j < jp.length; j++) {
          const a = jp[i], b = jp[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d >= JOB_LINK) continue;
          const t = 1 - d / JOB_LINK;
          // glow
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(59,130,246,${t * 0.28})`; ctx.lineWidth = 4; ctx.stroke();
          // core
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(186,219,255,${t * 0.62})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }

      // ── mouse lines ──────────────────────────────────────────────────
      const { x: mx, y: my } = mouseRef.current;
      for (const p of bg) {
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d >= M_DIST) continue;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my);
        ctx.strokeStyle = `rgba(120,180,255,${(1 - d / M_DIST) * 0.5 * p.depth})`;
        ctx.lineWidth = 0.6; ctx.stroke();
      }
      for (const p of jp) {
        const d = Math.hypot(p.x - mx, p.y - my);
        const md = M_DIST * 1.4;
        if (d >= md) continue;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my);
        ctx.strokeStyle = `rgba(120,180,255,${(1 - d / md) * 0.42})`;
        ctx.lineWidth = 0.65; ctx.stroke();
      }

      // ── draw bg dots ─────────────────────────────────────────────────
      for (const p of bg) {
        const breathe = 0.78 + 0.22 * Math.sin(p.pulse);
        const gr = p.r * 6 * breathe;
        const g  = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
        g.addColorStop(0,   `rgba(160,200,255,${0.55 * breathe * p.depth})`);
        g.addColorStop(0.4, `rgba(80,140,255,${0.2  * breathe * p.depth})`);
        g.addColorStop(1,   'rgba(40,90,200,0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * breathe, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,230,255,${0.82 * breathe * p.depth})`; ctx.fill();
      }

      // ── draw job nodes ───────────────────────────────────────────────
      const hoveredIdx = getJobAt(mx, my);
      for (let i = 0; i < jp.length; i++) {
        const p = jp[i];
        const [r, g_, b_] = ACCENT_RGB[p.job.accent];
        const hovered  = i === hoveredIdx;
        const breathe  = 0.82 + 0.18 * Math.sin(p.pulse);
        const nr = p.r * breathe * (hovered ? 1.25 : 1);
        const gr = nr * 5.5;

        // outer glow halo
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
        grd.addColorStop(0,    `rgba(${r},${g_},${b_},${0.48 * breathe})`);
        grd.addColorStop(0.45, `rgba(${r},${g_},${b_},${0.14 * breathe})`);
        grd.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();

        // node body
        ctx.beginPath(); ctx.arc(p.x, p.y, nr, 0, Math.PI * 2);
        ctx.fillStyle   = `rgb(${r},${g_},${b_})`;
        ctx.strokeStyle = `rgba(255,255,255,${hovered ? 0.85 : 0.6})`;
        ctx.lineWidth   = hovered ? 1.8 : 1.2;
        ctx.fill(); ctx.stroke();

        // bright inner core
        ctx.beginPath(); ctx.arc(p.x, p.y, nr * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();

        // urgent pulse ring
        if (p.job.urgent) {
          const rt = Math.abs(Math.sin(p.pulse * 1.6));
          ctx.beginPath(); ctx.arc(p.x, p.y, nr + 4 + 3 * rt, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r},${g_},${b_},${0.5 * rt})`;
          ctx.lineWidth = 1.5; ctx.stroke();
        }
      }

      // update cursor
      canvas.style.cursor = hoveredIdx >= 0 ? 'pointer' : 'default';

      raf = requestAnimationFrame(draw);
    }

    draw();

    // ── hit test ─────────────────────────────────────────────────────────
    function getJobAt(cx: number, cy: number): number {
      for (let i = jp.length - 1; i >= 0; i--) {
        if (Math.hypot(jp[i].x - cx, jp[i].y - cy) < jp[i].r * 2.8 + 4) return i;
      }
      return -1;
    }

    // ── event listeners ──────────────────────────────────────────────────
    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (dragRef.current.active) {
        const p = jp[dragRef.current.idx];
        p.x = e.clientX; p.y = e.clientY;
        p.vx = 0; p.vy = 0;
        dragRef.current.moved = true;
      }
    }

    function onLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    function onDown(e: MouseEvent) {
      const idx = getJobAt(e.clientX, e.clientY);
      if (idx >= 0) {
        dragRef.current = { active: true, idx, moved: false };
        e.stopPropagation();
      }
    }

    function onUp(e: MouseEvent) {
      if (!dragRef.current.active) return;
      const { idx, moved } = dragRef.current;
      dragRef.current = { active: false, idx: -1, moved: false };
      if (!moved) onSelectRef.current(jp[idx].job, jp[idx].x, jp[idx].y);
    }

    function onResize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      initBg(canvas.width, canvas.height);
    }

    // mousedown on canvas only — prevents stealing clicks from hero buttons
    canvas.addEventListener('mousedown',  onDown);
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('resize',     onResize);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('resize',     onResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable — jobs & onSelect accessed via refs

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
