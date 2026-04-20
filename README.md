# Quotes App

A full-stack web app for saving and organizing quotes from books, videos, podcasts, and other sources. Built with a modern TypeScript stack featuring end-to-end type safety.

## Features

- **Save quotes** with author, source, context, and tags
- **Rich source metadata** — YouTube (channel, timestamp), Books (ISBN, publisher, year), and more
- **Filter by tag** and sort by newest/oldest
- **Search** quotes by text, author, or source title
- **Full CRUD** — create, edit, and delete quotes
- **Authentication** via Clerk (OAuth-ready)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| API | tRPC v11 |
| Database | PostgreSQL via Prisma Accelerate |
| Auth | Clerk |
| UI | Shadcn/ui + Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| State | TanStack React Query v5 |
| Testing | Jest + ts-jest |

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd quotes-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your keys:
- **`DATABASE_URL`** — Prisma Accelerate connection string from [console.prisma.io](https://console.prisma.io)
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** and **`CLERK_SECRET_KEY`** — from [dashboard.clerk.com](https://dashboard.clerk.com)

### 3. Run database migrations

```bash
npx prisma migrate deploy
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev       # Start dev server with Turbopack
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npm test          # Run Jest tests
npm run test:watch  # Jest in watch mode
```

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── (auth)/           # Sign-in / sign-up pages
│   ├── api/trpc/         # tRPC HTTP handler
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # Shadcn UI primitives
│   └── *.tsx             # Feature components
├── trpc/
│   ├── routers/_app.ts   # All tRPC procedures
│   ├── init.ts           # tRPC + context setup
│   └── client.tsx        # React Query provider
├── lib/
│   ├── schemas/quote.ts  # Zod form schema
│   └── prisma.ts         # Prisma singleton
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
└── __tests__/            # Jest test suites
```

## Data Model

- **Quote** — core entity: text, author (optional), source (optional), tags, context
- **Author** — reusable author with optional bio
- **Source** — typed source with per-type metadata (YouTube, Book, Article, etc.)
- **Tag** — simple label; many-to-many with quotes

## Architecture Decisions

- **tRPC** provides end-to-end type safety between server procedures and React Query hooks with zero code generation.
- **Prisma Accelerate** enables edge-compatible database access with built-in connection pooling.
- **Source as a separate table** — source metadata is complex (type-specific fields) and reusable across quotes, so it lives in its own table rather than embedded JSON.
- **User isolation** — every query and mutation is scoped to `ctx.auth.userId`, enforced server-side.

## Deployment

Deploy to [Vercel](https://vercel.com) with zero config — Next.js is detected automatically. Set the environment variables from `.env.example` in your Vercel project settings.
