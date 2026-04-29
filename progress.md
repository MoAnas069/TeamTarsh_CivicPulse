# CivicPulse — Development Progress

> Tracking the evolution of CivicPulse from concept to current state, and what lies ahead.

---

## Timeline

| Phase | Status | Description |
|---|---|---|
| Phase 1 — MVP | Completed | Core platform with issue reporting, feed, and map |
| Phase 2 — Enterprise | Completed | RBAC, AI priority engine, government panel |
| Phase 3 — UI Redesign | Completed | Government portal aesthetic, emoji removal |
| Phase 4 — Scale & Deploy | Planned | Backend, real auth, production deployment |

---

## Phase 1: MVP Foundation

**Status:** Completed

Built the core CivicPulse platform as a fully functional single-page application.

### What was built
- **Issue Reporting Modal** — 4-step wizard (Photo → Location → Description → Review) with image compression, GPS auto-detect, Nominatim address search, and real-time AI category detection
- **Issue Feed** — Responsive card grid with category filtering, status filtering, and sort controls (Latest / Most Upvoted)
- **Issue Detail View** — Full-page view with image, description, interactive Leaflet map, upvoting, sharing, and comment section
- **Map View** — Full-screen Leaflet map with circle markers colored by category, interactive popups
- **Authentication** — Client-side login/register system with session persistence
- **Notification System** — Bell icon with dropdown panel, unread badges, mark-all-read
- **Toast System** — Non-blocking success/error/info notifications with progress bars
- **Responsive Design** — Mobile-first layouts, bottom-sheet modals on small screens

### Technical decisions
- Vanilla JS (no React/Vue) for minimal bundle size and zero framework overhead
- Component-based architecture using factory functions (`createHeader()`, `createIssueFeed()`)
- localStorage as the data layer for zero-infrastructure demos
- Leaflet.js with CartoDB tiles (no API key required)
- Vite 6 for instant HMR and fast builds

---

## Phase 2: Enterprise Infrastructure

**Status:** Completed

Transformed the MVP into an enterprise-ready platform with institutional features.

### What was built
- **Role-Based Access Control (RBAC)** — Two roles: `citizen` and `official`. Officials get access to the Government Panel and Analytics Hub
- **AI Priority Engine** (`priority-engine.js`) — Automated severity scoring (0–100) using:
  - Base category risk (Electrical Hazard = 80, Noise Pollution = 10)
  - Community upvote signal (up to +30 points)
  - Time stagnation penalty (+1 per day unresolved, up to +20)
  - Normalized to 0–100 with labels: Low / Medium / High / Critical
- **Government Access Panel** — Three-column Kanban-style interface:
  - Triage Queue (unassigned issues, sorted by severity)
  - My Workbench (claimed issues with status dropdowns)
  - Recently Resolved (completed assignments)
- **Analytics Hub** — Enterprise dashboard with:
  - KPI cards (resolution rate, avg resolution time, issue density)
  - Department performance bar charts
  - Ward-level accountability leaderboard
  - Ward selector with CSV export button
  - Gated behind `official` role
- **Department Routing** (`departments.js`) — Automatic mapping of issue categories to responsible municipal departments
- **Metrics Engine** (`metrics.js`) — Computes ward-level and department-level metrics from the issue store
- **Issue Assignment Flow** — Officials can claim issues from the triage queue, which moves them to their personal workbench
- **Comment System** (`comment-section.js`) — Threaded comments on issues with author avatars, timestamps, and delete capability

### Demo accounts added
| Role | Email | Password |
|---|---|---|
| Citizen | alex@demo.com | demo123 |
| Official | mayor@cityhall.gov | gov2024 |

---

## Phase 3: Government UI Redesign

**Status:** Completed

Complete visual overhaul to transform CivicPulse from a dark-mode startup aesthetic to a clean, authoritative government portal.

### What changed

#### Design System
- **Color palette** — Replaced dark glassmorphism (neon indigo on slate-900) with a light institutional palette: Navy `#1B3A5C`, Teal `#0F7B6C`, White `#FFFFFF`, Light Gray `#F5F6FA`
- **Typography** — Switched from Inter to **Source Sans 3** (widely used on gov.uk, usa.gov, and other government portals)
- **Shadows** — Replaced glow effects (`box-shadow: 0 0 30px rgba(99,102,241,0.4)`) with subtle `0 2px 4px rgba(0,0,0,0.06)`
- **Borders** — Clean `1px solid #D9DEE5` instead of translucent glass borders
- **Animations** — Toned down bouncy spring curves to subtle ease-in/out fades. Removed confetti entirely.

**Verification:** Regex sweep for Unicode emoji ranges (U+1F300–U+1F9FF, U+2600–U+26FF, U+2700–U+27BF) returns **0 results** across the entire `src/` directory.

#### Generated Assets
| Asset | Description |
|---|---|
| `public/images/logo-emblem.png` | Civic government crest emblem (header + favicon) |
| `public/images/hero-banner.png` | Civic cityscape illustration (hero section) |
| `public/images/category-icons.png` | Reference category icon sheet |

#### Files Modified
- 5 CSS files (complete rewrites)
- 14 JS component files
- 3 JS data files
- 1 JS utility file
- 1 HTML entry point
- **Total: 24 files touched**

#### Map Theme
Switched from CartoDB Dark Matter to **CartoDB Positron** (light tiles) across all map instances (detail view, report modal mini-map, full map view).

### 3.1 — Mobile Layout Polish
- **Header Responsiveness** — Stripped inline flex styles from header navigation and migrated to CSS media queries for proper mobile collapsing.
- **Mobile Navigation** — Implemented the previously missing mobile hamburger menu dropdown to enable mobile access to Analytics, Authentication, and Reporting.
- **Dropdown Overflows** — Fixed the Notification panel overflowing horizontally on small screens by snapping it to viewport width via `position: fixed`. Extracted Profile dropdown styles to CSS for maintainability.
- **Badge Wrapping** — Added `white-space: nowrap` to prevent awkward line breaks inside category and status badges on small screens.

---

## Phase 4: Scale & Deploy (Planned)

### 4.1 — Backend & Real Database
- [ ] Set up Node.js/Express API server (or serverless functions)
- [ ] Migrate from localStorage to PostgreSQL or MongoDB
- [ ] Implement real JWT authentication with password hashing (bcrypt)
- [ ] File upload endpoint (S3 or Cloudinary) for issue images
- [ ] Rate limiting, input sanitization, CORS configuration

### 4.2 — Real-time Features
- [ ] WebSocket or SSE for live issue status updates
- [ ] Push notifications (browser Push API or Firebase Cloud Messaging)
- [ ] Live feed updates without page refresh

### 4.3 — Advanced Analytics
- [ ] Ward-level heatmaps on the map view (issue density visualization)
- [ ] Time-series charts (issues reported per week/month)
- [ ] Department response time tracking
- [ ] CSV/PDF export for government reports
- [ ] SLA tracking (target resolution times per category)

### 4.4 — Enhanced AI
- [ ] Integrate an LLM API (GPT/Gemini) for smarter issue categorization
- [ ] Image analysis — auto-detect issue type from uploaded photos
- [ ] Duplicate detection — flag similar issues in the same area
- [ ] Sentiment analysis on comments for escalation signals

### 4.5 — User Experience
- [ ] Dark mode toggle (preserve current light theme as default)
- [ ] Multi-language support (i18n)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] PWA support (service worker, offline mode, install prompt)
- [ ] Email notifications for issue updates

### 4.6 — Deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production build optimization
- [ ] Deploy to Vercel / Netlify (frontend) + Railway / Render (API)
- [ ] Custom domain setup
- [ ] SSL and security headers

### 4.7 — Governance Features
- [ ] Multi-tenant support (different cities/municipalities)
- [ ] Admin panel for user management
- [ ] Audit log for all official actions
- [ ] Public API for third-party integrations
- [ ] Embed widget for municipality websites

---

## Technical Debt & Improvements

| Item | Priority | Notes |
|---|---|---|
| Replace `window.navToIssue` hack in government-panel.js | Medium | Use proper event delegation instead of global function |
| Add unit tests | High | No test coverage currently — add Vitest |
| Extract inline styles | Low | Cleaned up header/dropdowns, but some components still use inline `style=` — move to CSS classes |
| Error boundaries | Medium | Add graceful error handling for failed geocoding/map init |
| Optimize re-renders | Medium | Feed re-renders entire grid on store change — add diffing |
| Bundle analysis | Low | Check final bundle size and tree-shake unused Lucide icons |

---

*Last updated: April 29, 2026*
