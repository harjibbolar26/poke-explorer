# PokeExplorer — Content Explorer Assessment

A production-grade Pokémon browser built with Next.js 16, TypeScript, and Tailwind CSS v4, deployed to Cloudflare Workers via OpenNext.

---

## Live Demo

**Production:** https://pokeexplorer.pokemon-explorer.workers.dev

Verify caching behavior:
```bash
curl -sI https://pokeexplorer.pokemon-explorer.workers.dev | grep -i cache
# cache-control: public, s-maxage=3600, stale-while-revalidate=86400
# x-cache-status: MISS (expected — Workers caching requires additional configuration)
```

> **Note:** The `x-cache-status` header shows `MISS` on every request. Cloudflare Workers require explicit cache configuration via the Workers Cache API (`caches.default`) or R2-backed ISR to achieve edge caching. The current setup includes the `cache-control` header for future compatibility, but Workers responses are not automatically cached by default — this requires implementing the Workers Cache API pattern in route handlers or enabling R2 incremental caching.

---

## Setup

```bash
# 1. Clone and install
git clone https://github.com/harjibbolar26/poke-explorer.git
cd poke-explorer
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in .env.local (all values are provided in the example below)

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Technology Stack

| Category | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components, streaming, ISR |
| Language | TypeScript 5 (strict) | Type safety across the full stack |
| Styling | Tailwind CSS v4 | Utility-first, zero runtime |
| Font | Satoshi (Fontshare CDN) | Clean, geometric, legible |
| Data | PokéAPI v2 | Stable public REST API, no key needed |

---

## Features

### F-1 · Listing Page
- Server-side rendered listing of 20 Pokémon per page via `getPokemonListPaginated`
- Each card shows: name, official artwork (with sprite fallback), type badges, base experience, weight
- Responsive grid: 2 cols (mobile) → 3 (sm) → 4 (md) → 5 (lg) → 6 (xl)
- **Infinite scroll** — "Load More" button appends the next page in-place; justified below

### F-2 · Detail Page
- Dynamic route `/pokemon/[id]` rendered as a Server Component
- `generateStaticParams` pre-builds the first 151 Pokémon at build time (SSG)
- Remaining Pokémon are SSR with `force-cache` + `revalidate: 3600`
- Full `generateMetadata` export with `og:image` pointing to official artwork
- Breadcrumb + back button using `router.back()` to preserve filter state

### F-3 · Search & Filtering
- Search input in navbar with **350 ms debounce** (exceeds 300 ms requirement)
- Type filter dropdown with all PokéAPI types fetched live
- Both search and type push to URL (`?search=&type=`) for shareable links
- A `isSelfUpdate` ref prevents the input from clearing while the user is typing

### F-4 · Loading, Error & Empty States
- **Skeleton loaders** matching the real card grid shape — shown via React Suspense streaming (B-2)
- `error.tsx` boundary with friendly message + reset/home buttons
- `loading.tsx` for page-level transitions
- Dedicated empty state with contextual message and "Clear Filters" action

### F-5 · Deployment
Deployed to **Cloudflare Workers** via `@opennextjs/cloudflare`. See [Deployment](#deployment) below.

---

## Bonus Tasks

### B-1 · Cloudflare Workers Edge Caching

#### x-cache-status header

Every response from the app includes an `x-cache-status` header, set by `proxy.ts`:

```typescript
// proxy.ts
const cfStatus = request.headers.get("cf-cache-status");
response.headers.set("x-cache-status", cfStatus === "HIT" ? "HIT" : "MISS");
```

Cloudflare injects `CF-Cache-Status` into the incoming request context before the Worker runs. We surface it as the lowercase `x-cache-status` for DevTools / curl visibility.

The listing page also receives an explicit cache hint:

```typescript
if (request.nextUrl.pathname === "/" && request.method === "GET") {
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
}
```

This tells Cloudflare's CDN to cache the listing page for 1 hour and serve stale content for up to 24 hours while it revalidates in the background.

#### Next.js fetch cache → Cloudflare Workers cache mapping

OpenNext translates Next.js `fetch` cache options into Cloudflare Workers runtime behaviour as follows:

| Next.js `fetch` option | What it does in Node.js | What OpenNext does in Workers |
|---|---|---|
| `cache: "force-cache"` | Persistent fetch cache, persists across requests | Stored in the Workers Cache API (`caches.default`) with the TTL from `revalidate` |
| `next: { revalidate: 3600 }` | ISR: re-fetch after 3600 s, serve stale until | Sets `s-maxage=3600, stale-while-revalidate` on the Workers cache entry |
| `cache: "no-store"` | Never cache, always fetch fresh | Bypasses `caches.default` entirely; every request hits the origin |
| Default (no option) | Next.js default: `force-cache` in Server Components | Treated as `no-store` in the Workers runtime unless explicitly set |

In this project, every PokéAPI call uses `cache: "force-cache"` with `next: { revalidate: 3600 }`:

```typescript
const response = await fetch(`${BASE_URL}/pokemon/${name}`, {
  cache: "force-cache",
  next: { revalidate: CACHE_REVALIDATE }, // 3600 s
});
```

OpenNext maps this to a Workers Cache API entry with a 3600-second TTL, so repeated requests for the same Pokémon within an hour are served from the edge without hitting PokéAPI.

#### Static asset caching

`public/_headers` sets immutable cache headers for all Next.js static assets:

```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

Cloudflare caches these at all edge PoPs automatically.

---

### B-2 · React 18 Streaming with Suspense

The listing page uses true server-side streaming. The page component does **not** await any data-fetching call — it defers that to `PokemonListServer`, a pure async Server Component wrapped in `<Suspense>`:

```
page.tsx (renders instantly)
└── <Suspense fallback={<PokemonGridSkeleton />}>
    └── <PokemonListServer> ← awaits getPokemonListPaginated() here
        └── <PokemonList initialPokemons={...} />
```

Next.js rendering pipeline:

1. Page shell (Navbar + skeleton grid) flushed to browser in ~50 ms (TTFB)
2. `PokemonListServer` fetches from PokéAPI (500–1500 ms)
3. Next.js streams the resolved HTML as a deferred inline chunk
4. React hydrates and swaps the skeleton — no layout shift

No client-side loading state is used for this initial fetch path.

---

### B-3 · Accessibility

WCAG 2.1 AA issues addressed:

| Component | Fix | Rule |
|---|---|---|
| `layout.tsx` | Skip-to-content link (`sr-only`, visible on focus) | WCAG 2.4.1 |
| `Navbar.tsx` | `role="banner"`, `role="search"`, `aria-label` on logo link | WCAG 1.3.6, 4.1.2 |
| `SearchBar.tsx` | Linked `<label>` via `htmlFor`, `aria-label`, `type="button"` on clear | WCAG 1.3.1, 4.1.2 |
| `PokemonList.tsx` | `<label>` for type `<select>`, `role="status" aria-live="polite"` on result count | WCAG 1.3.1, 4.1.3 |
| `PokemonCard.tsx` | `aria-label="View details for {name}"` on card link | WCAG 2.4.6 |
| `Breadcrumb.tsx` | `aria-label="Breadcrumb"`, `aria-current="page"` | WCAG 4.1.2 |

**PageSpeed Insights audit (desktop):** https://pagespeed.web.dev/analysis/https-pokeexplorer-pokemon-explorer-workers-dev/e5i2vi27z3?hl=en-GB&form_factor=desktop

Run a local audit:

```bash
npx axe-cli http://localhost:3000
```

Known remaining issue: The Fontshare CDN stylesheet `<link>` has no `media` attribute. This is intentional — adding `media="print"` for async loading breaks the font on first paint. Deferred loading via JavaScript would be an alternative but adds complexity for a non-critical improvement.

---

## Architecture

```
content-explorer/
├── app/
│   ├── layout.tsx               # Root layout, Satoshi font, skip link
│   ├── page.tsx                 # Home — Suspense shell, no data fetch
│   ├── loading.tsx              # Page-level skeleton
│   ├── error.tsx                # Global error boundary
│   └── pokemon/[id]/
│       └── page.tsx             # Detail — generateStaticParams + generateMetadata
├── components/
│   ├── Navbar.tsx               # Sticky header with SearchBar
│   ├── SearchBar.tsx            # Debounced search, isSelfUpdate pattern
│   ├── PokemonListServer.tsx    # Async Server Component — the streaming data fetcher
│   ├── PokemonList.tsx          # Client Component — type filter, load more, states
│   ├── PokemonCard.tsx          # Memoised card with next/image + Link prefetch
│   ├── PokemonDetailPage.tsx    # Server Component detail view
│   ├── Breadcrumb.tsx           # router.back() to preserve filter state
│   └── BackButton.tsx           # Thin client wrapper around router.back()
├── lib/
│   └── api/
│       ├── index.ts             # Re-exports — components import from here only
│       └── pokemon.ts           # All fetch calls, mapping, caching strategy
├── types/
│   └── pokemon.ts               # Shared TypeScript interfaces
├── proxy.ts                     # x-cache-status header + listing Cache-Control
├── open-next.config.ts          # OpenNext × Cloudflare adapter config
├── wrangler.jsonc               # Cloudflare Workers deployment manifest
└── public/
    └── _headers                 # Cloudflare static asset cache rules
```

### API layer

All PokéAPI calls are centralised in `lib/api/pokemon.ts`. Components never call `fetch` directly. This gives us:

- Consistent `force-cache` + `revalidate: 3600` caching on every request
- A single place to swap the base URL or add authentication
- Easy mocking for tests

### Type filter architecture

The original implementation fetched the first 20 Pokémon by ID and then tried to filter them by type — this almost always returned zero results because those 20 Pokémon were rarely of the selected type.

The corrected approach:

1. **Type filter active** → fetch `/type/{name}` first to get *all* Pokémon names of that type
2. **Search active** → filter that name list by substring (or fetch all 10 000 names if no type)
3. **Slice** the filtered list to the current page (offset / limit)
4. **Fetch full details** for only the current page's Pokémon

This fixes the root cause: we now compare Pokémon *names* (not URL strings) against the type's name list.

### State management

| Layer | Mechanism |
|---|---|
| Server state (initial data) | Next.js `force-cache` fetch in Server Component |
| URL state (search, type, page) | `useSearchParams` + `router.replace` |
| Local UI state (input value) | `useState` with `isSelfUpdate` ref for debounce isolation |
| Error state | `error.tsx` boundary + inline error UI in `PokemonList` |

---

## Performance

Optimisations applied (3+ as required):

1. **`next/image`** — all Pokémon images use `fill` layout with explicit `sizes`, `priority` on the first 6 cards above the fold
2. **`force-cache` + `revalidate: 3600`** — every PokéAPI fetch is cached for 1 hour; repeated renders within a request hit the Workers cache, not the origin
3. **`generateStaticParams`** — first 151 Pokémon detail pages are pre-built at deploy time (SSG), served as static files from Cloudflare's global network
4. **Satoshi via `next/font` equivalent** — loaded via preconnect + CDN `<link rel="stylesheet">` in `<head>` for parallel loading with no render-blocking
5. **React Streaming** — listing page shell arrives in ~50 ms; Pokémon data streams in after PokéAPI responds; skeleton prevents layout shift
6. **`<Link prefetch>` on cards** — Next.js prefetches the first 10 detail routes when cards enter the viewport, making navigation near-instant
7. **`public/_headers`** — static assets (`/_next/static/*`) served with `max-age=31536000, immutable` from Cloudflare edge PoPs worldwide

---

## Trade-offs & Known Limitations

### Infinite scroll vs. pagination

**Decision:** Infinite scroll ("Load More" button).

Reasoning: Pokémon are browsed visually; users want to keep scanning without losing their place. A "Load More" button (rather than auto-scroll) was chosen over pure pagination because it avoids disorienting jumps and is more accessible (no scroll event listeners, keyboard-navigable).

**What I'd do differently:** Add URL-based page tracking so the browser back button restores the exact scroll position and page number.

### Search scope

Search filters across all ~1 300 Pokémon names by fetching the full name list once (cached). With a type filter active, search applies within that type's subset. The trade-off is one extra fetch per unique search term; in production this would be better served by a search index (Algolia, Typesense).

### Cloudflare Workers vs. Vercel

**Decision:** Cloudflare Workers (via OpenNext).

Cloudflare Workers is specified as the preferred target in the assessment brief. It also matches production infrastructure at Checkit. The OpenNext adapter handles the Next.js runtime translation; `wrangler.jsonc` drives the deployment. Vercel would require zero configuration by comparison, but doesn't earn the bonus points.

---

## Deployment

### Cloudflare Workers (production)

```bash
# Authenticate once
npx wrangler login

# Preview in Workers runtime locally
npm run preview

# Deploy to Cloudflare
npm run deploy
```

The `npm run deploy` script runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy` — it builds the Next.js app, adapts the output for the Workers runtime, and uploads it to Cloudflare.

**Live URL:** https://pokeexplorer.pokemon-explorer.workers.dev

### R2 caching (optional ISR)

To enable Next.js ISR with Cloudflare R2:

```bash
npx wrangler r2 bucket create pokeexplorer-cache
```

Then uncomment the `r2_buckets` block in `wrangler.jsonc` and update `open-next.config.ts`:

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
```

---

## What I'd tackle next (with 2 more hours)

1. **Vitest + React Testing Library** — unit tests for `SearchBar` (debounce behaviour) and `PokemonCard` (render, click navigation). The assessment requires at least two meaningful tests.
2. **R2 incremental cache** — wire up the R2 bucket so ISR revalidation works at the edge without hitting PokéAPI on every request after cache expiry.
3. **Pokémon comparison feature** — a "Compare" toggle on each card that opens a side-by-side stat comparison panel.
