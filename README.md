# Patient Visit Tracker

A small full-stack application for tracking clinician visits for patients. The stack is:

- `server/`: Express + TypeScript + Prisma + SQLite
- `client/`: React + TypeScript + Vite + React Query

## Prerequisites

- Node.js 24+ or Node.js 20+
- npm 10+

## Project Structure

```text
server/
  src/
    app.ts
    controllers/
    db/
    middleware/
    routes/
    services/
    validation/
  prisma/
    schema.prisma
client/
  src/
    api/
    components/
    pages/
    App.tsx
```

## Backend Setup

From the repository root:

```bash
npm install
```

The backend uses SQLite via Prisma. The database file is configured in [server/.env](/Users/shashankshekhar/Projects/workspace/woundtech/server/.env).

## Database Migration

Run the initial Prisma migration from the repository root:

```bash
npm run db:migrate -- --name init
```

This creates the SQLite database at `server/prisma/dev.db` and generates the Prisma client.

If you are working in a restricted sandbox and Prisma cannot write to its default cache path, use:

```bash
cd server
XDG_CACHE_HOME=/tmp/prisma-cache npx prisma generate
sqlite3 prisma/dev.db < prisma/migrations/20260303083000_init/migration.sql
```

## Frontend Setup

No additional setup is required after `npm install`.

If you want to point the frontend at a different backend URL, create `client/.env` with:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

## Run Locally

Use two terminals from the repository root.

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:client
```

Then open `http://localhost:5173`.

## Ports

- Frontend: `5173`
- Backend API: `3001`

## Testing

Run the unit tests from the repository root:

```bash
npm test
```

Generate a coverage report:

```bash
npm test -- --coverage
```

## API Summary

- `GET /api/clinicians`
- `POST /api/clinicians`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/visits?clinicianId=&patientId=`
- `POST /api/visits`

## Notes

- Visits are returned in reverse chronological order by `visitedAt`.
- Visit responses include clinician and patient names.
- The UI includes lightweight forms for adding clinicians and patients so the app is usable immediately on a fresh database.
- The checked-in SQL migration matches the Prisma schema and can be applied directly if Prisma migration commands are blocked by the environment.
