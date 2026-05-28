'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string }>('/auth/login', { email, password });
      localStorage.setItem('token', res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020b24] flex flex-col">

      {/* Top bar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-blue-600/80 border border-blue-400/25 flex items-center justify-center shadow-[0_0_14px_rgba(59,130,246,0.35)]">
            <Send className="w-[14px] h-[14px] text-white" />
          </div>
          <span className="font-bold text-[15px] text-white tracking-tight">SmartMatch AI</span>
        </Link>
        <p className="text-sm text-slate-500">
          No account?{' '}
          <Link href="/register" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Sign up free
          </Link>
        </p>
      </nav>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-[400px] rounded-2xl p-8"
          style={{
            background: 'rgba(8,18,52,0.75)',
            border: '1px solid rgba(96,165,250,0.14)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Heading */}
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-7">Sign in to your SmartMatch AI account</p>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <Button variant="outline" className="w-full h-11 gap-3 bg-blue-950/40 border-blue-800/40 text-slate-200 hover:bg-blue-900/40 hover:text-white">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <Button variant="outline" className="w-full h-11 gap-3 bg-blue-950/40 border-blue-800/40 text-slate-200 hover:bg-blue-900/40 hover:text-white">
              <svg className="w-4 h-4 shrink-0 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[11px] text-slate-600 font-mono tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[12.5px] text-slate-400 mb-1.5 block">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-blue-950/40 border-blue-800/40 text-white placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-0"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-[12.5px] text-slate-400">Password</Label>
                <a href="#" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-blue-950/40 border-blue-800/40 text-white placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-0"
                />
              </div>
            </div>

            {error && (
              <p className="text-[12.5px] text-rose-300 bg-rose-500/8 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-[12px] text-slate-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center gap-6 py-5 text-[11.5px] text-slate-700">
        <a href="#" className="hover:text-slate-500 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-slate-500 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-slate-500 transition-colors">Help Center</a>
      </div>
    </div>
  );
}
