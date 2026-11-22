'use client';

import { useState, useRef, MouseEvent } from 'react';
import {
  Calendar,
  MapPin,
  Check,
  ChevronRight,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  IndianRupee,
  Clock,
  PhoneCall,
} from 'lucide-react';

interface StageCard {
  step: number;
  shortName: string;
  badge: string;
  status: string;
  statusClass: string;
  title: string;
  clientName: string;
  venue: string;
  date: string;
  budget: string;
  actionSnippet: string;
  highlightTag: string;
  details: string[];
}

const deckStages: StageCard[] = [
  {
    step: 1,
    shortName: 'Intake',
    badge: 'STAGE 01 • INTAKE',
    status: 'LEAD LOGGED',
    statusClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    title: 'Client Walk-in / Phone Inquiry',
    clientName: 'Dr. Mathew Kurian (Wedding)',
    venue: 'Royal Ballroom, Kollam',
    date: 'Target: 14 Dec 2026',
    budget: '₹8,50,000 Estimated Budget',
    actionSnippet: 'Instant Intake • 650 Plates (400 Veg / 250 Non-Veg)',
    highlightTag: 'Fast 15-Second Entry',
    details: ['Headcount split captured', 'Phone inquiry logged', 'Immediate pipeline visibility'],
  },
  {
    step: 2,
    shortName: 'Delegation',
    badge: 'STAGE 02 • DELEGATION',
    status: 'PARTNERS SCOPED',
    statusClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    title: 'Partner Network Assignment',
    clientName: 'Elite Florals & Royal Spice Catering',
    venue: 'Kollam Convention Center',
    date: 'Assigned: Lead Planner Alex',
    budget: 'Multi-Partner Scoping Active',
    actionSnippet: 'Catering + Décor + AV Coordinators Enrolled',
    highlightTag: 'Role-Based Privacy',
    details: ['Florist assigned to mandap', 'Catering head notified', 'Zero master ledger leaks'],
  },
  {
    step: 3,
    shortName: 'Site Visits',
    badge: 'STAGE 03 • INSPECTION',
    status: 'VISIT CONFIRMED',
    statusClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    title: 'Venue Walkthrough & Food Tasting',
    clientName: 'Priya & Vignesh (650 Guests)',
    venue: 'The Grand Waterfront Ballroom, Kollam',
    date: 'Thursday, 3:30 PM - 5:30 PM',
    budget: 'Checklist: Truss points, Generator, Bride aisle',
    actionSnippet: 'Synced with Google & Apple Calendar (.ics ready)',
    highlightTag: 'Universal .ICS Sync',
    details: ['Ballroom measurements logged', 'Live tasting approved', 'Zero double-booking risk'],
  },
  {
    step: 4,
    shortName: 'Quotations',
    badge: 'STAGE 04 • PROPOSAL',
    status: 'QUOTE DELIVERED',
    statusClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    title: 'Itemized Proposal & Milestone Quote',
    clientName: 'Ananya & Rahul Wedding Reception',
    venue: 'Taj Gateway Grand Hall, Punalur',
    date: 'Deposit Required: 30% (₹1,56,000)',
    budget: 'Total Agreed Quote: ₹5,20,000',
    actionSnippet: 'Live Digital Proposal Link Generated',
    highlightTag: 'Instant PDF & Web Link',
    details: ['Itemized décor & lighting', 'Custom catering breakdown', '1-click client approval'],
  },
  {
    step: 5,
    shortName: 'Lock-in',
    badge: 'STAGE 05 • LOCK-IN',
    status: 'OFFICIALLY BOOKED',
    statusClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    title: 'Advance Deposit Received & Secured',
    clientName: 'Sneha & David Engagement',
    venue: 'Lakeside Pavilion & Lawn',
    date: 'Remaining Balance: ₹3,60,000',
    budget: 'Advance Paid: ₹1,60,000 (UPI Ref #78901)',
    actionSnippet: 'Date Locked on Master Ledger • Milestone Set',
    highlightTag: 'Guaranteed Peace of Mind',
    details: ['Advance receipt recorded', 'Date locked against duplicates', 'Day-of handover ready'],
  },
];

interface CypheirWorkflowDeckProps {
  activeStep: number;
  onSelectStep: (step: number) => void;
}

export default function CypheirWorkflowDeck({ activeStep, onSelectStep }: CypheirWorkflowDeckProps) {
  // Mouse coordinates for dynamic spotlight refraction (Cypheir effect)
  const [mousePos, setMousePos] = useState({ x: 200, y: 150 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  // Active card is front, subsequent cards stack behind
  const activeCardIndex = deckStages.findIndex((s) => s.step === activeStep);
  const currentCard = deckStages[activeCardIndex] || deckStages[0];

  // Up to 2 peek cards stacked behind for 3D depth
  const nextCard1 = deckStages[(activeCardIndex + 1) % deckStages.length];
  const nextCard2 = deckStages[(activeCardIndex + 2) % deckStages.length];

  return (
    <div className="relative w-full max-w-lg mx-auto py-4 select-none">
      
      {/* 3D Stack Container */}
      <div
        className="relative"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        
        {/* Layer 3 (Deepest Background Peek Card) */}
        <div
          className="absolute inset-0 rounded-3xl bg-brand-charcoal/40 border border-white/5 shadow-md pointer-events-none transition-all duration-300 ease-out hidden sm:block"
          style={{
            transform: 'translateY(24px) scale(0.91)',
            opacity: 0.35,
            zIndex: 1,
            filter: 'blur(1px)',
          }}
        >
          <div className="p-6 flex items-center justify-between text-xs text-brand-muted">
            <span className="font-mono">{nextCard2.badge}</span>
            <span>{nextCard2.clientName}</span>
          </div>
        </div>

        {/* Layer 2 (Middle Background Peek Card - Clickable) */}
        <div
          onClick={() => onSelectStep(nextCard1.step)}
          className="absolute inset-0 rounded-3xl bg-brand-charcoal/70 border border-white/10 shadow-lg cursor-pointer transition-all duration-300 ease-out hover:border-brand-gold/30 hidden sm:block"
          style={{
            transform: 'translateY(12px) scale(0.96)',
            opacity: 0.75,
            zIndex: 2,
          }}
          title={`Click to preview ${nextCard1.shortName}`}
        >
          <div className="p-5 flex items-center justify-between text-xs">
            <span className="font-mono text-brand-muted text-[10px]">{nextCard1.badge}</span>
            <span className="font-medium text-brand-cream/80 text-xs">{nextCard1.shortName} →</span>
          </div>
        </div>

        {/* Layer 1 (Front Active Cypheir Card) */}
        <div
          ref={cardRef}
          className="relative rounded-3xl bg-brand-charcoal/95 border border-white/10 shadow-2xl backdrop-blur-2xl p-6 sm:p-7 space-y-5 transition-all duration-300 overflow-hidden"
          style={{
            zIndex: 10,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Dynamic Spotlight Glow Layer (Cypheir Dribbble Effect) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl"
            style={{
              opacity: isHovering ? 1 : 0.4,
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(197, 168, 128, 0.18), transparent 70%)`,
            }}
          />

          {/* Top Badge & Status Indicator */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-muted">
                {currentCard.badge}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${currentCard.statusClass}`}
            >
              {currentCard.status}
            </span>
          </div>

          {/* Title & Client Focus */}
          <div className="relative z-10 space-y-1">
            <h4 className="text-lg sm:text-xl font-serif text-brand-cream font-medium leading-snug">
              {currentCard.title}
            </h4>
            <div className="text-xs text-brand-gold font-medium flex items-center gap-1.5">
              <span>✦</span>
              <span>{currentCard.clientName}</span>
            </div>
          </div>

          {/* Realistic Event Metrics Box (Glass Refraction) */}
          <div className="relative z-10 p-3.5 rounded-2xl bg-brand-dark/70 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-brand-muted">
              <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span className="truncate">{currentCard.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-muted">
              <Calendar className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>{currentCard.date}</span>
            </div>
            <div className="text-[11px] text-brand-muted/90 font-mono">
              {currentCard.budget}
            </div>
          </div>

          {/* Interactive Feature Tag */}
          <div className="relative z-10 p-2.5 rounded-xl bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-between gap-2">
            <span className="text-[11px] text-brand-cream font-medium truncate">
              {currentCard.actionSnippet}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold flex-shrink-0">
              {currentCard.highlightTag}
            </span>
          </div>

          {/* Interactive Stack Advance Controls */}
          <div className="relative z-10 pt-2 flex items-center justify-between gap-3 border-t border-white/5">
            <span className="text-[10px] text-brand-muted">
              Card {currentCard.step} of 5 • Click to cycle
            </span>
            <button
              type="button"
              onClick={() => onSelectStep(currentCard.step < 5 ? currentCard.step + 1 : 1)}
              className="py-2 px-3.5 rounded-xl bg-brand-surface hover:bg-brand-charcoal text-brand-cream hover:text-brand-gold border border-white/10 hover:border-brand-gold/40 text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm group"
            >
              <span>Next Stage</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>

      {/* Under-Card Microcopy */}
      <div className="text-center pt-4 text-[10px] text-brand-muted font-mono flex items-center justify-center gap-2">
        <span>CYPHEIR 3D STACK INTERACTION</span>
        <span>•</span>
        <span>HOVER SPOTLIGHT ACTIVE</span>
      </div>

    </div>
  );
}
