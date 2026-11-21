import React from 'react';
import { Calendar, Compass, Palette, Sparkles, CheckCircle2 } from 'lucide-react';

interface Step {
  step: string;
  title: string;
  timing: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  deliverable: string;
}

const STEPS: Step[] = [
  {
    step: '01',
    title: 'The Coffee & Vision Discovery',
    timing: 'Day 1 - 3',
    description: 'We meet in person or via WhatsApp to understand your family tradition, preferred color palettes, guest count, and auditorium/church constraints.',
    icon: Compass,
    deliverable: 'Initial Moodboard & Feasibility Audit',
  },
  {
    step: '02',
    title: '3D Spatial Blueprint & Floral Design',
    timing: 'Week 1',
    description: 'Our creative studio drafts precise dimensions for your stage arch, mandap height, trussing angles, bridal entry walkway, and guest dining ambience.',
    icon: Palette,
    deliverable: 'Customized 3D Layout & Itemized Estimate',
  },
  {
    step: '03',
    title: 'Lighting, Acoustic & Vendor Choreography',
    timing: '2 Weeks Prior',
    description: 'We coordinate with caterers, photographers, light technicians, and pyrotechnics teams so every transition is sequenced down to the minute.',
    icon: Calendar,
    deliverable: 'Day-of Run Sheet & Power Contingency Plan',
  },
  {
    step: '04',
    title: 'Flawless Day-of Execution',
    timing: 'The Big Day',
    description: 'Our lead planners are on-site 8 hours before guest arrival. We oversee lighting cues, flower freshness, and stage reveals while your family celebrates stress-free.',
    icon: Sparkles,
    deliverable: '100% On-Time, Picture-Perfect Celebration',
  },
];

export default function EventTimelineSection() {
  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-white/10 text-brand-gold text-xs font-semibold tracking-wider uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" />
            The DaisyUI Process Framework
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream">
            The Heavenly Journey
          </h2>
          <p className="text-brand-muted text-sm sm:text-base">
            How we take your celebration from an initial dream to a grand, breathtaking reality with zero last-minute panic.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-3xl bg-brand-charcoal/50 border border-white/5 p-8 flex flex-col justify-between hover:border-brand-gold/40 hover:bg-brand-charcoal/80 transition-all duration-300 group shadow-lg"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-dark transition-all duration-300 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-mono font-bold text-white/20 group-hover:text-brand-gold/40 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="text-[11px] font-mono tracking-wider uppercase text-brand-gold font-semibold">
                    {item.timing}
                  </div>
                  <h3 className="text-xl font-serif text-brand-cream group-hover:text-brand-gold transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-brand-muted text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="text-[11px] text-brand-muted uppercase tracking-wider">Deliverable</div>
                  <div className="text-xs font-medium text-brand-cream mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                    {item.deliverable}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
