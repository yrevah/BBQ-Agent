# BBQ Agent

A personal assistant for the Weber Vast Kettle. It reads your cooking notes,
classifies them as BBQ vs. non-BBQ, and answers grilling questions with
citations.

It runs locally on one machine, for one person. That choice keeps the setup
small: no OAuth app, no database server, no sign-in.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- SQLite (`better-sqlite3`) via Drizzle ORM — a single file under `data/`
- Anthropic Claude for generation, OpenAI `text-embedding-3-small` for retrieval

Embeddings are stored as raw float32 blobs and scored with a brute-force
cosine scan. At a personal corpus size that is well under a millisecond, so
there is no vector index to run or tune.

## Getting your notes onto disk

The app reads a plain folder, recursively. Get your Drive BBQ folder there in
whichever way suits your machine:

- **macOS / Windows** — [Google Drive for Desktop](https://www.google.com/drive/download/),
  then point the app at e.g. `~/Google Drive/My Drive/BBQ`.
- **Linux** — `rclone` works well and ships its own client ID, so there is no
  Cloud Console setup: `rclone config` (pick `drive`, accept the defaults),
  then `rclone sync gdrive:BBQ ~/bbq --progress`.
- **Any OS, one-off** — download the folder from Drive as a zip and unpack it.

Today the importer reads `.txt`, `.md`, `.rtf`, `.csv`, `.json`, and `.html`.
PDFs, Word documents, and images are catalogued but not yet extracted.

## Local setup

1. `pnpm install`
2. `cp .env.example .env` and fill in your API keys.
3. `pnpm db:migrate`
4. `pnpm dev`, then open <http://localhost:3000/sources> and enter your folder
   path.

The database lives at `data/bbq.db` by default; set `DATABASE_FILE` to move it.

## Project layout

```
src/
  app/                 App Router routes (dashboard, inbox, sources, settings)
  components/          Shared UI components
  db/                  Drizzle schema and SQLite client
  lib/library.ts       Folder scanning and text extraction
scripts/migrate.ts     Applies migrations from drizzle/
```

## Status

Phase 1 — the folder source can be connected and validated. Import, chunking,
embedding, and the assistant itself are still to come.
