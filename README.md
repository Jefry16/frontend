# Vointika Admin

Operator-facing admin SPA — React 19 · TanStack Start/Router · Tailwind 4 · shadcn/ui.

Greenfield rebuild in progress: the foundation is in place; feature modules are added one
at a time. See [`CLAUDE.md`](./CLAUDE.md) for the stack, conventions, and module rules.

## Getting started

```bash
pnpm install
pnpm paraglide:compile   # generate the i18n output (src/paraglide/)
pnpm dev                 # http://localhost:3000
```

Point the app at a running backend via `.env` (copy `.env.example`): `VITE_API_URL`.

## Quality gates

```bash
pnpm typecheck   # tsc --noEmit
pnpm check       # biome lint + format
pnpm depcheck    # module-boundary rules
pnpm test        # vitest
```
