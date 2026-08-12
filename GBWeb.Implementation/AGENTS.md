# GBWeb Implementation - Codex Continuation Context

## Project goal

Build the API foundation and business modules for Grameen Bank's banking and
microfinance platform. Development is API-first in .NET. The platform must be
secure, auditable, performant, maintainable by multiple teams, and suitable for
regulated financial workflows.

This file carries forward the important decisions from the earlier Codex
conversation. Read it together with:

- `README.md`
- `docs/Architecture-Notes.md`

## Current architecture decision

Use a Clean Architecture modular monolith with vertical application slices:

```text
API -> Application <- Infrastructure
             |
           Domain
```

- `Domain` owns entities, value objects, invariants, domain events, and domain
  exceptions. It must not depend on Application, Infrastructure, or API.
- `Application` owns use cases, commands, queries, handlers, validators, DTOs,
  security constants, and interfaces for infrastructure dependencies.
- `Infrastructure` implements EF Core persistence, SQL Server behavior,
  Microsoft Entra ID token validation, auditing, and external integrations.
- `Api` owns HTTP transport, authorization attributes/policies, middleware,
  Swagger, and composition. Controllers must stay thin and must not query EF
  directly.

Organize business functionality by module and vertical feature:

```text
Domain/Modules/{Module}/Entities
Application/Modules/{Module}/Features/{Feature}/{Commands|Queries|Dtos}
Infrastructure/Modules/{Module}
Api/Controllers
```

Start as a modular monolith. Do not introduce microservices without a measured
operational or bounded-context reason.

## Non-negotiable engineering rules

### Boundaries and dependency injection

- Put interfaces at genuine substitution or layer boundaries; implementations
  belong in Infrastructure and are registered through DI.
- Application handlers implement MediatR request-handler interfaces.
- Validators implement FluentValidation interfaces and run through the MediatR
  pipeline.
- Do not create meaningless interfaces for DTOs, commands, or domain entities.
- Do not create a generic `Services` folder containing unrelated business
  logic.
- Do not use a service locator, static mutable state, or direct construction of
  infrastructure services inside Application or API.

### Authentication and authorization

- Microsoft Entra ID is the sole authentication authority.
- Frontend/mobile clients use MSAL to obtain access tokens.
- The API validates Entra bearer tokens; it must never receive user passwords or
  issue its own access tokens.
- Authentication is required globally. Anonymous endpoints must be explicitly
  and narrowly marked.
- Authorize capabilities through permission values, not job-title role names.
- Entra app-role/scope values must match constants in
  `Application/Common/Security/Permissions.cs`.
- Use `[PermissionAuthorize(...)]` on every business endpoint.
- Permission and data scope are separate. Branch-owned data must be constrained
  using the authenticated user's `branch_id` claim unless a defined
  cross-branch permission grants broader access.
- Never trust a branch/office ID supplied by a request without checking the
  authenticated user's permitted scope.

### Maker-checker

- Sensitive and financial changes must use maker-checker approval.
- A maker submits an immutable approval operation; the business change is not
  applied immediately.
- A checker must be a different authenticated user.
- Only a pending request may be approved or rejected.
- Rejection requires a reason.
- Approval decision and resulting business change must commit atomically.
- Use optimistic concurrency to prevent simultaneous checker decisions.
- Never store secrets, tokens, passwords, or unmasked sensitive customer data in
  approval payload JSON.

### Auditing and logs

- Auditable entities inherit `AuditableEntity<TKey>`.
- Audit metadata is populated centrally in `ApplicationDbContext`.
- Before/after audit rows are written in the same transaction as the business
  change.
- Audit rows are immutable.
- Financial postings are reversed; they are never edited or deleted to rewrite
  history.
- HTTP and security logs must contain trace/correlation ID and authenticated
  Entra object ID.
- Do not log access tokens, passwords, secrets, or unmasked sensitive data.
- Unexpected errors return generic RFC Problem Details with a trace ID; internal
  details remain in protected logs.

### EF Core, SQL Server, and performance

- `DbContext` is request-scoped and disposed by DI.
- Never retain `DbContext`, `DbConnection`, or a transaction in a singleton.
- ADO.NET connection pooling must remain enabled and bounded with `Max Pool
  Size`.
- Remember that the pool limit is per process/replica:

```text
(max pool size per replica * maximum replicas) + reserve
    < SQL Server connection limit
```

- Current defaults are 40 connections in development and 80 per production API
  process; change only using load-test and SQL-capacity evidence.
- Use bounded transient retries and bounded command timeouts.
- Read queries default to `AsNoTracking()`, projection, and server-side paging.
- Never add an unbounded list endpoint.
- Avoid N+1 queries and client-side filtering.
- Keep database transactions short. Do not make external calls inside them.
- Use an outbox for reliable asynchronous integration.
- Financial commands require idempotency protection before production use.

### API behavior

- Use cancellation tokens end-to-end.
- Validate requests before handlers execute.
- Use consistent Problem Details responses.
- Return correct HTTP semantics: `202` for submitted approval work, `409` for
  business/concurrency conflicts, `401` for unauthenticated callers, and `403`
  for authenticated callers lacking permission.
- Add OpenAPI documentation and examples for developer-facing reference APIs.
- Preserve API compatibility or explicitly version breaking changes.

## Foundation already implemented

The repository currently includes:

- Domain, Application, Infrastructure, and API projects.
- Entra ID JWT bearer validation suitable for MSAL clients.
- Dynamic permission-based authorization policies.
- Authentication required globally.
- Current-user abstraction populated from Entra claims.
- FluentValidation integrated into the MediatR pipeline.
- Centralized Problem Details exception handling.
- Serilog request logging with trace/user enrichment.
- API rate limiting and health checks.
- EF Core SQL Server configuration with bounded pooling, retries, and command
  timeout.
- Central audit-field handling, soft deletion, row-version concurrency, and
  immutable before/after audit logs.
- Generic approval-request domain foundation with self-approval prevention.
- A Branch reference slice:
  - submit branch creation for approval;
  - approve or reject it as a different checker;
  - retrieve an approved branch.

Reference endpoints:

```text
POST /api/branches
POST /api/branches/approvals/{approvalRequestId}/decision
GET  /api/branches/{id}
GET  /health
```

The previous verification succeeded:

- NuGet restore succeeded.
- Solution build succeeded with zero warnings and zero errors.
- `/health` returned HTTP 200.
- A protected Branch endpoint returned HTTP 401 without a bearer token.

The authenticated Entra flow and database-dependent flow have not yet been
verified because real tenant/app-registration and SQL development settings have
not been supplied.

## Configuration still required

Replace placeholder configuration through development secrets or the deployment
configuration provider:

```text
EntraId__TenantId
EntraId__ClientId
EntraId__SwaggerClientId
EntraId__Audience
ConnectionStrings__DefaultConnection
```

Configure:

- one Entra API app registration exposing `access_as_user`;
- one MSAL client registration/redirect URI;
- Entra app roles whose values match permission constants;
- at least two test users, one maker and one checker;
- a development SQL Server database.

Never commit production credentials or secrets.

## Framework status

The repository currently targets .NET 9 because only a .NET 9 SDK was available
in the earlier environment. Before freezing the production baseline, install
the .NET 10 SDK on development/build agents and upgrade target frameworks and
Microsoft packages to .NET 10 LTS. Perform restore, build, tests, and package
compatibility checks as part of that upgrade.

## Next milestone

The next requested task is to create one complete, production-style sample API
with guided documentation that other developers can copy.

Use the Branch module as the reference unless the user selects another business
entity. Complete the slice with:

1. create/submit, approve, reject, get-by-ID, paged search, and update flow;
2. permission and data-scope enforcement;
3. request/response DTOs and FluentValidation;
4. duplicate, not-found, concurrency, and approval-state handling;
5. EF configurations, indexes, and initial migrations;
6. unit, integration, authorization, maker-checker, and architecture tests;
7. OpenAPI summaries, response contracts, and example payloads;
8. a step-by-step developer guide explaining exactly how to add the next
   entity/use case while preserving boundaries.

Before implementing that milestone, inspect the current Git status and preserve
all unrelated user changes. Do not rewrite the foundation unless a verified
defect or an agreed architectural decision requires it.

## Verification expectations for future changes

For every implemented slice:

```powershell
dotnet restore
dotnet build
dotnet test
```

Also verify:

- anonymous caller receives `401`;
- authenticated caller without permission receives `403`;
- maker cannot approve their own request;
- two checkers cannot decide the same request;
- audit records are created and cannot be changed;
- paged reads use no tracking and remain bounded;
- SQL connections/contexts are released after requests;
- logs and responses contain no secrets or sensitive payloads.
