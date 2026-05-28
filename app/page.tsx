'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, X } from 'lucide-react';

import PlexusNetwork, { type JobData, type JobAccent } from '@/components/network/PlexusNetwork';

// ── 35 Job listings ──────────────────────────────────────────────────────────
const JOBS: JobData[] = [
  { id: 'j01', company: 'Nimbus Labs',       role: 'Senior React Developer',       location: 'San Francisco, CA', type: 'hybrid',    salary: '$160–200K', tags: ['React','TypeScript','GraphQL'],      postedAgo: '2h ago',  accent: 'teal',   urgent: true  },
  { id: 'j02', company: 'Stellar Design',    role: 'Senior UX/UI Designer',        location: 'New York, NY',      type: 'remote',    salary: '$120–150K', tags: ['Figma','Design Sys','Research'],     postedAgo: '5h ago',  accent: 'violet'              },
  { id: 'j03', company: 'DataCore',          role: 'Backend Engineer (Go)',         location: 'Austin, TX',        type: 'full-time', salary: '$170–215K', tags: ['Go','PostgreSQL','Kafka'],           postedAgo: '1d ago',  accent: 'blue'                },
  { id: 'j04', company: 'Quantum Cloud',     role: 'Cloud Architect',              location: 'Remote',            type: 'remote',    salary: '$180–225K', tags: ['AWS','GCP','Terraform','K8s'],       postedAgo: '4h ago',  accent: 'cyan'                },
  { id: 'j05', company: 'Vega Analytics',   role: 'Data Engineer',                location: 'Chicago, IL',       type: 'hybrid',    salary: '$140–175K', tags: ['Spark','dbt','Snowflake'],          postedAgo: '7h ago',  accent: 'amber'               },
  { id: 'j06', company: 'Neural Works AI',  role: 'ML Engineer (LLMs)',           location: 'Remote',            type: 'remote',    salary: '$190–240K', tags: ['Python','PyTorch','LLM'],           postedAgo: '3h ago',  accent: 'rose',   urgent: true  },
  { id: 'j07', company: 'CloudScale',       role: 'DevOps / SRE Lead',            location: 'Seattle, WA',       type: 'hybrid',    salary: '$150–185K', tags: ['Terraform','AWS','Docker','K8s'],   postedAgo: '12h ago', accent: 'cyan'                },
  { id: 'j08', company: 'Sync Studio',      role: 'Product Manager',              location: 'Los Angeles, CA',   type: 'hybrid',    salary: '$130–165K', tags: ['Agile','Roadmap','Analytics'],      postedAgo: '1d ago',  accent: 'amber'               },
  { id: 'j09', company: 'Helix Robotics',   role: 'Embedded Systems Engineer',    location: 'Boston, MA',        type: 'full-time', salary: '$155–195K', tags: ['C++','ROS','RTOS','Linux'],         postedAgo: '2d ago',  accent: 'teal'                },
  { id: 'j10', company: 'Orbit Media',      role: 'Mobile Engineer (iOS)',         location: 'Remote',            type: 'remote',    salary: '$135–170K', tags: ['Swift','SwiftUI','CoreML'],         postedAgo: '9h ago',  accent: 'violet'              },
  { id: 'j11', company: 'Forge Capital',    role: 'Quant Developer',              location: 'New York, NY',      type: 'full-time', salary: '$200–280K', tags: ['Python','C++','QuantLib'],          postedAgo: '6h ago',  accent: 'rose',   urgent: true  },
  { id: 'j12', company: 'Apex Fintech',     role: 'Full Stack Engineer',          location: 'Remote',            type: 'remote',    salary: '$145–180K', tags: ['Next.js','Node.js','AWS'],          postedAgo: '6h ago',  accent: 'blue',   urgent: true  },
  { id: 'j13', company: 'Orion Security',   role: 'Security Engineer',            location: 'Remote',            type: 'remote',    salary: '$155–195K', tags: ['Rust','Cryptography','Pentest'],    postedAgo: '8h ago',  accent: 'rose'                },
  { id: 'j14', company: 'Prism Health',     role: 'Frontend Engineer',            location: 'Austin, TX',        type: 'hybrid',    salary: '$125–158K', tags: ['React','D3.js','WebGL'],            postedAgo: '11h ago', accent: 'teal'                },
  { id: 'j15', company: 'Drift AI',         role: 'AI Product Engineer',          location: 'Remote',            type: 'remote',    salary: '$160–210K', tags: ['LLM','RAG','TypeScript'],           postedAgo: '1h ago',  accent: 'violet', urgent: true  },
  { id: 'j16', company: 'Nexus Games',      role: 'Graphics / Engine Programmer', location: 'Los Angeles, CA',   type: 'full-time', salary: '$145–185K', tags: ['C++','Vulkan','HLSL','Unreal'],     postedAgo: '3d ago',  accent: 'amber'               },
  { id: 'j17', company: 'Scale Infra',      role: 'Platform Engineer',            location: 'Remote',            type: 'remote',    salary: '$150–190K', tags: ['Go','K8s','Prometheus','Rust'],     postedAgo: '5h ago',  accent: 'cyan'                },
  { id: 'j18', company: 'Pixel Apps',       role: 'Android Developer',            location: 'Berlin, DE',        type: 'remote',    salary: '$110–145K', tags: ['Kotlin','Jetpack','Compose'],       postedAgo: '14h ago', accent: 'blue'                },
  { id: 'j19', company: 'ChainForge',       role: 'Blockchain Engineer',          location: 'Remote',            type: 'remote',    salary: '$170–220K', tags: ['Solidity','Rust','EVM','ZK'],       postedAgo: '2h ago',  accent: 'violet', urgent: true  },
  { id: 'j20', company: 'Insight Analytics',role: 'Data Scientist',               location: 'Toronto, CA',       type: 'hybrid',    salary: '$130–165K', tags: ['Python','scikit','XGBoost'],       postedAgo: '1d ago',  accent: 'rose'                },
  { id: 'j21', company: 'Apex Systems',     role: 'Software Architect',           location: 'Remote',            type: 'full-time', salary: '$195–245K', tags: ['System Design','Java','DDD'],       postedAgo: '18h ago', accent: 'blue'                },
  { id: 'j22', company: 'Mobile.xyz',       role: 'React Native Developer',       location: 'Remote',            type: 'remote',    salary: '$130–160K', tags: ['RN','TypeScript','Expo'],           postedAgo: '10h ago', accent: 'teal'                },
  { id: 'j23', company: 'TestFlow',         role: 'QA Automation Engineer',       location: 'Chicago, IL',       type: 'hybrid',    salary: '$115–148K', tags: ['Cypress','Playwright','Jest'],      postedAgo: '2d ago',  accent: 'amber'               },
  { id: 'j24', company: 'API Labs',         role: 'Node.js Backend Engineer',     location: 'Remote',            type: 'remote',    salary: '$135–170K', tags: ['Node.js','Express','GraphQL'],      postedAgo: '7h ago',  accent: 'blue'                },
  { id: 'j25', company: 'LowLevel.io',      role: 'Rust Systems Engineer',        location: 'Remote',            type: 'remote',    salary: '$160–205K', tags: ['Rust','WebAssembly','LLVM'],        postedAgo: '3h ago',  accent: 'rose'                },
  { id: 'j26', company: 'Cerebral Labs',    role: 'AI Research Engineer',         location: 'San Francisco, CA', type: 'hybrid',    salary: '$210–270K', tags: ['PyTorch','RLHF','CUDA','JAX'],      postedAgo: '1h ago',  accent: 'violet', urgent: true  },
  { id: 'j27', company: 'MetaPlay',         role: 'Game Developer (Unity)',       location: 'Los Angeles, CA',   type: 'full-time', salary: '$130–165K', tags: ['Unity','C#','Shader','Physics'],    postedAgo: '4d ago',  accent: 'amber'               },
  { id: 'j28', company: 'DataStream',       role: 'ETL / Pipelines Engineer',     location: 'Remote',            type: 'remote',    salary: '$135–168K', tags: ['Airflow','Flink','BigQuery'],       postedAgo: '20h ago', accent: 'cyan'                },
  { id: 'j29', company: 'AppWorks',         role: 'iOS Swift Developer',          location: 'Austin, TX',        type: 'hybrid',    salary: '$140–175K', tags: ['Swift','SwiftUI','CoreData'],       postedAgo: '16h ago', accent: 'teal'                },
  { id: 'j30', company: 'DataForge',        role: 'Python Data Engineer',         location: 'Remote',            type: 'remote',    salary: '$130–162K', tags: ['Python','Pandas','dbt','SQL'],      postedAgo: '1d ago',  accent: 'blue'                },
  { id: 'j31', company: 'Uplift Cloud',     role: 'Site Reliability Engineer',    location: 'Seattle, WA',       type: 'hybrid',    salary: '$160–200K', tags: ['Linux','SRE','PagerDuty','Go'],     postedAgo: '6h ago',  accent: 'cyan'                },
  { id: 'j32', company: 'CrossPlatform Co', role: 'Flutter Developer',            location: 'Remote',            type: 'remote',    salary: '$120–152K', tags: ['Flutter','Dart','Firebase'],        postedAgo: '2d ago',  accent: 'violet'              },
  { id: 'j33', company: 'TechVentures',     role: 'Principal Engineer',           location: 'New York, NY',      type: 'full-time', salary: '$240–310K', tags: ['Leadership','Architecture','Scale'], postedAgo: '3h ago',  accent: 'cyan',   urgent: true  },
  { id: 'j34', company: 'Docs.ai',          role: 'Technical Writer / Dev Rel',   location: 'Remote',            type: 'remote',    salary: '$100–130K', tags: ['Markdown','OpenAPI','Devrel'],      postedAgo: '5d ago',  accent: 'amber'               },
  { id: 'j35', company: 'MeshNet',          role: 'Distributed Systems Engineer', location: 'Remote',            type: 'remote',    salary: '$175–225K', tags: ['Raft','Paxos','Go','gRPC'],         postedAgo: '4h ago',  accent: 'rose',   urgent: true  },
];

// ── Accent palette (for popup card) ─────────────────────────────────────────
const ACCENT: Record<JobAccent, {
  core: string; rim: string; far: string; mid: string;
  bubbleBorder: string; badge: string; tag: string; btn: string;
}> = {
  teal:   { core: '#2dd4bf', rim: 'rgba(45,212,191,0.65)',   mid: 'rgba(45,212,191,0.4)',   far: 'rgba(45,212,191,0.12)',   bubbleBorder: 'rgba(45,212,191,0.22)',   badge: 'text-teal-300 border-teal-400/30 bg-teal-950/80',     tag: 'text-teal-300/55 border-teal-500/20 bg-teal-950/50',     btn: 'text-teal-300 border-teal-400/30 hover:bg-teal-500/15'     },
  blue:   { core: '#60a5fa', rim: 'rgba(96,165,250,0.65)',   mid: 'rgba(96,165,250,0.4)',   far: 'rgba(96,165,250,0.12)',   bubbleBorder: 'rgba(96,165,250,0.22)',   badge: 'text-blue-300 border-blue-400/30 bg-blue-950/80',     tag: 'text-blue-300/55 border-blue-500/20 bg-blue-950/50',     btn: 'text-blue-300 border-blue-400/30 hover:bg-blue-500/15'     },
  violet: { core: '#a78bfa', rim: 'rgba(167,139,250,0.65)', mid: 'rgba(167,139,250,0.4)', far: 'rgba(167,139,250,0.12)', bubbleBorder: 'rgba(167,139,250,0.22)', badge: 'text-violet-300 border-violet-400/30 bg-violet-950/80', tag: 'text-violet-300/55 border-violet-500/20 bg-violet-950/50', btn: 'text-violet-300 border-violet-400/30 hover:bg-violet-500/15' },
  rose:   { core: '#fb7185', rim: 'rgba(251,113,133,0.65)', mid: 'rgba(251,113,133,0.4)', far: 'rgba(251,113,133,0.12)', bubbleBorder: 'rgba(251,113,133,0.22)', badge: 'text-rose-300 border-rose-400/30 bg-rose-950/80',     tag: 'text-rose-300/55 border-rose-500/20 bg-rose-950/50',     btn: 'text-rose-300 border-rose-400/30 hover:bg-rose-500/15'     },
  amber:  { core: '#fbbf24', rim: 'rgba(251,191,36,0.65)',  mid: 'rgba(251,191,36,0.4)',  far: 'rgba(251,191,36,0.12)',  bubbleBorder: 'rgba(251,191,36,0.22)',  badge: 'text-amber-300 border-amber-400/30 bg-amber-950/80',  tag: 'text-amber-300/55 border-amber-500/20 bg-amber-950/50',  btn: 'text-amber-300 border-amber-400/30 hover:bg-amber-500/15'  },
  cyan:   { core: '#22d3ee', rim: 'rgba(34,211,238,0.65)',  mid: 'rgba(34,211,238,0.4)',  far: 'rgba(34,211,238,0.12)',  bubbleBorder: 'rgba(34,211,238,0.22)',  badge: 'text-cyan-300 border-cyan-400/30 bg-cyan-950/80',     tag: 'text-cyan-300/55 border-cyan-500/20 bg-cyan-950/50',     btn: 'text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/15'     },
};

const TYPE_LABEL: Record<string, string> = {
  'full-time': 'Full-Time', remote: 'Remote', hybrid: 'Hybrid', contract: 'Contract',
};

interface Selected { job: JobData; sx: number; sy: number }

// ── Job popup card ───────────────────────────────────────────────────────────
function JobCard({ sel, onClose }: { sel: Selected; onClose: () => void }) {
  const a = ACCENT[sel.job.accent];
  const cardW = 240, cardH = 210, arrowH = 14;
  const pad = 12;

  // clamp so card stays inside viewport
  let left = sel.sx - cardW / 2;
  let top  = sel.sy - cardH - arrowH - 10;
  if (typeof window !== 'undefined') {
    left = Math.max(pad, Math.min(left, window.innerWidth  - cardW - pad));
    top  = Math.max(pad, Math.min(top,  window.innerHeight - cardH - pad));
  }

  return (
    <div
      className="absolute pointer-events-auto"
      style={{ left, top, width: cardW, zIndex: 50 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(3,9,32,0.96)',
          border: `1px solid ${a.bubbleBorder}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.85), 0 0 28px ${a.far}`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* top accent line */}
        <div className="h-[1.5px] w-full" style={{ background: `linear-gradient(to right, transparent, ${a.rim}, transparent)` }} />

        <div className="px-4 pt-3 pb-3.5">
          {/* company row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0 w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: a.core, boxShadow: `0 0 5px ${a.mid}` }} />
              <span className="text-[9px] font-bold tracking-widest text-slate-400/75 uppercase truncate">{sel.job.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`shrink-0 text-[7.5px] font-semibold px-1.5 py-[2px] rounded-full border ${a.badge}`}>{TYPE_LABEL[sel.job.type]}</span>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* role */}
          <h3 className="text-white/92 font-semibold text-[12px] leading-snug mb-1 tracking-tight">{sel.job.role}</h3>

          {/* location + salary */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[9px] text-slate-500 truncate mr-1">📍 {sel.job.location}</span>
            <span className="shrink-0 text-[9px] font-mono font-semibold text-slate-300/70">{sel.job.salary}</span>
          </div>

          {/* tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {sel.job.tags.map((t) => (
              <span key={t} className={`text-[8px] font-mono px-1.5 py-[2px] rounded-[3px] border ${a.tag}`}>{t}</span>
            ))}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-slate-600">{sel.job.postedAgo}</span>
            <button className={`text-[9px] font-semibold px-3 py-[5px] rounded-[7px] border transition-all duration-200 tracking-wide ${a.btn}`}>
              {sel.job.urgent ? '🔥 Apply Now' : 'Apply →'}
            </button>
          </div>
        </div>
      </div>

      {/* arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -6, width: 12, height: 12,
          background: 'rgba(3,9,32,0.96)',
          border: `1px solid ${a.bubbleBorder}`,
          borderTop: 'none', borderLeft: 'none',
          transform: 'translateX(-50%) rotate(45deg)',
        }}
      />
    </div>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [selected, setSelected] = useState<Selected | null>(null);

  const handleSelect = useCallback((job: JobData, sx: number, sy: number) => {
    setSelected((prev) => (prev?.job.id === job.id ? null : { job, sx, sy }));
  }, []);

  const handleClose = useCallback(() => setSelected(null), []);

  // Close card when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const card = document.getElementById('job-card-overlay');
      if (card && !card.contains(e.target as Node)) setSelected(null);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020b24]">
      {/* Single unified Plexus canvas — background particles + job nodes */}
      <PlexusNetwork jobs={JOBS} onSelect={handleSelect} />

      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(2,6,22,0.55) 100%)',
        }}
      />

      {/* Hero text — centered, always visible as focal anchor */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* soft background blur so text is readable over the network */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(2,8,30,0.55) 0%, transparent 100%)' }}
        />

        <div className="relative flex flex-col items-center text-center px-6 gap-5">
          {/* <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400" />
            </span>
            <span className="text-[10px] font-mono tracking-[0.18em] text-blue-300/80 uppercase">AI-Powered Job Matching</span>
          </div> */}

          {/* headline */}
          <h1
            className="font-bold tracking-tight text-white leading-[1.12]"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
              textShadow: '0 0 40px rgba(96,165,250,0.25), 0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            Find Your Perfect Role.<br />
            <span style={{ color: '#60a5fa' }}>We Apply For You.</span>
          </h1>

          {/* subtext */}
          <p
            className="text-slate-400 max-w-[480px] leading-relaxed"
            style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)' }}
          >
            SmartMatch AI scans top job boards, tailors your resume, and submits applications — while you focus on what matters.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pointer-events-auto mt-1">
            <Link href="/register">
              <span className="inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-6 py-[10px] rounded-full border border-blue-400/30 shadow-[0_0_24px_rgba(59,130,246,0.35)] transition-all duration-200 cursor-pointer">
                Get Started Free →
              </span>
            </Link>
            <Link href="/login">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white px-5 py-[10px] rounded-full border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer">
                Sign In
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Job popup card */}
      {selected && (
        <div id="job-card-overlay" style={{ zIndex: 50 }} className="absolute inset-0 pointer-events-none">
          <JobCard sel={selected} onClose={handleClose} />
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-7 py-4 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <div className="w-8 h-8 rounded-[9px] bg-blue-600/75 backdrop-blur-sm border border-blue-400/25 flex items-center justify-center shadow-[0_0_14px_rgba(59,130,246,0.35)]">
            <Send className="w-[14px] h-[14px] text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white/88">SmartMatch AI</span>
        </div>


        <div className="flex items-center gap-3 pointer-events-auto">
          <Link href="/login">
            <span className="text-[11.5px] font-medium text-slate-400 hover:text-white px-1.5 cursor-pointer">Log in</span>
          </Link>
          <Link href="/register">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold bg-blue-600/80 hover:bg-blue-500 text-white px-4 py-[7px] rounded-full border border-blue-400/28 transition-all duration-200 cursor-pointer">
              Get Started
            </span>
          </Link>
        </div>
      </header>
    </div>
  );
}
