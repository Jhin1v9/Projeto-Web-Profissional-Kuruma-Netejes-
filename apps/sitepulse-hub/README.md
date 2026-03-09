# SitePulse Hub

Standalone UI base for audit orchestration, command copy and report reading.

## Why this folder exists
- dedicated app to deploy on Vercel without touching the main site runtime
- easy to iterate on graphics/UI independently
- ready starting point for future integration with real audit execution

## Quick start (local)
```bash
cd apps/sitepulse-hub
npm install
npm run dev
```

Open: `http://localhost:3000`

Demo users:
- `admin / admin123`
- `mobile / mobile123`

## Vercel deploy
1. Push this repository to GitHub.
2. In Vercel, create/import project from this repo.
3. Set **Root Directory** to `apps/sitepulse-hub`.
4. Framework preset: `Next.js` (auto).
5. Build command: `npm run build` (default).
6. Output directory: `.next` (default).
7. Deploy.

## Included API routes
- `GET /api/health`: health check.
- `GET /api/demo-report?mode=desktop|mobile`: sample report payload.
- `POST /api/run-plan`: returns execution plan + command template.

## Notes
- Includes:
  - control center (URL/mode/headed/no-server)
  - live progress + run log
  - issue center with severity filter and search
  - assistant playbook panel
  - command copy for guided CMD and direct CMD
  - JSON import (file and paste) for real report inspection
- Real audit execution can be plugged next (self-hosted runner or queue worker).
