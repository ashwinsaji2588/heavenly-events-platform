'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
  Phone,
  Smartphone,
} from 'lucide-react';
import {
  isFirebaseConfigured,
  getFirebaseAuth,
  createRecaptchaVerifier,
  sendFirebasePhoneOtp,
} from '@/lib/firebase';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Input Phone -> Step 2: Enter OTP & New Password -> Step 3: Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Phone & Recaptcha
  const [phoneNumber, setPhoneNumber] = useState('+91 9188444859');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Reset fields
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber.replace(/\s+/g, '')
        : `+91${phoneNumber.replace(/\s+/g, '')}`;

      if (formattedPhone.length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }

      if (isFirebaseConfigured) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase Auth unavailable.');

        if (!recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-reset-container', auth);
        }

        const confirmation = await sendFirebasePhoneOtp(formattedPhone, recaptchaVerifierRef.current);
        setConfirmationResult(confirmation);
      } else {
        console.log(`[Demo Phone OTP] Simulating SMS dispatch to ${formattedPhone}. Test Code: 123456`);
      }

      setStep(2);
      setCountdown(45);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS OTP');
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);

    try {
      let idToken: string | undefined;

      if (isFirebaseConfigured && confirmationResult) {
        const userCredential = await confirmationResult.confirm(otpCode);
        idToken = await userCredential.user.getIdToken();
      } else {
        if (otpCode !== '123456') {
          throw new Error('Invalid code. In demo mode, please enter 123456.');
        }
      }

      const res = await fetch('/api/auth/reset-password/phone-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          idToken,
          newPassword,
          isDevMock: !isFirebaseConfigured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error resetting password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div id="recaptcha-reset-container"></div>

      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="w-10 h-10 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center font-serif text-xl group-hover:scale-105 transition-transform border border-brand-gold/30">
              ✦
            </span>
          </Link>
          <div className="text-xs uppercase tracking-widest text-brand-gold font-semibold flex items-center justify-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4" />
            Security &amp; Account Recovery
          </div>
          <h2 className="text-3xl font-serif text-brand-cream">
            Reset Password via SMS
          </h2>
          <p className="text-xs text-brand-muted mt-2">
            Verify your registered mobile number using instant SMS OTP
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-brand-charcoal/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* STEP 1: Enter Phone Number */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-brand-gold" /> Registered Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 91884 44859"
                  className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors font-mono tracking-wide"
                />
                <p className="text-[11px] text-brand-muted/80 mt-1.5">
                  We will dispatch a secure 6-digit SMS OTP to authenticate your request.
                </p>
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
                    Send Reset Code via SMS
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-white/5 text-xs text-brand-muted">
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('+91 9188444859');
                    handleSendOtp();
                  }}
                  className="w-full text-left text-brand-cream hover:text-brand-gold transition-colors flex justify-between bg-brand-dark/50 p-2.5 rounded-xl border border-white/5"
                >
                  <span>✦ Auto-fill Demo Phone (+91 9188444859)</span>
                  <span className="text-brand-gold">Fast Test</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP & Set New Password */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div className="text-center pb-1">
                <div className="text-xs text-brand-muted">SMS Code sent to</div>
                <div className="text-sm font-mono text-brand-gold font-semibold">{phoneNumber}</div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-brand-gold" /> 6-Digit SMS OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-center text-xl text-brand-cream tracking-[0.4em] font-mono focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-gold" /> New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-gold p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-gold" /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-gold p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-brand-muted hover:text-brand-cream"
                >
                  ← Change Number
                </button>

                {countdown > 0 ? (
                  <span className="text-brand-muted">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-brand-gold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Resend SMS
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 px-6 rounded-xl bg-brand-gold text-brand-dark font-semibold text-sm hover:bg-brand-goldHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm &amp; Update Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-brand-cream">Password Reset Complete</h3>
              <p className="text-xs text-brand-muted max-w-xs mx-auto">
                Your password has been successfully updated. You can now access your Occasion Desk workspace.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-brand-gold text-brand-dark font-semibold text-sm hover:bg-brand-goldHover transition-all shadow-lg shadow-brand-gold/15"
              >
                Proceed to Partner Login →
              </Link>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/login" className="text-xs text-brand-muted hover:text-brand-cream transition-colors">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
