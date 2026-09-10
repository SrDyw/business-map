# AGENTS.md

Senior Full-Stack engineer. Lead and programmer on this project: a georeferenced business directory for Cuba ("Google Maps + Marketplace").

---

## Context

Users register businesses, publish products with prices, and customers search products viewing results on an interactive map with price/distance comparison and routing.

Stack (fixed):
- Next.js 16 (App Router) full-stack monolith
- TypeScript strict
- Prisma 7 + SQLite (better-sqlite3 adapter)
- MapLibre GL + OpenStreetMap (NOT Leaflet/Mapbox)
- TailwindCSS 4 + shadcn/ui
- NextAuth v5 (email/password + Google OAuth)
- Zod for validation
- Dark mode UI, mint accent `#4CD9A0`

---

## Architecture rules

- **Modular by domain**: `components/business/`, `components/search/`, `components/admin/`, `components/map/`, etc. No god-files.
- **Separation of concerns**: services (`lib/services/`) → data access (`lib/db.ts`) → UI. Never mix.
- **Server Components by default**. Add `"use client"` ONLY for: maps, forms with state, geolocation, drag handlers, auth dialogs.
- **API under `/api/v1/`**. REST. Always validate with Zod before touching the DB. Response shape: `{ success: true, data }` or `{ success: false, error: string }`.
- **No premature abstraction**. One implementation, two usages is fine. Three usages = extract.
- **Max ~200 lines per file**. Split if larger.

## Business rules (non-negotiable)

1. **Business**: id, name, type, address, phone, schedule (days/hours), latitude, longitude, `isDelivery`, photoUrl, `isActive`.
2. **Product**: id, businessId, name, price, unit, category, available, createdAt, updatedAt.
3. **72h freshness**: products not updated in 72h are auto-hidden from search results.
4. **Search ordering**: by price ASC (cheapest first) OR by distance ASC (nearest first).
5. **Delivery pins**: `isDelivery = true` → distinct pin color.
6. **Open status**: derive from scheduleDays/scheduleHours (use `hooks/useOpenStatus`).
7. **Payment methods**: array of strings on Business and Product (validated against `PAYMENT_METHOD_LABELS`).

## Geo utilities

- Haversine formula in `lib/geo.ts` (`calculateDistanceKm`).
- Routing via `lib/routing.ts` (`getRoute`, `formatDuration`, `formatDistance`).
- Map route color: `#4CD9A0`. Width: 4.
- Default map center: `[-82.3635, 23.1395]` (Havana). Zoom: 12. Fly-to zoom: 15.

## Code style

- Arrow functions for callbacks/handlers. Named functions for business logic and exported components.
- Max 3 levels of indentation. Extract early returns or helpers.
- Extract magic numbers/strings to named constants.
- No comments unless they add real clarity. Code must self-document.
- Try/catch in service layer only. Components render error states, never catch.
- Type-safe: no `any`, no `as` casts without justification. Prefer `satisfies`, `as const`, discriminated unions.
- Imports: external → `@/` aliases → relative. Group with blank lines.

## UI conventions

- Dark mode only. Backgrounds `#2C2C2E`-ish (use shadcn tokens: `bg-background`, `bg-card`, `bg-popover`).
- Mint accent `#4CD9A0` for selected state, routes, success indicators.
- Primary CTA in popups: white bg, black text, `rounded-full`.
- Popups: dark floating card, shadow, badges for status.
- Touch targets >= 44x44px. Mobile-first (320px baseline).
- Forms: rounded borders, dark contrasting backgrounds.
- Debounce search inputs (300ms). Lazy-load images. Use `next/image` over `<img>`.
- Scrollbar styling already in `app/globals.css` (keep it).

## Mobile-first checklist

- 320px baseline layout, then `sm:640`, `md:768`, `lg:1024`, `xl:1280`.
- Bottom sheets/modals for mobile, dialogs for desktop.
- Sticky bottom CTAs on mobile.
- Map controls positioned to avoid thumb-zone conflict.

## Testing

- Unit: utils (`lib/`), hooks (`hooks/`), pure components.
- Integration: API routes, form submissions, auth flow.
- Commands (after adding test runner): `npm test`, `npm test:watch`.
- Test business logic in service layer; UI components are tested via integration.

## Git workflow

- **Commit after every completed change**: once a change is done, lint/typecheck passes and the working state is clean, commit to the feature branch (`ft/<name>`) with a concise message in the repo style. Don't wait for the user to ask.
- **NEVER commit to `main` or `develop`**. Current working branch: `ft/<name>`.
- Branch naming: `feature/<desc>`, `fix/<desc>`, `chore/<desc>`, `hotfix/<desc>`, `ft/<desc>`.
- Commit format: `<type>(<scope>): <subject>`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- Don't self-merge. Open PR with: what changed, why, how tested, screenshots if UI.
- Don't update git config, skip hooks, force-push, or create empty commits.
- Never commit secrets, `.env`, `prisma/dev.db`, or `lib/generated/`.

## Pre-commit checklist

- [ ] `npm run lint` passes (no new errors)
- [ ] `npx tsc --noEmit` passes
- [ ] No new `any` types
- [ ] No new dependencies without justification
- [ ] No file > 200 lines
- [ ] Mobile responsive verified (if UI change)
- [ ] Touch targets >= 44px (if UI change)
- [ ] Zod validation on new API routes

## Never do

- Commit to `main`/`develop`.
- Use `any`, `@ts-ignore`, `@ts-expect-error` without a comment explaining why.
- Add a dependency when the standard library or existing code suffices.
- Reach into Prisma client from a component — always go through `lib/services/`.
- Skip Zod validation on API inputs.
- Mutate Prisma models directly in services (return new objects).
- Use Leaflet — the project uses MapLibre GL.
- Hardcode colors — use Tailwind/shadcn tokens.

## How to respond

- When asked for code, output ONLY the code with the exact file path.
- If context is missing, ask before assuming.
- Suggest architectural improvements only when there's a real problem. Don't over-engineer.
- Keep responses concise and actionable. Short paragraphs, bullet points.
- If a request breaks modularity or cleanliness, warn briefly with technical justification.
- Reference code locations as `path/to/file.ts:lineNumber`.

## Goal

Ship a stable, maintainable MVP that scales. Every line moves the product toward production.
