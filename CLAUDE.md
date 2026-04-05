@AGENTS.md

# NativeSeed

## What This Is
A location-intelligent native plant advisor and seed ordering assistant
for US gardeners. Users enter a zip code or address; the app pulls real
soil composition, climate zone, and climate change projection data for
that exact location, then uses AI to generate a personalized native plant
garden plan across four categories: vegetables, herbs, flowers/decorative
grass, and bushes and trees.

All flower recommendations are pollinator-friendly and always optimized
for honey bees.

After the user confirms their plan, the app uses browser automation to
find seed suppliers that ship to their zip code, match confirmed plants
to available products, and fill shopping carts within the user's specified
budget. The user reviews and presses Pay.

Each recommended plant includes a full botanical profile: conservation
status and rarity, what makes it ecologically unique, edible and medicinal
uses, recipes, and photos.

**Status:** Prototype / MVP — US only. Monetization model TBD.

## Core User Journey
1. Enter zip code or address
2. Receive soil + climate report for that location
3. Receive native plant recommendations across 4 categories
4. Tap any plant to explore its full profile (conservation, edible,
   medicinal, recipes, photos)
5. Review visual garden design + planting instructions
6. Confirm plant selection + set budget
7. App fills seed supplier carts → user presses Pay

---

## Tech Stack

### Frontend
- **Next.js 14 (App Router)** — SSR for data-heavy location pages, good SEO
- **TypeScript** — required throughout; no plain JS files
- **Tailwind CSS** — utility-first styling; no CSS modules or styled-components

### AI Layer
- **Claude API** (`claude-sonnet-4-6`) — generates all plant recommendations,
  garden design combinations, planting instructions, medicinal uses, and recipes
- **Anthropic SDK** (`@anthropic-ai/sdk`) — do not use OpenAI or other AI SDKs

### External Data APIs
- **Census Geocoder** — zip/address → lat/lng (free, no key required)
- **USDA Plant Hardiness Zone API** — climate zone from coordinates
- **USDA Web Soil Survey (WSS)** — soil composition, pH, texture by location
- **NOAA Climate Data Online API** — historical weather + climate projections
- **USDA PLANTS Database** — native plant records by state/region
- **NatureServe API** — conservation status + rarity ranking (G1–G5 scale)
- **IUCN Red List API** — endangered/threatened/extinct classification
- **iNaturalist API** — plant photos + community observation data
- **Trefle API** — edible properties and plant characteristics
- **Wikimedia Commons API** — fallback image source (attribution required)
- **PFAF (Plants For A Future)** — medicinal uses via Playwright scraping;
  use only when Claude API knowledge is insufficient

### Browser Automation (Ordering Layer)
- **Playwright** — fills shopping carts on seed supplier websites
- Runs server-side only; never imported by or exposed to client code

### Data / Persistence
- **PostgreSQL + Prisma** — caches API responses (soil/climate data per zip
  with 30-day TTL), stores user garden plans
- Cache all USDA/NOAA responses — never re-fetch on every request

---

## Dev Commands

```bash
npm run dev          # Start local dev server (http://localhost:3000)
npm run build        # Production build — run before any deployment
npm run start        # Start production server locally
npm run lint         # ESLint check — fix errors before committing
npm run type-check   # TypeScript check without building (faster)

# Database
npx prisma migrate dev    # Apply schema changes in development
npx prisma migrate deploy # Apply schema changes in production
npx prisma studio         # Open DB GUI at http://localhost:5555
npx prisma generate       # Regenerate client after schema edits

# Browser automation
npx playwright install    # Install browser binaries (run once after clone)

# Environment
cp .env.example .env.local  # Set up local env vars (do this first on clone)
```

**Never run `prisma migrate deploy` in development — use `migrate dev`.**
**Never commit `.env.local` or any file containing API keys.**

---

## Project Structure

```
nativeseed/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing / location input
│   ├── garden/
│   │   └── [zipCode]/
│   │       ├── report/page.tsx   # Soil + climate report
│   │       ├── plan/page.tsx     # Plant recommendations + garden design
│   │       │   └── [plantId]/
│   │       │       └── page.tsx  # Plant deep-dive profile
│   │       └── order/page.tsx    # Seed order builder + cart filling
│   ├── api/
│   │   ├── location/route.ts     # Geocode zip → lat/lng + hardiness zone
│   │   ├── soil/route.ts         # USDA Web Soil Survey
│   │   ├── climate/route.ts      # NOAA climate + projections
│   │   ├── recommend/route.ts    # Claude API — plant recommendations
│   │   ├── plant/[id]/route.ts   # Plant profile (conservation, edible,
│   │   │                         # medicinal, photos, recipes)
│   │   └── order/route.ts        # Playwright — fill supplier carts
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # Generic: Button, Card, Input, Badge
│   ├── garden/                   # Domain: PlantCard, SoilReport,
│   │   │                         # GardenDesign, ConservationBadge,
│   │   │                         # PlantProfile, RecipeCard
│   └── layout/                   # Header, Footer, Nav
│
├── lib/                          # All logic — no UI, no React
│   ├── apis/                     # External API clients (one file per source)
│   │   ├── census.ts             # Zip/address → lat/lng
│   │   ├── usda-soil.ts          # Soil composition + pH
│   │   ├── usda-plants.ts        # Native plant records by region
│   │   ├── noaa.ts               # Historical weather + climate projections
│   │   ├── hardiness.ts          # USDA Plant Hardiness Zone
│   │   ├── natureserve.ts        # Conservation status + rarity (G1–G5)
│   │   ├── iucn.ts               # Endangered/threatened classification
│   │   ├── inaturalist.ts        # Plant photos + observations
│   │   ├── trefle.ts             # Edible properties
│   │   └── wikimedia.ts          # Fallback images (with attribution)
│   ├── ai/
│   │   ├── recommend.ts          # Builds prompts + calls Claude API
│   │   └── prompts/              # Prompt templates
│   │       ├── plants.ts         # Plant recommendation prompt
│   │       ├── garden-design.ts  # Visual combination + planting guide
│   │       ├── medicinal.ts      # Medicinal uses for a given plant
│   │       └── recipes.ts        # Recipes using this plant
│   ├── automation/               # Playwright only — server-side only
│   │   ├── cart-filler.ts        # Orchestrator: finds suppliers, fills carts
│   │   └── suppliers/            # One file per supplier site
│   │       ├── american-meadows.ts
│   │       └── prairie-moon.ts
│   └── utils/                    # Shared helpers (formatting, validation)
│
├── types/                        # TypeScript interfaces — no logic
│   ├── location.ts               # ZipLocation, HardinessZone, SoilProfile
│   ├── plants.ts                 # Plant, PlantCategory, GardenPlan
│   ├── plant-profile.ts          # ConservationStatus, MedicinalUse,
│   │                             # Recipe, PlantPhoto
│   └── order.ts                  # SeedOrder, Supplier, CartItem
│
├── prisma/
│   └── schema.prisma             # DB schema — source of truth for data models
│
└── .env.example                  # All required env vars listed (no values)
```

**Rules:**
- All external API calls live in `lib/apis/` — never inline in components or routes
- All Playwright code lives in `lib/automation/` — never imported by client code
- All TypeScript types live in `types/` — shared across the whole app
- `components/ui/` is generic only — no domain knowledge (plants, soil, orders)

---

## Conventions

### TypeScript
- Strict mode is on — no `any`, no `@ts-ignore`
- All functions must have explicit return types
- Use `interface` for object shapes, `type` for unions and aliases
- All shared types live in `types/` — never define types inline in components

### Naming
- **Files:** kebab-case — `soil-report.tsx`, `usda-plants.ts`
- **Components:** PascalCase — `PlantCard`, `SoilReport`, `GardenDesign`
- **Functions/variables:** camelCase — `fetchSoilData`, `hardinessZone`
- **Constants:** SCREAMING_SNAKE_CASE — `MAX_PLANT_RECOMMENDATIONS`
- **API routes:** kebab-case folders — `app/api/usda-soil/route.ts`

### Components
- Functional components only — no class components
- Server Components by default; add `'use client'` only when required
  (event handlers, hooks, browser APIs)
- Props interface named `[ComponentName]Props` and defined above the component
- One component per file; file name matches component name

### Data Fetching
- All external API calls go through `lib/apis/` — never fetch directly
  in a component or route handler
- Always handle loading and error states explicitly
- Cache API responses in PostgreSQL — never call USDA/NOAA on every request
- Use `async/await` — never `.then()` chains

### Styling
- Tailwind only — no inline styles, no CSS modules, no styled-components
- Use `cn()` utility for conditional class merging
- Mobile-first responsive design on all components
- Earth tones and natural palette — the design should feel like the outdoors

### Claude API Prompts
- All prompts live in `lib/ai/prompts/` as named template functions
- Prompts must include location context (zone, soil, climate) when relevant
- Always specify output format (JSON schema) in the prompt — never parse
  free-form text responses
- Model: `claude-sonnet-4-6` unless a task explicitly needs more reasoning power

---

## Guardrails

### Never do these — no exceptions

**Ordering**
- Never auto-submit or auto-pay any order — the user always presses Pay
- Never store payment information of any kind
- Never select a supplier without verifying it ships to the user's zip code

**Plant Recommendations**
- Never recommend non-native plants — every recommendation must be native
  to the user's specific region, verified against USDA PLANTS data
- Never recommend a plant outside the user's USDA hardiness zone
- Never mix categories — vegetables, herbs, flowers/decorative grass, and
  bushes and trees are always presented as separate sections
- Never recommend plants with known toxic parts (to humans or pets) without
  a clearly visible warning alongside the recommendation

**Data Integrity**
- Never fabricate soil, climate, or conservation data — all must come
  from real API responses
- Never make conservation status claims (rare, endangered, extinct) without
  citing NatureServe or IUCN as the source
- Never cache user location data beyond the active session without
  explicit user consent

**Medical / Edible Content**
- Never present medicinal uses as medical advice — always include:
  "This is for informational purposes only. Consult a healthcare
  professional before using any plant medicinally."
- Never include recipes using plant parts that are toxic or not confirmed
  edible by Trefle or Claude's verified knowledge

**Technical**
- Never import Playwright in any client-side file
- Never call external APIs directly from components — always via `lib/apis/`
- Never use a different AI provider — Claude API only
- Never commit `.env.local` or any file containing real API keys
- Never use `any` type to silence a TypeScript error — fix the type
