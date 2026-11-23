'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Phone,
  Smartphone,
  KeyRound,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import {
  isFirebaseConfigured,
  getFirebaseAuth,
  createRecaptchaVerifier,
  sendFirebasePhoneOtp,
} from '@/lib/firebase';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();

  // Mode: 'phone' (primary) | 'password' (fallback)
  const [loginMode, setLoginMode] = useState<'phone' | 'password'>('phone');

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('+91 9188444859');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Password Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (phoneStep === 'otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneStep, countdown]);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, []);

  // 1. Handle Send SMS OTP
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
          recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-container', auth);
        }

        const confirmation = await sendFirebasePhoneOtp(formattedPhone, recaptchaVerifierRef.current);
        setConfirmationResult(confirmation);
        setSuccessMsg(`SMS verification code sent to ${formattedPhone}`);
      } else {
        // Dev / Demonstration Mode (Firebase API keys not yet populated in .env)
        console.log(`[Demo Phone OTP] Simulating SMS dispatch to ${formattedPhone}. Test Code: 123456`);
        setSuccessMsg(`[Demo Mode] Simulated SMS OTP dispatched to ${formattedPhone}. Use code 123456`);
      }

      setPhoneStep('otp');
      setCountdown(45);
    } catch (err: unknown) {
      console.error('Send OTP error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send SMS OTP. Please check your mobile number.');
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

  // 2. Handle Verify SMS OTP & Login
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (otpCode.length < 6) {
        throw new Error('Please enter the complete 6-digit verification code.');
      }

      let idToken: string | undefined;

      if (isFirebaseConfigured && confirmationResult) {
        const userCredential = await confirmationResult.confirm(otpCode);
        idToken = await userCredential.user.getIdToken();
      } else {
        // Dev mock check: allow 123456 in demo mode
        if (otpCode !== '123456') {
          throw new Error('Invalid code. In demo mode, please enter 123456.');
        }
      }

      // Call Next.js Phone Login API to issue session cookie
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          idToken,
          isDevMock: !isFirebaseConfigured,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.notFound) {
          throw new Error('No partner agency found for this phone number. Please click "Register a New Business" below to onboard.');
        }
        throw new Error(data.error || 'Authentication failed');
      }

      // Hard redirect to load session cookies into Desk
      window.location.href = data.redirect || '/desk';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  }

  // 3. Handle Password Login (Secondary tab)
  async function handlePasswordLogin(e: React.FormEvent) {
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

      window.location.href = '/desk';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

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
            Partner Authentication
          </div>
          <h2 className="text-3xl font-serif text-brand-cream">
            Sign in to Occasion Desk
          </h2>
          <p className="text-xs text-brand-muted mt-2">
            Instant mobile access for event planners, caterers &amp; décor partners
          </p>
        </div>

        {/* Tab Switcher: Mobile OTP vs Password */}
        <div className="flex rounded-2xl bg-brand-charcoal/90 p-1 border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setLoginMode('phone');
              setError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              loginMode === 'phone'
                ? 'bg-brand-gold text-brand-dark shadow-md'
                : 'text-brand-muted hover:text-brand-cream'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile OTP (SMS)
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              loginMode === 'password'
                ? 'bg-brand-gold text-brand-dark shadow-md'
                : 'text-brand-muted hover:text-brand-cream'
            }`}
          >
            <Lock className="w-4 h-4" />
            Email &amp; Password
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-brand-charcoal/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {successMsg && !error && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PHONE SMS AUTH */}
          {loginMode === 'phone' && (
            <div>
              {phoneStep === 'input' ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-gold" /> Registered Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 91884 44859"
                        className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors font-mono tracking-wide"
                      />
                    </div>
                    <p className="text-[11px] text-brand-muted/80 mt-1.5">
                      Enter with country code (e.g. +91 9188444859). Firebase will send a 6-digit SMS OTP.
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
                        Send Verification Code via SMS
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center pb-2">
                    <div className="text-xs text-brand-muted">Code dispatched to</div>
                    <div className="text-sm font-mono text-brand-gold font-semibold">{phoneNumber}</div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-brand-gold" /> Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full bg-brand-dark/90 border border-white/10 rounded-xl px-4 py-3.5 text-center text-xl text-brand-cream tracking-[0.5em] font-mono focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setPhoneStep('input')}
                      className="text-brand-muted hover:text-brand-cream transition-colors"
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
                    className="w-full py-3.5 px-6 rounded-xl bg-brand-gold text-brand-dark font-semibold text-sm hover:bg-brand-goldHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify &amp; Enter Desk
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Demo Auto-fill Helper */}
              <div className="pt-5 mt-6 border-t border-white/5 text-xs text-brand-muted space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-brand-gold/80 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick Demo Test:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('+91 9188444859');
                    setPhoneStep('otp');
                    setOtpCode('123456');
                    setSuccessMsg('Demo credentials filled. Click "Verify & Enter Desk" to sign in.');
                  }}
                  className="w-full text-left text-brand-cream hover:text-brand-gold transition-colors flex justify-between bg-brand-dark/50 p-2.5 rounded-xl border border-white/5"
                >
                  <span>✦ Ashwin Saji Demo (+91 9188444859)</span>
                  <span className="text-brand-gold font-medium">Auto-fill &amp; Code</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD AUTH */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-gold" /> Partner Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. demo@occasiondesk.com"
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
                    Authenticate &amp; Enter Desk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-white/5 text-xs text-brand-muted space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@occasiondesk.com');
                    setPassword('Demo@2026!');
                  }}
                  className="w-full text-left text-brand-cream hover:text-brand-gold transition-colors flex justify-between bg-brand-dark/50 p-2.5 rounded-xl border border-white/5"
                >
                  <span>✦ Demo Studio (Lead Planner)</span>
                  <span className="text-brand-gold">Auto-fill password</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Navigation */}
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
