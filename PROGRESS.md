# Project Delta — Build Progress Log

A running record of work sessions. Each entry notes where the session **began** and **ended**.

---

## Session 6 — 2026-06-16

**Began:** Asked to improve layout/UI/design professionalism. Audited the live app
across Home, Analytics, and Tests in-browser.

**Done:**
- Found the biggest credibility problem: every subject metric rendered the SAME value
  (~12%). Root cause in `lib/store.ts` `seedProgress()` — the completed/partial calc keyed
  only off `video.number` and `chapter.number`, never the subject, so all six subjects
  computed identical completion. This polluted the Home Subject Progress rings, Analytics
  Subject Completion radial, and Subject Mastery bars.
- Rewrote `seedProgress()` with a per-subject `SUBJECT_TARGET` map (Physics 71% → English
  25%), completing earlier chapters/videos first and leaving a small in-progress frontier.
  Now the dashboard tells a believable learning story with distinct, descending values.
- Verified in-browser (after clearing persisted localStorage): rings show 72/55/48,
  radial shows nested arcs (72/55/48/40/33%), mastery bars graduate cleanly, and Total
  Study Hours reads a realistic 111h.

**Ended:** Subject analytics are coherent and product-grade across every surface.

---

## Session 5 — 2026-06-16

**Began:** App running cleanly. Reviewed the live app in-browser to find a meaningful
improvement.

**Done:**
- Found a data-integrity bug: `leaderboard` in `lib/mock-data.ts` assigned ranks by array
  index but generated scores with random noise, so standings weren't monotonic (e.g. rank
  #3 outscored rank #2). This surfaced on the Home Leaderboard Peek, Batch Rank widget, and
  the full Leaderboard page.
- Fixed at the source: sort the 1000 entries by score descending and reassign ranks before
  injecting "you" at slot 47. Now higher rank always means higher score everywhere.
- Fixed two follow-on display bugs exposed by real (sometimes negative) `change` values:
  - Home `WidgetLeaderPeek` always showed a green up-arrow; now renders a red down-arrow for
    negative weekly change (imported `ArrowDownRight`).
  - Leaderboard page "You" bar hardcoded `+{change}` in green; now direction-aware.
- Verified in-browser: Home widgets and Leaderboard page show strictly descending scores and
  correct trend direction/colors.

**Ended:** Leaderboard data and trend indicators are consistent across all surfaces.

**Next candidates:** Library video player modal states (theater/PiP), Live page
interactions, Tests attempt/auto-save flow.

---

## Session 4 — 2026-06-16

**Began:** App running cleanly. User requested an onboarding-style flow to create the
user profile (previously the profile was hardcoded as "Aryan Sharma" everywhere).

**Done:**
- Added a persisted `profile` slice to `lib/store.ts` (`name`, `location`, `bio`,
  `targetYear`, `batch`) with a `setProfile()` action; added to `partialize`.
- Rebuilt `onboarding.tsx` to a 4-step flow, inserting a "Create your profile" step
  (live-initials avatar, name + location fields, JEE target-year selector, optional bio)
  in the same glass-card style. Continue is disabled until a name is entered; Skip/Get
  started both commit sensible defaults.
- Wired profile data through the app: `profile.tsx` header, `widget-content.tsx` greeting,
  `top-nav.tsx` avatar, and `settings.tsx` account fields (now read + write the store).
- Verified end-to-end in browser: created "Riya Verma / Hyderabad" → greeting, nav avatar
  (RV), and profile page all reflect the new data; settings edits persist back.

**Ended:** Profile creation is fully functional and persisted. App runs error-free.

**Next candidates:** Library video player modal states (theater/PiP), Live page
interactions, Tests attempt/auto-save flow, optional avatar image upload.

---

## Earlier work (pre-session, from git history)

- `c5d0f18` Initial commit from v0 — app shell, store, mock data, most pages.
- `4471228` Added Achievements and Analytics pages with UI components.
- `7bbf0d0` Added README.md.
