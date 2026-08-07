# Platform Architecture Handbook

# Volume 4 --- Core Platform

> The Core Platform provides the shared business infrastructure used by
> every capability.

------------------------------------------------------------------------

# 1. Core Principles

The Core owns identity, tenancy, permissions, domains, subscriptions,
and platform context.

Capabilities must never reimplement these concerns.

------------------------------------------------------------------------

# 2. Hierarchy

``` text
Platform
└── Organization
    └── Tenant
        ├── Workspace
        │   ├── Team
        │   └── Users
        └── Installed Capabilities
```

------------------------------------------------------------------------

# 3. Organization

Represents the customer account.

Owns: - Billing - Subscription - Branding - Tenants - Domains -
Administrators

------------------------------------------------------------------------

# 4. Tenant

Represents an isolated business environment.

Stores: - Configuration - Installed capabilities - Feature flags -
Branding - Themes - Workflows

Every request resolves to exactly one tenant.

------------------------------------------------------------------------

# 5. Workspace

Logical partition for departments or business units.

Examples: - Sales - HR - Finance - Marketing

------------------------------------------------------------------------

# 6. Identity Model

## Platform Users

Internal staff.

## Tenant Users

Employees of a customer.

## Public Users

Customers, members, vendors, patients, students.

Authentication stores are isolated.

------------------------------------------------------------------------

# 7. Authentication

Support: - Email/password - OAuth - SSO (future) - MFA - Passkeys
(future) - API keys - Service accounts

Sessions include: - User ID - Organization ID - Tenant ID - Workspace
ID - Roles - Permissions

------------------------------------------------------------------------

# 8. Authorization

Permission format:

capability.resource.action

Examples: products.create orders.refund cms.publish

Roles are collections of permissions.

Never hardcode "admin".

------------------------------------------------------------------------

# 9. Domains

Support: - Platform subdomains - Custom domains - Multiple domains -
SSL - Domain verification

Request Flow

Host Header ↓ Resolve Domain ↓ Resolve Tenant ↓ Load Context

------------------------------------------------------------------------

# 10. Invitations

Invite flow:

Admin ↓ Email Invite ↓ Accept ↓ Create User ↓ Assign Roles ↓ Join
Workspace

------------------------------------------------------------------------

# 11. Platform Context

Every request carries:

-   Organization
-   Tenant
-   Workspace
-   User
-   Roles
-   Permissions
-   Locale
-   Timezone
-   Subscription
-   Installed Capabilities

Injected once by the Core.

------------------------------------------------------------------------

# 12. Audit

Record: - Login - Logout - Permission changes - User creation -
Capability installation - Configuration changes

Audit is immutable.

------------------------------------------------------------------------

# 13. Subscription Model

Subscription controls: - Enabled capabilities - Limits - Storage - API
usage - AI credits - Seats

Business logic checks subscription through Core APIs.

------------------------------------------------------------------------

# 14. Feature Flags

Levels: - Global - Organization - Tenant - Workspace - User

Used for rollout---not tenant hacks.

------------------------------------------------------------------------

# 15. Database Ownership

Core tables include:

organizations tenants workspaces users roles permissions memberships
domains subscriptions feature_flags audit_logs

Capabilities own their own schemas.

------------------------------------------------------------------------

# 16. Rules

-   Core never depends on capabilities.
-   Capabilities never duplicate identity.
-   Tenant isolation is mandatory.
-   All operations are audited.
-   Every API enforces permissions.
-   Context is immutable during a request.

------------------------------------------------------------------------

# Next Volume

Volume 5: Database Architecture Schema Standards Naming Conventions
Migration Strategy Entity Relationships
