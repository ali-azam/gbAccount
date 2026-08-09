# Setup Guide

Getting this running on your machine takes three steps. You should only ever need to edit `.env` — nothing in `src/`.

## 1. Prerequisites

- **Node.js** LTS — nodejs.org (developed on v26, any recent LTS is fine)
- **SQL Server** with the `GbAccount` database restored and reachable
- **Git** — git-scm.com

## 2. Configure

Copy the template and fill in your own database credentials:

```bash
cp .env.example .env
```

Then open `.env` and set the values for your SQL Server instance:

| Variable | What it is |
| --- | --- |
| `DB_SERVER` | Hostname. `localhost` if SQL Server is on your machine. |
| `DB_PORT` | Usually `1433`. |
| `DB_NAME` | `GbAccount`. |
| `DB_USERNAME` | Your SQL Server login. |
| `DB_PASSWORD` | That login's password. |
| `DB_ENCRYPT` | `false` for local. `true` against a real server. |
| `DB_TRUST_SERVER_CERT` | `true` for local. `false` against a server with a valid certificate. |
| `DATABASE_URL` | Only used by the Prisma CLI (`studio`, `migrate`). Same credentials, connection-string form. |

`.env` is gitignored and must stay that way — it holds real credentials. `.env.example` is the committed template.

## 3. Install and run

```bash
npm install
npm run dev
```

`npm install` generates the Prisma client automatically, then the dev server starts and opens http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

## Checking the API

Three read-only endpoints. Each returns `{ success: boolean, data: [...] }`.

| Endpoint | Returns |
| --- | --- |
| `GET /api/accounts` | Chart of accounts, with category and organization joined in |
| `GET /api/categories` | Account categories |
| `GET /api/organizations` | Organizations |

Quickest way to confirm the database connection is working — visit http://localhost:3000/api/organizations in a browser, or:

```bash
curl http://localhost:3000/api/organizations
```

A `success: true` response with rows means the connection is good. A 500 means check your `.env` credentials first.

To browse the data directly:

```bash
npx prisma studio
```

## Note on the current state

The API routes above are live and read from SQL Server. The **UI does not use them yet** — the screens still run on hardcoded sample data and browser `localStorage`, so anything you enter there is per-browser and won't persist to the database. Connecting the two is the next piece of work.

The schema currently covers three tables: `AccChart`, `AccCategory`, and `Organization`.

## Troubleshooting

**`Cannot find module '../generated/prisma/client'`** — the Prisma client wasn't generated. Run `npm run db:generate`.

**500 from an API route** — almost always `.env` credentials or SQL Server not reachable. Verify the login works in SSMS, and check `DB_SERVER`/`DB_PORT`. Confirm the schema is readable with `npm run db:check`.

**Login failed for user** — the SQL Server login needs read access to `GbAccount`, and the instance must allow SQL Server authentication (not Windows-only).
