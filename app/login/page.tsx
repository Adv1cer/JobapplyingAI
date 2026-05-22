'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Mail, Lock, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: { name: string } }>(
        '/auth/login',
        { email, password },
      );
      localStorage.setItem('token', res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">JobAI</span>
        </Link>
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl flex rounded-2xl overflow-hidden shadow-xl bg-white">
          {/* Left: Form */}
          <div className="flex-1 p-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500 mb-8">Sign in to resume your automated job search.</p>

            {/* OAuth */}
            <div className="space-y-3 mb-6">
              <Button variant="outline" className="w-full justify-center gap-3 h-11">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full justify-center gap-3 h-11">
                <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continue with LinkedIn
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400 uppercase tracking-wider">
                  OR SIGN IN WITH EMAIL
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm text-gray-700 mb-1.5 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
                  <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Keep me signed in for 30 days
                </Label>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gray-900 text-white hover:bg-gray-700 text-sm font-semibold"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </div>

          {/* Right: Promo panel */}
          <div className="hidden md:flex flex-col justify-between w-96 bg-blue-700 p-10 text-white">
            <div className="space-y-4">
              {/* Mock AI card */}
              <div className="bg-blue-600/60 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-blue-500/60 rounded w-full" />
                    <div className="h-2 bg-blue-500/40 rounded w-3/4" />
                  </div>
                </div>
                <div className="h-2 bg-blue-500/40 rounded w-5/6" />
              </div>

              <div className="bg-blue-600/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-blue-200">SUCCESS RATE</span>
                  <span className="text-green-400 text-sm font-semibold">+24%</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-blue-500/60 rounded w-full" />
                  <div className="h-2 bg-blue-500/40 rounded w-4/5" />
                  <div className="h-2 bg-blue-500/30 rounded w-3/5" />
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-blue-600/50 rounded-full px-3 py-1 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-blue-100">AI Matching Engine v4.0</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Focus on interviews, not applications.
              </h3>
              <p className="text-sm text-blue-200 leading-relaxed mb-6">
                Join over 12,000 professionals who have automated their job hunt and
                landed roles at top-tier companies.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['bg-pink-400', 'bg-purple-400', 'bg-yellow-400', 'bg-blue-300'].map(
                    (color, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${color} border-2 border-blue-700`}
                      />
                    ),
                  )}
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-700 flex items-center justify-center text-xs">
                    +5k
                  </div>
                </div>
                <span className="text-sm text-blue-200">New job matches today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="flex justify-center gap-8 py-6 text-sm text-gray-500">
        <a href="#" className="hover:text-gray-700">Privacy Policy</a>
        <a href="#" className="hover:text-gray-700">Terms of Service</a>
        <a href="#" className="hover:text-gray-700">Help Center</a>
      </div>
    </div>
  );
}
