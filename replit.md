# Security Scanner - AI-Powered Security Analysis Platform

## Overview
A full-stack web application that allows users to submit URLs for AI-powered security analysis. The system crawls web pages, extracts resources, and uses both OpenAI (GPT-4o-mini) and Anthropic (Claude) to perform security audits with scoring and risk assessment.

## Architecture
- **Frontend**: React (Vite), served on port 5000
- **Backend**: Node.js/Express API, served on port 3000
- **Database**: PostgreSQL (Prisma ORM)
- **AI**: OpenAI GPT-4o-mini + Anthropic Claude dual-model analysis

## Project Layout
```
/
├── backend/              # Node.js/Express API
│   ├── app.js            # Express app setup and route registration
│   ├── server.js         # Entry point (port 3000)
│   ├── cron.js           # Weekly monitoring cron jobs
│   ├── middleware/       # auth.js, admin.js, planCheck.js, usage.js
│   ├── prisma/           # schema.prisma (PostgreSQL)
│   ├── services/
│   │   ├── auth/         # JWT authentication routes
│   │   ├── scanning/     # URL scan queue and results
│   │   ├── admin/        # Admin analytics dashboard
│   │   ├── analytics/    # Usage and domain stats
│   │   ├── ai/           # OpenAI + Claude integration, scoring
│   │   ├── crawler/      # Web crawler (axios + jsdom)
│   │   ├── features/     # Plan-based feature flags
│   │   ├── monitor/      # Weekly rescan monitoring service
│   │   └── usage/        # Token/scan usage logging
│   └── shared/           # Prisma client singleton
├── frontend/             # React application (Vite)
│   ├── index.html        # Entry HTML
│   ├── vite.config.js    # Vite config (proxy to backend, port 5000)
│   └── src/
│       ├── App.jsx       # Router setup
│       ├── index.js      # React entry (JSX)
│       └── components/   # AuthForm, ScanPage, ResultsPage, AdminDashboard, etc.
├── start.sh              # Combined startup script
└── replit.md             # This file
```

## Key Features
- User authentication (JWT, bcrypt)
- Plan-based access control (FREE / PRO / ENTERPRISE)
- URL security scanning with dual AI model analysis
- Security score (0-100) and risk level computation
- Admin analytics dashboard
- Weekly monitoring/rescan cron job
- Usage tracking per user/plan

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection (auto-provisioned by Replit)
- `JWT_SECRET` - JWT signing secret (defaults to dev value)
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o-mini
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude

## Workflows
- **Start application**: `bash start.sh` — starts backend on port 3000, frontend on port 5000

## Database
- PostgreSQL via Prisma
- Schema: User, UsageEvent, Scan, ScanHistory
- Run `cd backend && npx prisma db push` to sync schema changes

## Development Notes
- Frontend uses Vite proxy to forward API calls from port 5000 to backend port 3000
- `.js` files in frontend/src use JSX syntax — configured in vite.config.js via esbuild loader
- Vite is configured with `allowedHosts: true` for Replit proxy compatibility
