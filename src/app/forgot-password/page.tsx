'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Lock,
  Mail,
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1 State: Requesting OTP
  const [identifier, setIdentifier] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Step 2 State: Resetting Password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [resetTicket, setResetTicket] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError(null);

    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, deliveryMethod }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch verification code');

      setResetTicket(data.resetTicket || '');
      setMaskedTarget(deliveryMethod === 'EMAIL' ? data.maskedEmail : data.maskedPhone);
      setWhatsappUrl(data.whatsappUrl || null);
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
      setVerifyError('New password must be at least 8 characters.');
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
        body: JSON.stringify({ resetTicket, otp, newPassword }),
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
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <span className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center font-serif text-xl border border-brand-gold/30 group-hover:scale-105 transition-transform shadow-sm">
              ✦
            </span>
          </Link>
          <div className="text-xs uppercase tracking-widest text-brand-gold font-semibold flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            Security &amp; Recovery
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-brand-cream">
            Reset Account Password
          </h2>
          <p className="text-xs text-brand-muted">
            Recover access using free WhatsApp OTP or registered email verification
          </p>
        </div>

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <div className="bg-brand-charcoal/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
            {requestError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                {requestError}
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 font-medium">
                  Registered Email or Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin@yourfirm.com or 9188444859"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 font-medium">
                  Preferred Delivery Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('WHATSAPP')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      deliveryMethod === 'WHATSAPP'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-brand-dark/50 border-white/5 text-brand-muted hover:text-brand-cream'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp OTP (Free)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('EMAIL')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      deliveryMethod === 'EMAIL'
                        ? 'bg-brand-gold/15 border-brand-gold/40 text-brand-gold shadow-sm'
                        : 'bg-brand-dark/50 border-white/5 text-brand-muted hover:text-brand-cream'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-brand-gold" />
                    <span>Email OTP</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-brand-gold text-brand-dark font-semibold text-xs sm:text-sm hover:bg-brand-goldHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 disabled:opacity-50 active:scale-98"
              >
                {requestLoading ? (
                  <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-white/5 text-center text-xs">
              <Link href="/login" className="text-brand-muted hover:text-brand-cream transition-colors">
                ← Return to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Verify OTP & Set New Password */}
        {step === 2 && (
          <div className="bg-brand-charcoal/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
            <div className="p-3.5 rounded-xl bg-brand-surface/70 border border-white/5 space-y-1.5 text-xs text-center">
              <span className="text-[11px] uppercase tracking-wider text-brand-gold font-semibold">
                Code Dispatched
              </span>
              <p className="text-brand-muted">
                Sent to {maskedTarget || identifier}. Valid for 10 minutes.
              </p>
              {whatsappUrl && (
                <div className="pt-1.5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Open WhatsApp to view code ↗</span>
                  </a>
                </div>
              )}
            </div>

            {verifyError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs text-center">
                {verifyError}
              </div>
            )}

            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                  6-Digit Verification Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-center text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-brand-gold" /> New Password (Min 8 Chars) *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-4 pr-11 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-gold transition-colors p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-brand-gold" /> Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-4 pr-11 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-gold transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-brand-gold text-brand-dark font-semibold text-xs sm:text-sm hover:bg-brand-goldHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 disabled:opacity-50 active:scale-98"
              >
                {verifyLoading ? (
                  <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Code &amp; Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-brand-muted hover:text-brand-cream inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Resend code or change target
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="bg-brand-charcoal/80 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-brand-cream">
                Password Successfully Reset!
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Your new master credentials are now active. You can now authenticate and enter your Occasion Desk workspace.
              </p>
            </div>

            <Link
              href="/login"
              className="w-full py-3.5 px-6 rounded-xl bg-brand-gold text-brand-dark font-semibold text-xs sm:text-sm hover:bg-brand-goldHover transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15"
            >
              <span>Sign In to Occasion Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="text-center text-xs text-brand-muted">
          Need immediate support? Contact concierge at{' '}
          <a href="tel:+919188444859" className="text-brand-gold hover:underline">
            +91 91884 44859
          </a>
        </div>
      </div>
    </div>
  );
}
