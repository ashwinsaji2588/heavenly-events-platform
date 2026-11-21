# Heavenly Events & Occasion Desk | Master Architecture Specification & Build Plan

**Product Vision:** A unified, production-grade event management platform combining a high-converting public portfolio with **Occasion Desk**—an end-to-end event operations engine (CRM, visit dispatch, quote generation, client portal, and vendor coordination). Built for uncompromising reliability, automated communication, and scalable multi-user operations.

---

## 1. System Topology & Architectural Overview

The architecture transitions from decoupled static files and local SQLite scripts into a cohesive, cloud-native modular application.

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                     CLIENT LAYER                       │
                                  ├────────────────────────────┬───────────────────────────┤
                                  │   Public Portfolio & PWA   │  Occasion Desk (Internal) │
                                  │  - Showcase & Mood Boards  │  - Pipeline CRM           │
                                  │  - Direct Ingestion Forms  │  - Visit & Calendar Sync  │
                                  │  - Client Booking Portal   │  - Financials & Invoices  │
                                  └─────────────┬──────────────┴─────────────┬─────────────┘
                                                │                            │
                                                ▼                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   APPLICATION & API LAYER                                │
│  - Framework: TypeScript / Node.js (Next.js App Router / Fastify API)                    │
│  - Authentication: Session / JWT with MFA & Role-Based Access Control (RBAC)             │
│  - Pipeline Engine: State machine managing Lead ➔ Venue Visit ➔ Quote ➔ Confirmed Booking│
│  - Task Engine: Transactional PostgreSQL worker tables for async WhatsApp & notifications │
└───────────────────────────────────────┬──────────────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│     DATA LAYER       │     │     MEDIA & BLOB     │     │ THIRD-PARTY SERVICES │
│ - PostgreSQL (RDS/   │     │ - AWS S3 / Cloudflare│     │ - WhatsApp Cloud API │
│   Supabase/Neon)     │     │   R2 Object Storage  │     │ - Google Calendar API│
│ - Transactional ACID │     │ - Image Optimization │     │ - Razorpay / Stripe  │
│ - Point-in-time (PITR│     │   CDN (Cloudinary/   │     │ - Resend (Emails)    │
│   automated backups) │     │   imgix)             │     │ - Twilio (SMS/Alerts)│
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

---

## 2. Core Functional Domains

### 2.1 Public Experience & Direct Client Capture
* **Dynamic Event Showcase:** High-resolution galleries categorized by occasion (Weddings, Receptions, Mini Events, Corporate) with tag filtering (stage setup, floral, lighting, outdoor).
* **Smart Inquiry Funnel:** Multi-step intake capturing:
  * Client identity & verified contact (WhatsApp OTP / email validation).
  * Occasion type, estimated guest count, target venue/city, date flexibility, and aesthetic preferences.
* **Instant Multi-Channel Dispatch:**
  * Submissions immediately write to the primary database.
  * Webhook triggers immediate **WhatsApp Cloud API** confirmation to the client with a branded welcome brochure.
  * Real-time push notification/SMS to on-call partners via Telegram/WhatsApp Business bot.

### 2.2 Occasion Desk: Agency Operations Engine
* **Pipeline Kanban & Status Engine:** Inquiry ➔ Initial Consultation ➔ Site Visit Scheduled ➔ Proposal Drafted ➔ Contract Sent ➔ Deposit Confirmed ➔ Execution ➔ Post-Event Review.
* **Site Visit & Calendar Coordination:**
  * Two-way synchronization with **Google Calendar / Outlook** for partner availability.
  * Automated GPS venue location pins, reminder notifications sent to clients 24 hours and 2 hours prior to visit.
  * Mobile visit notes with image upload (site power outlets, stage dimensions, ceiling rigging points).
* **Quotation & Proposal Builder:**
  * Master itemized catalog (Florals, Sound/Light, Trussing, Stage Décor, Seating).
  * Tiered package generation (Silver / Gold / Bespoke) with instant PDF export and shareable web link.
* **Client Portal & Contract Management:**
  * Dedicated link for the couple/client to review their mood boards, schedule timeline, sign digital service contracts, and view payment schedules.
* **Financial Milestones:**
  * Advance deposit, milestone payments (e.g., 50% 1 week prior, balance on event eve).
  * Direct payment gateway integration (Razorpay / UPI / NetBanking) with automated receipts.

---

## 3. Technology Stack & Production Infrastructure

| Component | Selected Technology | Architecture Justification |
|---|---|---|
| **Core Framework** | **TypeScript + Next.js (App Router)** | Single cohesive codebase for SEO-optimized public portfolio and secure authenticated desktop/mobile CRM portal. |
| **Primary Database** | **PostgreSQL (v16+)** | Strict relational integrity, JSONB support for dynamic event specifications, ACID transactions for bookings/invoices. |
| **Data Access / ORM** | **Prisma ORM or Drizzle ORM** | Type-safe queries, automated migrations, zero runtime overhead. |
| **Authentication & RBAC**| **Auth0 / Supabase Auth / Lucia** | Enterprise-grade passwordless login, TOTP multi-factor authentication, granular RBAC (`SuperAdmin`, `Partner`, `Coordinator`, `Client`). |
| **Media Pipeline** | **AWS S3 / Cloudflare R2 + CDN** | Uncompressed client gallery uploads converted to modern WebP/AVIF variants with responsive aspect ratios. |
| **Motion & UI Interaction** | **Motion (`motion.dev`)** | Primary UI interaction engine for layout animations (FLIP), shared element gallery expansion, fluid CRM drag-and-drop, and page transitions. |
| **Bespoke Narrative & SVG** | **Anime.js (v4 / v3)** | Specialized path morphing, SVG line tracing (stage blueprints, floral motifs), and multi-stage event timeline choreographies. |
| **3D & Spatial Visualization**| **Three.js + React Three Fiber** | Interactive 3D stage/venue layout inspector for proposals; ambient GPU lighting/bokeh shaders (on-demand rendering). |
| **Communications** | **Meta WhatsApp Cloud API + Resend** | Direct API integration for sub-second transactional messaging and branded PDF delivery. |
| **Hosting & Compute** | **AWS ECS / Render Pro / Vercel Enterprise** | Dedicated production environments with zero cold-starts, automated zero-downtime blue/green deployments. |
| **Observability** | **Sentry + Datadog / BetterStack** | Full distributed transaction tracing, error logging, synthetic uptime monitoring with SMS alerts. |

### 3.1 Motion & Interaction Design System (Anti-Cliché Architecture)
To differentiate Heavenly Events from standard commercial event templates, the front-end marries **Motion (`motion.dev`)** and **Anime.js** into a cohesive luxury interaction system:

1. **Seamless Shared-Element Transitions (Motion `layoutId`):**
   * Clicking an occasion card (e.g. Wedding Setup) organically expands the card into the full-bleed case study view without jarring modal popups, maintaining continuous visual anchor points.
2. **Editorial Masked Typography:**
   * Headlines reveal via baseline mask overflow wrappers (`cubic-bezier(0.16, 1, 0.3, 1)`), avoiding the generic 30px opacity fade-up cliché.
3. **Interactive SVG Stage & Timeline Tracing (Anime.js):**
   * Dynamic path-tracing (`stroke-dashoffset`) illustrates wedding day chronology and stage dimension blueprints as the user scrolls.
4. **Tactile CRM Physics in Occasion Desk:**
   * Kanban cards in the pipeline feature velocity-aware spring physics and automatic neighbor reordering via Motion's layout engine.
5. **3D Stage & Spatial Visualizer (Three.js / React Three Fiber):**
   * An interactive 3D layout viewer allowing clients and planners to inspect stage dimensions, lighting angles (Daylight vs. Evening setup), and floral backdrop presets.
   * **Performance Rule:** Three.js is code-split and lazy-loaded on demand. Uses `frameloop="demand"` so GPU consumption drops to 0% when the viewport or model is idle.
6. **Strict Core Web Vitals Guardrails:**
   * Animations strictly target GPU composite properties (`transform`, `opacity`).
   * Hero LCP images render statically without JavaScript dependencies. Full `prefers-reduced-motion` compliance.

---

## 4. Target Database Schema (PostgreSQL DDL Reference)

```sql
-- Core Firm/Tenant Isolation
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(60) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users & Staff
CREATE TYPE user_role AS ENUM ('super_admin', 'partner', 'planner', 'client');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(120) NOT NULL,
    role user_role DEFAULT 'planner',
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads & Events
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'visit_scheduled', 'proposal_sent', 'booked', 'archived', 'lost');

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_name VARCHAR(120) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    client_email VARCHAR(255),
    occasion_type VARCHAR(60) NOT NULL,
    target_date DATE,
    venue_name VARCHAR(200),
    venue_city VARCHAR(100),
    guest_count INT,
    budget_range VARCHAR(50),
    status lead_status DEFAULT 'new',
    assigned_user_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue Visits & Field Appointments
CREATE TABLE site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id),
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    location_address TEXT NOT NULL,
    google_calendar_event_id VARCHAR(255),
    notes TEXT,
    site_measurements JSONB DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals & Invoices
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'accepted', 'declined', 'expired');

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    version INT DEFAULT 1,
    status proposal_status DEFAULT 'draft',
    total_amount NUMERIC(12, 2) NOT NULL,
    deposit_required NUMERIC(12, 2) NOT NULL,
    line_items JSONB NOT NULL,
    valid_until DATE NOT NULL,
    client_signature TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit & Activity Trail
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Phased Implementation Roadmap (Quality & Reliability First)

```
Q1 ─────────────────────────────── Q2 ─────────────────────────────── Q3
Phase 1: Core Engine & DB        Phase 3: Portfolio & Funnel      Phase 5: Financials & Contracts
Phase 2: CRM & Visit Dispatch    Phase 4: WhatsApp & Integrations Phase 6: Security, Staging & Launch
```

### Phase 1: Architecture Foundation & Core Data Services
* Set up monorepo / application scaffold (Next.js 15, TypeScript, Tailwind CSS, PostgreSQL, Prisma).
* Provision cloud infrastructure: PostgreSQL instance with automated daily snapshots and point-in-time recovery (PITR).
* Implement authentication with role-based session controls, password reset flows, and audit log tracking.
* Set up automated CI/CD pipeline with GitHub Actions (linting, type checking, unit tests).

### Phase 2: Occasion Desk (Operations & CRM Engine)
* Build internal CRM Dashboard:
  * Inquiry management pipeline (filtering by date, occasion, planner).
  * Lead profile view with complete audit history and activity timeline.
* Site Visit Scheduling Engine:
  * Calendar view with conflict detection.
  * Mobile visit record form: upload photos, save stage dimensions, record vendor notes.
* Partner handoff and assignment workflow with real-time status updates.

### Phase 3: Premium Public Experience & Dynamic Portfolio
* Re-architect the client-facing UI:
  * Responsive, high-performance visual catalog using Next.js Image optimization and Cloudflare R2.
  * Individual showcases for Weddings, Receptions, and Mini-Events with rich metadata (themes, venue size, lighting).
* Direct Ingestion Engine:
  * High-converting interactive quote request form with immediate data validation.
  * Built-in fallback resilience: if API experiences latency, form caches locally and re-transmits.

### Phase 4: Integrations (WhatsApp, Google Calendar, Notifications)
* **Meta WhatsApp Cloud API:**
  * Automatic lead confirmation template message sent to client.
  * Interactive WhatsApp buttons for the client to confirm phone consultations.
  * Internal WhatsApp notifications dispatched to the assigned planner's phone upon new lead entry.
* **Google Calendar API Integration:**
  * Two-way sync: creating a visit in Occasion Desk creates an event in the assigned partner's Google Calendar with navigation links.

### Phase 5: Client Portal, Proposals, 3D Visualizer & Financials
* Digital Proposal Builder:
  * Catalog of decoration setups, lighting packages, and bespoke add-ons.
  * Web-based proposal link sent to clients with interactive accept/reject options.
* **3D Stage & Venue Visualizer (Three.js / React Three Fiber):**
  * Interactive 3D preview of stage setup, floral backdrops, and lighting conditions integrated into client proposals.
* Payment Gateway Integration:
  * Razorpay / Stripe integration for collecting booking deposits and milestone disbursements.
  * Automated tax invoice generation (GST compliant) and payment reconciliation.

### Phase 6: Hardening, Security Audit & Staged Rollout
* **Security & Penetration Testing:**
  * Strict Content Security Policy (CSP), OWASP Top 10 mitigation, CSRF token validation, rate-limiting on all public endpoints via Redis token bucket.
* **End-to-End Automated Testing:**
  * Playwright suites covering lead ingestion, visit scheduling, quote approval, and auth flows.
* **Staged Alpha & Beta Testing:**
  * Alpha: Partners run parallel shadowing with real events for 4 weeks.
  * Beta: Soft launch on custom domain with marketing channels activated.

---

## 6. Production Infrastructure & Operational Budget (Estimated)

Designed for 99.99% uptime, data redundancy, and zero data loss:

| Service | Purpose | Monthly Cost (Est.) |
|---|---|---|
| **AWS / Vercel Pro Compute** | Production Next.js hosting, Edge CDN, zero cold starts | $20 / month (approx. ₹1,700) |
| **Managed PostgreSQL** | Dedicated Postgres database with PITR & automated backups | $25 / month (approx. ₹2,100) |
| **Cloudflare R2 / S3 Storage** | High-resolution image/video hosting and mood boards | $5 / month (approx. ₹420) |
| **WhatsApp Cloud API** | Transactional customer & staff messaging | Pay-per-conversation (~₹500 - ₹1,000) |
| **Resend / Postmark** | Transactional email & PDF proposal dispatch | $0 - $15 / month (approx. ₹1,250) |
| **Sentry & BetterStack** | Error monitoring and synthetic uptime tracking | $0 (Free tiers) / $15 / month |
| **Total Production Estimate** | **Full enterprise-grade platform** | **~₹5,200 – ₹6,500 / month** |

---

## 7. Immediate Next Action Items

1. **Repository & Stack Initialization:** Initialize the production Next.js 15 TypeScript project with Prisma and PostgreSQL connection.
2. **Schema Migration:** Apply the complete relational schema defined in Section 4 to the database.
3. **Migrate Portfolio Assets:** Port existing static pages and visual styling into optimized React components with responsive media delivery.
4. **Build the Ingestion API & WhatsApp Webhook:** Replace the manual Instagram copy/paste logic with direct database ingestion and instant WhatsApp notification.
