'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollReveal from '@/components/ScrollReveal';
import TiltCard from '@/components/TiltCard';
import KineticCounter from '@/components/KineticCounter';
import FloatingBadge from '@/components/FloatingBadge';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Utensils,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  DollarSign,
  Layers,
  Volume2,
  Clock,
  PhoneCall,
  FileText,
  Building2,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  Check,
  MapPin,
  Receipt,
  MessageCircle,
} from 'lucide-react';

export default function SaaSProductLandingPage() {
  const [activeIndustry, setActiveIndustry] = useState<'events' | 'catering' | 'decor' | 'av'>('events');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);

  const industries = [
    {
      id: 'events',
      label: 'Event Management & Weddings',
      icon: Sparkles,
      tagline: 'End-to-end client journey from first phone call to final day-of execution.',
      pains: [
        'Leads lost in scattered personal WhatsApp chats',
        'Confusion over client budget and initial consultation dates',
        'Sub-vendors accidentally seeing confidential agency profit margins',
      ],
      solutions: [
        'Centralized visual Kanban pipeline with 1-click status progression',
        'Manual phone/walk-in booking entry with immediate lead partner assignment',
        'Field-level role privacy protecting agency fee and vendor costs',
      ],
      previewHeadline: 'Royal Wedding & Reception (800 Guests)',
      previewDetails: 'River Palace Auditorium • Full Décor, Catering & Live Band',
    },
    {
      id: 'catering',
      label: 'Catering & Banquets',
      icon: Utensils,
      tagline: 'Headcount accuracy, live counters, tasting logs, and per-plate costing.',
      pains: [
        'Costly food wastage or embarrassing food shortages from unverified counts',
        'Confusion between Veg, Non-Veg, and VIP dietary requirements',
        'Untracked food tasting feedback and last-minute menu change disputes',
      ],
      solutions: [
        'Automated Headcount Split Calculator (Veg vs. Non-Veg split with safety buffers)',
        'Menu blueprint builder (Starters, Live Chaat, Sadhya/Buffet, Desserts)',
        'Food tasting scheduler with client sign-off records',
      ],
      previewHeadline: 'Grand Sadhya & Evening Buffet (1,200 Plates)',
      previewDetails: '350 Traditional Veg Sadhya • 850 Non-Veg Dinner Buffet',
    },
    {
      id: 'decor',
      label: 'Stage Architecture & Décor',
      icon: Layers,
      tagline: 'Venue measurements, trussing heights, floral recipes, and 3D blueprints.',
      pains: [
        'Stage dimensions mismatched with auditorium ceiling heights',
        'Floral freshness logistics and missing flower color palettes',
        'Uncoordinated setup truck arrival times and hall entry access windows',
      ],
      solutions: [
        'Built-in venue dimension logs (Width × Height × Depth) per booking',
        'Floral recipe and palette swatch documentation',
        'Site inspection scheduler with direct iCal & Google Calendar synchronization',
      ],
      previewHeadline: 'Lotus Mandap & Floral Ceiling Arch',
      previewDetails: '40ft Stage Width • 16ft Truss Height • Amber Mood Lighting',
    },
    {
      id: 'av',
      label: 'Sound, Lighting & AV Production',
      icon: Volume2,
      tagline: 'Power requirements, moving head cues, generator loads, and audio riders.',
      pains: [
        'Sudden circuit breaker trips from uncalculated generator power loads',
        'Missing day-of sound check windows causing delay in bridal entry',
        'Crew members not knowing audio cues or pyrotechnic safety timings',
      ],
      solutions: [
        'Equipment checklist: Trussing, line array, cold pyro, and wash lights',
        'Generator and power load (kW) verification field on booking record',
        'Master minute-by-minute run sheet shared with technicians',
      ],
      previewHeadline: 'Gala Sangeet & Acoustic Curve Truss',
      previewDetails: '12 Moving Heads • 25kW Generator Load • Cold Spark Cues',
    },
  ];

  const workflowSteps = [
    {
      step: 1,
      name: 'Intake & Rapid Triage',
      shortName: '1. Intake',
      icon: PhoneCall,
      subtitle: 'Capture every phone call, Instagram DM, and walk-in lead in 30 seconds.',
      description:
        'Stop losing booking details in individual chat threads. Centralize every inquiry with client name, phone number, occasion type, venue city, and budget range into an active Kanban card.',
      deliverables: [
        'Instant manual intake modal with field validation',
        'Automatic routing to uncontacted triage queue',
        'Zero lost phone numbers or forgotten follow-ups',
      ],
      previewCard: {
        stepBadge: 'Stage 01 • Ingestion',
        title: 'Wedding Ceremony & Reception',
        clientName: 'Priya & Vignesh',
        clientPhone: '+91 91884 44859',
        venue: 'Grand Waterfront Ballroom, Kollam',
        date: '28 Dec 2026',
        budget: '₹4,50,000 - ₹6,00,000',
        status: 'NEW INQUIRY',
        statusClass: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
        actionSnippet: 'Next Action: Mark Contacted & Assign Lead Planner',
      },
    },
    {
      step: 2,
      name: 'Partner Delegation & Privacy',
      shortName: '2. Delegation',
      icon: Users,
      subtitle: 'Delegate catering, lighting, and décor without leaking agency profit margins.',
      description:
        'Invite head chefs, stage decorators, and sound technicians to your workspace. Field-level privacy safeguards sensitive agency fees and overall client budget so partners see only their execution scope.',
      deliverables: [
        'Dedicated partner accounts with role-scoped logins',
        'Confidential agency markups masked by default',
        'One-click WhatsApp credentials dispatch to new partners',
      ],
      previewCard: {
        stepBadge: 'Stage 02 • Delegation',
        title: 'Stage Mandap & Amber Lighting Truss',
        clientName: 'Assigned Partner: Décor Lead (Alex Morgan)',
        clientPhone: '+91 91884 44859',
        venue: 'Floral Arch & LED Beam Rigging',
        date: 'Scope Handoff Active',
        budget: 'Confidential Agency Scope [Masked]',
        status: 'DELEGATED',
        statusClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        actionSnippet: 'Partner View Active • Agency Net Margin Protected',
      },
    },
    {
      step: 3,
      name: 'Site Inspection & Menu Tastings',
      shortName: '3. Site Visits',
      icon: Calendar,
      subtitle: 'Coordinate venue measurements and tasting approvals with live .ICS calendar sync.',
      description:
        'Schedule on-site ballroom walkthroughs and tasting sessions. Occasion Desk generates synchronized .ics calendar files that import directly into Google Calendar and Apple Calendar for planners and clients.',
      deliverables: [
        'Universal .ICS calendar invitations generated instantly',
        'Venue GPS directions and walkthrough checklist embedded',
        'Live countdown to inspection with zero double-booking risk',
      ],
      previewCard: {
        stepBadge: 'Stage 03 • Inspection',
        title: 'Venue Walkthrough & Food Tasting',
        clientName: 'Client: Priya & Vignesh (650 Guests)',
        clientPhone: '+91 91884 44859',
        venue: 'The Grand Waterfront Ballroom, Kollam',
        date: 'Thursday, 3:30 PM - 5:30 PM',
        budget: 'Checklist: Truss points, Generator load, Bride aisle',
        status: 'VISIT CONFIRMED',
        statusClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        actionSnippet: 'Synced with Google & Apple Calendar (.ics ready)',
      },
    },
    {
      step: 4,
      name: 'Itemized Digital Proposals',
      shortName: '4. Quotations',
      icon: FileText,
      subtitle: 'Transparent line-item scope that clients accept on WhatsApp in one tap.',
      description:
        'Itemize stage décor, buffet headcount per plate, ambient lighting, and photography. Occasion Desk calculates deposit percentages automatically and renders an elegant, print-ready digital proposal URL.',
      deliverables: [
        'Dynamic itemized line items with live total calculations',
        'Configurable deposit percentage requirement (20% - 50%)',
        'Direct "Accept Proposal via WhatsApp" button for instant client signoff',
      ],
      previewCard: {
        stepBadge: 'Stage 04 • Proposal',
        title: 'Proposal #PROP-8392 Scope Breakdown',
        clientName: 'Total Scope: ₹4,80,000 (INR)',
        clientPhone: '+91 91884 44859',
        venue: 'Mandap (₹1.8L) • Banquets (₹2.4L) • Sound (₹60k)',
        date: '25% Required Deposit: ₹1,20,000',
        budget: 'Digital Shareable Link Active',
        status: 'PROPOSAL DISPATCHED',
        statusClass: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
        actionSnippet: 'Client Acceptance via 1-Click WhatsApp CTA',
      },
    },
    {
      step: 5,
      name: 'Advance Ledger & WhatsApp Receipts',
      shortName: '5. Lock-in',
      icon: TrendingUp,
      subtitle: 'Record lock-in deposits and dispatch branded WhatsApp payment receipts instantly.',
      description:
        'Log UPI transactions, bank transfers, or cash advances. The instant the advance is recorded, Occasion Desk auto-advances the lead to BOOKED and generates a formatted payment receipt card ready to share with the client.',
      deliverables: [
        'Automated progression from PROPOSAL_SENT to BOOKED upon deposit',
        'Pre-composed WhatsApp receipt card with payment reference',
        'Real-time cash ledger tracking advances vs. outstanding balances',
      ],
      previewCard: {
        stepBadge: 'Stage 05 • Locked Date',
        title: '₹1,20,000 Advance Deposit Recorded',
        clientName: 'Client: Priya & Vignesh (Confirmed)',
        clientPhone: '+91 91884 44859',
        venue: 'Method: Google Pay (UTR #93827104)',
        date: 'Remaining Balance: ₹3,60,000',
        budget: 'Date Officially Confirmed on Master Ledger',
        status: 'BOOKED & SECURED',
        statusClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        actionSnippet: 'WhatsApp Receipt Card Dispatched • Date Locked',
      },
    },
  ];

  const activeIndData = industries.find((i) => i.id === activeIndustry)!;

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark overflow-x-hidden transition-colors">
      <ScrollProgress />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden border-b border-white/5">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-gold/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <ScrollReveal direction="down">
              <FloatingBadge
                text="The Operating System for Occasion Businesses"
                subtext="Event Management • Catering • Décor • AV"
              />
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15}>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-brand-cream leading-[1.15] sm:leading-[1.08]">
                Manage Every Event, <br className="hidden sm:inline" />
                Menu &amp; Milestone. <br />
                <span className="italic text-brand-gold font-serif">
                  Zero WhatsApp Chaos.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.25}>
              <p className="text-brand-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                The all-in-one platform engineered for event management agencies, catering teams, and stage décor studios. Self-onboard your business in 60 seconds, enroll your partner network, enter bookings manually, and track advances with guaranteed peace of mind.
              </p>
            </ScrollReveal>

            {/* Action Buttons */}
            <ScrollReveal direction="up" delay={0.35}>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/onboard"
                  className="relative group py-4 px-8 rounded-2xl bg-brand-gold text-brand-dark font-bold text-sm sm:text-base overflow-hidden transition-all flex items-center gap-2 shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10">Onboard Your Business Free</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                </Link>

                <Link
                  href="/desk"
                  className="py-4 px-7 rounded-2xl bg-brand-charcoal border border-white/10 text-brand-cream font-medium text-sm sm:text-base hover:bg-brand-surface hover:border-brand-gold/30 transition-all flex items-center gap-2"
                >
                  <span>Explore Live Workspace</span>
                  <ArrowUpRight className="w-4 h-4 text-brand-gold" />
                </Link>
              </div>

              <div className="pt-4 flex items-center justify-center gap-6 text-xs text-brand-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Zero Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Instant 60-Second Setup
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Multi-Partner Scoping
                </span>
              </div>
            </ScrollReveal>

          </div>

          {/* Live Product Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto">
            <ScrollReveal direction="up" delay={0.4}>
              <TiltCard>
                <div className="rounded-3xl bg-brand-charcoal border border-white/10 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
                  
                  {/* Mock Window Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                        <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-xs text-brand-muted font-mono ml-2">
                        Occasion Desk CRM · Grand Royal Events &amp; Catering
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs py-1 px-3 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 font-medium">
                        Active Workspace
                      </span>
                    </div>
                  </div>

                  {/* Mock Kanban Pipeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
                    
                    {/* Col 1 */}
                    <div className="rounded-2xl bg-brand-dark/60 p-4 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-cream uppercase tracking-wider">New Inquiries</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold font-mono">3</span>
                      </div>
                      <div className="p-3 rounded-xl bg-brand-surface border border-white/5 space-y-1.5">
                        <div className="font-serif font-medium text-xs text-brand-cream">Rahul &amp; Ananya Wedding</div>
                        <div className="text-[11px] text-brand-muted">Kollam • 800 Guests (₹12L)</div>
                        <div className="text-[10px] text-brand-gold font-mono pt-1">Added 2h ago (Phone Walk-in)</div>
                      </div>
                    </div>

                    {/* Col 2 */}
                    <div className="rounded-2xl bg-brand-dark/60 p-4 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-cream uppercase tracking-wider">Food Tasting / Visit</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono">2</span>
                      </div>
                      <div className="p-3 rounded-xl bg-brand-surface border border-purple-500/20 space-y-1.5">
                        <div className="font-serif font-medium text-xs text-brand-cream">Dr. Mathew Reception</div>
                        <div className="text-[11px] text-brand-muted">Tasting Confirmed • 650 Plates</div>
                        <div className="text-[10px] text-purple-300 font-mono pt-1">Tomorrow, 3:00 PM</div>
                      </div>
                    </div>

                    {/* Col 3 */}
                    <div className="rounded-2xl bg-brand-dark/60 p-4 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-cream uppercase tracking-wider">Proposal Sent</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono">4</span>
                      </div>
                      <div className="p-3 rounded-xl bg-brand-surface border border-indigo-500/20 space-y-1.5">
                        <div className="font-serif font-medium text-xs text-brand-cream">Thomas Engagement</div>
                        <div className="text-[11px] text-brand-muted">Quote: ₹3,50,000 (WhatsApp)</div>
                        <div className="text-[10px] text-indigo-300 font-mono pt-1">Deposit Due: ₹1,00,000</div>
                      </div>
                    </div>

                    {/* Col 4 */}
                    <div className="rounded-2xl bg-brand-dark/60 p-4 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Booked &amp; Advance Paid</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">6</span>
                      </div>
                      <div className="p-3 rounded-xl bg-brand-surface border border-emerald-500/20 space-y-1.5">
                        <div className="font-serif font-medium text-xs text-brand-cream">Sunil Golden Anniversary</div>
                        <div className="text-[11px] text-emerald-400 font-medium">₹1,50,000 Advance Locked</div>
                        <div className="text-[10px] text-brand-muted font-mono pt-1">Assigned: Chef &amp; Decorator</div>
                      </div>
                    </div>

                  </div>

                </div>
              </TiltCard>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* Industry Tabs Section: Who It's For */}
      <section id="industries" className="py-24 bg-brand-deep/50 border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold">
                Built For Your Industry
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream">
                Tailored for Every Event Professional
              </h2>
              <p className="text-brand-muted text-sm sm:text-base">
                Whether you coordinate 1,500-guest weddings, manage a 20-chef catering operation, or build 40ft stage arches, Occasion Desk adapts to your daily terminology.
              </p>
            </div>
          </ScrollReveal>

          {/* Industry Selection Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {industries.map((ind) => {
              const Icon = ind.icon;
              const isSelected = activeIndustry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustry(ind.id as typeof activeIndustry)}
                  className={`py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/20 scale-105'
                      : 'bg-brand-charcoal text-brand-muted hover:text-brand-cream hover:bg-brand-surface border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{ind.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Industry Deep-Dive Card */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="max-w-4xl mx-auto rounded-3xl bg-brand-charcoal border border-white/10 p-8 sm:p-12 shadow-xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
                <div>
                  <div className="text-xs text-brand-gold uppercase tracking-wider font-semibold">
                    Industry Specialization
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-brand-cream mt-1">
                    {activeIndData.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted mt-2">
                    {activeIndData.tagline}
                  </p>
                </div>
                <Link
                  href="/onboard"
                  className="py-3 px-6 rounded-xl bg-brand-surface hover:bg-brand-gold hover:text-brand-dark text-xs sm:text-sm font-semibold text-brand-gold transition-all border border-white/10 flex items-center gap-2 self-start"
                >
                  <span>Onboard in This Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Before vs With Occasion Desk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                
                {/* Pains */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✕</span> Everyday Operational Chaos
                  </div>
                  <ul className="space-y-3">
                    {activeIndData.pains.map((p, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-brand-muted flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80 mt-1.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solutions */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✓</span> With Occasion Desk
                  </div>
                  <ul className="space-y-3">
                    {activeIndData.solutions.map((s, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-brand-cream/90 flex items-start gap-2.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* The 4 Operational Superpowers */}
      <section id="features" className="py-24 bg-brand-dark relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream">
                Engineered for High-Stakes Events
              </h2>
              <p className="text-brand-muted text-sm sm:text-base">
                Everything you need to capture, organize, price, and execute events without dropped balls.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1: Manual Booking */}
            <ScrollReveal direction="up" delay={0.1}>
              <TiltCard className="h-full">
                <div className="rounded-3xl bg-brand-charcoal/60 border border-white/5 p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-all shadow-xl h-full space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center text-brand-gold shadow-md">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-serif text-brand-cream font-medium">
                      + Add Booking Manually
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                      Took a phone call or office walk-in? Enter client name, phone, venue, headcount (Veg/Non-Veg), and estimated budget in 15 seconds.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-brand-gold">
                    ✓ Immediate Pipeline Injection
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Feature 2: Partner Enrollment */}
            <ScrollReveal direction="up" delay={0.2}>
              <TiltCard className="h-full">
                <div className="rounded-3xl bg-brand-charcoal/60 border border-white/5 p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-all shadow-xl h-full space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center text-emerald-400 shadow-md">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-serif text-brand-cream font-medium">
                      Partner &amp; Vendor Hub
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                      Enroll external caterers, decorators, and technicians. Assign them to specific bookings while hiding your total agency contract value.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    ✓ Role-Scoped Privacy
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Feature 3: WhatsApp Proposals */}
            <ScrollReveal direction="up" delay={0.3}>
              <TiltCard className="h-full">
                <div className="rounded-3xl bg-brand-charcoal/60 border border-white/5 p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-all shadow-xl h-full space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center text-indigo-400 shadow-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-serif text-brand-cream font-medium">
                      1-Click WhatsApp Quotes
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                      Build line-item estimates in seconds. Auto-generate a beautiful mobile web proposal link and dispatch directly to client WhatsApp.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-indigo-300">
                    ✓ Digital Client Acceptance
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Feature 4: Advance & Ledger */}
            <ScrollReveal direction="up" delay={0.4}>
              <TiltCard className="h-full">
                <div className="rounded-3xl bg-brand-charcoal/60 border border-white/5 p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-all shadow-xl h-full space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center text-amber-400 shadow-md">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-serif text-brand-cream font-medium">
                      Advance &amp; Milestone Ledger
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                      Log UPI, bank transfers, and cash advances. Instantly see pending balances across your entire upcoming wedding season.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-amber-400">
                    ✓ Real-Time Cash Flow Clarity
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* 5-Stage Event Operations Workflow */}
      <section id="workflows" className="py-24 bg-brand-charcoal/30 relative border-b border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Operational Blueprint
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream text-balance">
                The 5-Stage Event Operating Workflow
              </h2>
              <p className="text-brand-muted text-sm sm:text-base text-pretty">
                How elite event planners, catering heads, and stage décor studios take a booking from first phone call to final day-of execution with zero WhatsApp chaos.
              </p>
            </div>
          </ScrollReveal>

          {/* Connected Kinetic Progress Rail */}
          <div className="max-w-3xl mx-auto mb-6 px-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-brand-muted mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                <span>LIFECYCLE PROGRESSION</span>
              </span>
              <span className="text-brand-gold font-bold">{activeWorkflowStep * 20}% COMPLETED</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-gold via-emerald-400 to-indigo-400 transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${(activeWorkflowStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Pill Navigation (Mobile Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
            {workflowSteps.map((s) => {
              const Icon = s.icon;
              const isActive = activeWorkflowStep === s.step;
              const isPast = s.step < activeWorkflowStep;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveWorkflowStep(s.step)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 active:scale-95 border ${
                    isActive
                      ? 'bg-brand-gold text-brand-dark border-brand-gold shadow-lg shadow-brand-gold/20 scale-[1.03] animate-badge-pop'
                      : isPast
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-brand-surface/70 text-brand-muted hover:text-brand-cream border-white/10 hover:border-brand-gold/30'
                  }`}
                >
                  {isPast ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>{s.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase with Fluid Motion Animation */}
          {(() => {
            const activeStep = workflowSteps.find((s) => s.step === activeWorkflowStep)!;

            return (
              <div
                key={activeWorkflowStep}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-brand-charcoal/80 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl animate-workflow-slide"
              >
                {/* Left: Step Details */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold flex items-center justify-center font-bold text-sm shadow-sm">
                      0{activeStep.step}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-brand-gold font-semibold">
                        Stage {activeStep.step} of 5
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-brand-cream font-medium">
                        {activeStep.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-brand-gold/90 font-medium text-sm sm:text-base leading-snug">
                    {activeStep.subtitle}
                  </p>

                  <p className="text-brand-muted text-xs sm:text-sm leading-relaxed text-pretty">
                    {activeStep.description}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {activeStep.deliverables.map((d, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-brand-cream/90">
                        <div className="w-4 h-4 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>

                  {/* Step Control Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={() => setActiveWorkflowStep((prev) => (prev > 1 ? prev - 1 : 5))}
                      className="py-2.5 px-4 rounded-xl bg-brand-surface text-brand-muted hover:text-brand-cream border border-white/10 text-xs font-medium transition-all active:scale-95"
                    >
                      ← Previous Stage
                    </button>
                    <button
                      onClick={() => setActiveWorkflowStep((prev) => (prev < 5 ? prev + 1 : 1))}
                      className="py-2.5 px-5 rounded-xl bg-brand-gold text-brand-dark font-semibold text-xs hover:bg-brand-goldHover transition-all flex items-center gap-1.5 shadow-md shadow-brand-gold/15 active:scale-95"
                    >
                      <span>Advance to {activeWorkflowStep === 5 ? 'Stage 1' : `Stage 0${activeWorkflowStep + 1}`}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href="/desk"
                      className="ml-auto text-xs text-brand-gold hover:underline hidden sm:inline-flex items-center gap-1 font-medium"
                    >
                      Open in Live Workspace ↗
                    </Link>
                  </div>
                </div>

                {/* Right: Live Realistic Preview Card */}
                <div className="lg:col-span-5">
                  <div className="bg-brand-dark/90 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden transition-all duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-muted">
                        {activeStep.previewCard.stepBadge}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${activeStep.previewCard.statusClass} animate-pulse`}>
                        {activeStep.previewCard.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-base font-serif font-medium text-brand-cream">
                        {activeStep.previewCard.title}
                      </div>
                      <div className="text-xs text-brand-gold font-medium">
                        {activeStep.previewCard.clientName}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-brand-surface/70 border border-white/5 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-brand-muted">
                        <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                        <span className="truncate">{activeStep.previewCard.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-brand-muted">
                        <Calendar className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                        <span>{activeStep.previewCard.date}</span>
                      </div>
                      <div className="text-[11px] text-brand-muted/90 font-mono">
                        {activeStep.previewCard.budget}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-brand-cream/90 font-medium truncate">
                        {activeStep.previewCard.actionSnippet}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    </div>

                    {/* Interactive Test-Drive Advance Trigger */}
                    <button
                      type="button"
                      onClick={() => setActiveWorkflowStep((prev) => (prev < 5 ? prev + 1 : 1))}
                      className="w-full py-2.5 px-3 rounded-xl bg-brand-surface/90 hover:bg-brand-surface border border-white/10 hover:border-brand-gold/40 text-xs text-brand-cream font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95 group"
                    >
                      <Zap className="w-3.5 h-3.5 text-brand-gold group-hover:scale-110 transition-transform" />
                      <span>Test Drive Next Stage →</span>
                    </button>
                    <div className="text-[10px] text-brand-muted text-center pt-1">
                      Concierge Support: +91 91884 44859
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* Transparent SaaS Pricing */}
      <section id="pricing" className="py-24 bg-brand-deep/50 relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold">
                Transparent Pricing
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream">
                Predictable Plans for Growing Firms
              </h2>
              <p className="text-brand-muted text-sm sm:text-base">
                Start with our Always Free plan to organize your immediate pipeline. Upgrade only when your partner network expands.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Tier 1: Free Forever */}
            <ScrollReveal direction="up" delay={0.1}>
              <TiltCard className="h-full">
                <div className="rounded-3xl p-8 bg-brand-charcoal/60 border border-white/5 flex flex-col justify-between h-full space-y-6">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-brand-gold font-semibold">
                      Starter Studio
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-cream mt-2">
                      ₹0 <span className="text-xs font-sans text-brand-muted font-normal">/ month forever</span>
                    </div>
                    <p className="text-xs text-brand-muted mt-2">
                      Perfect for independent wedding planners and boutique catering teams.
                    </p>
                    <ul className="space-y-3 mt-6 pt-6 border-t border-white/5 text-xs text-brand-cream/90">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Up to 25 Active Bookings
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Manual Phone &amp; Walk-In Entry
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        3 Partner / Team Seats
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Kanban Pipeline &amp; Calendar Sync
                      </li>
                    </ul>
                  </div>
                  <Link
                    href="/onboard"
                    className="py-3 px-6 rounded-xl bg-brand-surface hover:bg-brand-charcoal text-center text-xs font-semibold text-brand-cream border border-white/10 transition-colors"
                  >
                    Start Free
                  </Link>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Tier 2: Growth (Popular) */}
            <ScrollReveal direction="up" delay={0.2}>
              <TiltCard className="h-full">
                <div className="rounded-3xl p-8 bg-brand-charcoal border-2 border-brand-gold shadow-2xl shadow-brand-gold/10 flex flex-col justify-between h-full space-y-6 relative">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 py-1 px-4 rounded-full bg-brand-gold text-brand-dark text-xs font-semibold tracking-wide shadow-md whitespace-nowrap">
                    Most Popular
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-brand-gold font-semibold">
                      Growth Agency
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-cream mt-2">
                      ₹1,499 <span className="text-xs font-sans text-brand-muted font-normal">/ month</span>
                    </div>
                    <p className="text-xs text-brand-muted mt-2">
                      For established event management agencies and busy banquet catering firms.
                    </p>
                    <ul className="space-y-3 mt-6 pt-6 border-t border-white/5 text-xs text-brand-cream/90">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Unlimited Bookings &amp; Events
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        10 Partner &amp; Staff Roles with Privacy Scoping
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        WhatsApp Itemized Proposal Generator
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Catering Headcount (Veg/Non-Veg) Calculator
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Custom Branded Firm Intake URL
                      </li>
                    </ul>
                  </div>
                  <Link
                    href="/onboard"
                    className="py-3 px-6 rounded-xl bg-brand-gold text-brand-dark text-center text-xs font-bold hover:bg-brand-goldHover transition-colors shadow-lg shadow-brand-gold/20"
                  >
                    Onboard Growth Agency
                  </Link>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Tier 3: Multi-Branch Enterprise */}
            <ScrollReveal direction="up" delay={0.3}>
              <TiltCard className="h-full">
                <div className="rounded-3xl p-8 bg-brand-charcoal/60 border border-white/5 flex flex-col justify-between h-full space-y-6">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-brand-gold font-semibold">
                      Multi-Branch Production
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-cream mt-2">
                      ₹3,499 <span className="text-xs font-sans text-brand-muted font-normal">/ month</span>
                    </div>
                    <p className="text-xs text-brand-muted mt-2">
                      For multi-city event houses, convention centers, and large-scale caterers.
                    </p>
                    <ul className="space-y-3 mt-6 pt-6 border-t border-white/5 text-xs text-brand-cream/90">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Unlimited Partner Accounts &amp; Contractors
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Custom Domain (e.g. crm.yourcompany.com)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Dedicated PostgreSQL Isolation &amp; Audit Logs
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        Priority WhatsApp Concierge Onboarding
                      </li>
                    </ul>
                  </div>
                  <Link
                    href="/onboard"
                    className="py-3 px-6 rounded-xl bg-brand-surface hover:bg-brand-charcoal text-center text-xs font-semibold text-brand-cream border border-white/10 transition-colors"
                  >
                    Contact Enterprise
                  </Link>
                </div>
              </TiltCard>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-brand-dark relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <ScrollReveal direction="up">
            <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream">
              Ready to Stop Event Chaos?
            </h2>
            <p className="text-brand-muted text-sm sm:text-base max-w-xl mx-auto mt-3">
              Join hundreds of event coordinators, caterers, and decorators running their entire operations on Occasion Desk.
            </p>
            <div className="pt-6">
              <Link
                href="/onboard"
                className="inline-flex items-center gap-2 py-4 px-9 rounded-2xl bg-brand-gold text-brand-dark font-bold text-sm sm:text-base hover:bg-brand-goldHover transition-all shadow-xl shadow-brand-gold/20 hover:scale-105 active:scale-95"
              >
                <span>Onboard Your Firm in 60 Seconds</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
