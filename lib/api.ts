const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ── Type definitions ──────────────────────────────────────────────────────────

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  jobUrl?: string;
  salary?: string;
  jobType?: string;
  skills: string[];
  matchScore: number;
  missingSkills: string[];
  strengths: string[];
  aiSummary?: string;
  aiReasons: string[];
  coverLetter?: string;
  coverLetterLang?: string;
  remote?: boolean;
  status: string;
  resumeName?: string;
  hrEmails: string[];
  companyInfo?: Record<string, any>;
  gmailDraftId?: string;
  scrapedAt: string;
}

export interface DashboardStats {
  totalScanned: number;
  aiMatches: number;
  pendingReview: number;
  applied: number;
  interviewRequests: number;
}

export interface ScanSession {
  id: string;
  status: 'running' | 'done' | 'failed';
  totalFound: number;
  processed: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SavedJob {
  id: string;
  jobId?: string;
  title?: string;
  company?: string;
  url?: string;
  source?: string;
  savedAt: string;
}

export interface GmailStatus {
  connected: boolean;
  email?: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const jobsApi = {
  getDashboard: () => api.get<DashboardStats>('/jobs/dashboard'),
  getMatches: () => api.get<JobMatch[]>('/jobs/matches'),
  getSaved: () => api.get<SavedJob[]>('/jobs/saved'),
  confirm: (id: string) => api.post<JobMatch>(`/jobs/${id}/confirm`, {}),
  discard: (id: string) => api.delete<void>(`/jobs/${id}/discard`),
  save: (id: string) => api.post<SavedJob>(`/jobs/${id}/save`, {}),
  unsave: (id: string) => api.delete<void>(`/jobs/${id}/save`),
  regenerateCoverLetter: (id: string, language?: 'TH' | 'EN') =>
    api.post<{ coverLetter: string }>(`/jobs/${id}/cover-letter`, { language }),
  lookupHrEmail: (id: string) =>
    api.get<{ company: string; contacts: Array<{ email: string; firstName?: string; lastName?: string; position?: string; confidence?: number }> }>(`/jobs/${id}/hr-email`),
};

export const resumeApi = {
  get: () => api.get<Record<string, any>>('/resume'),
  save: (data: Record<string, any>) =>
    api.put<Record<string, any> & { reanalyzeSession: string | null }>('/resume', data),
  reanalyze: () =>
    api.post<{ id: string; status: string; totalFound: number; processed: number }>('/resume/reanalyze', {}),
};

export const scanApi = {
  start: (filters: Record<string, any>) => api.post<ScanSession>('/scan/start', filters),
  getStatus: (id: string) => api.get<ScanSession>(`/scan/status/${id}`),
  getLatest: () => api.get<ScanSession | null>('/scan/latest'),
};

export const gmailApi = {
  getStatus: () => api.get<GmailStatus>('/gmail/status'),
  getAuthUrl: () => api.get<{ url: string }>('/gmail/auth'),
  createDraft: (payload: { to: string; subject: string; body: string; jobMatchId?: string }) =>
    api.post<{ draftId: string; threadId: string; message: string }>('/gmail/draft', payload),
  disconnect: () => api.delete<void>('/gmail/disconnect'),
};
