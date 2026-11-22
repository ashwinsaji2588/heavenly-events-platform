'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Building2,
  Sparkles,
  Users,
  Clock,
  Send,
} from 'lucide-react';

export default function DemoRequestSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Event Management Agency');
  const [monthlyEvents, setMonthlyEvents] = useState('5-15 Events / Month');
  const [requirements, setRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    directWhatsAppUrl: string;
    recipientEmail: string;
    recipientPhone: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          businessName,
          businessType,
          monthlyEvents,
          requirements,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit demo request');

      setResult({
        directWhatsAppUrl: data.directWhatsAppUrl,
        recipientEmail: data.recipientEmail || 'ashwinsaji2588@gmail.com',
        recipientPhone: data.recipientPhone || '9188444859',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting demo request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="demo" className="py-24 bg-brand-dark relative border-b border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Direct Concierge Access
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream font-medium">
            Request a Live Demo &amp; Connect
          </h2>
          <p className="text-brand-muted text-sm sm:text-base max-w-2xl mx-auto">
            See how Occasion Desk transforms intake, delegation, tasting visits, proposals, and advances for your agency. Connect directly with Ashwin Saji.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Founder Contacts */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-charcoal/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-gold font-semibold">
                  Direct Founder Line
                </span>
                <h3 className="text-2xl font-serif text-brand-cream font-medium">
                  Ashwin Saji
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Founder &amp; Principal Architect, Occasion Desk Studio. Reach out directly for custom agency workflows, volume onboarding, or partner white-labeling.
                </p>
              </div>

              {/* Direct Touchpoints */}
              <div className="space-y-3 pt-2">
                {/* Phone & WhatsApp */}
                <a
                  href="tel:+919188444859"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-brand-surface/70 hover:bg-brand-surface border border-white/5 hover:border-brand-gold/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-brand-muted uppercase tracking-wider">Direct Calling Line</div>
                    <div className="text-sm font-semibold text-brand-cream group-hover:text-brand-gold transition-colors font-mono">
                      +91 91884 44859
                    </div>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:ashwinsaji2588@gmail.com"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-brand-surface/70 hover:bg-brand-surface border border-white/5 hover:border-brand-gold/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-brand-muted uppercase tracking-wider">Official Email</div>
                    <div className="text-sm font-semibold text-brand-cream group-hover:text-brand-gold transition-colors truncate">
                      ashwinsaji2588@gmail.com
                    </div>
                  </div>
                </a>

                {/* WhatsApp Instant Chat */}
                <a
                  href="https://wa.me/919188444859?text=Hi%20Ashwin%2C%20I%20would%20like%20to%20learn%20more%20about%20Occasion%20Desk."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-emerald-300 uppercase tracking-wider">WhatsApp Concierge</div>
                    <div className="text-sm font-semibold text-brand-cream group-hover:text-emerald-300 transition-colors">
                      Chat 1-on-1 on WhatsApp
                    </div>
                  </div>
                </a>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-brand-muted">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                  <span>Guaranteed response within 2 business hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Zero obligations • Tailored 15-minute walkthrough</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Demo Request Form */}
          <div className="lg:col-span-7">
            <div className="bg-brand-charcoal/80 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6">
              
              {result ? (
                /* Success View */
                <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif text-brand-cream font-medium">
                      Demo Request Dispatched!
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
                      Thank you for your interest! Your details have been delivered directly to <strong className="text-brand-cream">{result.recipientEmail}</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-brand-surface/70 border border-white/5 max-w-md mx-auto text-xs space-y-1.5 text-left">
                    <div className="text-brand-muted">Direct Contact: <strong className="text-brand-cream">Ashwin Saji (+91 91884 44859)</strong></div>
                    <div className="text-brand-muted">Expected Response: <strong className="text-emerald-400">Within 2 hours</strong></div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={result.directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Start 1-on-1 Chat on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        setName('');
                        setPhone('+91 ');
                        setEmail('');
                        setBusinessName('');
                        setRequirements('');
                      }}
                      className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-brand-surface hover:bg-brand-charcoal text-brand-cream border border-white/10 text-xs font-medium transition-all"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              ) : (
                /* Form View */
                <>
                  <div className="space-y-1 pb-2 border-b border-white/5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-gold font-semibold">
                      Schedule 15-Minute Tour
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif text-brand-cream font-medium">
                      Tell Us About Your Business
                    </h3>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Ashwin Saji"
                          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                          Phone / WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 91884 44859"
                          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="planner@studio.com"
                          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                        />
                      </div>

                      {/* Business Name */}
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                          Business / Agency Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Royal Occasions &amp; Catering"
                          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                          Business Category
                        </label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                        >
                          <option value="Event Management Agency">Event Management Agency</option>
                          <option value="Catering & Banquet Service">Catering &amp; Banquet Service</option>
                          <option value="Stage Décor & Mandap Studio">Stage Décor &amp; Mandap Studio</option>
                          <option value="AV, Sound & Trussing Firm">AV, Sound &amp; Trussing Firm</option>
                          <option value="Ballroom / Convention Center">Ballroom / Convention Center</option>
                        </select>
                      </div>

                      {/* Monthly Events */}
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                          Monthly Event Volume
                        </label>
                        <select
                          value={monthlyEvents}
                          onChange={(e) => setMonthlyEvents(e.target.value)}
                          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                        >
                          <option value="1-5 Events / Month">1–5 Events / Month</option>
                          <option value="5-15 Events / Month">5–15 Events / Month</option>
                          <option value="15-30 Events / Month">15–30 Events / Month</option>
                          <option value="30+ High-Volume Events">30+ High-Volume Events</option>
                        </select>
                      </div>
                    </div>

                    {/* Notes / Needs */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                        Specific Operational Requirements (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Tell us what you'd love to see in the walkthrough (e.g. food tasting calendar sync, multi-partner quote approvals, advance milestone receipts)..."
                        className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || !name || !phone || !businessName}
                      className="w-full py-4 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs sm:text-sm hover:bg-brand-goldHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15 active:scale-98 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Transmitting Demo Request...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Request Personalized Live Demo →</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-brand-muted pt-1">
                      No sales spam. Ashwin Saji will review your request and connect personally within 2 hours.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
