# GBWeb API architecture

## Decision

GBWeb is a modular monolith using Clean Architecture and vertical application slices. A module may be extracted into a service later, but modules must not share tables or bypass application contracts.

```text
API -> Application <- Infrastructure
             |
           Domain
```

- **Domain** contains entities, value objects, invariants and domain events. It has no external package dependency.
- **Application** contains commands, queries, validators, DTOs and interfaces. A handler owns one use case.
- **Infrastructure** implements persistence, Entra token validation, auditing and external integrations.
- **API** translates HTTP to application requests. It contains no business rules or direct EF queries.

## Module and feature layout

```text
Domain/Modules/{Module}/Entities
Application/Modules/{Module}/Features/{Feature}/{Commands|Queries|Dtos}
Infrastructure/Modules/{Module}
Api/Controllers
```

Do not create a generic `Services` folder containing unrelated business logic. Use a command/query handler for a use case and an interface when the use case needs infrastructure. Interfaces belong in Application; implementations and their DI registration belong in Infrastructure.

## Authentication and authorization

MSAL runs in the client and obtains an access token from Microsoft Entra ID. The API never receives Microsoft passwords and never issues its own access token. The API validates issuer, audience, signature and lifetime through the Entra OpenID Connect metadata endpoint.

Define Entra app-role values using the same names as `Permissions`, for example:

```text
organization.branch.create
organization.branch.read
workflow.approval.decide
```

Every controller is authenticated by the global fallback filter. Every business action additionally uses `[PermissionAuthorize(...)]`. Roles are collections of permissions administered in Entra; code authorizes capabilities, not job titles.

Data scope is separate from permission. Branch-owned handlers must filter by the authenticated user's `branch_id` claim unless the user has an explicitly defined cross-branch permission. Never accept an unrestricted branch ID from the request and trust it without checking scope.

## Maker-checker

Commands requiring approval do not immediately change business state:

1. The maker validates and submits a serialized operation to `workflow.ApprovalRequests`.
2. A checker with `workflow.approval.decide` loads the pending request.
3. The domain rejects self-approval and repeated decisions.
4. Approval decision and business change are persisted in one `SaveChangesAsync` transaction.
5. `RowVersion` protects the request from two checkers deciding concurrently.

Never put secrets, passwords, tokens or unmasked sensitive customer data in an approval payload.

## Audit and logging

- All auditable entities inherit `AuditableEntity<TKey>`.
- `ApplicationDbContext` fills create/update/delete metadata centrally.
- Every audited change appends before/after JSON to `audit.AuditLogs` in the same transaction.
- Audit rows are immutable at the EF boundary.
- HTTP logs include trace ID and Entra object ID through Serilog.
- Exceptions return RFC Problem Details and a trace ID; internal exception details are not returned for 500 responses.

Production should send application/security logs to the approved centralized sink and restrict direct database access to the audit schema. Retention and masking rules must be agreed with Security and Compliance.

## SQL connection and performance rules

ADO.NET connection pooling is enabled and bounded in the connection string. `Max Pool Size` is **per API process/replica**; set it so:

```text
(max pool size per replica × maximum replicas) + administrative reserve < SQL Server connection limit
```

The current defaults are 40 connections for development and 80 per production API process. Tune them using load-test evidence and SQL capacity.

- `DbContext` is scoped and disposed at the end of the request.
- Do not keep a context or connection in a singleton.
- Open connections late and release them quickly; never cache a `DbConnection`.
- Read queries use `AsNoTracking()` and database-side projection/paging.
- SQL retries are bounded and intended for transient faults only.
- Command timeout is bounded.
- Avoid N+1 queries and unbounded list endpoints.
- Add indexes based on query plans and measured workloads.
- External calls must not run while a database transaction is open; use an outbox for reliable asynchronous integration.

Connection pooling prevents the API from opening an unlimited number of SQL connections. If the bounded pool is exhausted, requests wait until the connection timeout rather than creating connections beyond the configured maximum.

## Required production additions

- EF migrations and controlled deployment pipeline
- outbox/domain-event dispatcher
- persistent security-event sink
- branch/area/zone data-scope policies
- idempotency store for financial commands
- automated architecture, unit, integration and authorization tests
- secret management and production Entra configuration
- OpenTelemetry metrics/traces and operational alerts
- .NET 10 LTS upgrade once the build agents and developer SDK baseline are installed
