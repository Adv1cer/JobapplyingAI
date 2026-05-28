'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Send, LayoutDashboard, FileText, BriefcaseBusiness, Bot,
  Settings, LogOut, Search, Flame, Rocket, MessageSquare,
  Filter, SortAsc, Eye, FileIcon, ScanLine, ChevronDown,
  ChevronUp, Loader2, CheckCircle2, AlertCircle, ExternalLink,
  Building2, Mail, Bookmark, BookmarkCheck, RefreshCw,
  MailOpen, X, TrendingUp, AlertTriangle, Menu, Phone, Globe,
} from 'lucide-react';
import { ChatPanel } from '@/components/ChatPanel';
import {
  api, jobsApi, scanApi, gmailApi,
  type JobMatch, type DashboardStats, type ScanSession, type GmailStatus,
} from '@/lib/api';

const PAGE_SIZE = 10;

// ── Constants ─────────────────────────────────────────────────────────────────

const PROVINCES = [
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ',
  'เชียงใหม่', 'ชลบุรี', 'ขอนแก่น', 'ภูเก็ต', 'นครราชสีมา', 'สุราษฎร์ธานี',
];
const JOB_TYPES = [
  { value: '', label: 'ทุกประเภท' }, { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' }, { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' }, { value: 'internship', label: 'ฝึกงาน' },
];
const POSTED_WITHIN = [
  { value: '', label: 'ทุกช่วงเวลา' }, { value: '1', label: 'วันนี้' },
  { value: '3', label: '3 วัน' }, { value: '7', label: '7 วัน' },
  { value: '14', label: '14 วัน' }, { value: '30', label: '30 วัน' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 3600;
  if (diff < 1) return 'เมื่อกี้';
  if (diff < 24) return `${Math.floor(diff)}h ago`;
  const days = Math.floor(diff / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/** Returns the best date to display: actual posting date from source, or fallback to scraped date */
function jobDisplayDate(job: JobMatch): { dateStr: string; label: string } {
  if (job.postedAt) {
    return { dateStr: job.postedAt, label: 'ประกาศ' };
  }
  return { dateStr: job.scrapedAt, label: 'พบ' };
}

function matchColor(score: number) {
  if (score >= 80) return 'text-green-700 bg-green-50 border border-green-200';
  if (score >= 60) return 'text-yellow-700 bg-yellow-50 border border-yellow-200';
  return 'text-orange-700 bg-orange-50 border border-orange-200';
}

function sourceColor(source: string) {
  const map: Record<string, string> = {
    JobsDB:  'bg-blue-100 text-blue-700',
    JobThai: 'bg-green-100 text-green-700',
  };
  return map[source] ?? 'bg-gray-100 text-gray-600';
}

function sourceHomeUrl(source: string) {
  const map: Record<string, string> = {
    JobsDB:  'https://th.jobsdb.com',
    JobThai: 'https://www.jobthai.com',
  };
  return map[source] ?? '#';
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <div className="px-4 md:px-6 py-5 animate-pulse border-b border-gray-50 last:border-b-0">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-200 rounded-full w-14" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-7 bg-gray-200 rounded-md w-16 hidden sm:block" />
          <div className="h-8 bg-gray-200 rounded-md w-20" />
        </div>
      </div>

      {/* AI summary */}
      <div className="space-y-1.5 mb-3 pl-13">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>

      {/* Skill tags */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <div className="h-5 bg-green-100 rounded-full w-20" />
        <div className="h-5 bg-green-100 rounded-full w-24" />
        <div className="h-5 bg-red-100 rounded-full w-18" />
        <div className="h-5 bg-red-100 rounded-full w-16" />
      </div>

      {/* AI reasons */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        <div className="h-5 bg-blue-100 rounded-full w-24" />
        <div className="h-5 bg-blue-100 rounded-full w-20" />
        <div className="h-5 bg-blue-100 rounded-full w-28" />
      </div>

      {/* HR email row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-5 bg-gray-200 rounded w-36" />
      </div>

      {/* Cover letter + resume grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-gray-100 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="h-3 bg-gray-200 rounded w-28 mb-3" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-10 bg-gray-200 rounded shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-gray-200 rounded w-32" />
              <div className="flex gap-1">
                <div className="h-4 bg-gray-200 rounded w-12" />
                <div className="h-4 bg-gray-200 rounded w-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Gmail Draft Modal ─────────────────────────────────────────────────────────

function GmailDraftModal({
  job, onClose, onSuccess,
}: {
  job: JobMatch;
  onClose: () => void;
  onSuccess: (draftId: string) => void;
}) {
  const [to, setTo] = useState(job.hrEmails?.[0] ?? '');
  const [subject, setSubject] = useState(`สมัครงาน ${job.title} - ${job.company}`);
  const [body, setBody] = useState(job.coverLetter ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!to) { setError('กรุณาใส่อีเมลผู้รับ'); return; }
    setLoading(true); setError('');
    try {
      const res = await gmailApi.createDraft({ to, subject, body, jobMatchId: job.id });
      onSuccess(res.draftId);
    } catch (err: any) {
      setError(err.message ?? 'ไม่สามารถสร้าง Draft ได้');
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <MailOpen className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">สร้าง Gmail Draft</span>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">To (HR Email)</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="hr@company.com" className="h-9 text-sm" />
            {job.hrEmails?.length > 1 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {job.hrEmails.map((e) => (
                  <button key={e} onClick={() => setTo(e)}
                    className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded">{e}</button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Body (Cover Letter)</Label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full text-sm border border-input rounded-md p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
          <p className="text-xs text-gray-400">Draft จะถูกบันทึกใน Gmail ของคุณ — ต้องตรวจสอบและส่งเองเท่านั้น</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="h-9 text-sm">ยกเลิก</Button>
            <Button onClick={submit} disabled={loading} className="h-9 text-sm bg-blue-600 hover:bg-blue-700 gap-2 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailOpen className="w-4 h-4" />}
              บันทึก Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [user, setUser] = useState<{ name?: string; email: string; plan: string } | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [scanSession, setScanSession] = useState<ScanSession | null>(null);
  const [filters, setFilters] = useState({ keywords: '', province: '', salaryMin: '', salaryMax: '', jobType: '', postedWithin: '', country: 'TH' });
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ connected: false });
  const [gmailDraftJob, setGmailDraftJob] = useState<JobMatch | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'matches' | 'saved'>('matches');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [jobPage, setJobPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stores a session ID discovered on initial load that needs polling to start
  const pendingSessionIdRef = useRef<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const [s, jPage, u, gmail, saved, latest] = await Promise.all([
        jobsApi.getDashboard(),
        jobsApi.getMatches(1, PAGE_SIZE, false),
        api.get<{ name?: string; email: string; plan: string }>('/auth/me'),
        gmailApi.getStatus(),
        jobsApi.getSaved(),
        scanApi.getLatest(),     // ← auto-detect any running session
      ]);
      setStats(s);
      setJobs(jPage.jobs);
      setTotalJobs(jPage.total);
      setHasMoreJobs(jPage.hasMore);
      setJobPage(1);
      setUser(u);
      setGmailStatus(gmail);
      setSavedJobIds(new Set(saved.map((sv) => sv.jobId ?? '').filter(Boolean)));

      // If a scan/reanalyze session is still running, resume polling
      if (latest?.status === 'running') {
        setScanSession(latest);
        setScanning(true);
        pendingSessionIdRef.current = latest.id;
      }
    } catch {
      router.push('/login');
    } finally {
      setLoadingDashboard(false);
    }
  }, [router]);

  /** Load next page and append to current list */
  const loadMoreJobs = useCallback(async () => {
    if (loadingMore || !hasMoreJobs) return;
    setLoadingMore(true);
    try {
      const nextPage = jobPage + 1;
      const result = await jobsApi.getMatches(nextPage, PAGE_SIZE, showExpired);
      setJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.id));
        const newJobs = result.jobs.filter((j) => !existingIds.has(j.id));
        return [...prev, ...newJobs];
      });
      setJobPage(nextPage);
      setTotalJobs(result.total);
      setHasMoreJobs(result.hasMore);
    } catch { /* silent */ }
    finally { setLoadingMore(false); }
  }, [loadingMore, hasMoreJobs, jobPage, showExpired]);

  /** Reload page 1 (e.g. after scan done or toggle showExpired) */
  const reloadJobs = useCallback(async (includeExpired = showExpired) => {
    try {
      const result = await jobsApi.getMatches(1, PAGE_SIZE, includeExpired);
      setJobs(result.jobs);
      setTotalJobs(result.total);
      setHasMoreJobs(result.hasMore);
      setJobPage(1);
    } catch { /* silent */ }
  }, [showExpired]);

  // startPolling must be declared BEFORE the effects that reference it
  const startPolling = useCallback((sessionId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const session = await scanApi.getStatus(sessionId);
        setScanSession(session);
        if (session.status === 'done' || session.status === 'failed') {
          clearInterval(pollRef.current!);
          setScanning(false);
          if (session.status === 'done') {
            const [s] = await Promise.all([jobsApi.getDashboard(), reloadJobs()]);
            setStats(s);
          }
        } else if (session.status === 'running') {
          // Reload jobs every poll tick so 'analyzing'/'isReanalyzing' → 'pending' updates appear
          reloadJobs();
        }
      } catch {
        clearInterval(pollRef.current!);
        setScanning(false);
      }
    }, 3000);
  }, [reloadJobs]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  useEffect(() => {
    loadDashboard();
    if (typeof window !== 'undefined' && window.location.search.includes('gmail=connected')) {
      gmailApi.getStatus().then(setGmailStatus).catch(() => {});
    }
  }, [loadDashboard]);

  // After initial load finishes, start polling any session that was auto-detected
  useEffect(() => {
    if (!loadingDashboard && pendingSessionIdRef.current) {
      const id = pendingSessionIdRef.current;
      pendingSessionIdRef.current = null;
      startPolling(id);
    }
  }, [loadingDashboard, startPolling]);

  // ── Infinite scroll via IntersectionObserver ──────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Debounce: wait 200ms before triggering load to avoid rapid firing
          if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
          scrollDebounceRef.current = setTimeout(() => {
            loadMoreJobs();
          }, 200);
        }
      },
      { threshold: 0.1, rootMargin: '120px' },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    };
  }, [loadMoreJobs]);

  async function handleScan(force = false) {
    const errors: Record<string, string> = {};
    
    if (!filters.keywords.trim()) errors.keywords = 'กรุณากรอกคำค้นหา';
    if (!filters.salaryMin) errors.salaryMin = 'กรุณากรอกเงินเดือนขั้นต่ำ';
    
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setScanning(true);
    setScanSession(null);
    try {
      const body: Record<string, string | number | boolean> = {};
      if (filters.keywords) body.keywords = filters.keywords;
      if (filters.province) body.province = filters.province;
      if (filters.salaryMin) body.salaryMin = Number(filters.salaryMin);
      if (filters.salaryMax) body.salaryMax = Number(filters.salaryMax);
      if (filters.jobType) body.jobType = filters.jobType;
      if (filters.postedWithin) body.postedWithin = Number(filters.postedWithin);
      body.country = filters.country || 'TH';
      if (force) body.force = true;

      const session = await scanApi.start(body);
      setScanSession(session);

      if ((session as any).fromCache) {
        setScanning(false);
        const [s] = await Promise.all([jobsApi.getDashboard(), reloadJobs()]);
        setStats(s);
      } else {
        startPolling(session.id);
      }
    } catch (err: any) {
      setScanning(false);
      alert(err.message ?? 'Scan failed');
    }
  }

  async function clearAllJobs() {
    if (!confirm('ลบงานทั้งหมดออกจาก Dashboard?')) return;
    setClearing(true);
    try {
      await api.delete('/jobs/clear/all');
      setJobs([]);
      setStats(null);
    } finally { setClearing(false); }
  }

  async function confirmJob(jobId: string) {
    await jobsApi.confirm(jobId);
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: 'applied' } : j));
    setStats((s) => s ? { ...s, applied: (s.applied ?? 0) + 1, aiMatches: Math.max(0, s.aiMatches - 1) } : s);
  }

  async function discardJob(jobId: string) {
    await jobsApi.discard(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }

  async function toggleSave(job: JobMatch) {
    const isSaved = savedJobIds.has(job.id);
    if (isSaved) {
      await jobsApi.unsave(job.id);
      setSavedJobIds((prev) => { const s = new Set(prev); s.delete(job.id); return s; });
    } else {
      await jobsApi.save(job.id);
      setSavedJobIds((prev) => new Set([...prev, job.id]));
    }
  }

  async function regenerateCoverLetter(jobId: string) {
    setRegeneratingId(jobId);
    try {
      const res = await jobsApi.regenerateCoverLetter(jobId, 'TH');
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, coverLetter: res.coverLetter } : j));
    } catch (err: any) {
      alert(err.message ?? 'ไม่สามารถสร้าง Cover Letter ใหม่ได้');
    } finally { setRegeneratingId(null); }
  }

  async function connectGmail() {
    try {
      const { url } = await gmailApi.getAuthUrl();
      if (!url) throw new Error('ไม่ได้รับ URL จาก server');
      window.location.href = url;
    } catch (err: any) {
      const msg: string = err.message ?? '';
      if (msg.includes('GOOGLE_CLIENT_ID') || msg.includes('OAuth') || msg.includes('ตั้งค่า')) {
        alert(
          '⚙️ Gmail ยังไม่ได้ตั้งค่า\n\n' +
          'กรุณาเพิ่มใน backend .env:\n' +
          '  GOOGLE_CLIENT_ID=...\n' +
          '  GOOGLE_CLIENT_SECRET=...\n' +
          '  GOOGLE_REDIRECT_URI=http://localhost:3001/api/gmail/callback\n\n' +
          'จากนั้น restart backend และ Google Cloud Console → OAuth → Authorized redirect URIs',
        );
      } else {
        alert(msg || 'ไม่สามารถเชื่อมต่อ Gmail ได้');
      }
    }
  }

  const pendingJobs = jobs.filter((j) => j.status === 'pending');
  const scanProgress = scanSession && scanSession.totalFound > 0
    ? Math.round((scanSession.processed / scanSession.totalFound) * 100) : 0;

  // Jobs to show in the matches tab
  const matchJobs = activeTab === 'matches' ? jobs : jobs.filter((j) => savedJobIds.has(j.id));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-52 bg-white border-r border-gray-100 flex flex-col py-5 px-3 shrink-0
        transition-transform duration-200
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Link href="/" className="flex items-center gap-2 px-3 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">SmartMatch AI</span>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', active: true },
            { label: 'My Resumes', icon: FileText, href: '/resumes' },
          ].map(({ label, icon: Icon, href, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>

        {/* Gmail connection in sidebar */}
        <div className="mb-3 px-3">
          {gmailStatus.connected ? (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
              <MailOpen className="w-3.5 h-3.5" />
              <span className="truncate">{gmailStatus.email ?? 'Gmail Connected'}</span>
            </div>
          ) : (
            <button onClick={connectGmail}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50 border border-dashed border-gray-200">
              <Mail className="w-3.5 h-3.5" />Connect Gmail
            </button>
          )}
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Settings className="w-4 h-4" />Settings
          </button>
          <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Application Pipeline</h1>
              <p className="text-xs md:text-sm text-gray-500 hidden sm:block">AI-ranked matches from JobsDB · JobThai</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {scanSession?.status === 'running' && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                {scanSession.filters?.reanalyze
                  ? <span className="hidden md:inline">วิเคราะห์ด้วย Resume ใหม่… {scanSession.processed}/{scanSession.totalFound}</span>
                  : <span className="hidden md:inline">Scanning… {scanSession.processed}/{scanSession.totalFound}</span>
                }
              </div>
            )}
            {scanSession?.status === 'done' && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                {scanSession.filters?.reanalyze
                  ? <span className="hidden md:inline">วิเคราะห์ใหม่เสร็จ {scanSession.processed} งาน ✓</span>
                  : <span className="hidden md:inline">พบ {scanSession.totalFound} งาน · บันทึก {scanSession.processed} รายการ</span>
                }
              </div>
            )}
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setChatOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chatOpen
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}>
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">AI Chat</span>
              </button>
              <p className="text-sm font-medium text-gray-900 hidden md:block">{user?.name ?? user?.email ?? '—'}</p>
              <Avatar className="w-8 h-8 md:w-9 md:h-9">
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {(user?.name ?? user?.email ?? 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-5">
          {/* Scan Panel */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              onClick={() => setScanOpen(!scanOpen)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <ScanLine className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Scan Now</p>
                  <p className="text-xs text-gray-500">JobsDB · JobThai</p>
                </div>
              </div>
              {scanOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {scanOpen && (
              <div className="px-6 pb-6 border-t border-gray-50">
                <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Source indicator */}
                  <div className="col-span-2 md:col-span-3">
                    <Label className="text-xs text-gray-500 mb-1.5 block">แหล่งงาน</Label>
                    <div className="flex gap-2">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-blue-600 text-white border-blue-600">
                        🇹🇭 JobsDB · JobThai
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-3">
                    <Label className="text-xs text-gray-500 mb-1 block">คำค้นหา (ตำแหน่งงาน / ทักษะ)</Label>
                    <Input placeholder="เช่น React Developer, Node.js, Fullstack"
                      value={filters.keywords}
                      onChange={(e) => { setFilters({ ...filters, keywords: e.target.value }); setValidationErrors({...validationErrors, keywords: ''}) }}
                      className="h-9 text-sm"
                      required />
                    {validationErrors.keywords && <span className="text-xs text-red-500 mt-0.5 block">{validationErrors.keywords}</span>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">จังหวัด</Label>
                    <select className="w-full h-9 text-sm border border-input rounded-md px-3 bg-background"
                      value={filters.province}
                      onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                      >
                      <option value="">ทั้งประเทศ</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">ประเภทงาน</Label>
                    <select className="w-full h-9 text-sm border border-input rounded-md px-3 bg-background"
                      value={filters.jobType}
                      onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                      required>
                      {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">ประกาศเมื่อ</Label>
                    <select className="w-full h-9 text-sm border border-input rounded-md px-3 bg-background"
                      value={filters.postedWithin}
                      onChange={(e) => setFilters({ ...filters, postedWithin: e.target.value })}
                      required>
                      {POSTED_WITHIN.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">เงินเดือนขั้นต่ำ (บาท)</Label>
                    <Input type="number" placeholder="เช่น 30000"
                      value={filters.salaryMin}
                      onChange={(e) => { setFilters({ ...filters, salaryMin: e.target.value }); setValidationErrors({...validationErrors, salaryMin: ''}) }}
                      className="h-9 text-sm"
                      required />
                    {validationErrors.salaryMin && <span className="text-xs text-red-500 mt-0.5 block">{validationErrors.salaryMin}</span>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">เงินเดือนสูงสุด (บาท)</Label>
                    <Input type="number" placeholder="เช่น 80000"
                      value={filters.salaryMax}
                      onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                      className="h-9 text-sm" />
                  </div>
                  <div className="col-span-2 md:col-span-3 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button onClick={() => handleScan(false)} disabled={scanning}
                        className="bg-blue-600 hover:bg-blue-700 gap-2 px-6 text-white">
                        {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                        {scanning ? 'กำลัง Scan…' : 'เริ่ม Scan Now'}
                      </Button>

                      {scanSession?.status === 'running' && (
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${scanProgress}%` }} />
                          </div>
                          <p className="text-xs text-blue-600 whitespace-nowrap">
                            วิเคราะห์ {scanSession.processed}/{scanSession.totalFound}
                          </p>
                        </div>
                      )}

                      {!scanning && (scanSession as any)?.fromCache && (scanSession as any)?.cacheAgeMinutes != null && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-amber-700">
                            📦 ข้อมูลจาก {(scanSession as any).cacheAgeMinutes} นาทีที่แล้ว
                          </span>
                          <button
                            onClick={() => handleScan(true)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2">
                            Scan ใหม่
                          </button>
                        </div>
                      )}

                      {!scanning && !(scanSession as any)?.fromCache && (scanSession as any)?.cacheAgeMinutes != null && (scanSession as any)?.status === 'done' && (
                        <span className="text-xs text-gray-400">
                          อัปเดตเมื่อ {(scanSession as any).cacheAgeMinutes} นาทีที่แล้ว
                        </span>
                      )}
                    </div>
                    {scanSession?.status === 'failed' && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{scanSession.errorMessage ?? 'Scan failed'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Total Scanned', value: stats?.totalScanned ?? 0, icon: Search, badge: '', badgeColor: '' },
              { label: 'AI Matches', value: stats?.aiMatches ?? 0, icon: Flame, badge: 'Pending', badgeColor: 'text-purple-600' },
              { label: 'Applied', value: stats?.applied ?? 0, icon: Rocket, badge: '', badgeColor: '' },
              { label: 'Interview Requests', value: stats?.interviewRequests ?? 0, icon: MessageSquare, badge: 'Action', badgeColor: 'text-green-600' },
            ].map(({ label, value, icon: Icon, badge, badgeColor }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-gray-400" />
                  {badge && <span className={`text-xs font-medium ${badgeColor}`}>{badge}</span>}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'matches' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              AI Matches <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{pendingJobs.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Saved <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{savedJobIds.size}</span>
            </button>
          </div>

          {/* Job list */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-gray-900">
                  {activeTab === 'matches' ? 'New Job Matches' : 'Saved Jobs'}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {activeTab === 'matches'
                    ? `${totalJobs} งาน`
                    : `${savedJobIds.size} saved`}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                {activeTab === 'matches' && (
                  <button
                    onClick={() => { const next = !showExpired; setShowExpired(next); reloadJobs(next); }}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${showExpired ? 'bg-red-50 text-red-600 border-red-200' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                    {showExpired ? 'ซ่อนหมดอายุ' : 'แสดงหมดอายุ'}
                  </button>
                )}
                {jobs.length > 0 && activeTab === 'matches' && (
                  <Button variant="outline" size="sm"
                    className="gap-1.5 text-xs h-8 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={clearAllJobs} disabled={clearing}>
                    {clearing ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    <span className="hidden sm:inline">Clear All</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {/* Initial dashboard loading — show skeleton cards */}
              {loadingDashboard && (
                <>
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                </>
              )}

              {/* Empty state: no jobs, not scanning, not loading */}
              {!loadingDashboard && activeTab === 'matches' && jobs.length === 0 && !scanning && (
                <div className="py-16 text-center space-y-3">
                  <ScanLine className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm text-gray-400 font-medium">ยังไม่มีงานที่จับคู่</p>
                  <p className="text-xs text-gray-400">กด <strong>Scan Now</strong> เพื่อเริ่มค้นหางาน</p>
                </div>
              )}

              {/* Scanning but no jobs fetched yet */}
              {!loadingDashboard && activeTab === 'matches' && scanning && jobs.length === 0 && (
                <div className="py-8 text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-blue-400 mx-auto animate-spin" />
                  <p className="text-sm text-gray-500">กำลังรวบรวมงานจาก JobsDB · JobThai…</p>
                  {scanSession && (
                    <p className="text-xs text-gray-400">
                      พบ {scanSession.totalFound} งาน · วิเคราะห์แล้ว {scanSession.processed} รายการ
                    </p>
                  )}
                </div>
              )}

              {/* Actual job cards */}
              {!loadingDashboard && matchJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  gmailConnected={gmailStatus.connected}
                  isRegenerating={regeneratingId === job.id}
                  onConfirm={() => confirmJob(job.id)}
                  onDiscard={() => discardJob(job.id)}
                  onSave={() => toggleSave(job)}
                  onGmailDraft={() => setGmailDraftJob(job)}
                  onRegenerateLetter={() => regenerateCoverLetter(job.id)}
                />
              ))}

              {/* Infinite scroll sentinel — hidden div at the bottom */}
              {activeTab === 'matches' && !loadingDashboard && (
                <div ref={sentinelRef} className="py-0" aria-hidden="true">
                  {loadingMore && (
                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังโหลดงานเพิ่มเติม…
                    </div>
                  )}
                  {!hasMoreJobs && jobs.length > 0 && !loadingMore && (
                    <p className="text-center text-xs text-gray-300 py-3">
                      แสดงครบทุกงานแล้ว ({totalJobs} รายการ)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Right panel */}
      <aside className="hidden xl:block w-64 bg-white border-l border-gray-100 overflow-y-auto shrink-0 p-5 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Job Sources</h3>
          <div className="space-y-2">
            {['JobsDB', 'JobThai'].map((src) => {
              const count = jobs.filter((j) => j.source === src).length;
              return (
                <div key={src} className="flex items-center justify-between">
                  <a href={sourceHomeUrl(src)} target="_blank" rel="noopener noreferrer"
                    className={`px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 ${sourceColor(src)}`}>
                    {src} ↗
                  </a>
                  <span className="text-xs text-gray-500">{count} งาน</span>
                </div>
              );
            })}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Match Distribution</h3>
          <div className="space-y-2">
            {[
              { label: '80–100%', color: 'bg-green-500', filter: (s: number) => s >= 80 },
              { label: '60–79%', color: 'bg-yellow-500', filter: (s: number) => s >= 60 && s < 80 },
              { label: '0–59%', color: 'bg-orange-400', filter: (s: number) => s < 60 },
            ].map(({ label, color, filter }) => {
              const count = jobs.filter((j) => filter(j.matchScore)).length;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-gray-600 flex-1">{label}</span>
                  <span className="text-xs font-medium text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Gmail Integration</h3>
          {gmailStatus.connected ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs">{gmailStatus.email}</span>
              </div>
              <p className="text-xs text-gray-400">สร้าง Draft อีเมลได้จากปุ่ม "Gmail Draft" บนแต่ละงาน</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">เชื่อมต่อ Gmail เพื่อสร้าง Draft อีเมลสมัครงาน</p>
              <Button onClick={connectGmail} size="sm" variant="outline" className="w-full h-8 text-xs gap-2">
                <Mail className="w-3.5 h-3.5" />Connect Gmail
              </Button>
            </div>
          )}
        </div>
        <Separator />
        <div className="bg-blue-900 text-white rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Pro Tip</p>
          <p className="text-sm leading-relaxed">
            กรอกข้อมูลใน <strong>My Resumes</strong> ให้ครบถ้วนเพื่อให้ AI วิเคราะห์ได้แม่นยำขึ้น
          </p>
          <Link href="/resumes">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-xs h-8">ไปที่ My Resumes</Button>
          </Link>
        </div>
      </aside>

      {/* AI Chat Panel */}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Gmail Draft Modal */}
      {gmailDraftJob && (
        <GmailDraftModal
          job={gmailDraftJob}
          onClose={() => setGmailDraftJob(null)}
          onSuccess={(draftId) => {
            setJobs((prev) => prev.map((j) => j.id === gmailDraftJob.id ? { ...j, gmailDraftId: draftId } : j));
            setGmailDraftJob(null);
            alert(`Draft สร้างแล้ว! เปิด Gmail เพื่อตรวจสอบและส่ง`);
          }}
        />
      )}
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────────

function JobCard({
  job, isSaved, gmailConnected, isRegenerating,
  onConfirm, onDiscard, onSave, onGmailDraft, onRegenerateLetter,
}: {
  job: JobMatch;
  isSaved: boolean;
  gmailConnected: boolean;
  isRegenerating: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
  onSave: () => void;
  onGmailDraft: () => void;
  onRegenerateLetter: () => void;
}) {
  const [showLetter, setShowLetter] = useState(false);
  const [hrContacts, setHrContacts] = useState<Array<{ email?: string; phone?: string; website?: string; type?: 'hr' | 'general'; source?: string; firstName?: string; lastName?: string; position?: string; confidence?: number }> | null>(null);
  const [hrLoading, setHrLoading] = useState(false);
  const [hrError, setHrError] = useState('');

  // Show skeleton AI section when:
  // - status=analyzing (Phase 1 of fresh scan — AI hasn't scored yet)
  // - isReanalyzing=true (resume was updated → this job is queued for rescoring)
  const isAnalyzing = job.status === 'analyzing' || job.isReanalyzing === true;
  const { dateStr, label: dateLabel } = jobDisplayDate(job);

  async function lookupHrEmail() {
    setHrLoading(true); setHrError('');
    try {
      const res = await jobsApi.lookupHrEmail(job.id);
      setHrContacts(res.contacts);
      if (res.contacts.length === 0) setHrError('ไม่พบข้อมูลติดต่อ');
    } catch {
      setHrError('ค้นหาไม่สำเร็จ กรุณาลองใหม่');
    } finally { setHrLoading(false); }
  }

  return (
    <div className={`px-4 md:px-6 py-5 transition-colors ${job.isExpired ? 'opacity-60 bg-gray-50/80' : 'hover:bg-gray-50/50'}`}>
      {/* Expired / Stale banners */}
      {job.isExpired && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 mb-3">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>งานนี้อาจหมดอายุแล้ว (ประกาศเกิน 30 วัน) — ลิงก์อาจใช้ไม่ได้</span>
        </div>
      )}
      {!job.isExpired && job.isStale && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>คะแนนอาจไม่ตรงกับ Resume ล่าสุด — <button onClick={onRegenerateLetter} className="underline underline-offset-2 font-medium">คลิกเพื่อวิเคราะห์ใหม่</button></span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 text-sm shrink-0">
            {job.company?.[0] ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold ${job.isExpired ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{job.title}</span>
              {/* Match score badge — skeleton when analyzing */}
              {isAnalyzing ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />กำลังวิเคราะห์…
                </span>
              ) : (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${job.isStale ? 'text-gray-500 bg-gray-100 border border-gray-200' : matchColor(job.matchScore)}`}>
                  {job.matchScore}% {job.isStale ? '(เก่า)' : 'MATCH'}
                </span>
              )}
              {job.remote && (
                <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">Remote</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
              <Building2 className="w-3 h-3 shrink-0" />
              <span>{job.company}</span>
              <span>·</span>
              <span>{job.location}</span>
              {job.salary && <><span>·</span><span className="text-green-700 font-medium">{job.salary}</span></>}
              <a href={sourceHomeUrl(job.source)} target="_blank" rel="noopener noreferrer"
                className={`px-2 py-0.5 rounded-full font-medium hover:opacity-80 ${sourceColor(job.source)}`}>
                {job.source} ↗
              </a>
              {job.jobUrl && (
                <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                  <ExternalLink className="w-3 h-3" />ดูประกาศ
                </a>
              )}
            </div>
            {/* Company info */}
            {job.companyInfo?.found && (
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                {job.companyInfo.status && (
                  <span className={`flex items-center gap-1 ${job.companyInfo.status.includes('ดำเนินกิจการ') ? 'text-green-600' : 'text-red-500'}`}>
                    <CheckCircle2 className="w-3 h-3" />{job.companyInfo.status}
                  </span>
                )}
                {job.companyInfo.registeredCapital && <span>ทุน: {job.companyInfo.registeredCapital}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <span className="text-xs text-gray-400 hidden sm:inline" title={new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}>
            {dateLabel} {timeAgo(dateStr)}
          </span>
          {/* Save button */}
          <button onClick={onSave} disabled={isAnalyzing}
            className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'} ${isAnalyzing ? 'opacity-40 cursor-not-allowed' : ''}`}>
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          {isAnalyzing ? (
            <Badge className="text-xs border-none bg-blue-50 text-blue-500 gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />AI…
            </Badge>
          ) : job.status === 'pending' ? (
            <>
              <Button variant="outline" size="sm" className="h-8 text-xs hidden sm:flex" onClick={onDiscard}>Discard</Button>
              <Button size="sm" className="text-white h-8 text-xs bg-blue-600 hover:bg-blue-700" onClick={onConfirm}>Confirm</Button>
            </>
          ) : (
            <Badge className={`text-xs border-none ${job.status === 'applied' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {job.status === 'applied' ? '✓ Applied' : job.status}
            </Badge>
          )}
        </div>
      </div>

      {/* ── Analyzing state: show skeleton for AI content ── */}
      {isAnalyzing ? (
        <div className="animate-pulse space-y-3">
          {/* AI summary skeleton */}
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
          {/* Skill tags skeleton */}
          <div className="flex gap-2 flex-wrap">
            <div className="h-5 bg-green-100 rounded-full w-20" />
            <div className="h-5 bg-green-100 rounded-full w-24" />
            <div className="h-5 bg-red-100 rounded-full w-16" />
          </div>
          {/* AI reasons skeleton */}
          <div className="flex gap-1.5 flex-wrap">
            <div className="h-5 bg-blue-100 rounded-full w-24" />
            <div className="h-5 bg-blue-100 rounded-full w-20" />
            <div className="h-5 bg-blue-100 rounded-full w-16" />
          </div>
          {/* HR row */}
          <div className="flex items-center gap-2">
            <div className="h-3 bg-gray-200 rounded w-8" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
          {/* Cover letter + resume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg p-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="h-3 bg-gray-200 rounded w-28 mb-3" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-10 bg-gray-200 rounded shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-32" />
                  <div className="flex gap-1">
                    <div className="h-4 bg-gray-200 rounded w-12" />
                    <div className="h-4 bg-gray-200 rounded w-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* AI Summary */}
          {job.aiSummary && (
            <p className="text-xs text-gray-600 italic mb-3 pl-13">"{job.aiSummary}"</p>
          )}

          {/* Skills analysis row */}
          <div className="flex flex-wrap gap-2 mb-3">
            {job.strengths?.slice(0, 3).map((s) => (
              <span key={s} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />{s}
              </span>
            ))}
            {job.missingSkills?.slice(0, 3).map((s) => (
              <span key={s} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />{s}
              </span>
            ))}
          </div>

          {/* AI Reasons */}
          {job.aiReasons?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.aiReasons.map((r, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{r}</span>
              ))}
            </div>
          )}

          {/* HR / Contact section */}
          <div className="flex items-start gap-2 flex-wrap mb-4">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-500 font-medium shrink-0 mt-0.5">ติดต่อ:</span>
            <div className="flex items-center gap-1.5 flex-wrap flex-1">

              {/* ── Emails from the original job listing ── */}
              {job.hrEmails?.filter((email): email is string => !!email).map((email) => (
                <a key={email} href={`mailto:${email}`}
                  className="text-xs text-blue-600 hover:underline font-mono bg-blue-50 px-2 py-0.5 rounded">
                  {email}
                </a>
              ))}

              {/* ── Contacts found via AI/DDG lookup ── */}
              {hrContacts !== null && (() => {
                // Flatten into separate deduplicated lists for clean display
                const emails  = hrContacts.filter((c) => c.email);
                const phones  = hrContacts.filter((c) => c.phone && !c.email);
                const sites   = hrContacts.filter((c) => c.website && !c.email && !c.phone);
                const source  = hrContacts[0]?.source; // 'ai' | 'web'

                return (
                  <>
                    {/* Emails */}
                    {emails.map((c) => {
                      const isHr = c.type === 'hr';
                      return (
                        <span key={c.email} className="inline-flex items-center gap-0.5">
                          <a href={`mailto:${c.email}`}
                            title={[c.position, isHr ? 'HR/Recruiter' : 'ติดต่อบริษัท'].filter(Boolean).join(' · ')}
                            className={`text-xs hover:underline font-mono px-2 py-0.5 rounded-l border ${
                              isHr ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-gray-700 bg-gray-50 border-gray-200'
                            }`}>
                            {c.email}
                          </a>
                          <span className={`text-xs px-1.5 py-0.5 rounded-r border-y border-r font-medium ${
                            isHr ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {isHr ? 'HR' : 'บริษัท'}
                          </span>
                        </span>
                      );
                    })}

                    {/* Phone numbers */}
                    {phones.map((c) => (
                      <a key={c.phone} href={`tel:${(c.phone ?? '').replace(/[\s\-]/g, '')}`}
                        className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {c.phone}
                      </a>
                    ))}

                    {/* Website (show domain, not "สมัครงาน") */}
                    {sites.map((c) => {
                      const domain = c.website ?? '';
                      const href = domain.startsWith('http') ? domain : `https://${domain}`;
                      return (
                        <a key={domain} href={href} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">
                          <Globe className="w-3 h-3" />
                          {domain}
                        </a>
                      );
                    })}

                    {/* Source label */}
                    {(emails.length > 0 || phones.length > 0 || sites.length > 0) && (
                      <span className="text-xs text-gray-300 italic ml-0.5">
                        {source === 'ai' ? '· AI' : '· web'}
                      </span>
                    )}
                  </>
                );
              })()}

              {/* Lookup button */}
              {(job.hrEmails?.length ?? 0) === 0 && hrContacts === null && (
                <button onClick={lookupHrEmail} disabled={hrLoading}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded transition-colors disabled:opacity-60">
                  {hrLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                  {hrLoading ? 'กำลังค้นหา…' : 'ค้นหา HR / ติดต่อ'}
                </button>
              )}
              {hrError && <span className="text-xs text-red-500 italic">{hrError}</span>}
              {hrContacts !== null && hrContacts.length === 0 && !hrError && (
                <span className="text-xs text-gray-400 italic">ไม่พบข้อมูลติดต่อ</span>
              )}
            </div>
            {gmailConnected && (
              <button onClick={onGmailDraft}
                className={`ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${job.gmailDraftId ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-600 bg-white border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}>
                <MailOpen className="w-3 h-3" />
                {job.gmailDraftId ? 'Draft ✓' : 'Gmail Draft'}
              </button>
            )}
          </div>

          {/* Cover letter + Resume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Cover Letter</span>
                <div className="flex items-center gap-2">
                  <button onClick={onRegenerateLetter} disabled={isRegenerating}
                    className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1">
                    <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'กำลังสร้าง…' : 'สร้างใหม่'}
                  </button>
                  <button onClick={() => setShowLetter(!showLetter)}
                    className="text-xs text-blue-600 font-medium hover:underline">
                    {showLetter ? 'ย่อ' : 'แสดงทั้งหมด'}
                  </button>
                </div>
              </div>
              <p className={`text-xs text-gray-600 leading-relaxed ${showLetter ? '' : 'line-clamp-4'}`}>
                {job.coverLetter ?? 'ยังไม่มี Cover Letter'}
              </p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Selected Resume</span>
                <Link href="/resumes" className="text-xs text-blue-600 font-medium hover:underline">Edit</Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-10 bg-red-50 border border-red-100 rounded flex items-center justify-center shrink-0">
                  <FileIcon className="w-4 h-4 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{job.resumeName || 'Resume'}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.skills?.slice(0, 3).map((s) => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
                <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0"><Eye className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
