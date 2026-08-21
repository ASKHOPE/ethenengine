# CHANGELOG

All notable changes to **ETHENENGINE** are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — 2026-08-17

### 🐛 Fixed

#### Critical — CSS Static Asset Serving (404 Bug)
- **Root cause**: `serveStatic({ root: './public' })` wildcard routes for `/*.css` returned 404 in Bun's runtime due to path resolution differences vs Node.js.
- **Fix**: Replaced broken wildcard middleware in `src/index.ts` with explicit per-file `Bun.file()` reads for each public asset (`styles.css`, `editor.css`, `blocks.css`, `animations.css`).
- **Impact**: The Studio Builder left panel, canvas, inspector, and all themed components were completely unstyled before this fix.

#### Admin Settings — Day/Night Buttons Not Working
- Replaced `alert()` + `window.location.reload()` with inline DOM updates and a smooth toast notification system.
- Day/Night preset buttons now update color pickers, hex inputs, swatches, live preview bar, and the theme preview card in real-time — no page reload required.

---

### ✨ Added

#### Settings & Theme Engine UI (Admin Console)
- **Live color preview bar** — gradient strip that updates in real-time as colors are changed.
- **Synced color picker + hex input + circular swatch** — all three controls stay in sync bidirectionally.
- **5 quick-color palette shortcuts** — one-click presets: Indigo/Purple, Sky Blue, Emerald/Cyan, Amber/Rose, Pink/Violet.
- **Redesigned Day/Night toggle buttons** — warm yellow gradient (☀️ Day) and deep indigo gradient (🌙 Night) with hover lift effects.
- **Live theme preview card** — mini card showing brand name + CTA button + gradient strip that updates with selected colors.
- **Save & Apply button** — explicitly saves design tokens to the tenant's storefront via `/api/theme`.
- **Reset to Default** — one-click restore to system defaults.
- **Toast notifications** — replaces all `alert()` popups with smooth bottom-right toasts (3.5s auto-dismiss).
- **Design tokens panel** — corner radius (4/8/12/16/24px), typography scale (Inter/Roboto/Outfit/System), and font size scale selectors.

#### Color Science Engine (`src/capabilities/theme-engine/ColorScienceEngine.ts`)
- Harmonic palette generation: complementary, triadic, split-complementary, monochromatic, analogous modes.
- WCAG 2.1 AAA contrast ratio verification (relative luminance calculation per spec).
- Palette export as CSS custom property maps.

#### Resilience Infrastructure
- **`WatchdogEngine.ts`** — Real-time anomaly detection, subsystem health scoring, per-endpoint circuit breakers with configurable failure thresholds and auto-reset timers.
- **`DisasterRecoveryEngine.ts`** — Outage detection, automatic failover to read-only mode, upstream database health polling.
- **`DataRecoveryEngine.ts`** — HMAC-SHA-256 signed point-in-time data snapshots with 1-click restore. Snapshot integrity is verified on restore.
- **`LoadGovernor.ts`** — 3-tier request prioritization middleware: Critical routes (auth, admin) → Standard routes → Background tasks. Graceful 503 shedding under load.

#### Watchdog Admin View
- Real-time cockpit showing: System Load Governor status, DR mode, p95 latency & heap memory, error rate.
- Subsystem Circuit Breaker Matrix with status badges and per-breaker Reset actions.
- Point-in-Time Snapshot table with HMAC checksum display and 1-click Restore button.
- Live Anomaly Incident Log with severity-coded left-border indicators.

#### Cross-Browser CSS Hardening
- Added `-webkit-user-select`, `-moz-user-select`, `-ms-user-select` vendor prefixes in `editor.css` and `blocks.css` for Safari 3+ / iOS 3+ support.
- Added `-webkit-backdrop-filter` prefix alongside `backdrop-filter` for Safari glassmorphism support.
- Added `-webkit-` prefixed keyframe animations in `animations.css` for GPU-accelerated FX cross-browser compatibility.

#### Docker Self-Hosting Configuration
- `docker-compose.yml` configured with full self-hosted stack: Nginx, Bun core, Rust services, Keycloak (Enterprise SSO), Mailcow (email), PostgreSQL.
- Nginx reverse proxy config in `nginx/nginx.conf` with upstream routing for all services.

---

### 🔄 Changed

#### `src/index.ts`
- Replaced wildcard `serveStatic` CSS routes with explicit `Bun.file()` handlers for each public asset.
- Added per-file routes: `/styles.css`, `/editor.css`, `/blocks.css`, `/animations.css`.

#### `src/views/adminView.ts`
- **Settings view** completely redesigned with live color science controls (see Added above).
- `applyAdminThemePreset()` refactored: removed `alert()` / `reload()`, added real-time DOM mutation and toast.
- Added `syncColorInput()`, `syncColorPicker()`, `quickColor()`, `updateLivePreview()`, `saveThemeSettings()`, `resetToDefault()`, `showAdminToast()` helper functions.

#### `Dockerfile`
- Updated build command from `npm run build` to `bun build` for faster, lighter production bundles.

#### `public/editor.css`
- Added missing `.floating-action-toolbar`, `.floating-action-btn` classes (were referenced in HTML but undefined).
- Added vendor-prefixed `user-select` and `backdrop-filter` rules.

#### `public/animations.css`
- All keyframe blocks now include `-webkit-` prefixed variants for Safari / iOS compatibility.

---

### 🔢 Test Results

| Suite | Tests | Status |
|---|---|---|
| `platform.test.ts` | 50 | ✅ All passing |
| `security-audit.test.ts` | 40 | ✅ All passing |
| `api-interoperability.test.ts` | 20 | ✅ All passing |
| `watchdog-dr.test.ts` | 16 | ✅ All passing |
| **Total** | **126** | ✅ **126/126** |

---

## [0.2.0] — 2026-08-17 (Watchdog & Resilience Release)

### Added
- `WatchdogEngine`, `DisasterRecoveryEngine`, `DataRecoveryEngine`, `LoadGovernor` foundation modules.
- Watchdog Admin cockpit view.
- Multi-Warehouse Inventory Engine.
- Real-Time Analytics & A/B Testing Engine.
- Support Delegation & Break-Glass access system.
- OpenAPI Swagger Explorer at `/docs`.

---

## [0.1.0] — 2026-08-17 (Initial Release)

### Added
- Multi-tenant platform core: `HierarchyManager`, `IdentityEngine`, `DomainGateway`.
- Visual Studio Builder with drag-and-drop block system.
- ThemeEngine with preset palettes and holiday overlays.
- CommerceEngine, CRMEngine, ERPEngine, AccountingEngine, HREngine.
- BasicCMS with headless content API.
- MarketplaceEngine with capability installation system.
- AuditLogger with tamper-evident event trail.
- SyncEngine with dual-write to local PostgreSQL + Aiven Cloud.
- SecurityGuard middleware: rate limiting, CSP, HSTS, XSS protection.
- AES-256-GCM zero-knowledge field encryption for confidential tenant data.
- PBKDF2-SHA-512 password hashing.
- Docker Compose self-hosted deployment stack.
- Seed data for LIORAMEDIA Studios tenant.
