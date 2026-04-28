<p align="center">
  <img src="public/images/logo-emblem.png" alt="CivicPulse Logo" width="80" />
</p>

<h1 align="center">CivicPulse</h1>

<p align="center">
  <strong>A civic issue reporting and tracking platform for communities and local government.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-1B3A5C" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-0F7B6C" alt="License" />
  <img src="https://img.shields.io/badge/vite-6.x-646CFF" alt="Vite" />
  <img src="https://img.shields.io/badge/vanilla-JS-F7DF1E" alt="JavaScript" />
  <img src="https://img.shields.io/badge/API%20keys-none-green" alt="No API Keys" />
</p>

---

## Overview

CivicPulse empowers citizens to report local civic issues — potholes, broken streetlights, waste buildup, drainage problems — and track their resolution in real time. Government officials can triage, assign, and resolve issues through a dedicated access panel.

The platform uses a professional government portal design language, making it suitable for municipal deployment.

## Screenshots

| Hero & Navigation | Stats & Community Feed |
|---|---|
| ![Hero](public/images/hero-banner.png) | Clean stat cards, category filters, and issue grid |

## Features

### For Citizens
- **Report Issues** — Multi-step modal with image upload, GPS location detection, address search, and AI-powered category detection
- **Browse & Filter** — Filter issues by category, status, and sort by latest or most upvoted
- **Upvote & Comment** — Support important issues and participate in community discussion
- **Map View** — Full-screen interactive map with all reported issues plotted as markers
- **Profile Dashboard** — View your submitted reports, upvoted issues, and account stats
- **Real-time Notifications** — Get notified when your issue status changes

### For Government Officials
- **Government Access Panel** — Triage queue, personal workbench, and resolved issues dashboard
- **Issue Assignment** — Claim unassigned issues and manage your active workload
- **Status Management** — Update issue status (Reported → In Progress → Resolved)
- **Analytics Hub** — KPI dashboard with resolution rate, average resolution time, department performance, and ward-level leaderboard

### AI & Intelligence
- **Auto-Categorization** — Keyword-based NLP engine that detects issue categories in real time as users type descriptions
- **Priority Scoring** — Automated severity scoring (0–100) based on category risk, community upvotes, and time stagnation
- **Department Routing** — Issues are automatically mapped to the responsible municipal department

## Tech Stack

| Layer | Technology |
|---|---|
| **Build Tool** | Vite 6.x |
| **Language** | Vanilla JavaScript (ES Modules) |
| **Styling** | Custom CSS with CSS variables (design tokens) |
| **Typography** | Source Sans 3 (Google Fonts) |
| **Icons** | Lucide Icons (CDN) |
| **Maps** | Leaflet.js + CartoDB Positron tiles |
| **Geocoding** | OpenStreetMap Nominatim (free, no key) |
| **Storage** | Browser localStorage |
| **Auth** | Client-side localStorage auth (demo) |

## Architecture

```
civic-pulse/
├── index.html                  # Entry point
├── package.json                # Project config
├── vite.config.js              # Vite configuration
├── public/
│   └── images/                 # Static assets (logo, hero banner)
└── src/
    ├── main.js                 # App shell, routing, initialization
    ├── components/             # UI Components (14 modules)
    │   ├── header.js           # Sticky header with nav, auth, notifications
    │   ├── hero.js             # Hero section + stats bar
    │   ├── issue-feed.js       # Feed section with filters and grid
    │   ├── issue-card.js       # Individual issue card component
    │   ├── issue-detail.js     # Full issue detail view with sidebar
    │   ├── report-modal.js     # Multi-step issue reporting modal
    │   ├── auth-modal.js       # Login / register modal
    │   ├── comment-section.js  # Threaded comments on issues
    │   ├── notification-panel.js # Bell dropdown with notifications
    │   ├── map-view.js         # Full-screen Leaflet map
    │   ├── profile-page.js     # User profile and submitted issues
    │   ├── analytics-dashboard.js # Government analytics KPIs
    │   ├── government-panel.js # Official triage and assignment panel
    │   └── toast.js            # Toast notification system
    ├── data/                   # Data layer (8 modules)
    │   ├── store.js            # Issue CRUD + localStorage persistence
    │   ├── auth.js             # Authentication (login, register, session)
    │   ├── categories.js       # Category definitions with icons
    │   ├── comments.js         # Comment storage and retrieval
    │   ├── departments.js      # Department ↔ category mapping
    │   ├── metrics.js          # Analytics metrics computation
    │   ├── notifications.js    # Notification storage and management
    │   └── ai-categorizer.js   # Keyword-based AI categorization engine
    ├── utils/                  # Utilities (4 modules)
    │   ├── helpers.js          # UUID, timeAgo, debounce, escapeHtml
    │   ├── geolocation.js      # GPS, reverse geocoding, address search
    │   ├── image.js            # Image compression and validation
    │   └── priority-engine.js  # Severity scoring algorithm
    └── styles/                 # Design system (5 files)
        ├── variables.css       # Design tokens (colors, spacing, typography)
        ├── base.css            # Reset and global styles
        ├── components.css      # Component-level styles
        ├── layout.css          # Page layout and responsive breakpoints
        └── animations.css      # Keyframes and animation utilities
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/civic-pulse.git
cd civic-pulse

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Build for Production

```bash
npm run build
npm run preview
```

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Citizen | `alex@demo.com` | `demo123` |
| Government Official | `mayor@cityhall.gov` | `gov2024` |

> **Note:** All data is stored in your browser's localStorage. Clearing browser data will reset the app.

## API Keys

**None required.** CivicPulse runs entirely client-side with zero external API keys:

| Service | Purpose | Authentication |
|---|---|---|
| OpenStreetMap Nominatim | Geocoding & address search | Free, no key |
| CartoDB Tile Server | Map tiles | Free, public |
| Leaflet.js | Map rendering | Open source (CDN) |
| Lucide Icons | Icon set | Open source (CDN) |
| Google Fonts | Typography | Free |
| Browser Geolocation | GPS detection | Built-in browser API |

## Design System

CivicPulse uses a **government portal design language**:

- **Palette:** Navy `#1B3A5C`, Teal `#0F7B6C`, White `#FFFFFF`, Light Gray `#F5F6FA`
- **Typography:** Source Sans 3 (400/500/600/700)
- **Borders:** Clean `1px solid #D9DEE5` — no glassmorphism or glow effects
- **Shadows:** Subtle `box-shadow` only — `0 2px 4px rgba(0,0,0,0.06)`
- **Icons:** Lucide icon set (no emojis anywhere in the interface)
- **Maps:** Light CartoDB Positron tiles

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/ward-heatmaps`)
3. Commit changes (`git commit -m "Add ward-level heatmaps"`)
4. Push to branch (`git push origin feature/ward-heatmaps`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>CivicPulse</strong> — Your City. Your Voice.
</p>
