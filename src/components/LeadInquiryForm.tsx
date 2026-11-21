'use client';

import { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, Calendar, MapPin, Users, Sparkles } from 'lucide-react';

export default function LeadInquiryForm() {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    occasionType: 'Wedding Ceremony',
    targetDate: '',
    venueName: '',
    venueCity: 'Punalur',
    guestCount: '',
    budgetRange: '₹3,00,000 - ₹5,00,000',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ leadId?: string; whatsappPartner1?: string; whatsappPartner2?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const occasions = [
    'Wedding Ceremony',
    'Grand Reception',
    'Engagement & Ring Ceremony',
    'Intimate Mini Event / Birthday',
    'Corporate & Gala Evening',
  ];

  const budgetOptions = [
    '₹1,50,000 - ₹3,00,000',
    '₹3,00,000 - ₹5,00,000',
    '₹5,00,000 - ₹10,00,000',
    '₹10,00,000+ (Bespoke Luxury)',
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setResult(data);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please call us directly.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (success && result) {
    return (
      <div className="bg-brand-charcoal/90 border border-brand-gold/40 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-serif text-brand-cream font-medium mb-3">Inquiry Confirmed</h3>
        <p className="text-brand-muted text-sm sm:text-base mb-6 leading-relaxed">
          Thank you, <span className="text-brand-cream font-medium">{formData.clientName}</span>. Your event details have been recorded in Occasion Desk. A dedicated senior planner is reviewing your date and will reach out shortly.
        </p>

        <div className="bg-brand-dark/60 rounded-xl p-4 border border-white/5 mb-8 text-left text-xs text-brand-muted space-y-1">
          <div><span className="text-brand-cream">Reference ID:</span> {result.leadId}</div>
          <div><span className="text-brand-cream">Occasion:</span> {formData.occasionType}</div>
          <div><span className="text-brand-cream">Estimated Date:</span> {formData.targetDate || 'To be finalized'}</div>
          <div><span className="text-brand-cream">Location:</span> {formData.venueCity}</div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="text-xs text-brand-muted uppercase tracking-wider font-semibold">
            Connect Instantly With Our Planners:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.whatsappPartner1 && (
              <a
                href={result.whatsappPartner1}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white text-xs font-medium hover:bg-[#20ba59] transition-all shadow-md shadow-[#25D366]/20"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Jomit (+91 90746 24023)
              </a>
            )}

            {result.whatsappPartner2 && (
              <a
                href={result.whatsappPartner2}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white text-xs font-medium hover:bg-[#20ba59] transition-all shadow-md shadow-[#25D366]/20"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Savio (+91 89217 44145)
              </a>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setFormData({
              clientName: '',
              clientPhone: '',
              clientEmail: '',
              occasionType: 'Wedding Ceremony',
              targetDate: '',
              venueName: '',
              venueCity: 'Punalur',
              guestCount: '',
              budgetRange: '₹3,00,000 - ₹5,00,000',
              notes: '',
            });
          }}
          className="mt-4 text-xs text-brand-muted hover:text-brand-gold transition-colors"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-brand-charcoal/80 border border-white/10 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6"
    >
      <div className="flex items-center gap-2 text-brand-gold text-xs font-semibold tracking-wider uppercase mb-1">
        <Sparkles className="w-4 h-4" />
        Bespoke Event Consultation
      </div>
      <h3 className="text-2xl sm:text-3xl font-serif text-brand-cream">
        Plan Your Celebration with Heavenly Events
      </h3>
      <p className="text-brand-muted text-sm leading-relaxed">
        Tell us about your envisioned occasion. We coordinate everything from custom stage architecture to floral palettes.
      </p>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
            Your Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="e.g. Ananya Nair"
            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
            Phone / WhatsApp Number *
          </label>
          <input
            type="tel"
            required
            value={formData.clientPhone}
            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            placeholder="client@example.com"
            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
            Occasion Type *
          </label>
          <select
            value={formData.occasionType}
            onChange={(e) => setFormData({ ...formData, occasionType: e.target.value })}
            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
          >
            {occasions.map((occ) => (
              <option key={occ} value={occ} className="bg-brand-charcoal text-brand-cream">
                {occ}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-gold" /> Estimated Date
          </label>
          <input
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-gold" /> City / Venue
          </label>
          <input
            type="text"
            value={formData.venueCity}
            onChange={(e) => setFormData({ ...formData, venueCity: e.target.value })}
            placeholder="Punalur / Kollam"
            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-gold" /> Guest Count
          </label>
          <input
            type="number"
            value={formData.guestCount}
            onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
            placeholder="e.g. 500"
            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
          Estimated Budget Range
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {budgetOptions.map((budget) => (
            <button
              type="button"
              key={budget}
              onClick={() => setFormData({ ...formData, budgetRange: budget })}
              className={`py-2 px-3 text-xs rounded-lg border text-left transition-all ${
                formData.budgetRange === budget
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-medium'
                  : 'border-white/10 text-brand-muted hover:border-white/20'
              }`}
            >
              {budget}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
          Special Notes & Decor Preferences
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Tell us about your preferred themes, color palettes, stage requirements, or venue specifics..."
          className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-gold transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 rounded-xl bg-brand-gold text-brand-dark font-semibold text-sm sm:text-base hover:bg-brand-goldHover transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-brand-gold/10 disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Inquiry to Occasion Desk
          </>
        )}
      </button>

      <p className="text-center text-xs text-brand-muted">
        Direct intake. No third-party clipboard required. You will receive an immediate confirmation.
      </p>
    </form>
  );
}
