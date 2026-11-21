'use client';

import React from 'react';
import { Check, Sparkles, MessageCircle, ArrowUpRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import TiltCard from './TiltCard';

interface Tier {
  id: string;
  name: string;
  subtitle: string;
  priceRange: string;
  badge?: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
  whatsAppMsg: string;
}

const TIERS: Tier[] = [
  {
    id: 'intimate',
    name: 'Curated Intimacy',
    subtitle: 'Engagements, Ring Ceremonies & Haldi/Mehendi',
    priceRange: '₹75,000 – ₹1.75 Lakhs',
    features: [
      'Custom Backdrop (Curved Arch or Wooden Frame)',
      'Fresh Exotic Floral Arrangement (Roses, Orchids, Baby’s Breath)',
      'Bridal Sofa / Loveseat & Accent Side Tables',
      'Warm LED Par Spotlighting & Uplighting Scapes',
      'Welcome Easel Board with Calligraphy Personalization',
      'Dedicated On-Site Supervisor for Setup & Tear-down',
    ],
    ctaText: 'Inquire for Intimate Event',
    whatsAppMsg: 'Hello Heavenly Events! I would like to inquire about the Curated Intimacy package for an upcoming celebration.',
  },
  {
    id: 'signature',
    name: 'Signature Wedding & Mandap',
    subtitle: 'Grand Traditional & Church Nuptials',
    priceRange: '₹2.5 Lakhs – ₹5.5 Lakhs',
    badge: 'Most Popular in Kollam & Punalur',
    popular: true,
    features: [
      'Full-Width Stage Architecture (Up to 40ft Mandap / Backdrop)',
      'Multi-Tier Floral Arch with Fresh Hanging Wisteria & Marigold',
      'Illuminated Bridal Walkway & Carpet Runway Aisle',
      'VIP Front-Row Seating & Stage Sofas with Velour Finish',
      'Ambient Intelligent Moving Heads & Warm Wash Light Truss',
      'Custom Entrance Arch & Photo-Op Floral Photobooth',
      'Lead Project Manager on Site 10 Hours Prior to Event',
    ],
    ctaText: 'Check Wedding Date Availability',
    whatsAppMsg: 'Hello Jomit & Savio! We are planning a wedding and want to check availability for the Signature Wedding & Mandap styling.',
  },
  {
    id: 'imperial',
    name: 'Imperial Gala & Sangeet',
    subtitle: 'Full Venue Transformation & Large Scale Galas',
    priceRange: 'Bespoke Custom Quotation',
    features: [
      '360° Venue Scenography & Ceiling Fabric Drapes',
      'Curved Ultra-HD LED Video Wall Matrix with Motion Graphics',
      'Heavy-Duty Aluminum Box Trussing & Moving Beam Light Choreography',
      'Cold Spark Pyro Fountains & Dry-Ice Low Fog for Bridal Entry',
      'Custom Themed Dining Area Styling & Buffet Floral Centerpieces',
      'VIP Lounge Areas with Glass Tables & Amber Ambient Lanterns',
      'Complete Day-of Production Crew & Backup Power Contingency',
    ],
    ctaText: 'Request Imperial Bespoke Plan',
    whatsAppMsg: 'Hello Heavenly Events team! We have a large wedding/reception and would like to request a bespoke quote for the Imperial Gala tier.',
  },
];

export default function ExperiencePricingSection() {
  const getWhatsAppLink = (msg: string) => {
    return `https://wa.me/919074624023?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className="py-24 bg-brand-deep/60 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-white/10 text-brand-gold text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Transparent Styling Tiers
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream">
              Investment & Experiences
            </h2>
            <p className="text-brand-muted text-sm sm:text-base">
              Honest pricing with zero hidden add-ons. Every tier includes 3D visual previews, fresh flower guarantee, and professional on-time execution.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {TIERS.map((tier, idx) => (
            <ScrollReveal key={tier.id} direction="up" delay={0.15 * (idx + 1)}>
              <TiltCard className="h-full">
                <div
                  className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 h-full ${
                    tier.popular
                      ? 'bg-brand-charcoal border-2 border-brand-gold shadow-2xl shadow-brand-gold/10'
                      : 'bg-brand-charcoal/50 border border-white/5 hover:border-brand-gold/30'
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 py-1 px-4 rounded-full bg-brand-gold text-brand-dark text-xs font-semibold tracking-wide shadow-md whitespace-nowrap">
                      {tier.badge}
                    </div>
                  )}

                  <div>
                    <div className="text-xs uppercase tracking-wider text-brand-gold font-semibold">
                      {tier.name}
                    </div>
                    <div className="text-xs text-brand-muted mt-1">{tier.subtitle}</div>

                    <div className="mt-4 mb-6 pt-4 border-t border-white/5">
                      <div className="text-2xl sm:text-3xl font-serif text-brand-cream font-bold">
                        {tier.priceRange}
                      </div>
                      <div className="text-[11px] text-brand-muted mt-1">Starting estimation • All included</div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="text-xs sm:text-sm text-brand-cream/90 flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={getWhatsAppLink(tier.whatsAppMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-3.5 px-6 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      tier.popular
                        ? 'bg-brand-gold text-brand-dark hover:bg-brand-goldHover shadow-brand-gold/20'
                        : 'bg-brand-surface hover:bg-brand-gold hover:text-brand-dark text-brand-cream border border-white/10'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
