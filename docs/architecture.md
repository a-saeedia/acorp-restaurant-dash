# Architecture

## The one rule

Everything — dashboard, tests, film — reads from **one deterministic simulation
engine** (`src/simulation`). Nothing in the UI invents a number. If a screen needs
a figure, it exists as a selector or it does not exist.

```
seed.ts ──► SimulationState ──► selectors.ts ──► dashboard screens
                 ▲                                └► video scenes
                 │
            engine.ts  (events → state fold)
```

## Time

- `DEMO_NOW_ISO = 2026-10-21T20:15:00+03:30` — a Wednesday evening mid-service.
- Asia/Tehran is a fixed +03:30 offset (Iran abolished DST in 2022), so day keys
  are pure arithmetic, not `Intl` lookups.
- History: 365 days of synthetic-but-seeded orders. Today: 96 orders plus one
  prepared sample order (`SAMPLE_ORDER_SEQUENCE = 1082`).
- The service day runs 11:00–23:00. `serviceDayProgress(clock)` returns 0…1 and
  is the only place that decides whether today counts as partially elapsed.

## The event model

`SimulationEvent` is the primitive. `applyEvent(state, event)` is pure and
idempotent: it checks `state.processed[event.id]` before mutating anything, which
makes replay, scrubbing and double-submits safe by construction.

An order produces eleven events:

| #   | Type                              | Effect                               |
| --- | --------------------------------- | ------------------------------------ |
| 1   | `ORDER_RECEIVED`                  | order enters state                   |
| 2   | `ORDER_CONFIRMED`                 | status → confirmed                   |
| 3   | `KITCHEN_NOTIFIED`                | ticket appears                       |
| 4   | `INVENTORY_DEDUCTED`              | recipe consumption applied           |
| 5   | `STOCK_THRESHOLD_CHECKED`         | flags crossing ingredients           |
| 6   | `PURCHASE_RECOMMENDATION_CREATED` | request drafted with quantity + cost |
| 7   | `ANALYTICS_UPDATED`               | revenue recognised                   |
| 8   | `ORDER_PREPARING`                 | status → preparing                   |
| 9   | `ORDER_READY`                     | status → ready                       |
| 10  | `ORDER_COMPLETED`                 | status → completed                   |
| 11  | `ANALYTICS_UPDATED`               | metrics refresh                      |

`deriveStateAt(state, events, atMs)` folds all events up to a timestamp.
`deriveStateAtFrame(..., frame, fps, originMs)` is the film's entry point: frame
in, state out, byte-identical on every run.

## Money and P&L

All currency is integer Toman. Never floats.

```
netSales        = grossSales − discounts − refunds
grossProfit     = netSales − cogs
netOperatingProfit = grossProfit − operatingExpenses − marketingSpend
```

Two decisions worth knowing:

1. **Opex is prorated.** Fixed monthly opex is 685,000,000 Toman
   (rent 165M, payroll 395M, utilities 78M, misc 47M; `OPEX_DAYS_PER_MONTH = 30`).
   A window that includes an unfinished day charges only the elapsed fraction:
   `opexDays = windowDays − (1 − dayProgress)`. Without this, every morning shows
   a catastrophic loss.
2. **Marketing is annualised for long windows.** Campaign spend only exists for
   2026-10-01…2026-10-21. For windows longer than 45 days, spend is scaled by the
   campaign/window overlap ratio so a yearly report does not claim 99M of ads
   against twelve months of revenue.

`isPartialDay` and `dayProgress` are exported on every snapshot so the UI can say
"so far today" instead of pretending the day is over.

## Inventory

- Each ingredient has `reorderThreshold` and `reorderQuantity`.
- Status: `healthy` above 100% of threshold, `low` below it, `critical` below 50%.
- The demo order is calibrated to push **beef** (4,050 → below 4,000g) and
  **cheese** (31 → below 30 slices) across their thresholds, so the purchase
  recommendation is a real consequence, not a prop.
- Purchase requests carry `recommendedQuantity`, `unitCost` and `estimatedCost`,
  computed at creation time. Approving a request is another event.

## Rendering the film

`src/video/timeline.ts` is the single source of timing. `Root.tsx` maps
`SCENES` to `<Sequence from durationInFrames>`; each scene reads local frames
only. Adding a scene means: write the component, register it, append one row.

Two constraints learned the hard way:

- Recharts measures the DOM. In video, use explicit width/height and
  `isAnimationActive={false}` — or draw SVG by hand (the Analytics scene does).
- Remotion's bundler treats `url('/fonts/…')` as a module import. The font CSS
  uses a relative path into `public/fonts`, which both Vite and Remotion resolve.

The soundtrack is generated, not sampled: `scripts/generate-audio.mjs` writes a
44.1kHz mono WAV of sine pads plus filtered-noise swells on scene cuts. No
licensing surface, no network.

## Adding a screen

1. Add a selector in `src/simulation/selectors.ts` (never compute in JSX).
2. Compose from `src/components`; add a primitive there if it repeats.
3. Style in `src/design/screens.css` using tokens — logical properties only.
4. Register the route in `src/dashboard/shell/Sidebar.tsx` and `App.tsx`.

## Adding an industry

The simulation is restaurant-shaped but not restaurant-locked. To retarget:
replace `catalog.ts` (items, recipes, ingredients, suppliers), keep `engine.ts`.
The event vocabulary (`ORDER_*`, `INVENTORY_*`, `PURCHASE_*`) already fits retail,
cafés and dark kitchens.
