# GBWeb.Implementation

Hardened .NET API foundation for the GB banking and microfinance platform. It uses a Clean Architecture modular monolith with vertical application slices.

## Included

- Microsoft Entra ID bearer-token validation for MSAL clients
- permission-based authorization with authentication required by default
- maker-checker domain workflow with self-approval protection
- immutable EF audit history and structured HTTP logs
- FluentValidation through the MediatR pipeline
- RFC Problem Details exception handling
- bounded SQL connection pooling, transient retry and command timeout
- soft deletion and optimistic concurrency
- rate limiting, health endpoint and Swagger OAuth/PKCE setup
- Branch reference slice: submit, approve/reject and retrieve

Read [Architecture-Notes.md](docs/Architecture-Notes.md) before adding a feature.

## Configuration

Replace the placeholder Entra values in `src/GBWeb.Implementation.Api/appsettings.json` or, preferably, inject them from the deployment secret/configuration provider:

```text
EntraId__TenantId
EntraId__ClientId
EntraId__SwaggerClientId
EntraId__Audience
ConnectionStrings__DefaultConnection
```

The Entra API app registration must expose `access_as_user`. Add application roles whose values match the permission constants in `Application/Common/Security/Permissions.cs`. Configure the SPA/native client redirect URI for MSAL and grant it access to the API scope.

## Build

```powershell
dotnet restore
dotnet build
```

The repository currently targets .NET 9 because that is the SDK installed in the present development environment. Upgrade the target framework and Microsoft packages to .NET 10 LTS before the production baseline is frozen.

## Reference endpoints

```text
POST /api/branches
POST /api/branches/approvals/{approvalRequestId}/decision
GET  /api/branches/{id}
GET  /health
```

Creating a branch returns `202 Accepted` with an approval request ID. A different authenticated user with the approval permission must approve it before the Branch row is created.
