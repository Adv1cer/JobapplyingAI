'use client';

import { memo } from 'react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';

export type JobType = 'full-time' | 'remote' | 'hybrid' | 'contract';
export type JobAccent = 'teal' | 'blue' | 'violet' | 'rose' | 'amber' | 'cyan';

export interface JobPostingData extends Record<string, unknown> {
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

export type JobPostingFlowNode = Node<JobPostingData, 'jobPosting'>;

const TYPE_LABEL: Record<JobType, string> = {
  'full-time': 'Full-Time',
  remote: 'Remote',
  hybrid: 'Hybrid',
  contract: 'Contract',
};

// Per-accent token map – all values inlined so Tailwind can detect at build time
const ACCENT = {
  teal: {
    dot: '#2dd4bf',
    dotGlow: 'rgba(45,212,191,0.5)',
    topLine: 'from-transparent via-teal-400/55 to-transparent',
    border: 'border-teal-400/25',
    hoverGlow:
      'hover:shadow-[0_0_40px_-6px_rgba(45,212,191,0.3),0_8px_32px_rgba(0,0,0,0.7)]',
    badge: 'text-teal-300 border-teal-400/30 bg-teal-950/60',
    tag: 'text-teal-300/60 border-teal-500/20 bg-teal-950/40',
    btn: 'text-teal-300 border-teal-400/30 hover:bg-teal-500/12 hover:border-teal-300/50',
  },
  blue: {
    dot: '#60a5fa',
    dotGlow: 'rgba(96,165,250,0.5)',
    topLine: 'from-transparent via-blue-400/55 to-transparent',
    border: 'border-blue-400/25',
    hoverGlow:
      'hover:shadow-[0_0_40px_-6px_rgba(96,165,250,0.3),0_8px_32px_rgba(0,0,0,0.7)]',
    badge: 'text-blue-300 border-blue-400/30 bg-blue-950/60',
    tag: 'text-blue-300/60 border-blue-500/20 bg-blue-950/40',
    btn: 'text-blue-300 border-blue-400/30 hover:bg-blue-500/12 hover:border-blue-300/50',
  },
  violet: {
    dot: '#a78bfa',
    dotGlow: 'rgba(167,139,250,0.5)',
    topLine: 'from-transparent via-violet-400/55 to-transparent',
    border: 'border-violet-400/25',
    hoverGlow:
      'hover:shadow-[0_0_40px_-6px_rgba(167,139,250,0.3),0_8px_32px_rgba(0,0,0,0.7)]',
    badge: 'text-violet-300 border-violet-400/30 bg-violet-950/60',
    tag: 'text-violet-300/60 border-violet-500/20 bg-violet-950/40',
    btn: 'text-violet-300 border-violet-400/30 hover:bg-violet-500/12 hover:border-violet-300/50',
  },
  rose: {
    dot: '#fb7185',
    dotGlow: 'rgba(251,113,133,0.5)',
    topLine: 'from-transparent via-rose-400/55 to-transparent',
    border: 'border-rose-400/25',
    hoverGlow:
      'hover:shadow-[0_0_40px_-6px_rgba(251,113,133,0.3),0_8px_32px_rgba(0,0,0,0.7)]',
    badge: 'text-rose-300 border-rose-400/30 bg-rose-950/60',
    tag: 'text-rose-300/60 border-rose-500/20 bg-rose-950/40',
    btn: 'text-rose-300 border-rose-400/30 hover:bg-rose-500/12 hover:border-rose-300/50',
  },
  amber: {
    dot: '#fbbf24',
    dotGlow: 'rgba(251,191,36,0.5)',
    topLine: 'from-transparent via-amber-400/55 to-transparent',
    border: 'border-amber-400/25',
    hoverGlow:
      'hover:shadow-[0_0_40px_-6px_rgba(251,191,36,0.3),0_8px_32px_rgba(0,0,0,0.7)]',
    badge: 'text-amber-300 border-amber-400/30 bg-amber-950/60',
    tag: 'text-amber-300/60 border-amber-500/20 bg-amber-950/40',
    btn: 'text-amber-300 border-amber-400/30 hover:bg-amber-500/12 hover:border-amber-300/50',
  },
  cyan: {
    dot: '#22d3ee',
    dotGlow: 'rgba(34,211,238,0.5)',
    topLine: 'from-transparent via-cyan-400/55 to-transparent',
    border: 'border-cyan-400/25',
    hoverGlow:
      'hover:shadow-[0_0_40px_-6px_rgba(34,211,238,0.3),0_8px_32px_rgba(0,0,0,0.7)]',
    badge: 'text-cyan-300 border-cyan-400/30 bg-cyan-950/60',
    tag: 'text-cyan-300/60 border-cyan-500/20 bg-cyan-950/40',
    btn: 'text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/12 hover:border-cyan-300/50',
  },
} as const;

const handleStyle: React.CSSProperties = {
  opacity: 0,
  width: 10,
  height: 10,
  background: 'transparent',
  border: 'none',
  pointerEvents: 'all',
};

function JobPostingNode({ data, selected }: NodeProps<JobPostingFlowNode>) {
  const a = ACCENT[data.accent];

  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      <div
        className={[
          'w-[220px] rounded-2xl border backdrop-blur-lg overflow-hidden',
          'bg-gradient-to-b from-[rgba(4,12,40,0.88)] to-[rgba(2,7,28,0.92)]',
          'shadow-[0_8px_40px_rgba(0,0,0,0.75)]',
          'transition-all duration-300 ease-out',
          'hover:scale-[1.05] cursor-pointer',
          a.border,
          a.hoverGlow,
          selected ? 'scale-[1.05]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Top accent line */}
        <div className={`h-[1.5px] w-full bg-gradient-to-r ${a.topLine}`} />

        <div className="px-4 pt-3 pb-3.5">
          {/* Company row */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Glowing node indicator */}
              <span
                className="shrink-0 w-[7px] h-[7px] rounded-full animate-pulse"
                style={{
                  background: a.dot,
                  boxShadow: `0 0 6px ${a.dotGlow}, 0 0 12px ${a.dotGlow}`,
                }}
              />
              <span className="text-[9.5px] font-bold tracking-widest text-slate-400/75 uppercase truncate">
                {data.company}
              </span>
            </div>
            <span
              className={`shrink-0 text-[8px] font-semibold px-1.5 py-[2px] rounded-full border ${a.badge}`}
            >
              {TYPE_LABEL[data.type]}
            </span>
          </div>

          {/* Role */}
          <h3 className="text-white/90 font-semibold text-[12px] leading-snug mb-1 tracking-tight">
            {data.role}
          </h3>

          {/* Location + salary */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] text-slate-500 truncate mr-2">
              📍 {data.location}
            </span>
            <span className="text-[9px] font-mono font-semibold text-slate-300/70 shrink-0">
              {data.salary}
            </span>
          </div>

          {/* Skill tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[8px] font-mono px-1.5 py-[2px] rounded-[3px] border ${a.tag}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-slate-600">{data.postedAgo}</span>
            <button
              className={[
                'text-[9px] font-semibold px-3 py-[5px] rounded-[7px] border',
                'transition-all duration-200 tracking-wide',
                a.btn,
              ].join(' ')}
              onClick={(e) => e.stopPropagation()}
            >
              {data.urgent ? '🔥 Apply Now' : 'Apply →'}
            </button>
          </div>
        </div>

        {/* Bottom inner reflection */}
        <div className="h-px mx-4 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>
    </>
  );
}

export default memo(JobPostingNode);
