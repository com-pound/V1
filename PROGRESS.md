# Project Delta — Build Progress Log

A running record of work sessions. Each entry notes where the session **began** and **ended**.

---

## Session 3 — 2026-06-16

**Began:** Inherited a substantially complete build (12 pages, Zustand store, widget
dashboard, video player, charts). App was crashing on load with an infinite render loop.

**Done:**
- Diagnosed root cause: `useStore((s) => s.subjectProgress())` and
  `useStore((s) => s.totalHours())` returned a fresh object/value on every render, so
  Zustand saw a new snapshot each time → "Maximum update depth exceeded" crash on Home.
- Added memoized derived hooks `useSubjectProgress()` and `useTotalHours()` in `lib/store.ts`
  that subscribe to the stable `videoProgress` slice and recompute via `useMemo`.
- Updated call sites: `widget-content.tsx`, `analytics.tsx`, `profile.tsx`.
- Verified in-browser: Home, Analytics, and Tests render cleanly with no error overlay.

**Ended:** App loads and runs without errors. Home dashboard, Analytics charts, and Tests
center all confirmed working. Syllabus & Doubts pages remain reachable via Cmd+K spotlight
(consistent with the 10-item top nav in the spec).

**Next candidates:** Full click-through of Library video player modal states (theater/PiP),
Live page interactions, and Tests attempt/auto-save flow.

---

## Earlier work (pre-session, from git history)

- `c5d0f18` Initial commit from v0 — app shell, store, mock data, most pages.
- `4471228` Added Achievements and Analytics pages with UI components.
- `7bbf0d0` Added README.md.
