# Credit Book — Family Ledger

A secure digital ledger for tracking money lent and borrowed within a family or close circle.

## Stack

| Layer | Technology |
|---|---|
| Frontend (Web) | React 18 + Vite + Zustand |
| Backend (API) | Node.js + Express + Prisma |
| Database | PostgreSQL (Neon — cloud, auto-backup) |
| Deployment | Vercel (web) + Render (api) |

## Project Structure

```
CreditBook/
├── web/          → React web app  → deployed on Vercel
├── mobile/       → React Native app (future)
├── backend/      → Express API    → deployed on Render
├── database/     → Prisma schema + migrations
├── docs/         → Documentation (30 files)
└── reference/    → Design references (not in git)
```

## Local Development

```bash
# 1. Install all dependencies
npm install

# 2. Set up backend env
cp backend/.env.example backend/.env
# Edit backend/.env with your Neon DATABASE_URL and DIRECT_URL

# 3. Set up web env (optional for local)
cp web/.env.example web/.env

# 4. Run database migrations
cd backend && npm run db:deploy

# 5. Start both servers (in separate terminals)
npm run dev:api    # API on http://localhost:3001
npm run dev:web    # Web on http://localhost:5173
```

## Deployment

- **Database**: [Neon](https://neon.tech) — create a project, get `DATABASE_URL` + `DIRECT_URL`
- **Backend**: [Render](https://render.com) — connect GitHub repo, set env vars, auto-deploys
- **Frontend**: [Vercel](https://vercel.com) — connect GitHub repo, set `VITE_API_URL`, auto-deploys

See `render.yaml` and `web/vercel.json` for deployment configuration.
