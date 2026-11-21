'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, User, Mail, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function OnboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [firmName, setFirmName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmName,
          city,
          phone,
          adminName,
          adminEmail,
          adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Onboarding failed');

      // Successful onboarding immediately redirects to newly provisioned Occasion Desk
      router.push('/desk');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during onboarding');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-serif text-xl group-hover:scale-105 transition-transform">
              ✦
            </span>
          </Link>
          <div className="text-xs uppercase tracking-widest text-brand-gold font-semibold flex items-center justify-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4" />
            Agency SaaS Setup
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-brand-cream">
            Onboard Your Event Firm
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-2 max-w-md mx-auto">
            Provision your agency tenant, instantiate your Occasion Desk CRM, and configure master partner credentials.
          </p>
        </div>

        <div className="bg-brand-charcoal/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleOnboard} className="space-y-6">
            {/* Firm Details Section */}
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-wider text-brand-gold font-semibold flex items-center gap-2 pb-1 border-b border-white/5">
                <Building2 className="w-4 h-4" />
                1. Firm Information
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Event Firm / Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="e.g. Heavenly Events"
                  className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                    City / Headquarters *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Punalur, Kerala"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-brand-gold" /> Official WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 90746 24023"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Master Admin / Partner Credentials Section */}
            <div className="space-y-4 pt-2">
              <div className="text-xs uppercase tracking-wider text-brand-gold font-semibold flex items-center gap-2 pb-1 border-b border-white/5">
                <User className="w-4 h-4" />
                2. Master Admin / Founder Login
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Founder / Partner Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Jomit"
                  className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-brand-gold" /> Official Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="jomit@heavenlyevents.in"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-brand-gold" /> Master Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
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
                  Register Agency & Launch Desk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center flex items-center justify-center gap-4 text-xs text-brand-muted">
          <Link href="/login" className="hover:text-brand-cream transition-colors">
            Already have a login? Sign in here →
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-brand-cream transition-colors">
            Return to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
