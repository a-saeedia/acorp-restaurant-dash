# Contributing

Small project, short rules.

## Setup

```bash
pnpm install
pnpm dev
```

Node 22+, pnpm 10+.

## Before you open a PR

```bash
pnpm verify   # typecheck + eslint + vitest + prettier --check
pnpm build    # must produce dist/ without type errors
```

If you touched `src/video`, also render stills:

```bash
pnpm video:stills
```

## Conventions

- **TypeScript strict** with `noUncheckedIndexedAccess`. No `any`, no `as` casts
  to silence the compiler.
- **Money is integer Toman.** Do not introduce floats into currency paths.
- **No hardcoded UI numbers.** Derive from `src/simulation/selectors.ts`.
- **Persian first.** User-facing copy is Persian; code and comments are English.
  Use logical CSS properties (`margin-inline`, `inset-inline`) so a future LTR
  locale is a `dir` change, not a rewrite.
- **Design tokens, not hex codes** in components.
- Commit messages: imperative mood, one logical change per commit.

## Adding a scene (video)

1. Create `src/video/scenes/YourScene.tsx` — a component that uses
   `useCurrentFrame()` only (no timers, no `Date.now()`).
2. Register it in `src/video/Root.tsx`.
3. Add timing + label to `SCENES` in `src/video/timeline.ts`.
4. Add copy to `SCRIPT` in `src/video/script.ts`.
5. `pnpm video:stills` and inspect at least one frame.

## Licensing

By contributing you agree your work is licensed under MIT. Note that
`src/video` depends on Remotion, which is **not** OSI open source — see
`LICENSE` for the exact terms.
