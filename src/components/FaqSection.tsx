'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, Shield, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    category: 'Operations',
    question: 'How is Occasion Desk different from generic CRMs or WhatsApp groups?',
    answer:
      'Generic CRMs treat events like cold sales leads. Occasion Desk is custom-engineered for event management agencies, catering teams, and stage décor studios. It models the actual 5-stage lifecycle (Intake, Delegation, Visits, Proposals, and Advances), tracks Veg/Non-Veg headcount split, schedules walkthroughs with synchronized .ics calendar files, and tracks payment milestone advances with zero WhatsApp confusion.',
  },
  {
    category: 'Onboarding',
    question: 'How fast can our event agency or catering company start using Occasion Desk?',
    answer:
      'In under 60 seconds. There is no credit card required and no lengthy sales gate. You can self-onboard your agency, set your default location and currency (₹ INR), enroll your partner network (caterers, florists, AV engineers), and immediately start logging bookings from walk-ins or phone calls.',
  },
  {
    category: 'Multi-Partner',
    question: 'Can my catering manager and stage florist collaborate on the same booking?',
    answer:
      'Yes. Occasion Desk features multi-partner scoping. You can enroll your vendors, assign specific coordinators to bookings, and manage day-of execution without exposing your master financial ledger or proprietary pricing to sub-vendors.',
  },
  {
    category: 'Financials',
    question: 'How are client quotes and payment advances handled?',
    answer:
      'You can draft itemized proposals in seconds with custom line items and required deposit percentages (e.g. 30%). Clients receive a clean digital proposal. When an advance is received via UPI, bank transfer, or cash, logging it in Occasion Desk automatically locks the date and advances the status to Confirmed.',
  },
  {
    category: 'Security',
    question: 'How does password reset work without third-party telecom fees?',
    answer:
      'Occasion Desk uses Resend transactional email delivery (3,000 free emails/month) coupled with stateless HMAC-SHA256 one-time passcodes (OTP). When you request a reset, a 6-digit verification code is delivered directly to your registered email inbox in seconds with single-use, 10-minute validity and zero third-party telecom billing.',
  },
  {
    category: 'Flexibility',
    question: 'Can I delete an event booking if a client cancels or reschedules?',
    answer:
      'Yes, you can delete any event booking at any point. To prevent accidental data loss, Occasion Desk presents an explicit confirmation popup modal detailing all associated site visits, proposals, and payment records before executing a permanent cascade delete.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggleFaq(idx: number) {
    setOpenIndex(openIndex === idx ? null : idx);
  }

  return (
    <section id="faq" className="py-24 bg-brand-charcoal/40 relative border-b border-white/5 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream font-medium">
            Everything You Need to Know
          </h2>
          <p className="text-brand-muted text-sm sm:text-base max-w-xl mx-auto">
            Clear, honest answers about Occasion Desk, multi-partner scoping, advances, and workflow security.
          </p>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-brand-charcoal border-brand-gold/40 shadow-lg shadow-black/20'
                    : 'bg-brand-surface/60 border-white/5 hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-gold/10 text-brand-gold uppercase tracking-wider hidden sm:inline-block">
                      {faq.category}
                    </span>
                    <span className="font-serif text-base sm:text-lg text-brand-cream font-medium">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-lg bg-brand-dark/70 border border-white/10 flex items-center justify-center text-brand-gold flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-brand-gold/20' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-brand-muted leading-relaxed border-t border-white/5 pt-4">
                    <p className="text-pretty">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Doubt-Reducing Microcopy Footer */}
        <div className="mt-10 p-4 rounded-2xl bg-brand-surface/50 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-muted">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Have a specific agency workflow requirement?</span>
          </div>
          <a
            href="#demo"
            className="text-brand-gold hover:underline font-semibold flex items-center gap-1"
          >
            Connect directly with Ashwin Saji →
          </a>
        </div>
      </div>
    </section>
  );
}
