# Setup Guide

The app is two processes: an **ASP.NET Core API** (`GbAccount.Api`) that talks to SQL Server, and a **Next.js UI** that talks to the API. You need both running.

## 1. Prerequisites

- **.NET SDK 10** — dotnet.microsoft.com/download
- **Node.js** LTS — nodejs.org (developed on v26, any recent LTS is fine)
- **SQL Server** with the `gbAccount` database restored and reachable
- **Git** — git-scm.com

### If you want to use Visual Studio

The API targets `net10.0`, and **Visual Studio 2022 cannot target .NET 10** — it builds .NET 9 and lower only. You need **Visual Studio 2026 (18.0+)**, which ships the .NET 10 SDK in its installer. On VS 2022 you will get `NETSDK1233: Targeting .NET 10.0 or higher in Visual Studio 2022 is not supported`.

Install the **ASP.NET and web development** workload.

Visual Studio is optional. `dotnet run` from any terminal works with just the .NET 10 SDK, and VS Code with the C# Dev Kit extension is a lighter alternative.

## 2. Configure the API

Database credentials live on the API side only. Copy the template:

```bash
cp GbAccount.Api/appsettings.Development.json.example GbAccount.Api/appsettings.Development.json
```

Then edit `ConnectionStrings:GbAccount` in that file, replacing `YOUR_SERVER`, `YOUR_USER`, and `YOUR_PASSWORD`:

```
Server=YOUR_SERVER,1433;Database=gbAccount;User Id=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=False;TrustServerCertificate=True
```

| Setting | What it is |
| --- | --- |
| `Server` | Hostname or IP, then the port. `localhost,1433` if SQL Server is on your machine. |
| `Database` | `gbAccount`. |
| `User Id` / `Password` | Your SQL Server login. |
| `Encrypt` | `False` for local. `True` against a server with a valid certificate. |
| `TrustServerCertificate` | `True` when using a self-signed certificate. |
| `Cors:AllowedOrigins` | Origins the UI is served from. Defaults cover ports 3000 and 3001. |

`appsettings.Development.json` is gitignored and must stay that way — it holds real credentials. The `.example` file is the committed template.

Note: `Encrypt=False` sends credentials unencrypted. That is workable on a trusted LAN, but TLS cannot be enabled when the server is addressed by IP rather than hostname, so prefer a hostname plus a valid certificate for anything beyond local use.

## 3. Configure the UI

Nothing to do. The UI defaults to `http://localhost:5025`, which matches the API's `http` launch profile.

Only if the API runs on a different host or port, copy the template and set `NEXT_PUBLIC_API_BASE_URL`:

```bash
cp .env.example .env
```

## 4. Run

Starting the API also starts the Next.js UI. You do not need a second terminal.

### Option A — Visual Studio

1. Open `GbAccount.sln`
2. Select the **`http`** profile in the run-button dropdown
3. Press F5

The API comes up on `http://localhost:5025`, the UI on `http://localhost:3000`, and the browser opens at the UI. Stopping the debugger stops both.

### Option B — terminal

```bash
cd GbAccount.Api
dotnet run
```

Same result: both processes, one command. Ctrl+C stops both.

Run `npm install` once before the first launch, so `node_modules` exists.

### Running the API by itself

Use the **`api-only`** profile (or `dotnet run --launch-profile api-only`) when you want the API without the UI — testing endpoints in the `.http` file, for example.

### Production build of the UI

```bash
npm run build
npm start
```

### If the build fails with MSB3027 / MSB3021

A previous run is still holding `GbAccount.Api.exe`. Stop it before rebuilding:

```powershell
Get-Process -Name 'GbAccount.Api' -ErrorAction SilentlyContinue | Stop-Process -Force
```

## Checking the API

Each endpoint returns `{ "success": boolean, "data": [...] }`, or `{ "success": false, "message": "..." }` on failure.

| Endpoint | Returns |
| --- | --- |
| `GET /api/accounts` | Chart of accounts, with category and organization joined in. Accepts optional `orgId`, `page`, `pageSize`. |
| `GET /api/accounts/{id}` | One account |
| `POST /api/accounts` | Create |
| `PUT /api/accounts/{id}` | Update |
| `DELETE /api/accounts/{id}` | Delete |
| `GET /api/categories` | Account categories |
| `GET /api/organizations` | Organizations. Accepts optional `activeOnly`. |

Quickest way to confirm the database connection:

```bash
curl http://localhost:5025/api/organizations
```

A `success: true` response with rows means the connection is good. A 500 means check the connection string first.

In development the API also serves an OpenAPI document at `/openapi/v1.json`.

## Note on the current state

The chart-of-accounts list reads live data from the API. The other screens still run on hardcoded sample data and browser `localStorage`, so anything entered there is per-browser and won't persist. The account create/edit/delete handlers also still write to local component state rather than calling the API — wiring those up is the next piece of work.

`DELETE /api/accounts/{id}` is a hard delete. It should become a soft delete (`IsActive = false`) before end users touch it.

The EF Core model currently covers three tables: `AccChart`, `AccCategory`, and `Organization`.

## Troubleshooting

**`Connection string 'GbAccount' was not found`** — `appsettings.Development.json` is missing. Copy it from the `.example` file.

**UI shows "Could not load accounts"** — the API isn't running, or it's on a different port than `NEXT_PUBLIC_API_BASE_URL` expects. Check the port `dotnet run` printed and curl the endpoint directly.

**CORS error in the browser console** — the UI's origin isn't in `Cors:AllowedOrigins`. If port 3000 was taken, Next.js will have started on 3001; add that origin.

**A socket hang up or timeout from the API** — usually the wrong port in the connection string. SQL Server listens on 1433 by default; another service answering on a different port will accept the TCP connection and then fail the handshake, which looks like a network problem but isn't.

**Login failed for user** — the SQL Server login needs read access to `gbAccount`, and the instance must allow SQL Server authentication (not Windows-only).
