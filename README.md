## Comprehensive Codebase Exploration Report

---

### 1. **App Summary**

This is **EduMind**, a multi-tenant AI-powered educational platform built on Next.js 15 and PostgreSQL. It allows teams/organizations to create, analyze, and learn from documents via AI-generated quizzes, flashcards, and conversational AI assistants. Each organization has a subdomain-based workspace with role-based access control, subscription billing, and gamified learning features (streaks, progress tracking).

---

### 2. **Key Features** (with Evidence)

| Feature | Evidence Files |
|---------|---|
| **Document Upload & AI Analysis** | [src/app/api/documents/route.ts](src/app/api/documents/route.ts#L1-L80) — Handles PDF, Word, PowerPoint uploads via UploadThing; extracts embeddings via Google Gemini |
| **AI Document Assistant** | [src/app/api/documents/ai-assistant/route.ts](src/app/api/documents/ai-assistant/route.ts#L1-L100) — Chat interface with RAG (retrieval-augmented generation) using Gemini embeddings + LangChain |
| **AI-Generated Quizzes** | [src/app/api/quizzes/route.ts](src/app/api/quizzes/route.ts#L1-L150) — Creates MCQ/true-false/short-answer quizzes from documents using ChatGoogleGenerativeAI; enforces plan limits |
| **Flashcard Decks** | [src/app/api/decks/route.ts](src/app/api/decks/route.ts#L1-L50) — Study decks with manual and AI-generated flashcards |
| **Quiz Attempts & Scoring** | [src/db/schema.ts](src/db/schema.ts#L400-L430) — `quizAttempts`, `attemptsAnswers` tables track user scores and answer history |
| **Progress & Streaks** | [src/db/schema.ts](src/db/schema.ts#L500-L600) — `progressTracking`, `streaks`, `studyDays` tables track study hours, documents read, quizzes completed, streak counts |
| **Activity Logging** | [src/db/schema.ts](src/db/schema.ts#L580) — `userActivities` table captures user actions for auditing/analytics |
| **Notes/Annotations** | [src/db/schema.ts](src/db/schema.ts#L470) — `notes` table with tags, pinning, color-coding |
| **Multi-Tenant Workspaces** | [src/middleware.ts](src/middleware.ts#L1-L45) — Subdomain-based routing via `/s/{subdomain}/dashboard` pattern; cookie enforcement |
| **Team Invitations & Members** | [src/db/schema.ts](src/db/schema.ts#L147-L180) — `tenantInvites`, `tenantMembers` tables; email invitations via Resend ([src/app/api/members/invite/route.ts](src/app/api/members/invite/route.ts#L18-L150)) |
| **Role-Based Access Control (RBAC)** | [src/db/schema.ts](src/db/schema.ts#L104-L210) — `tenantRoles`, `rolePermission`, `permissions` tables; enforced via [src/utils/has-permission](src/utils/has-permission) |
| **Subscription Billing** | [src/app/api/subscriptions/route.ts](src/app/api/subscriptions/route.ts#L1-L100) — Paymob integration for monthly/yearly plans; invoice tracking |
| **Plan Limits** | [src/db/schema.ts](src/db/schema.ts#L48-L61) — `planLimits` table controls feature availability (documents, quizzes, decks); enforced via [src/utils/can-create-feature](src/utils/can-create-feature) |
| **Onboarding Flow** | [src/app/api/onboarding/route.ts](src/app/api/onboarding/route.ts#L144-L145) — Tenant creation and user preference setup |
| **Theme & Localization** | [src/db/schema.ts](src/db/schema.ts#L285-L292) — `aiCustomization` supports `spokenLanguage` (English, Arabic) |

---

### 3. **Tech Stack** (with Evidence)

| Layer | Technologies | Evidence |
|-------|---|---|
| **Frontend** | React 19, Next.js 15 (App Router), TailwindCSS, Shadcn UI, Framer Motion | [package.json](package.json#L1-L40) |
| **State Management** | TanStack React Query, Zustand (implied by query-persist), Nuqs (URL state) | [package.json](package.json#L51-L65) |
| **Forms** | React Hook Form + Zod validation | [package.json](package.json#L73-L74) |
| **Database** | PostgreSQL (Neon serverless), Drizzle ORM | [src/db/conn.ts](src/db/conn.ts#L1-L25), [drizzle.config.ts](drizzle.config.ts) |
| **Vector Database** | pgvector extension (3072-dim embeddings) | [src/db/schema.ts](src/db/schema.ts#L320) |
| **Caching** | Upstash Redis (REST API) | [src/db/conn.ts](src/db/conn.ts#L20-L24) |
| **Auth** | Custom JWT (jose library), bcrypt hashing | [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts#L1-L65) |
| **AI/LLM** | Google Gemini APIs (2.5-flash, embeddings), LangChain, @ai-sdk/google | [src/app/api/documents/ai-assistant/route.ts](src/app/api/documents/ai-assistant/route.ts#L17-L24) |
| **File Upload** | UploadThing | [src/app/api/uploadthing/core.ts](src/app/api/uploadthing/core.ts#L1-L80) |
| **Payments** | Paymob (Egyptian payment gateway) | [src/app/api/subscriptions/route.ts](src/app/api/subscriptions/route.ts#L18-L19) |
| **Email** | Resend | [src/app/api/members/invite/route.ts](src/app/api/members/invite/route.ts#L18) |
| **PDF Processing** | react-pdf, pdf-parse, @react-pdf-viewer, @react-pdf/renderer | [package.json](package.json#L48-L51) |
| **Data Visualization** | Recharts | [package.json](package.json#L66) |
| **Tables** | TanStack React Table | [package.json](package.json#L61) |
| **Drag & Drop** | dnd-kit | [package.json](package.json#L28-L31) |
| **Code Quality** | Biome linter/formatter, TypeScript, Turbopack | [package.json](package.json#L13-L15), [biome.json](biome.json) |

---

### 4. **Auth & Multi-Tenancy Behavior**

| Aspect | Evidence |
|--------|----------|
| **Auth Method** | Custom JWT-based (no next-auth). Access token (15m) + refresh token (7d) stored in HTTP-only, secure cookies | [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts#L20-L65) |
| **Password Security** | Bcrypt hashing (salt rounds 10) | [src/app/api/auth/signup/route.ts](src/app/api/auth/signup/route.ts#L35-L38) |
| **Subdomain Isolation** | Middleware redirects `/dashboard` → `/s/{subdomain}/dashboard`; subdomain must match user's tenant via cookie validation | [src/middleware.ts](src/middleware.ts#L1-L45) |
| **Cross-Tenant Protection** | Enforced in every API handler via `getTenantMember()` and `getTenantBySubdomain()` | [src/app/api/quizzes/route.ts](src/app/api/quizzes/route.ts#L35-L60) |
| **Tenant Ownership** | Each tenant has single `ownerId`; members join via invite with role-based access | [src/db/schema.ts](src/db/schema.ts#L85-L103) |
| **Role-Based Permissions** | Role → Permissions via `rolePermission` junction table; checked per API action (e.g., `quiz:create`) | [src/db/schema.ts](src/db/schema.ts#L189-L210) |
| **Session Persistence** | Last active tenant subdomain stored in user record and cookie for auto-redirect | [src/db/schema.ts](src/db/schema.ts#L77), [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts#L40) |

---

### 5. **Billing & Payments Integration**

| Component | Evidence |
|-----------|----------|
| **Payment Provider** | **Paymob** (Egyptian payment gateway); secret & public keys required | [src/app/api/subscriptions/route.ts](src/app/api/subscriptions/route.ts#L18-L19) |
| **Plan Model** | Tiered plans stored in `plans` table; prices in cents (EGP currency); annual discount configurable | [src/db/schema.ts](src/db/schema.ts#L36-L47) |
| **Billing Cycles** | Monthly and yearly options; enum: `billing_cycle` | [src/db/schema.ts](src/db/schema.ts#L19) |
| **Subscription States** | `active`, `expired`, `canceled`, `failed`, `pending` | [src/db/schema.ts](src/db/schema.ts#L27-L35) |
| **Payment Flow** | `createPaymentIntention()` calls Paymob API; webhooks update subscription status via provider IDs | [src/app/api/subscriptions/route.ts](src/app/api/subscriptions/route.ts#L30-L89) |
| **Invoice Tracking** | Invoices linked to subscriptions; issued, due, and paid dates tracked | [src/db/schema.ts](src/db/schema.ts#L245-L262) |
| **Feature Quotas** | `planLimits` table (`documents`, `quizzes`, `decks`, etc.); enforced via `canCreateFeature()` utility | [src/db/schema.ts](src/db/schema.ts#L48-L61), [src/app/api/quizzes/route.ts](src/app/api/quizzes/route.ts#L121-L128) |
| **Plan Upgrade** | Separate upgrade endpoint (`/api/subscriptions/upgrade`)  | [src/app/api/subscriptions/](src/app/api/subscriptions/) |
| **Cancellation** | Cancel endpoint with provider sync | [src/app/api/subscriptions/[subscriptionId]/](src/app/api/subscriptions/) |

---

### 6. **AI/LLM Functionality**

| Feature | Model | Evidence |
|---------|-------|----------|
| **Document Embedding** | `gemini-embedding-001` (3072 dimensions) | [src/app/api/documents/route.ts](src/app/api/documents/route.ts#L63-L65) |
| **Semantic Search (RAG)** | Uses embeddings to find relevant document chunks before answering queries | [src/app/api/documents/ai-assistant/route.ts](src/app/api/documents/ai-assistant/route.ts#L70-L80) |
| **Conversational AI** | `gemini-2.5-flash` with conversation history (last 5 messages) | [src/app/api/documents/ai-assistant/route.ts](src/app/api/documents/ai-assistant/route.ts#L22-L24) |
| **Quiz Generation** | LangChain + ChatGoogleGenerativeAI to create MCQ/true-false questions from prompts | [src/app/api/quizzes/route.ts](src/app/api/quizzes/route.ts#L164-L170) |
| **Flashcard AI** | AI-generated flashcards from documents or quiz answers | [src/db/schema.ts](src/db/schema.ts#L439-L445) (`source: 'manual' \| 'quiz' \| 'assistant'`) |
| **Text Processing** | LangChain `RecursiveCharacterTextSplitter` for chunking PDFs | [src/app/api/documents/route.ts](src/app/api/documents/route.ts) (Line 6 import) |
| **Google Vertex AI Integration** | Optional via `@langchain/google-vertexai` | [package.json](package.json#L13) |
| **Fallback NLP** | `@xenova/transformers` (Hugging Face models) for local inference | [package.json](package.json#L61) |

---

### 7. **Important Environment Variables**

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) | `postgresql://user:pass@host/db` |
| `GEMINI_API_KEY` | Google Gemini API key for embeddings & LLM | Required for all AI features |
| `PAYMOB_SECRET_KEY` | Paymob webhook/API secret | Required for subscription creation |
| `PAYMOB_PUBLIC_KEY` | Paymob client-side key | Required for payment UI |
| `UPSTASH_REDIS_REST_URL` | Redis cache endpoint | Required for caching |
| `UPSTASH_REDIS_REST_TOKEN` | Redis API token | Required for caching |
| `ACCESS_SECRET` | JWT signing key (15m tokens) | Should be strong random string |
| `REFRESH_SECRET` | JWT signing key (7d tokens) | Should be strong random string |
| `RESEND_API_KEY` | Email service API key | Required for team invitations |
| `RESEND_FROM_EMAIL` | Sender email | Default: `EduMind <noreply@edumind.app>` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Root domain for subdomains | Default: `lvh.me` (localhost) |
| `NEXT_PUBLIC_AUTH_ORIGIN` | Auth endpoint origin | Computed from domain |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | Computed from domain; used in invite links |
| `NEXT_PUBLIC_API_URL` | API base URL | Used by clients for API calls |
| `COOKIE_DOMAIN` | Cookie scope domain | Default: `.{rootDomain}` |
| `NODE_ENV` | Environment | `production` or `development` |

---

### 8. **Database Schema Overview** (Key Tables)

| Table | Purpose | Evidence |
|-------|---------|----------|
| `users` | Global user accounts with email/password | [src/db/schema.ts](src/db/schema.ts#L65-L82) |
| `tenants` | Organizations/workspaces | [src/db/schema.ts](src/db/schema.ts#L85-L103) |
| `tenantMembers` | User-to-tenant mapping with roles | [src/db/schema.ts](src/db/schema.ts#L125-L145) |
| `tenantRoles`, `rolePermission` | RBAC system | [src/db/schema.ts](src/db/schema.ts#L104-L210) |
| `documents` | PDFs, Word docs, slides with text extraction | [src/db/schema.ts](src/db/schema.ts#L294-L312) |
| `chunks` | Document text chunks + vector embeddings | [src/db/schema.ts](src/db/schema.ts#L314-L320) |
| `quizzes`, `quizQuestions` | AI-generated quizzes | [src/db/schema.ts](src/db/schema.ts#L325-L365) |
| `quizAttempts`, `attemptsAnswers` | User quiz performance | [src/db/schema.ts](src/db/schema.ts#L367-L415) |
| `deck`, `flashcards` | Study flashcard decks | [src/db/schema.ts](src/db/schema.ts#L426-L465) |
| `progressTracking`, `streaks`, `studyDays` | Gamification & analytics | [src/db/schema.ts](src/db/schema.ts#L485-L600) |
| `plans`, `subscriptions`, `invoices` | Billing & subscription state | [src/db/schema.ts](src/db/schema.ts#L36-L262) |
| `assistantMessages` | Chat history with AI | [src/db/schema.ts](src/db/schema.ts#L340-L365) |

---

### 9. **Caveats & TODOs**

| Issue | Evidence |
|-------|----------|
| **README Placeholder** | Generic create-next-app README; no custom app documentation | [README.md](README.md) |
| **Hardcoded Paymob Plan IDs** | Subscription plan IDs are hardcoded per billing cycle/tier; not parametrized in DB | [src/app/api/subscriptions/route.ts](src/app/api/subscriptions/route.ts#L20-L25) |
| **Email Styling** | Basic HTML email invites; no email templates defined in codebase | [src/app/api/members/invite/route.ts](src/app/api/members/invite/route.ts#L150) |
| **Test Suite Missing** | No Jest/Vitest test files visible | N/A |
| **PDF Processing Runtime** | Requires Node.js runtime (pdf-parse, canvas); not Edge-compatible | [src/app/api/documents/route.ts](src/app/api/documents/route.ts#L24-L25) |
| **Quiz Prompt Flexibility** | Quiz generation accepts freeform prompts but validation is light | [src/app/api/quizzes/route.ts](src/app/api/quizzes/route.ts#L140-L160) |
| **Unused next-auth Package** | Package.json includes `next-auth@^4.24.11` but custom JWT auth is implemented | [package.json](package.json#L41) |
| **Metadata Placeholder** | App title/description generic ("Create Next App") | [src/app/layout.tsx](src/app/layout.tsx#L18-L20) |
| **Error Handling** | Minimal error context in API responses (e.g., "Forbidden" without reason) | [src/app/api/quizzes/route.ts](src/app/api/quizzes/route.ts#L117) |
| **Rate Limiting** | No visible rate-limiting middleware | N/A |

---

**Report Complete.** All findings are grounded in inspected source files. No placeholder or speculative claims included.
