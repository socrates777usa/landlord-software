
================================================================================
O: NEW FEATURES ADDED — COMPETITIVE RESEARCH SESSION (March 2026)
================================================================================

Research Sources:
  - innago.com/core-features-property-management-software (2026)
  - baselane.com/resources/15-best-landlord-software-platforms
  - re-leased.com/software/6-best-property-management-software
  - hemlane.com/resources/best-landlord-software
  - rentmanager.com/best-property-management-software-2025-guide
  - Competitor set: Innago, TurboTenant, Buildium, DoorLoop, Rent Manager,
    Hemlane, Baselane, AppFolio, RentRedi, Landlord Studio

--------------------------------------------------------------------------------
20  Industry Features — Gap Analysis & Build Status
--------------------------------------------------------------------------------

    20.1  Insurance Tracking [BUILT — Phase 2]

          20.1.1  Add/edit/archive insurance policies per property
          20.1.2  Policy types: Landlord/Dwelling, Umbrella, Liability, Flood
          20.1.3  Coverage amounts: dwelling, liability, loss of rent
          20.1.4  Deductible and annual premium tracking
          20.1.5  Effective and expiration date tracking
          20.1.6  Auto-badge: Active / Expiring (within 60 days) / Expired
          20.1.7  Umbrella policy flagged as portfolio-wide (not property-specific)
          Route: /insurance, /insurance/new, /insurance/:id

    20.2  Vendor & Contractor Directory [BUILT — Phase 2]

          20.2.1  Name, trade specialty, phone, email, license number
          20.2.2  Star rating (1-5) with interactive star selector
          20.2.3  Last used date tracking
          20.2.4  Sort by rating (best vendors first)
          20.2.5  Free-text notes for past jobs, pricing, availability
          20.2.6  Linked to maintenance work orders (Phase 3 enhancement)
          Route: /vendors, /vendors/new, /vendors/:id
          Trades: HVAC, Plumbing, Electrical, Roofing, Painting, Flooring,
                  GC, Landscaping, Pest Control, Appliances, Locksmith,
                  Inspection, Cleaning, Other

    20.3  HELOC & Credit Line Tracker [BUILT — Phase 2]

          20.3.1  Track revolving credit lines: HELOC, Personal LOC,
                  Business LOC, Portfolio LOC, Investment LOC
          20.3.2  Limit, balance, available credit (auto-calculated)
          20.3.3  Utilization bar — color-coded: green/yellow/red
          20.3.4  Interest rate and minimum monthly payment tracking
          20.3.5  Portfolio-wide summary row: total limit, total balance,
                  total available, total monthly payments
          20.3.6  Live sidebar calculator: available credit, utilization %,
                  monthly interest cost
          20.3.7  This feeds directly into Brian's BRRRR acquisition math
          Route: /heloc, /heloc/new, /heloc/:id

    20.4  BRRRR Deal Pipeline Tracker [BUILT — Phase 2]

          20.4.1  Deal funnel stages:
                  Identified → Offered → Under Contract → Rehab
                  → Rented → Refinanced ✓
          20.4.2  Stage filter buttons at top of list
          20.4.3  Per-deal numbers: purchase price, rehab budget, rehab actual,
                  ARV, target rent, projected DSCR post-refi
          20.4.4  Key dates: offer, contract, closing, rehab complete,
                  rented, refi
          20.4.5  LIVE BRRRR CALCULATOR SIDEBAR:
                  - All-in cost (purchase + rehab)
                  - Equity spread (ARV minus all-in)
                  - ARV margin % (spread / ARV)
                  - 75% LTV refinance amount
                  - Estimated cash-out after refi
                  - Rule of thumb: need ≥25% ARV margin
          20.4.6  Color indicators: green/yellow/red on spread and DSCR
          Note: Uses localStorage pending migration to full IndexedDB store
          Route: /brrrr, /brrrr/new, /brrrr/:id

    20.5  Capital Events Log [BUILT — Phase 2]

          20.5.1  Log: HELOC Draw, DSCR Refi, Loan Payoff, Capital
                  Contribution, Distribution, Other
          20.5.2  Amount, date, property assignment (or portfolio-wide)
          20.5.3  From/To account tracking with autocomplete suggestions
          20.5.4  Description field for each capital movement
          20.5.5  Portfolio totals: total capital in, total capital out
          20.5.6  Critical for tracking Brian's revolving credit strategy
          Route: /capital, /capital/new, /capital/:id

    20.6  Live Analytics Dashboard [BUILT — Phase 2]

          20.6.1  KPI row: income, debt, cash flow, equity, portfolio value,
                  occupancy %, avg DSCR, vacant unit count — all color-coded
          20.6.2  Bar chart: Monthly cash flow by property (green/red)
          20.6.3  Bar chart: DSCR by property (green/yellow/red thresholds)
          20.6.4  Bar chart: Equity by property (amber)
          20.6.5  Bar chart: Maintenance cost by property (blue)
          20.6.6  Profitability rankings table: all properties sorted by
                  cash flow with rent, DSCR, cap rate, CoC return, equity
          20.6.7  Powered by recharts — already in dependencies
          Route: /analytics

    20.7  Functional Alerts System [BUILT — Phase 2]

          20.7.1  Auto-generated alerts from live portfolio data:
                  - Vacant units (critical)
                  - Leases expiring ≤60 days (critical if ≤30, warning if ≤60)
                  - Open maintenance: urgent/emergency (critical), routine (info)
                  - DSCR <1.0 (critical), DSCR <1.25 (warning)
          20.7.2  Priority system: Critical / Warning / Info
          20.7.3  Per-alert dismissal (persisted to localStorage)
          20.7.4  Dismiss All button
          20.7.5  Click-through to relevant record
          20.7.6  Alert count badge on alert count display
          Route: /alerts

    20.8  Functional Settings Page [BUILT — Phase 2]

          20.8.1  Projection assumptions (all editable, persist to IndexedDB):
                  - Rent growth %, expense growth %, property value growth %
                  - Vacancy rate %, maintenance reserve %, CapEx reserve %
          20.8.2  Alert thresholds: DSCR floor, lease lead days, insurance lead days
          20.8.3  Data management:
                  - Export all data → JSON backup file
                  - Import from JSON backup
                  - Clear all data (double-confirm)
          20.8.4  About section: version, storage type, license, GitHub
          Route: /settings

    20.9  Grouped Sidebar Navigation [BUILT — Phase 2]

          Groups: Overview / Portfolio / Financials / Acquisitions / Operations
          Settings pinned to footer
          Sticky header and footer within scrollable nav
          Overflow scroll for tall nav on small screens


================================================================================
P: FEATURES IDENTIFIED IN RESEARCH — PENDING FUTURE PHASES
================================================================================

    P.1   Tenant Online Payment Portal [MODULE — Phase 4]
          73% of tenants prefer online rent payment (NMHC/Innago research).
          ACH + card. Auto late fees. Receipt auto-send. Manual logging works
          for V1. This becomes critical at 10+ properties.

    P.2   Listing Syndication [MODULE — Phase 4]
          Post vacancies to Zillow, Trulia, Apartments.com from one place.
          Reduces days-on-market. Currently: user handles manually.

    P.3   Tenant Screening Integration [MODULE — Phase 4]
          Pull credit, criminal, eviction reports in-app via TransUnion or
          similar. Currently: user enters results manually from external service.

    P.4   Digital E-Signature for Leases [MODULE — Phase 4]
          DocuSign or HelloSign API integration. 79% of DocuSign transactions
          signed within 25 hours vs days for paper (DocuSign research).
          Currently: upload signed PDF copies.

    P.5   Tenant Communication Log [CORE — Phase 3 recommend]
          Per-tenant log of all communications: date, category (maintenance,
          payment, lease, notice, other), notes.
          CYA (legal protection) feature — highly recommended by industry.

    P.6   Move-In / Move-Out Condition Reports [CORE — Phase 3]
          Checklist template per room. Photo upload. Signed acknowledgment.
          Protects security deposit in dispute situations.

    P.7   Receipt / Document Scanner [MODULE — Phase 4]
          Mobile photo-to-expense workflow. Snap receipt → auto-categorize
          to property. Eliminates manual entry for maintenance and repairs.

    P.8   Mileage Log for Tax Deductions [MODULE — Phase 3]
          IRS Schedule E allows mileage deduction for property visits.
          Log date, start/end, miles, purpose. Export for CPA.

    P.9   Tenant Renters Insurance Tracking [CORE — Phase 3]
          Track whether each tenant has active renters insurance.
          Policy number, expiration date, provider.
          Increasingly required by landlords as standard lease clause.

    P.10  Rent Reporting to Credit Bureaus [MODULE — Phase 4]
          Report on-time payments to TransUnion/Equifax/Experian.
          Innago, TurboTenant, Avail all offer this.
          Tenant incentive to pay on time — reduces delinquency.

    P.11  AI-Powered Features [MODULE — Future]
          Industry is moving toward AI for:
          - Automated rent pricing suggestions (market comparison)
          - Predictive maintenance scheduling
          - Tenant screening score interpretation
          - Cash flow forecasting with anomaly detection
          Not scoped for current build but noted for roadmap.

    P.12  Cloud Storage Sync [MODULE — Phase 4]
          OneDrive + Google Drive adapters already designed in architecture.
          Storage adapter interface built in V1.

    P.13  SMS / Email Notifications [MODULE — Phase 4]
          Twilio (SMS) + SendGrid (email). Trigger on same conditions
          as in-app alert system.


================================================================================
Q: COMPETITOR GAPS WE WIN ON
================================================================================

    These are features NO major competitor offers that our app will have:

    Q.1   BRRRR Pipeline Tracker — No competitor tracks the full
          Buy-Rehab-Rent-Refi-Repeat cycle with DSCR calculator.

    Q.2   HELOC / Revolving Credit Line Tracker — None track the acquisition
          funding side. Competitors assume you already have financing.

    Q.3   Capital Events Log — No competitor tracks capital recycling
          (draw → deploy → refi → repay). This is core BRRRR management.

    Q.4   Series LLC Awareness — No competitor understands Series LLC
          structure. Ours assigns properties to parent LLC and named series.

    Q.5   One-Time $2.99 Mobile Pricing — All competitors use subscriptions
          ($10-$280/month). We own the one-time purchase category.

    Q.6   Local-First / Offline-Capable — No competitor is fully offline.
          Innago, TurboTenant, AppFolio all require internet for everything.

    Q.7   DSCR Analytics Built-In — No competitor tracks DSCR across
          portfolio, alerts on threshold breaches, or colors code by health.

================================================================================
END OF SECTIONS O, P, Q
================================================================================
