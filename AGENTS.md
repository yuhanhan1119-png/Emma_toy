# Emma_toy — 可愛遊戲樂園 (Kawaii Game Land)

A small collection of Sanrio-style mini-games behind a game-selection menu:

1. 尋找可愛夥伴 (Kawaii Seek) — a "Where's Waldo"-style hidden-object game.
   15 levels, 3 minutes each, increasing difficulty.
2. 可愛賽車大賽 (Kawaii Racing) — 大耳狗 vs 布丁狗 top-down car race: steer to
   dodge obstacles (🚧), grab gifts (🎁) for a speed boost, beat the rival to 🏁.

## Tech stack

- Vite + React 18 + TypeScript (single-page app, no backend)
- All artwork is original SVG (no official Sanrio assets are used).

## Project layout

- `src/App.tsx` — top-level menu router (menu → seek | racing)
- `src/characters.tsx` — seek-game character roster + `CharacterArt` SVG renderer
- `src/levels.ts` — 15-level difficulty ramp (sprite count, size, targets, time)
- `src/scene.ts` — scatters sprites and places exact target counts per level
- `src/games/SeekGame.tsx` — hidden-object game state machine
- `src/games/RacingGame.tsx` — racing game (requestAnimationFrame loop in a ref)
- `src/games/RaceCar.tsx` — animated 大耳狗 / 布丁狗 race-car SVGs

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
- The racing game runs its simulation loop with `requestAnimationFrame`, keeping
  mutable state in a `useRef` (`RaceState`) and forcing re-render each frame via a
  `frame` counter. React StrictMode double-invokes effects in dev; the loop guards
  against this by cancelling the previous `rAF` in the effect cleanup. Tune pace via
  the `PLAYER_BASE` / rival-speed constants at the top of `src/games/RacingGame.tsx`.
