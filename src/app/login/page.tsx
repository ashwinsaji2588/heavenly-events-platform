'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Hard redirect to bypass Next.js router cache and ensure session cookies are sent
      window.location.href = '/desk';
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-serif text-xl group-hover:scale-105 transition-transform">
              ✦
            </span>
          </Link>
          <div className="text-xs uppercase tracking-widest text-brand-gold font-semibold flex items-center justify-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4" />
            Partner Authentication
          </div>
          <h2 className="text-3xl font-serif text-brand-cream">
            Sign in to Occasion Desk
          </h2>
          <p className="text-xs text-brand-muted mt-2">
            Secure pipeline access for event studios, catering firms &amp; décor partners
          </p>
        </div>

        <div className="bg-brand-charcoal/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-gold" /> Partner Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@youragency.com"
                className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-gold" /> Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-gold hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-4 pr-11 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-gold transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-gold text-brand-dark font-semibold text-sm hover:bg-brand-goldHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate & Enter Desk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-4 border-t border-white/5 text-xs text-brand-muted space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-brand-gold/80 font-semibold">
              Live Demo Access:
            </div>
            <div className="flex flex-col gap-1 text-[11px] bg-brand-dark/50 p-3 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@occasiondesk.com');
                  setPassword('Demo@2026!');
                }}
                className="text-left text-brand-cream hover:text-brand-gold transition-colors flex justify-between"
              >
                <span>✦ Demo Studio (Lead Planner)</span>
                <span className="text-brand-gold">Auto-fill demo</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center flex flex-col items-center gap-2">
          <Link href="/onboard" className="text-xs text-brand-gold hover:underline font-medium">
            Register a New Event Management Agency →
          </Link>
          <Link href="/" className="text-xs text-brand-muted hover:text-brand-cream transition-colors">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
