# AGENTS — Next.js + Supabase

## Stack

- Next.js App Router, TypeScript strict, React Server Components by default.
- Supabase for Postgres, auth, storage. `@supabase/ssr` for cookie-based sessions.
- Tailwind for styling. No component library unless it is already in `package.json`.

## Rules

1. **Server first.** A component is a server component until it needs state, effects, or browser APIs. Then add `"use client"` to the smallest leaf possible.
2. **Never expose the service role key.** It is server-only. The browser gets the anon key and is constrained by RLS.
3. **RLS on every table.** A migration that creates a table without `enable row level security` and a policy is incomplete.
4. **Migrations are files.** Use `supabase/migrations/NNNN_name.sql`. Never edit a migration that has been applied; add a new one.
5. **Server Actions for writes.** Validate input with Zod at the boundary. Return typed results, not thrown strings.
6. **No data fetching in client effects** when a server component can fetch it. Avoid waterfalls: fetch in parallel with `Promise.all`.
7. **Secrets** live in `.env.local`; only `NEXT_PUBLIC_*` reaches the browser.

## Commands

```bash
npm run dev
npm run build
npm run lint
npx supabase db push          # apply migrations
npx supabase gen types typescript --local > lib/database.types.ts
```

## Definition of done

- `npm run build` passes.
- New table → migration + RLS policies + generated types.
- New route → loading and error states.
- No `any` in new code; no `console.log` left behind.
