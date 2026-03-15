# EduMind — AI Study Platform

EduMind is a multi-tenant AI learning platform built with Next.js.
Users can upload study documents, chat with an AI assistant over those documents, generate quizzes and flashcards, and track learning progress through streaks and activity analytics.

The app supports team workspaces (subdomain-based tenants), role-based permissions, invitations, and subscription billing.

## Core Features

- AI document assistant (RAG over uploaded document chunks)
- AI quiz generation (custom topic/prompt, difficulty, question count)
- Decks + flashcards (manual and AI-generated)
- Quiz attempts, scoring, and result pages
- Study streaks, progress metrics, and activity feed
- Team workspace management (members, roles, permissions)
- Tenant onboarding with subdomain routing
- Subscription + invoices with Paymob integration

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling/UI:** Tailwind CSS v4, Radix UI, shadcn/ui, Framer Motion
- **Data Layer:** PostgreSQL + Drizzle ORM + Drizzle Kit
- **Vector Search:** `pgvector` (document embeddings in `chunks.embedding`)
- **AI:** Google Gemini (`gemini-2.5-flash`, `gemini-embedding-001`) via LangChain
- **Caching:** Upstash Redis
- **Auth:** Custom JWT auth (`accessToken` + `refreshToken` in HttpOnly cookies)
- **Uploads:** UploadThing (PDF/Word/PowerPoint/Image)
- **Email:** Resend (member invitations)
- **Payments:** Paymob
- **Tooling:** Biome (lint/format), Turbopack

## Project Structure (high-level)

```text
src/
	app/
		api/                    # Route handlers (auth, documents, quizzes, billing, etc.)
		(root)/                 # Marketing pages
		s/[subdomain]/dashboard # Tenant dashboard pages
	features/                 # Domain modules (ai-assistant, quiz, decks, billing, ...)
	db/                       # Drizzle schema, connection, seed
	utils/                    # Session, permissions, subdomain, helpers
	middleware.ts             # Subdomain-aware routing/rewrites
drizzle/                    # SQL migrations
```

## Prerequisites

- Node.js 20+
- `pnpm` (recommended; `pnpm-lock.yaml` is included)
- PostgreSQL database
- `pgvector` extension enabled on your database

## Environment Variables

Create a `.env` file in the project root.

```env
# Database
DATABASE_URL=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI (Google Gemini)
GEMINI_API_KEY=

# Auth (JWT)
ACCESS_SECRET=
REFRESH_SECRET=

# Domain / app URLs
NEXT_PUBLIC_ROOT_DOMAIN=lvh.me
NEXT_PUBLIC_AUTH_ORIGIN=http://lvh.me:3000
NEXT_PUBLIC_APP_URL=http://lvh.me:3000
NEXT_PUBLIC_API_URL=http://lvh.me:3000
COOKIE_DOMAIN=.lvh.me

# Payments (Paymob)
PAYMOB_SECRET_KEY=
PAYMOB_PUBLIC_KEY=
PAYMOB_API_KEY=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL="EduMind <noreply@edumind.app>"

# UploadThing (required for file uploads)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

## Installation

```bash
pnpm install
```

## Database Setup

Generate/apply migrations with Drizzle:

```bash
pnpm drizzle-kit migrate --config=drizzle.config.ts
```

Optional permission seed script:

```bash
pnpm seed
```

## Running the App

Start development server:

```bash
pnpm dev
```

Open:

- `http://lvh.me:3000` (or your configured app URL)

## Available Scripts

- `pnpm dev` — Run Next.js dev server (Turbopack)
- `pnpm build` — Production build
- `pnpm start` — Run production server
- `pnpm lint` — Run Biome checks
- `pnpm format` — Format code with Biome
- `pnpm seed` — Run DB seed script

## Multi-Tenant Routing Notes

- Middleware rewrites tenant routes to: `/s/[subdomain]/dashboard...`
- Auth/onboarding sets a `subdomain` cookie for tenant context
- Use `NEXT_PUBLIC_ROOT_DOMAIN` + `COOKIE_DOMAIN` correctly in local/prod

## API Domains Covered

`src/app/api` includes endpoints for:

- auth (`login`, `signup`, `logout`, `refresh`)
- onboarding and profile
- documents + AI assistant chat
- quizzes + quiz attempts
- decks + flashcards
- roles, permissions, members, invitations
- billing/subscriptions/invoices
- dashboard/activity/streak/usage metrics

## Notes

- This app uses Node.js runtime for document processing routes.
- Webhook signature verification for Paymob should be enforced before production rollout.
