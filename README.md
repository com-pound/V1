# Project Delta — Study Platform

A premium, fully customizable study dashboard for exam aspirants across **any** subject or goal — JEE, NEET, UPSC, GATE, CAT, board exams, language tests, or a completely custom target. Built with [Next.js](https://nextjs.org) and [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_QOdNbmKe1CLhVKtoxP3hdFP1vqy8)

## Overview

Project Delta is a single-page, tab-based study workspace. State is managed with a persisted Zustand store (`lib/store.ts`), so a user's profile, goals, widget layout, and customizations survive reloads. The app is **exam-agnostic**: nothing is hardcoded to a single exam — users define their own exam/goal during onboarding and personalize everything from there.

## Features

### Implemented

- **Exam-agnostic onboarding** — Users enter a custom exam/goal name (with examples like JEE, NEET, UPSC, CAT, GATE) and pick from presets (JEE, NEET, Boards, GATE/CS, Language/Aptitude, or fully Custom) that pre-fill relevant subjects. No exam is hardcoded.
- **Customizable dashboard (Home)** — Widget-based layout users can arrange to fit their workflow.
- **Playground** — A hidden page (not in the top nav) reachable only from **Settings → Open Playground**, where users add, drag, resize, snap, and arrange their own widgets and customizations.
- **Settings** — Editable profile (name, exam/goal, batch, location), daily study-hour goal, and an editable countdown **label + target date** that drives the countdown widget.
- **Personalized widgets** — Greeting, streak, and countdown widgets pull live values from the store rather than static text.
- **Pages** — Analytics, Achievements, Doubts, Library, Live sessions, Notes, Leaderboard, Profile, Syllabus tracker, and Tests.
- **Persistent state** — Profile, goals, countdown, notes, and widget layout are saved locally via the Zustand persist middleware.

### Recently changed (generalization from JEE-only)

- Replaced JEE-specific defaults, copy, and metadata with generic, exam-neutral wording.
- Added `examName` to the user profile and a `countdownLabel` + `setCountdown` action to the store.
- Onboarding rewritten with a custom exam name field and exam presets.
- Settings now edits exam name and the countdown label/date; removed the hardcoded email.
- Syllabus, live chat, leaderboard, and layout metadata copy generalized.

### Missing / not yet implemented

- **Authentication & accounts** — No real auth or user accounts; profile data is local only (no Neon/Better Auth, no Supabase). Multi-device sync is not available.
- **Backend persistence** — All data lives in browser storage (Zustand persist). No database, so data is per-browser and not shareable.
- **Real content per exam** — Subjects are pre-filled by preset, but chapters, syllabus data, question banks, and tests are still mock/sample data rather than real per-exam content.
- **Functional leaderboard / live sessions** — These use mock data; there is no real-time backend, scoring, or video streaming.
- **Doubts / community features** — UI only; no backend to post, answer, or store doubts.
- **Notifications** — Settings toggles exist but are not wired to a delivery system.
- **Mobile-specific polish** — Layout is responsive but the drag/resize Playground is optimized for larger screens.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` — Next.js App Router entry (`layout.tsx`, `page.tsx`) and global styles.
- `components/delta/` — App shell, top nav, onboarding, spotlight, and shared UI.
- `components/delta/pages/` — Individual feature pages (home, settings, playground, analytics, etc.).
- `lib/store.ts` — Persisted Zustand store (profile, goals, countdown, widgets, layout).
- `lib/mock-data.ts` — Sample data used across pages until a backend is added.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
