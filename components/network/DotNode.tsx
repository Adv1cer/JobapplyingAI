'use client';

import { memo } from 'react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';

export type JobType = 'full-time' | 'remote' | 'hybrid' | 'contract';
export type DotAccent = 'teal' | 'blue' | 'violet' | 'rose' | 'amber' | 'cyan';

export interface DotNodeData extends Record<string, unknown> {
  company: string;
  role: string;
  location: string;
  type: JobType;
  salary: string;
  tags: string[];
  postedAgo: string;
  accent: DotAccent;
  urgent?: boolean;
}

export type DotFlowNode = Node<DotNodeData, 'dot'>;

const TYPE_LABEL: Record<JobType, string> = {
  'full-time': 'Full-Time',
  remote: 'Remote',
  hybrid: 'Hybrid',
  contract: 'Contract',
};

const ACCENT = {
  teal:   { core: '#2dd4bf', mid: 'rgba(45,212,191,0.4)',   far: 'rgba(45,212,191,0.12)',   rim: 'rgba(45,212,191,0.65)',   bubbleBorder: 'rgba(45,212,191,0.22)',   badge: 'text-teal-300 border-teal-400/30 bg-teal-950/80',   tag: 'text-teal-300/55 border-teal-500/20 bg-teal-950/50',   btn: 'text-teal-300 border-teal-400/30 hover:bg-teal-500/15' },
  blue:   { core: '#60a5fa', mid: 'rgba(96,165,250,0.4)',   far: 'rgba(96,165,250,0.12)',   rim: 'rgba(96,165,250,0.65)',   bubbleBorder: 'rgba(96,165,250,0.22)',   badge: 'text-blue-300 border-blue-400/30 bg-blue-950/80',   tag: 'text-blue-300/55 border-blue-500/20 bg-blue-950/50',   btn: 'text-blue-300 border-blue-400/30 hover:bg-blue-500/15' },
  violet: { core: '#a78bfa', mid: 'rgba(167,139,250,0.4)', far: 'rgba(167,139,250,0.12)', rim: 'rgba(167,139,250,0.65)', bubbleBorder: 'rgba(167,139,250,0.22)', badge: 'text-violet-300 border-violet-400/30 bg-violet-950/80', tag: 'text-violet-300/55 border-violet-500/20 bg-violet-950/50', btn: 'text-violet-300 border-violet-400/30 hover:bg-violet-500/15' },
  rose:   { core: '#fb7185', mid: 'rgba(251,113,133,0.4)', far: 'rgba(251,113,133,0.12)', rim: 'rgba(251,113,133,0.65)', bubbleBorder: 'rgba(251,113,133,0.22)', badge: 'text-rose-300 border-rose-400/30 bg-rose-950/80',   tag: 'text-rose-300/55 border-rose-500/20 bg-rose-950/50',   btn: 'text-rose-300 border-rose-400/30 hover:bg-rose-500/15' },
  amber:  { core: '#fbbf24', mid: 'rgba(251,191,36,0.4)',  far: 'rgba(251,191,36,0.12)',  rim: 'rgba(251,191,36,0.65)',  bubbleBorder: 'rgba(251,191,36,0.22)',  badge: 'text-amber-300 border-amber-400/30 bg-amber-950/80', tag: 'text-amber-300/55 border-amber-500/20 bg-amber-950/50', btn: 'text-amber-300 border-amber-400/30 hover:bg-amber-500/15' },
  cyan:   { core: '#22d3ee', mid: 'rgba(34,211,238,0.4)',  far: 'rgba(34,211,238,0.12)',  rim: 'rgba(34,211,238,0.65)',  bubbleBorder: 'rgba(34,211,238,0.22)',  badge: 'text-cyan-300 border-cyan-400/30 bg-cyan-950/80',   tag: 'text-cyan-300/55 border-cyan-500/20 bg-cyan-950/50',   btn: 'text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/15' },
} as const;

// บังคับสไตล์ให้หัวจับยึดสายมารวมศูนย์กลางเป๊ะๆ และปิดไม่ให้กวนการลากเมาส์
const CENTERED_HANDLE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  opacity: 0,
  width: 1,
  height: 1,
  background: 'transparent',
  border: 'none',
  pointerEvents: 'none',
};

function DotNode({ data, selected }: NodeProps<DotFlowNode>) {
  const a = ACCENT[data.accent];

  return (
    <div className="relative flex items-center justify-center w-[18px] h-[18px]">
      {/* ── บังคับยิงสายออกจากใจกลางเนื้อดวงดาวเท่านั้น ── */}
      <Handle type="target" position={Position.Left}   style={CENTERED_HANDLE_STYLE} />
      <Handle type="source" position={Position.Right}  style={CENTERED_HANDLE_STYLE} />
      <Handle type="target" position={Position.Top}    style={CENTERED_HANDLE_STYLE} />
      <Handle type="source" position={Position.Bottom} style={CENTERED_HANDLE_STYLE} />

      {/* ── Chat bubble — โผล่ด้านบนโดยไม่ขยายกรอบ Bounding Box หลัก ── */}
      {selected && (
        <div
          className="nodrag nowheel absolute"
          style={{
            bottom: 'calc(100% + 16px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 232,
            zIndex: 1000,
            pointerEvents: 'all',
          }}
        >
          {/* Card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(3,9,32,0.96)',
              border: `1px solid ${a.bubbleBorder}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.85), 0 0 32px ${a.far}`,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Top accent line */}
            <div
              className="h-[1.5px] w-full"
              style={{
                background: `linear-gradient(to right, transparent, ${a.rim}, transparent)`,
              }}
            />

            <div className="px-4 pt-3 pb-3.5">
              {/* Company row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="shrink-0 w-[6px] h-[6px] rounded-full animate-pulse"
                    style={{ background: a.core, boxShadow: `0 0 5px ${a.mid}` }}
                  />
                  <span className="text-[9px] font-bold tracking-widest text-slate-400/75 uppercase truncate">
                    {data.company}
                  </span>
                </div>
                <span className={`shrink-0 text-[7.5px] font-semibold px-1.5 py-[2px] rounded-full border ${a.badge}`}>
                  {TYPE_LABEL[data.type]}
                </span>
              </div>

              {/* Role */}
              <h3 className="text-white/92 font-semibold text-[12px] leading-snug mb-1 tracking-tight">
                {data.role}
              </h3>

              {/* Location + salary */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] text-slate-500 mr-1 truncate">📍 {data.location}</span>
                <span className="shrink-0 text-[9px] font-mono font-semibold text-slate-300/70">{data.salary}</span>
              </div>

              {/* Tags */}
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
                  className={`text-[9px] font-semibold px-3 py-[5px] rounded-[7px] border transition-all duration-200 tracking-wide ${a.btn}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {data.urgent ? '🔥 Apply Now' : 'Apply →'}
                </button>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: -6,
              width: 12,
              height: 12,
              background: 'rgba(3,9,32,0.96)',
              border: `1px solid ${a.bubbleBorder}`,
              borderTop: 'none',
              borderLeft: 'none',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </div>
      )}

      {/* ── ตัวดวงดาวเรืองแสง (เรียงเลเยอร์พุ่งเข้ากลาง) ── */}
      <div
        className="dot-drag-handle relative flex items-center justify-center w-full h-full cursor-pointer"
      >
        {/* Pulse ring when selected or urgent */}
        {(selected || data.urgent) && (
          <span
            className="absolute rounded-full animate-ping"
            style={{
              inset: -5,
              border: `1px solid ${a.core}`,
              opacity: 0.4,
            }}
          />
        )}

        {/* Soft aura */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -8,
            background: `radial-gradient(circle, ${a.mid} 0%, ${a.far} 55%, transparent 100%)`,
          }}
        />

        {/* Dot body */}
        <div
          className="relative rounded-full transition-transform duration-200 ease-out"
          style={{
            width: selected ? 15 : 13,
            height: selected ? 15 : 13,
            background: a.core,
            border: `1.5px solid ${a.rim}`,
            boxShadow: selected
              ? `0 0 10px ${a.mid}, 0 0 22px ${a.far}, 0 0 40px ${a.far}`
              : `0 0 7px ${a.mid}, 0 0 14px ${a.far}`,
            transition: 'width 0.2s, height 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Bright inner core */}
          <div
            className="absolute rounded-full"
            style={{
              width: 4, height: 4,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.92)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(DotNode);