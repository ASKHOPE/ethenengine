# Business Platform AI Architecture Specification

Version 1.0 (Foundational Draft)

> This document is the constitutional specification for the platform. It
> defines architectural intent, ownership, responsibilities, boundaries,
> extension points and AI implementation rules. It intentionally omits
> source code and implementation details.

------------------------------------------------------------------------

# Global Principles

## Mission

Build one configurable multi-tenant platform capable of delivering
websites, portals, ecommerce, CMS, CRM, ERP and future business
capabilities from a single shared architecture.

## Golden Rules

1.  One codebase.
2.  Never fork for a tenant.
3.  Configuration before customization.
4.  Blueprint before custom development.
5.  Capability before application.
6.  Event-driven communication.
7.  Core owns identity.
8.  Capabilities own business logic.
9.  AI must preserve architecture.
10. Every feature must be reusable whenever possible.

------------------------------------------------------------------------

# Layer Model

Foundation ↓ Core Platform ↓ Capabilities ↓ Blueprint Engine ↓
Experience Layer ↓ Marketplace

# Foundation

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Core Platform

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Identity

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Organizations

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Tenants

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Workspaces

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Permissions

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Configuration Engine

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Blueprint Engine

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Capability Framework

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Website Builder

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Theme Engine

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# CMS

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Commerce

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Inventory

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# CRM

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# ERP

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Workflow Engine

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Notification Engine

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Search

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Media

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Analytics

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# AI Platform

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Plugin SDK

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Developer SDK

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Marketplace

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Deployment

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Security

## Purpose

Define the responsibilities of this subsystem.

## Owns

Describe everything this subsystem exclusively owns.

## Does NOT Own

List responsibilities that belong elsewhere.

## Responsibilities

-   Primary business responsibility
-   Configuration support
-   Auditing
-   Permissions
-   Events
-   Documentation

## Dependencies

List the platform services this subsystem may depend on.

## Consumers

List which other subsystems commonly use it.

## Events Published

Document domain events this subsystem should publish.

## Events Consumed

Document important events this subsystem subscribes to.

## Configuration

Everything must be configurable where practical. No tenant-specific
branching.

## Extension Points

Describe approved extension mechanisms.

## AI Design Rules

-   Never duplicate another subsystem.
-   Respect ownership boundaries.
-   Preserve modularity.
-   Prefer composition over inheritance.
-   Publish events instead of direct coupling.
-   Keep interfaces stable.

## Future Evolution

Describe how this subsystem can grow without breaking compatibility.

------------------------------------------------------------------------

# Cross-Cutting Rules

Every capability must define:

-   Purpose
-   Ownership
-   Boundaries
-   Configuration
-   Events
-   Permissions
-   Audit strategy
-   Extension points
-   AI implementation rules

Never:

-   Duplicate authentication
-   Duplicate permissions
-   Access another capability's database directly
-   Hardcode tenant behavior
-   Break backward compatibility without an explicit migration plan

------------------------------------------------------------------------

# AI Master Constitution

Whenever building any module:

1.  Read this specification first.
2.  Determine the owning subsystem.
3.  Respect all ownership boundaries.
4.  Reuse existing capabilities.
5.  Add configuration before adding code.
6.  Publish events for important state changes.
7.  Keep modules independently testable.
8.  Keep public contracts stable.
9.  Produce documentation before implementation.
10. If uncertain, choose the design that increases long-term reuse.

Success is measured by: - fewer forks - fewer one-off implementations -
more reusable capabilities - simpler onboarding of new customers -
easier maintenance over many years.
