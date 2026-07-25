# Emma_toy — 尋找可愛夥伴 (Kawaii Seek)

A "Where's Waldo"-style hidden-object game where you search a crowded scene for
Sanrio-style kawaii characters. 15 levels, 3 minutes each, increasing difficulty.

## Tech stack

- Vite + React 18 + TypeScript (single-page app, no backend)
- All characters are original SVG art drawn in `src/characters.tsx` (no official
  Sanrio assets are used).

## Project layout

- `src/characters.tsx` — character roster + `CharacterArt` SVG renderer
- `src/levels.ts` — 15-level difficulty ramp (sprite count, size, targets, time)
- `src/scene.ts` — scatters sprites and places exact target counts per level
- `src/App.tsx` — game state machine (start → playing → levelComplete/timeUp → win)

## Commands

- Dev server: `npm run dev` (Vite on port 5173, `host: true`)
- Lint: `npm run lint`
- Type-check + production build: `npm run build`
- Preview production build: `npm run preview`

## Cursor Cloud specific instructions

- Dependencies are plain npm; the startup update script runs `npm install` only.
- There is no backend, database, or env vars — `npm run dev` is fully self-contained.
- `npm run lint` reports one non-blocking `react-refresh/only-export-components`
  warning in `src/characters.tsx` (it exports both components and constants). This
  is expected and does not fail lint.
- Target counts per level are exact: distractor sprites are drawn only from
  characters that are NOT targets (see `src/scene.ts`), so "find N of X" is always
  satisfiable and unambiguous. Keep that invariant if editing scene generation.
