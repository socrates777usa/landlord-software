# Rental Portfolio Management System — Master Feature Specification
**Version:** 1.0 Draft | **Status:** Requirements Definition Phase

---

## Legend
- `[CORE]` = Must have in V1 browser release
- `[V2]` = Planned for V2 or mobile release
- `[MODULE]` = Candidate for optional snap-in module
- `[FUTURE]` = Noted for roadmap, not yet scoped

---

## A. System Architecture

### 1. Platform Strategy
**Browser App** `[CORE]`
- React Progressive Web App (PWA)
- Auto-updates via service worker — no manual installs
- Runs in Chrome, Edge, Safari
- Offline-capable via IndexedDB local storage

**Mobile App** `[V2]`
- React Native — true native app, NOT a browser wrapper
- Distributed via Apple App Store and Google Play Store
- Shares business logic and data models with browser app
- Built AFTER browser app is stable

**Shared Core Layer (Browser + Mobile)**
- All data models (properties, leases, tenants, loans)
- All business logic (DSCR math, cash flow, projections)
- Storage adapter interface (swap storage without rewrite)
- Module registry and plugin definitions

### 2. Storage Architecture
**Phase 1 — Local Storage** `[CORE]`
- IndexedDB in the browser — fast, offline, no server needed
- All data stays on user's machine
- Export/import via JSON backup file

**Phase 2 — Cloud Storage** `[MODULE]`
- Storage adapter pattern — app does not care WHERE data lives
- OneDrive connector — plug in and sync
- Google Drive connector — plug in and sync
- Adapter interface designed in V1 even if only local is active

### 3. Update & Module System
**Patch Update System** `[CORE]`
- Service worker handles updates silently on next load
- Version number displayed in app footer
- Update changelog displayed to user on first load post-update
- Rollback capability for critical failures

**Module Architecture** `[CORE framework, modules optional]`
- Core app ships lean — only essential features active
- Module registry lists available modules
- Modules can be enabled/disabled in Settings
- Modules are self-contained — removing one leaves no debris

---

## B. LLC & Entity Management

### 4. LLC Tracking `[CORE]`
**LLC Registry**
- Add/edit/archive LLC entities
- Fields: LLC name, state, EIN, formation date, registered agent, bank accounts, series count
- Support for Series LLC structure — parent + named series
- Each property assignable to a specific LLC or series

**LLC Dashboard View**
- Per-LLC: total properties, total units, total income, total debt, net cash flow, equity
- Comparison view across all LLCs
- Filter all reports by LLC or series

---

## C. Property Management

### 5. Property Entry — Full Detail `[CORE]`

**5.1 Property Identification**
- Address, city, state, zip; property nickname/label
- Type (SFR, duplex, manufactured, etc.), year built, sqft, bed/bath, lot size
- Assigned LLC/Series; acquisition date and purchase price
- Current estimated market value (user-entered, updatable)
- Section 8/HUD status flag
- Property status: Active / Vacant / Under Renovation / For Sale

**5.2 Financing Details**
- Loan type (DSCR, conventional, seller finance, HELOC-funded)
- Lender name, original amount, current balance, interest rate, term
- Monthly P&I payment (calculated), amortization schedule (viewable)
- DSCR ratio (calculated: NOI / annual debt service)
- Refi date and terms

**5.3 Income Details**
- Current monthly rent; market rent estimate
- Rent-to-market ratio (calculated)
- Section 8 payment standard for zip code
- Annual rent increase assumption (default 4%, user-editable per property and globally)
- Vacancy rate assumption (default 5%, user-editable)
- Effective gross income (calculated)

**5.4 Expense Details**
- Property tax (annual, broken to monthly); insurance premium
- HOA; property management fee (% or flat)
- Maintenance reserve — SUGGESTED amount (never forced; default 1% of value annually)
- Maintenance actual amount set aside (user-entered, separate from suggested)
- CapEx reserve — SUGGESTED (default 1% annually); CapEx actual (user-entered)
- Utilities (if landlord-paid); lawn/pest/misc recurring

**5.5 Calculated Outputs (auto-updated)**
- Gross Operating Income (GOI)
- Net Operating Income (NOI = GOI minus operating expenses)
- Monthly and annual cash flow
- Cash-on-cash return; cap rate; DSCR ratio
- Equity position (market value minus loan balance)
- Total return (cash flow + equity growth)

**5.6 Yearly Projection Engine** `[CORE]`
- Project income, expenses, cash flow, equity out 1, 3, 5, 10, 20, 30 years
- Rent growth rate (default 4%, editable per property)
- Expense growth rate (default 3%, editable)
- Property value growth rate (default 3%, editable)
- All growth rates adjustable as they happen — history preserved

**5.7 Property Documents** `[CORE]`
- Upload photos, inspection reports, closing documents, insurance policies
- Tag documents by type and date; document viewer built into app

---

## D. Tenant Management

### 6. Tenant Records `[CORE]`
**Tenant Profile**
- Full legal name, DOB, phone, email, emergency contact
- Current property assignment; move-in/out dates; lease dates
- Monthly rent, security deposit, pet deposit
- Payment history (on-time, late, partial)
- Internal notes/flags (not visible to tenant)
- Section 8 voucher flag + HAP contract number

**Tenant Screening Records**
- Application date, credit score, income verification, background check result
- Eviction history flag, references checked, upload screening documents

**Tenant Length Analytics**
- Calculated tenure per tenant (months/years)
- Portfolio view: longest and shortest tenants
- Average tenure by property, LLC, portfolio-wide
- Tenant turnover rate (calculated annually)

---

## E. Lease Management

### 7. Lease Templates `[CORE]`
- Texas residential lease template (TAR-compliant baseline — attorney review recommended)
- Section 8 / HUD lease addendum template
- Pet addendum template; move-in/move-out condition checklist
- Auto-populate tenant name, address, rent, dates from records
- Upload signed PDF copies; tag to property and tenant record
- Lease expiration tracking with alert triggers
- Version history (original + renewals stored separately)
- E-signature module (future — DocuSign or HelloSign API) `[MODULE]`

---

## F. Financial Tracking & Reporting

### 8. Income & Expense Tracking `[CORE]`
- Log rent received per unit per month
- Log late fees, expenses by category
- Tag each transaction to property and LLC
- Notes field on each transaction
- **Rent Roll**: all units, tenant, rent, lease end date, payment status — export CSV/PDF

### 9. Debt & Income Projections `[CORE]`
**Portfolio-Wide View**
- Total monthly income (actual and projected)
- Total monthly debt service; total monthly net cash flow
- Total equity, total portfolio value, aggregate DSCR

**Scenario Projections**
- Run projections at 1, 3, 5, 10, 20, 30 years
- Toggle assumptions (rent growth, vacancies, rate changes) — see impact instantly
- Side-by-side scenario comparison (conservative vs aggressive)

### 10. Tax Reporting Support `[CORE]`
- Income/expense report formatted for Schedule E lines
- Depreciation tracker (straight-line, 27.5 year residential)
- Annual tax summary report exportable to PDF/CSV
- Property tax history — track last 3 years per property
- Flag properties where tax increase exceeds rent growth rate

---

## G. Dashboard & Analytics

### 11. Main Dashboard `[CORE]`
**Portfolio Summary Cards**
- Total units | Occupied | Vacant | Under renovation
- Total monthly income | Total monthly debt | Net cash flow
- Total portfolio value | Total equity | Total LTV
- Number of LLCs/Series active

**Alert Panel**
- Vacant units; open maintenance issues
- Leases expiring within 60 days
- Rent not recorded past due date
- Properties flagged for repair or inspection

**Dashboard Filter System**
- Filter by: LLC, zip code, city, property type, age, occupancy, Section 8/private, acquisition year
- Saved filter sets (user can name and save favorite views)

### 12. Analytics Views `[CORE]`
- **Profitability Rankings**: Top 10 most/least profitable units by cash flow
- **Maintenance Analytics**: Top 10 highest cost properties, breakdown by category, YoY trend
- **Tenant Analytics**: Longest/shortest tenured, average tenure by property/LLC/portfolio, turnover cost estimate
- **Tax Trend View**: 3-year bar chart per property, flag where tax growth exceeds rent growth
- **Occupancy Analytics**: Rate by property/LLC/portfolio, avg days vacant, seasonal trends

---

## H. Maintenance Management

### 13. Maintenance Tracking `[CORE]`
**Work Order Log**
- Status: Open / In Progress / Closed
- Property assignment, description, priority (Emergency/Urgent/Routine)
- Dates reported and resolved; vendor used; cost; receipt upload

**Maintenance Reserve Tracker**
- Suggested reserve balance per property (calculated)
- Actual reserve balance (user-entered)
- Reserve adequacy flag; YTD spend vs reserve balance

---

## I. Insurance Management

### 14. Insurance Tracking `[CORE]`
- Insurer, policy number, coverage type, coverage amounts, deductible, annual premium
- Policy effective/expiration dates; 60-day renewal alert; upload policy document
- Separate record for umbrella policy — coverage limit, properties covered

---

## J. Alert & Notification System

### 15. In-App Alerts `[CORE]`
- Vacancy, lease expiration (90/60/30 days), rent not logged
- Open maintenance, insurance expiring, maintenance reserve below threshold
- DSCR below user-defined floor, property tax increase detected YoY
- Alert badge count on dashboard; alerts sortable by priority/date/property

### 16. SMS / Email Alerts `[MODULE]`
- User enters email and/or mobile number in settings
- Select which alert types trigger SMS vs email vs both
- Frequency: immediate, daily digest, weekly digest
- Powered by Twilio (SMS) and SendGrid (email)

---

## K. Settings & Configuration

### 17. Global Settings `[CORE]`
- Default rent growth rate (4%), expense growth (3%), vacancy (5%), maintenance reserve (1%), CapEx reserve (1%)
- All defaults overridable per property
- Module manager: enable/disable modules
- Data management: export all (JSON), import from backup, clear all data
- User preferences: currency format, date format, dashboard default view, light/dark theme

---

## L. Navigation Structure

### 18. App Pages / Routes `[CORE]`
1. Dashboard (Home)
2. Properties — List View, Detail/Edit, Add New
3. Tenants — List, Detail/Edit, Add New
4. Leases — Active, Template Library, Signed Leases
5. Financials — Transaction Ledger, Rent Roll, Projections, Tax Reports
6. Maintenance — Work Orders, Reserve Tracker
7. Analytics — Profitability, Maintenance, Tenant, Tax Trends
8. Entities (LLCs) — List/Summary, Per-LLC Detail
9. Alerts (dedicated page)
10. Settings

---

## M. Industry Feature Gaps (Tara-added, not in original spec)

### Highly Recommended for V1
- **Tenant Communication Log** — log all comms by date/category — legal protection (CYA)
- **Move-In/Move-Out Condition Reports** — checklist per room, photo upload, signed acknowledgment — protects security deposit
- **Vendor/Contractor Directory** — name, trade, phone, license, rating, link to work orders
- **HELOC / Credit Line Tracker** — balance, limit, rate, available credit — feeds acquisition math directly
- **Capital Event Log** — track BRRRR draw → deploy → refi → repay cycle
- **General Document Vault** — LLC docs, BOI reports, tax returns, lender correspondence — tagged, searchable

### Module Candidates
- **BRRRR Acquisition Pipeline Tracker** — deal funnel: Identified → Analysis → Offer → Contract → Rehab → Rented → Refi'd. ARV, all-in cost, projected DSCR post-refi. Core to Brian's strategy.
- **Rent Collection Portal** — online ACH/card payments, auto late fees, receipts — relevant at higher property counts
- **E-Signature** — DocuSign or HelloSign API integration

---

## N. Development Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 — Foundation | DB schema, storage adapter, calculations, data models, PWA config, GitHub | ✅ Done |
| 2 — UI | App shell, Dashboard, Property entry, Tenant management, Leases, Ledger, Maintenance, Insurance | 🔄 In Progress |
| 3 — Intelligence | Analytics views, 30-year projections, dashboard filters, tax exports | ⬜ Backlog |
| 4 — Modules | BRRRR tracker, HELOC tracker, cloud sync, SMS/email alerts | ⬜ Backlog |
| 5 — Mobile | React Native, App Store + Google Play ($2.99) | ⬜ Backlog |

---

## Competing Software Reference

| Software | Monthly Cost | Notable Strength |
|----------|-------------|-----------------|
| TurboTenant | Free / $10/mo | Tenant screening, leases |
| Landlord Studio | $15–20/mo | Mobile-first, accounting |
| RentRedi | $20/mo flat | Native mobile, flat rate |
| Buildium | $55+/mo | Full service, large scale |
| AppFolio | $280+/mo | Enterprise, large portfolios |
| REI Hub | $15/mo | Investor-focused accounting |
| **This App** | **$0 (self-built)** | **Custom BRRRR, LLC-aware, local-first, no subscription ever** |
