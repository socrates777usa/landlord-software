# ACME Landlord Software
> Placeholder name — final name TBD by Brian

**Free, open-source** rental portfolio management for serious real estate investors.
Built for BRRRR strategy, LLC-structured portfolios, local-first data.

## The Model
- **Browser App** — Free forever. MIT License. Open source on GitHub.
- **Mobile App** — $2.99 on App Store + Google Play (React Native, separate repo, coming in Phase 5)

## Tech Stack
| Layer | Tech |
|-------|------|
| Browser App | React + Vite PWA |
| Mobile App | React Native (Phase 5) |
| Local Storage | IndexedDB via `idb` |
| Navigation | React Router |
| Charts | Recharts |
| Icons | Lucide React |
| Auto-updates | Vite PWA / Service Worker |

## Getting Started
```bash
npm install
npm run dev        # Dev server
npm run build      # Production build
npm run preview    # Preview build
```

## Project Structure
```
src/
  core/
    db/             IndexedDB schema (13 stores)
    models/         Data templates + global defaults
    calculations/   Financial math — NOI, DSCR, cash flow, projections
    storage/        Storage adapter — local now, cloud-ready later
  components/
    layout/         Sidebar, header, app shell
    ui/             Reusable UI components
  pages/
    Dashboard/      Portfolio overview + alerts
    Properties/     Property list + full detail entry
    Tenants/        Tenant records + screening
    Leases/         Templates + signed lease storage
    Financials/     Ledger, rent roll, projections, tax
    Maintenance/    Work orders + reserve tracker
    Analytics/      Profitability, maintenance, tax trends
    Entities/       LLC + Series management
    Alerts/         All active alerts
    Settings/       Global defaults + module manager
  modules/          Optional snap-in modules (BRRRR, HELOC, SMS, Cloud)
```

## Roadmap
- [x] Phase 1 — Foundation: DB schema, storage adapter, calculations, data models
- [ ] Phase 2 — UI: Dashboard, Property Entry, Tenant Management, Leases
- [ ] Phase 3 — Intelligence: Analytics, Projections, Tax Reports
- [ ] Phase 4 — Modules: BRRRR Tracker, HELOC Tracker, Cloud Sync, SMS Alerts
- [ ] Phase 5 — Mobile App: React Native, App Store + Google Play ($2.99)

## Changing the App Name
Search and replace `ACME` across:
- `vite.config.js` (manifest name + short_name)
- `README.md`
- `index.html` (title tag)
- App header component (once built)

## License
MIT — free to use, fork, and build on.
The companion mobile app is a separate commercial product.
