# ETHENENGINE Platform Architecture

> Production-ready, configurable multi-tenant platform built according to the **Business Platform AI Architecture Specification v1** and **Platform Architecture Handbook (Volumes 1–4)**.

---

## 🌟 Architectural Principles

1. **One Codebase**: Zero tenant forks. Tenants are isolated by runtime domain configuration, themes, and capability flags.
2. **Configuration Over Code (ADR-005)**: Priority hierarchy:
   $$\text{Tenant Dynamic Overrides} \rightarrow \text{Blueprint Defaults} \rightarrow \text{Global Config}$$
3. **Capability-First Architecture**: Applications are dynamic compositions of installed capabilities (`WebsiteBuilder`, `ThemeEngine`, `BasicCMS`, `CommerceEngine`, `MarketplaceEngine`).
4. **Strict Module Isolation & Database Ownership (ADR-009)**: Capabilities own their schemas and migrations with zero direct database cross-talk.
5. **Event-Driven Communication (ADR-007)**: Modules communicate asynchronously via the centralized `EventBus`.
6. **Isolated Identity Models (ADR-008)**: Strict domain separation between `PLATFORM_USER`, `TENANT_USER`, and `PUBLIC_USER`.

---

## 🏗️ Subsystem Architecture

```text
Foundation Layer (EventBus, AuditLogger, ConfigEngine, StorageDriver, DisasterRecoveryEngine)
       │
Core Platform (HierarchyManager, IdentityEngine, DomainGateway, WorkflowEngine, NotificationEngine)
       │
Capabilities Layer (WebsiteBuilder, ThemeEngine, BasicCMS, CommerceEngine, MarketplaceEngine)
       │
Polyglot Microservices (Rust Image Processor & Vector Search Indexer)
       │
Experience Layer (Admin Control Panel & Dynamic Page Renderer)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20+`
- **npm**: `v10+`
- **Docker**: (Optional, for containerized deployments)

### 1. Installation
```bash
git clone https://github.com/ethenengine/ethenengine.git
cd ethenengine
npm install
```

### 2. Build the Codebase
```bash
npm run build
```

### 3. Start Development Server
```bash
npm run dev
```
- **Admin Control Panel**: `http://localhost:3000/admin`
- **Live Website Preview**: `http://localhost:3000/preview/home`

---

## 🧪 Testing Suite

### 1. Integration Tests
Executes 9 end-to-end integration tests across all capabilities, multi-tenancy, events, workflows, and search:
```bash
npx tsx test/platform.test.ts
```

### 2. Playwright E2E & Security Tests
Executes browser-level UI tests, prototype pollution defense tests, and XSS sanitization checks:
```bash
npx playwright test
```

---

## 🐳 On-Premises & Cloud Deployment

### 1-Command Bare-Metal / Linux Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

### Docker Compose Deployment
```bash
docker compose up -d --build
```
This orchestrates:
- `ethenengine-core` (Node.js API Server)
- `ethenengine-rust` (Rust Microservice Worker)
- `ethenengine-db` (PostgreSQL Database)
- `ethenengine-gateway` (Nginx Reverse Proxy & Custom Domain Gateway)

---

## 🔒 Security & Data Protection Controls

- **XSS Protection**: HTML sanitization utility (`escapeHtml()`) applied to block template rendering in [Sanitizer.ts](file:///c:/Users/arnol/OneDrive/Documents/Github/ethenengine/src/foundation/Sanitizer.ts).
- **Runtime Security Middleware**: Prototype pollution and unsafe query parameter shield in [RuntimeValidator.ts](file:///c:/Users/arnol/OneDrive/Documents/Github/ethenengine/src/foundation/RuntimeValidator.ts).
- **Cryptographic Engine**: PBKDF2 with SHA-512 password hashing & AES-256-GCM field-level database encryption in [SecurityCrypto.ts](file:///c:/Users/arnol/OneDrive/Documents/Github/ethenengine/src/foundation/SecurityCrypto.ts).
- **Vendor-Lock-In Free ORM**: 100% open-source MIT schema definitions in [schema.ts](file:///c:/Users/arnol/OneDrive/Documents/Github/ethenengine/src/db/schema.ts) and Prisma support in [schema.prisma](file:///c:/Users/arnol/OneDrive/Documents/Github/ethenengine/prisma/schema.prisma).

---

## 📄 License

MIT License. 100% Vendor Lock-in Free & Open Source.
