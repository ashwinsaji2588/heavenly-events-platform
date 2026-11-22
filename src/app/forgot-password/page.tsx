'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1 State: Requesting OTP
  const [identifier, setIdentifier] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Step 2 State: Resetting Password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [resetTicket, setResetTicket] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Resend Countdown Timer
  const [countdown, setCountdown] = useState(45);
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError(null);

    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch verification code');

      setResetTicket(data.resetTicket || '');
      setMaskedEmail(data.maskedEmail || identifier);
      if (data.devOtp) setDevOtp(data.devOtp);
      setCountdown(45);
      setStep(2);
    } catch (err: unknown) {
      setRequestError(err instanceof Error ? err.message : 'Error generating code');
    } finally {
      setRequestLoading(false);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setVerifyError(null);

    if (newPassword.length < 8) {
      setVerifyError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setVerifyError('Passwords do not match. Please re-enter.');
      return;
    }

    setVerifyLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetTicket, otp: otp.trim(), newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify code');

      setStep(3);
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream flex flex-col justify-between selection:bg-brand-gold selection:text-brand-dark transition-colors">
      {/* Top Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-serif text-sm font-bold shadow-sm group-hover:scale-105 transition-transform">
            ✦
          </div>
          <span className="font-serif font-bold text-lg text-brand-cream group-hover:text-brand-gold transition-colors">
            Occasion Desk
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-xs text-brand-muted hover:text-brand-cream transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Step 1: Request Email OTP */}
          {step === 1 && (
            <div className="bg-brand-charcoal border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mx-auto flex items-center justify-center shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-serif text-brand-cream font-medium">
                  Reset Password
                </h1>
                <p className="text-xs text-brand-muted leading-relaxed max-w-xs mx-auto">
                  Enter your registered email address. We will dispatch a 6-digit one-time passcode (OTP) directly to your inbox.
                </p>
              </div>

              {requestError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs text-center">
                  {requestError}
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. planner@occasiondesk.com"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                    />
                    <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={requestLoading || !identifier}
                  className="w-full py-3.5 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs hover:bg-brand-goldHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 active:scale-98 disabled:opacity-50"
                >
                  {requestLoading ? (
                    <span>Dispatching Verification Code...</span>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs text-brand-muted hover:text-brand-cream transition-colors"
                >
                  Remembered your password? Sign in
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Verify Code and Set New Password */}
          {step === 2 && (
            <div className="bg-brand-charcoal border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-serif text-brand-cream font-medium">
                  Enter 6-Digit Code
                </h1>
                <p className="text-xs text-brand-muted leading-relaxed">
                  A verification code has been dispatched to:
                  <br />
                  <span className="font-mono text-brand-cream font-semibold mt-1 inline-block">
                    {maskedEmail}
                  </span>
                </p>
              </div>

              {devOtp && (
                <div className="p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Dev Helper OTP: <strong className="font-mono font-bold">{devOtp}</strong></span>
                </div>
              )}

              {verifyError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs text-center">
                  {verifyError}
                </div>
              )}

              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                {/* 6-Digit OTP */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                    One-Time Passcode (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-brand-cream focus:border-brand-gold outline-none"
                  />
                </div>

                {/* New Password with Eye Toggle */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                    />
                    <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-cream p-1 transition-colors"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password with Eye Toggle */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                    />
                    <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-cream p-1 transition-colors"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifyLoading || otp.length < 6 || newPassword.length < 8}
                  className="w-full py-3.5 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs hover:bg-brand-goldHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 active:scale-98 disabled:opacity-50"
                >
                  {verifyLoading ? (
                    <span>Verifying &amp; Updating Password...</span>
                  ) : (
                    <>
                      <span>Verify &amp; Update Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend Action */}
              <div className="pt-2 flex items-center justify-between text-xs text-brand-muted border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="hover:text-brand-cream transition-colors"
                >
                  ← Change Email
                </button>
                {countdown > 0 ? (
                  <span>Resend code in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-brand-gold hover:underline flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" /> Resend OTP Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {step === 3 && (
            <div className="bg-brand-charcoal border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-serif text-brand-cream font-medium">
                  Password Reset Successful
                </h1>
                <p className="text-xs text-brand-muted leading-relaxed max-w-xs mx-auto">
                  Your credentials have been securely updated. You can now sign in to your Occasion Desk workspace.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs hover:bg-brand-goldHover transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 active:scale-98"
                >
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-brand-muted border-t border-white/5">
        <p>Occasion Desk Platform • High-Security Identity Verification</p>
      </footer>
    </div>
  );
}
