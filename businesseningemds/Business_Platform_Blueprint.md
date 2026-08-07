# Business Platform Blueprint

> **Vision:** Build a platform that lets a development company rapidly
> deliver branded, hosted business websites and portals using a shared
> architecture. Every client receives a tailored solution while the
> platform remains a single maintainable codebase.

------------------------------------------------------------------------

# Philosophy

-   Do **not** build one-off applications.
-   Do **not** fork the platform per customer.
-   Build a **platform** that is configured and extended.
-   Sell implementation services powered by the platform.
-   Every project should improve the platform.

------------------------------------------------------------------------

# Business Model

## Revenue

1.  Discovery & Consulting
2.  Initial implementation
3.  Hosting
4.  Maintenance
5.  Premium support
6.  Feature development
7.  Marketplace modules
8.  AI services

------------------------------------------------------------------------

# High-Level Architecture

``` text
Foundation
    │
Platform Core
    │
Capabilities
    │
Blueprints
    │
Experiences
```

## Foundation

-   Configuration
-   Logging
-   Observability
-   Secrets
-   Cache
-   Queue
-   Storage
-   Database
-   Event Bus

## Platform Core

-   Authentication
-   Organizations
-   Multi-tenancy
-   Users
-   Roles
-   Permissions
-   Billing
-   Notifications
-   Workflow Engine
-   Plugin Runtime
-   API Gateway
-   Scheduler
-   Search
-   AI Gateway

## Capabilities

-   CMS
-   Website Pages
-   Media Library
-   Forms
-   Blog
-   Products
-   Inventory
-   Orders
-   CRM
-   Helpdesk
-   Calendar
-   Projects
-   Files
-   Reports
-   Analytics

## Experiences

-   Marketing Website
-   Ecommerce
-   Customer Portal
-   Admin Portal
-   Employee Portal
-   Partner Portal
-   Mobile App
-   Public APIs

------------------------------------------------------------------------

# Technology

## Backend

-   Node.js + TypeScript
-   Fastify or Hono
-   Drizzle ORM
-   PostgreSQL
-   Redis
-   NATS

## Rust Services

-   Search
-   Image processing
-   Video processing
-   OCR
-   PDF
-   AI inference
-   Queue workers

## Frontend

-   Astro
-   React
-   Tailwind CSS
-   shadcn/ui

------------------------------------------------------------------------

# Multi-Tenant Model

Organization - owns tenants

Tenant - owns websites - owns capabilities - owns branding

Website - custom domain - theme - pages

Workspace - departments - teams

------------------------------------------------------------------------

# Identity

Platform Users Tenant Users Public Users

Never mix them.

------------------------------------------------------------------------

# Plugin System

Each plugin contains:

-   manifest
-   migrations
-   backend
-   frontend
-   permissions
-   navigation
-   events
-   settings

------------------------------------------------------------------------

# Blueprint Engine

Blueprint = preconfigured business solution.

Examples

-   Restaurant
-   Retail
-   Church
-   School
-   Hospital
-   Agency
-   Law Firm
-   Construction
-   Manufacturing

Blueprint installs capabilities and default workflows.

------------------------------------------------------------------------

# Configuration Engine

Everything configurable:

-   branding
-   navigation
-   workflows
-   permissions
-   dashboards
-   forms
-   emails
-   reports
-   themes

------------------------------------------------------------------------

# Domain Flow

Customer Domain

↓

DNS

↓

Gateway

↓

Resolve Tenant

↓

Load Blueprint

↓

Load Capabilities

↓

Render Experience

------------------------------------------------------------------------

# Development Rules

1.  Never hardcode tenant logic.
2.  Never fork the platform.
3.  Build reusable capabilities.
4.  Everything is event-driven.
5.  Everything exposes APIs.
6.  Every feature supports permissions.
7.  Every module supports configuration.
8.  Every module supports localization.
9.  Every module supports auditing.
10. Every module is independently testable.

------------------------------------------------------------------------

# Monorepo

``` text
platform/
  apps/
  packages/
  services/
  plugins/
  sdk/
  docs/
  infrastructure/
```

------------------------------------------------------------------------

# Phases

## Phase 1

Foundation + Identity + Multi-tenancy

## Phase 2

CMS + Website Builder

## Phase 3

Commerce

## Phase 4

CRM + ERP capabilities

## Phase 5

Marketplace + SDK

## Phase 6

AI + Automation

------------------------------------------------------------------------

# AI Implementation Prompt

You are a senior software architect building a long-term Business
Platform.

Objectives:

-   Maintain one codebase.
-   Multi-tenant by design.
-   Configuration over customization.
-   Plugin-first architecture.
-   API-first.
-   Event-driven.
-   Domain-driven modules.
-   Strong typing.
-   Test every module.
-   No business logic duplication.

For every implementation:

1.  Design architecture first.
2.  Produce database schema.
3.  Produce API contracts.
4.  Produce events.
5.  Produce permissions.
6.  Produce UI.
7.  Produce tests.
8.  Produce documentation.
9.  Produce migrations.
10. Ensure compatibility with existing modules.

Never introduce tenant-specific hacks. Prefer: Configuration →
Capability → Plugin → Private Extension.

Success metric: Every new customer should require less custom code than
the previous one while the platform becomes more valuable.
