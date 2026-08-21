# ETHENENGINE Platform

> **Production-ready, zero-lock-in multi-tenant SaaS platform** — Visual website builder, enterprise back-office engines (CRM, ERP, HR, Accounting, Commerce), real-time analytics, zero-knowledge cryptography, and adaptive color-science theming — all in one codebase.

[![Tests](https://img.shields.io/badge/tests-126%2F126%20passing-34d399?style=flat-square)](./test/)
[![License](https://img.shields.io/badge/license-MIT-818cf8?style=flat-square)](./LICENSE)
[![Runtime](https://img.shields.io/badge/runtime-Bun%201.x-f59e0b?style=flat-square)](https://bun.sh)
[![Stack](https://img.shields.io/badge/framework-Hono-38bdf8?style=flat-square)](https://hono.dev)

---

## ✨ What's Inside

| Capability | Description |
|---|---|
| 🌐 **Visual Studio Builder** | Drag-and-drop no-code page editor with live canvas, block library, responsive preview (Desktop / Tablet / Mobile) |
| 🎨 **Color Science Engine** | Harmonic palette generation (complementary, triadic, monochromatic), WCAG 2.1 AAA contrast verification |
| 🌓 **Day / Night Theming** | Per-tenant light/dark mode with live preview — applies instantly without page reload |
| 🏢 **Multi-Tenant Architecture** | Unlimited tenants from a single codebase, zero forks, runtime domain isolation |
| 🔒 **Zero-Knowledge Cryptography** | AES-256-GCM + PBKDF2 field-level encryption for confidential CRM / HR / Ledger data |
| 🛡️ **Watchdog & Resilience** | Anomaly detection, circuit breakers, load governor (3-tier traffic shedding), disaster recovery with HMAC-256 snapshots |
| 📊 **Real-Time Analytics & A/B** | Server-side telemetry, conversion funnels, A/B variant split testing |
| 💼 **CRM & Sales Pipeline** | Lead management, deal value tracking, pipeline stages |
| 🏭 **ERP & Procurement** | Purchase orders, supplier management, supply chain automation |
| 💰 **Accounting & Ledger** | Double-entry accounting, real-time balance sheet |
| 👔 **HR & Payroll** | Staff directory, department management, monthly salary records |
| 📦 **Multi-Warehouse Inventory** | Multi-location stock allocation, reorder threshold alerts, inter-warehouse transfers |
| 🛒 **Commerce & Orders** | Product catalog, order processing, revenue tracking |
| 📝 **Headless CMS** | Schema-free content entries, publish/draft workflow |
| 🧩 **Marketplace Extensions** | Pluggable capability system with pricing and category management |
| 🛡️ **Security & Audit Trail** | Immutable event log for every action across all tenants |
| 💬 **Team Comms** | Internal channel messaging with E2E tenant isolation |
| 🤝 **Support Delegation** | Zero-knowledge break-glass grants for superadmin diagnostic access |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Experience Layer                              │
│   Admin Console  │  Studio Builder  │  Dynamic Page Renderer    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  Capabilities Layer                              │
│  WebsiteBuilder │ ThemeEngine │ CommerceEngine │ CRMEngine      │
│  ERPEngine │ AccountingEngine │ HREngine │ InventoryEngine      │
│  BasicCMS │ MarketplaceEngine │ AnalyticsEngine                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Core Platform                                 │
│  HierarchyManager │ IdentityEngine │ DomainGateway              │
│  UnifiedAuthGateway │ SupportAccessEngine │ WorkflowEngine      │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Foundation Layer                               │
│  WatchdogEngine │ DisasterRecoveryEngine │ DataRecoveryEngine   │
│  LoadGovernor │ SecurityGuard │ AuditLogger │ SyncEngine        │
│  EventBus │ TelemetryEngine │ SecurityCrypto │ Sanitizer        │
└─────────────────────────────────────────────────────────────────┘
```

### Architectural Principles

1. **One Codebase, Infinite Tenants** — Zero tenant forks; isolated by runtime domain, themes, and capability flags.
2. **Configuration Over Code** — `Tenant Overrides → Blueprint Defaults → Global Config` priority chain.
3. **Capability-First** — Features are composable, installable modules — not hardcoded monoliths.
4. **Strict Module Isolation** — Each capability owns its own schema; zero cross-module DB calls.
5. **Event-Driven** — Modules communicate asynchronously via `EventBus`.
6. **Zero-Knowledge by Default** — Confidential data (Leads, HR, Ledger) is always encrypted at rest.

---

## 🚀 Quick Start

### Prerequisites
- **Bun** `v1.x` — [Install](https://bun.sh)
- **Docker** `v24+` — for containerized self-hosting (optional)

### 1. Clone & Install
```bash
git clone https://github.com/your-org/ethenengine.git
cd ethenengine
bun install
```

### 2. Run Development Server
```bash
bun run dev
# Starts at http://localhost:3000 with --watch hot reload
```

| URL | Description |
|---|---|
| `http://localhost:3000/` | Marketing homepage |
| `http://localhost:3000/admin?tenant=lioramedia` | Admin Console |
| `http://localhost:3000/editor?tenant=lioramedia` | Studio Page Builder |
| `http://localhost:3000/preview/home?tenant=lioramedia` | Live Page Preview |
| `http://localhost:3000/docs` | OpenAPI Swagger Explorer |

**Seed credentials** (auto-seeded on startup):
- Email: `admin@lioramedia.com` / Password: `Password123!`

---

## 🐳 Self-Hosted Docker Deployment

### Full Stack (Recommended)
```bash
docker compose up -d --build
```

| Service | Role | Port |
|---|---|---|
| `ethenengine-core` | Bun API server | 3000 |
| `ethenengine-nginx` | Reverse proxy & custom domain gateway | 80 / 443 |
| `ethenengine-db` | PostgreSQL (primary) | 5432 |
| `ethenengine-keycloak` | Enterprise SSO & IAM | 8080 |
| `ethenengine-mailcow` | Transactional email (SMTP/IMAP) | 25 / 587 |
| `ethenengine-rust` | Rust image processor & vector search | 8001 |

### One-Command Bare-Metal Deployment
```bash
chmod +x deploy.sh && ./deploy.sh
```

---

## 🧪 Testing

```bash
# Run full test matrix
npm run test:all

# Individual suites
bun test/platform.test.ts              # Core platform (126 tests)
bun test/security-audit.test.ts        # Zero-knowledge & crypto audit
bun test/api-interoperability.test.ts  # API contract tests
bun test/watchdog-dr.test.ts           # Resilience & disaster recovery
```

**Current status: `126/126 passing ✅`**

---

## 🎨 Theme & Color Science

The **Color Science Engine** (`src/capabilities/theme-engine/ColorScienceEngine.ts`) provides:

- **Harmonic palette generation** — complementary, triadic, split-complementary, monochromatic
- **WCAG 2.1 contrast verification** — AA (4.5:1) and AAA (7:1) compliance checks
- **5-color Coolors-style harmonizer** in the Studio Builder → Theme tab
- **Per-tenant live theming** — Day ☀️ / Night 🌙 toggle with instant preview (no reload)
- **Design token system** — `--primary`, `--secondary`, `--bg`, `--card-bg`, `--radius`, `--glow`

To configure themes: `Admin Console → Settings & Theme Engine`

---

## 🔒 Security Architecture

| Control | Implementation |
|---|---|
| **Password Hashing** | PBKDF2-SHA-512, 100,000 iterations, per-user salt |
| **Field Encryption** | AES-256-GCM with PBKDF2-derived per-tenant keys |
| **Zero-Knowledge** | Confidential data inaccessible without explicit support grant |
| **XSS Prevention** | `escapeHtml()` on all server-rendered output |
| **Security Headers** | `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `CSP` |
| **Rate Limiting** | 120 req/min per IP, sliding window |
| **Circuit Breakers** | Per-subsystem fault isolation, configurable thresholds |
| **Load Governor** | 3-tier traffic shedding: Critical / Standard / Background |
| **Audit Trail** | Immutable, tamper-evident event log: actor + resource + timestamp |
| **Support Break-Glass** | Time-limited, reason-required, revocable superadmin grants |

---

## 📁 Project Structure

```
ethenengine/
├── src/
│   ├── index.ts                        # Entrypoint, routes, middleware
│   ├── api/                            # Modular Hono route handlers
│   ├── core/                           # Platform singletons (Auth, IAM, Domain)
│   ├── capabilities/                   # Installable feature modules
│   │   ├── theme-engine/
│   │   │   ├── ThemeEngine.ts
│   │   │   ├── ColorScienceEngine.ts   # Harmonic palettes & WCAG
│   │   │   └── HolidayEngine.ts
│   │   ├── website-builder/
│   │   ├── commerce/, crm/, erp/
│   │   ├── hr/, accounting/, inventory/
│   │   └── analytics/
│   ├── foundation/                     # Cross-cutting infrastructure
│   │   ├── WatchdogEngine.ts           # Anomaly detection & circuit breakers
│   │   ├── DisasterRecoveryEngine.ts   # Outage failover
│   │   ├── DataRecoveryEngine.ts       # HMAC-256 point-in-time snapshots
│   │   ├── LoadGovernor.ts             # 3-tier traffic shedding
│   │   ├── SecurityGuard.ts
│   │   ├── AuditLogger.ts
│   │   └── SyncEngine.ts              # Dual-write: local + Aiven cloud
│   └── views/                          # Server-rendered HTML
│       ├── adminView.ts               # Admin console
│       ├── editorView.ts              # Studio page builder
│       ├── previewView.ts
│       └── loginView.ts
├── public/                             # Static assets
│   ├── styles.css                     # Global design system
│   ├── editor.css                     # Studio builder styles
│   ├── blocks.css                     # Block component styles
│   └── animations.css                 # GPU-accelerated keyframes
├── test/                              # Test suites (126 tests)
├── nginx/                             # Reverse proxy config
├── docker-compose.yml                 # Full self-hosted stack
└── Dockerfile
```

---

## 📄 License

**MIT** — 100% open-source, vendor lock-in free.
