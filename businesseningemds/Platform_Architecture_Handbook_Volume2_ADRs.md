# Platform Architecture Handbook

# Volume 2 --- Architecture Decision Records (ADR)

> Purpose: Capture the architectural decisions that govern the platform.

------------------------------------------------------------------------

# ADR-001 --- Platform Mission

## Decision

Build a configurable business platform rather than isolated SaaS
products.

## Rationale

Every client should share one evolving platform while receiving a
tailored solution.

## Consequences

-   One codebase
-   Faster onboarding
-   Lower maintenance
-   Recurring improvements

------------------------------------------------------------------------

# ADR-002 --- Modular Monolith First

## Decision

Start as a modular monolith.

## Why

-   Faster development
-   Easier debugging
-   Simpler deployment
-   Clear module boundaries

## Future

Extract services only when operationally justified.

------------------------------------------------------------------------

# ADR-003 --- Multi-Tenant Architecture

## Decision

Every request executes inside tenant context.

Tenant Context includes: - Organization - Tenant - Workspace - User -
Roles - Installed Capabilities - Branding - Subscription

Never infer tenant state outside this context.

------------------------------------------------------------------------

# ADR-004 --- Capability-first Design

Applications are compositions of capabilities.

Examples

Restaurant Blueprint: - Website - Orders - Inventory - Reservations

Retail Blueprint: - Website - Products - Inventory - CRM

------------------------------------------------------------------------

# ADR-005 --- Configuration Before Code

Priority:

1.  Configuration
2.  Blueprint
3.  Capability
4.  Plugin
5.  Private Extension

Avoid modifying shared platform logic whenever possible.

------------------------------------------------------------------------

# ADR-006 --- Plugin Runtime

Every plugin contains:

-   Manifest
-   Backend
-   Frontend
-   Migrations
-   Events
-   Permissions
-   Navigation
-   Settings

Plugins never directly depend on each other.

------------------------------------------------------------------------

# ADR-007 --- Event Driven Platform

Modules communicate using events.

Examples:

UserCreated OrderCreated InvoicePaid TicketOpened

Consumers subscribe instead of calling modules directly.

------------------------------------------------------------------------

# ADR-008 --- Identity

Separate identities:

-   Platform Users
-   Tenant Users
-   Public Users

Authentication and authorization are isolated.

------------------------------------------------------------------------

# ADR-009 --- Database Ownership

Each capability owns:

-   Tables
-   Migrations
-   Indexes

No capability modifies another capability's schema.

------------------------------------------------------------------------

# ADR-010 --- API Standards

Every capability exposes:

-   REST
-   OpenAPI
-   Events

Optional: - GraphQL - Webhooks

------------------------------------------------------------------------

# ADR-011 --- Domain Routing

Request

↓

Gateway

↓

Resolve Domain

↓

Resolve Tenant

↓

Load Blueprint

↓

Load Capabilities

↓

Render Experience

------------------------------------------------------------------------

# ADR-012 --- Development Principles

Engineers and AI must:

-   preserve modularity
-   never fork platform
-   write tests
-   document APIs
-   publish events
-   use feature flags
-   support localization
-   support auditing
-   support permissions

------------------------------------------------------------------------

# Next Volumes

Volume 3 - Database Specification - Foundation Layer - Identity -
Permission System

Volume 4 - Blueprint Engine - Configuration Engine - Website Builder

Volume 5 - Commerce - CRM - ERP - SDK - Marketplace
