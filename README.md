# BBQ Agent

A personal assistant for the Weber Vast Kettle. It ingests cooking notes from
Google Drive and Google Keep, classifies them as BBQ vs. non-BBQ, and answers
grilling questions with citations.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Auth.js v5 (Google provider) with Drizzle adapter
- Postgres + pgvector via Drizzle ORM
- Anthropic Claude for generation, OpenAI `text-embedding-3-small` for retrieval

## Local setup

1. `pnpm install`
2. Copy `.env.example` to `.env` and fill in the values you have.
3. Start a Postgres with pgvector (e.g. `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres pgvector/pgvector:pg16`).
4. `pnpm db:generate && pnpm db:migrate`
5. `pnpm dev`

## Project layout

```
src/
  app/                 App Router routes (dashboard, inbox, sources, settings)
  components/          Shared UI components
  db/                  Drizzle schema and client
  auth.ts              Auth.js v5 config
```

## Status

Phase 0 — scaffold only. See the plan file for the full roadmap.
