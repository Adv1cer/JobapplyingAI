'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Send } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">JobAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How it Works</a>
          <a href="#benefits" className="text-sm text-gray-600 hover:text-gray-900">Benefits</a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-700 rounded-full px-5">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 bg-gradient-to-b from-white to-gray-50">
        <Badge variant="secondary" className="mb-6 text-blue-600 bg-blue-50 border-blue-100 rounded-full px-4 py-1 text-xs font-medium tracking-wide">
          <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2" />
          AI-POWERED JOB SEARCH
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight max-w-2xl mb-4">
          Automate Your Job Search<br />
          <span className="text-blue-500">with AI Precision</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-lg mb-10 leading-relaxed">
          Stop manually applying. Our AI scrapes top boards, tailors your resume,
          writes perfect cover letters, and applies for you while you sleep.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/register">
            <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-700 rounded-full px-8 h-12">
              Start Automating Now
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="rounded-full px-8 h-12 gap-2">
            <PlayCircle className="w-5 h-5" />
            Watch Demo
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Applications Sent Today</p>
              <p className="text-4xl font-bold text-gray-900">124</p>
              <div className="mt-4 flex items-end gap-1 h-12">
                {[30, 45, 35, 50, 40, 60, 80, 100, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${i === 7 ? 'bg-blue-500' : 'bg-gray-200'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <div>
                  <p className="text-xs font-medium text-gray-800">LinkedIn</p>
                  <p className="text-xs text-gray-500">45 matches</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">J</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">JobDB</p>
                  <p className="text-xs text-gray-500">32 matches</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 text-lg">
            Set it up once, and let our AI handle the heavy lifting of finding and
            applying to jobs that match your profile.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Automated Scraping',
              desc: 'Our bots continuously scan platforms like LinkedIn, JobDB, and JobTopGun for roles matching your criteria.',
              tags: ['LinkedIn', 'JobDB'],
              dark: false,
            },
            {
              step: '2',
              title: 'AI Matching & Writing',
              desc: "The AI analyzes the job description, scores your resume fit, and generates a highly personalized cover letter instantly.",
              tags: [],
              dark: false,
            },
            {
              step: '3',
              title: 'Review & Apply',
              desc: 'Approve applications with one click, or set it to auto-apply mode for 100% hands-free job hunting.',
              tags: [],
              dark: true,
            },
          ].map(({ step, title, desc, tags, dark }) => (
            <div key={step} className="border border-gray-200 rounded-2xl p-8">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-5 ${
                  dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{desc}</p>
              {tags.length > 0 && (
                <div className="flex gap-2">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 bg-white text-center border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-2">
          <span>✉</span> hello@jobai.com
        </p>
        <h2 className="text-5xl font-black text-gray-900 leading-tight mb-8">
          READY TO START?<br />GET HIRED FASTER
        </h2>
        <Link href="/register">
          <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-700 rounded-full px-10 h-13">
            Create Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
        <p>© 2026 JobAI Inc. All rights reserved.</p>
        <div className="flex gap-6 mt-3 sm:mt-0">
          <a href="#" className="hover:text-gray-700">Privacy Policy</a>
          <a href="#" className="hover:text-gray-700">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
