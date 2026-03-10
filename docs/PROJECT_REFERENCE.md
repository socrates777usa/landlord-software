# Landlord Software — Project Reference
> This is the living reference page. Update in place. Not a log — a lookup.

---

## Identity
| Field | Value |
|-------|-------|
| App Name | **TBD** — placeholder `ACME` used throughout codebase |
| GitHub Repo | https://github.com/socrates777usa/landlord-software |
| Local Path | `C:\Users\socra\Documents\landlord-software` |
| License | MIT (browser app free forever) |
| Status | Phase 1 complete — Phase 2 in progress |

---

## Business Model
| Product | Price | Distribution |
|---------|-------|--------------|
| Browser App (PWA) | Free | GitHub / direct |
| Mobile App (React Native) | $2.99 one-time | App Store + Google Play |

- Browser app: MIT open source — anyone can fork, build on, self-host
- Mobile app: separate repo, separate commercial product, built after browser V1 stable

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Browser App | React + Vite PWA |
| Mobile App | React Native (Phase 5) |
| Local Storage | IndexedDB via `idb` library |
| Navigation | React Router DOM |
| Charts | Recharts |
| Icons | Lucide React |
| Auto-Updates | Vite PWA service worker |
| Unique IDs | uuid |
| Build Tool | Vite |

---

## Swapping the App Name
When Brian decides on a name, find-replace `ACME` in:
- `vite.config.js` — manifest `name` and `short_name`
- `index.html` — `<title>` tag
- `README.md` — title and description
- App header component (once built in Phase 2)

---

## Notion Links
| Page | URL |
|------|-----|
| Operation Bat Computer (root) | https://www.notion.so/Operation-Bat-Computer-319cd0ace5f4806d81ecd61f810628d9 |
| Engineering Journal (work log DB) | Session log — one entry per work session |
| Task Board (kanban) | https://www.notion.so/31fcd0ace5f481578606f6b7b5368cd5 |
| Phase 1 Session Entry | https://www.notion.so/Landlord-Software-Phase-1-Foundation-GitHub-Setup-31fcd0ace5f481199392c4666d88e409 |

---

## Developer Accounts Needed
| Platform | Cost | Status |
|----------|------|--------|
| GitHub | Free | ✅ Active — socrates777usa |
| Google Play | $25 one-time | Needed for Phase 5 |
| Apple Developer | $99/year | Needed for Phase 5 |

---

## Architecture Decisions (Locked)
- **Local-first**: IndexedDB Phase 1. Cloud connectors Phase 4 via adapter pattern — zero logic change
- **Modular**: Core ships lean. Features snap in/out via module registry
- **Shared core**: `src/core/` calculations and models shared by browser AND React Native mobile app
- **No server required**: Runs fully offline. PWA installable on desktop/mobile
- **Series LLC aware**: Entity structure supports parent LLC + named series per Texas law
