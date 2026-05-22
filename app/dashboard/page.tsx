'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  Bot,
  Settings,
  LogOut,
  Search,
  Flame,
  Rocket,
  MessageSquare,
  Filter,
  SortAsc,
  Eye,
  FileIcon,
  ToggleRight,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Stats {
  totalScanned: number;
  aiMatches: number;
  pendingReview: number;
  interviewRequests: number;
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  matchScore: number;
  coverLetter: string;
  resumeName: string;
  resumeOptimizedFor: string;
  scrapedAt: string;
  status: string;
}

interface Bot {
  id: number;
  name: string;
  frequency: string;
  matches: number;
  active: boolean;
}

interface Interview {
  id: number;
  title: string;
  company: string;
  date: string;
  time: string;
  type: string;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 3600;
  if (diff < 1) return 'just now';
  if (diff < 24) return `${Math.floor(diff)}h ago`;
  return `${Math.floor(diff / 24)}d ago`;
}

function matchColor(score: number) {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 75) return 'text-yellow-600 bg-yellow-50';
  return 'text-orange-600 bg-orange-50';
}

function sourceColor(source: string) {
  if (source === 'LinkedIn') return 'bg-blue-100 text-blue-700';
  if (source === 'Facebook Jobs') return 'bg-blue-50 text-blue-600';
  return 'bg-green-50 text-green-700';
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [user, setUser] = useState<{ name?: string; email: string; plan: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, j, b, i, u] = await Promise.all([
        api.get<Stats>('/jobs/dashboard'),
        api.get<JobMatch[]>('/jobs/matches'),
        api.get<Bot[]>('/jobs/bots'),
        api.get<Interview[]>('/jobs/interviews'),
        api.get<{ name?: string; email: string; plan: string }>('/auth/me'),
      ]);
      setStats(s);
      setJobs(j);
      setBots(b);
      setInterviews(i);
      setUser(u);
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm(jobId: string) {
    await api.post(`/jobs/${jobId}/confirm`, {});
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'applied' } : j)));
  }

  async function discard(jobId: string) {
    await api.delete(`/jobs/${jobId}/discard`);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  const pendingJobs = jobs.filter((j) => j.status === 'pending');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col py-5 px-3 shrink-0">
        <Link href="/" className="flex items-center gap-2 px-3 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">JobAI</span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, active: true },
            { label: 'My Resumes', icon: FileText },
            { label: 'Applications', icon: BriefcaseBusiness },
            { label: 'Job Hunter Bots', icon: Bot },
          ].map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Application Pipeline</h1>
            <p className="text-sm text-gray-500">Your AI-curated matches for today</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm text-gray-600">Bot Active: Scoping LinkedIn</span>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name ?? user?.email ?? '—'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.plan ?? 'free'} Member</p>
              </div>
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {(user?.name ?? user?.email ?? 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: 'Total Scanned',
                value: stats?.totalScanned ?? '—',
                icon: Search,
                badge: '+12%',
                badgeColor: 'text-blue-600',
              },
              {
                label: 'AI Matches',
                value: stats?.aiMatches ?? '—',
                icon: Flame,
                badge: 'High Fit',
                badgeColor: 'text-purple-600',
              },
              {
                label: 'Pending Review',
                value: stats?.pendingReview ?? '—',
                icon: Rocket,
                badge: 'This Month',
                badgeColor: 'text-orange-600',
              },
              {
                label: 'Interview Requests',
                value: stats?.interviewRequests ?? '—',
                icon: MessageSquare,
                badge: 'Action Needed',
                badgeColor: 'text-green-600',
              },
            ].map(({ label, value, icon: Icon, badge, badgeColor }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className={`text-xs font-medium ${badgeColor}`}>{badge}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Job Matches */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-gray-900">New Job Matches</h2>
                <Badge variant="secondary" className="text-xs">
                  {pendingJobs.length} New Today
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <Filter className="w-3 h-3" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <SortAsc className="w-3 h-3" /> Sort by Fit
                </Button>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {jobs.length === 0 && (
                <p className="py-12 text-center text-sm text-gray-400">Loading matches…</p>
              )}
              {jobs.map((job) => (
                <div key={job.id} className="px-6 py-5">
                  {/* Job header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">
                        {job.company[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{job.title}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${matchColor(job.matchScore)}`}>
                            {job.matchScore}% MATCH
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <FileText className="w-3 h-3" />
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceColor(job.source)}`}
                          >
                            {job.source}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        Scraped {timeAgo(job.scrapedAt)}
                      </span>
                      {job.status === 'pending' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => discard(job.id)}
                          >
                            Discard
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                            onClick={() => confirm(job.id)}
                          >
                            Confirm Application
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-none text-xs">
                          Applied
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Cover letter + Resume */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          AI Generated Cover Letter
                        </span>
                        <button className="text-xs text-blue-600 font-medium hover:underline">
                          Edit with AI
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                        {job.coverLetter}
                      </p>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Selected Resume
                        </span>
                        <button className="text-xs text-blue-600 font-medium hover:underline">
                          Change Version
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-red-50 border border-red-100 rounded flex items-center justify-center">
                          <FileIcon className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-800">{job.resumeName}</p>
                          <p className="text-xs text-gray-500">Optimized for: {job.resumeOptimizedFor}</p>
                        </div>
                        <button className="ml-auto text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Right panel */}
      <aside className="w-64 bg-white border-l border-gray-100 overflow-y-auto shrink-0 p-5 space-y-6">
        {/* Active Bots */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Job Bots</h3>
          <div className="space-y-3">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <p className="text-xs font-medium text-gray-800">{bot.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="mr-1">⏱</span>
                    {bot.frequency}
                    <span className="mx-1">·</span>
                    <span className="text-green-600">✓ {bot.matches} matches</span>
                  </p>
                </div>
                <ToggleRight className="w-8 h-4 text-blue-500" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Upcoming Interviews */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Interviews</h3>
          <div className="space-y-3">
            {interviews.map((iv) => {
              const d = new Date(iv.date);
              return (
                <div key={iv.id} className="flex gap-3">
                  <div className="w-10 shrink-0 text-center">
                    <p className="text-xs text-gray-400 uppercase">
                      {d.toLocaleString('en', { month: 'short' })}
                    </p>
                    <p className="text-xl font-bold text-gray-900">{d.getDate()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{iv.title}</p>
                    <p className="text-xs text-gray-500">
                      {iv.type} with {iv.company} • {iv.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Pro Tip */}
        <div className="bg-blue-900 text-white rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Pro Tip</p>
          <p className="text-sm leading-relaxed">
            Our AI suggests tailoring your &apos;Leadership&apos; resume version for the Meta role to
            increase fit score to 94%.
          </p>
          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-xs h-8">
            Apply Suggestion
          </Button>
        </div>
      </aside>
    </div>
  );
}
