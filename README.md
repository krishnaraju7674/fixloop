# FixLoop — Close the civic loop

**Live URL:** https://fixloop.vercel.app _(update after first deploy)_
**Author:** G Krishnam Raju · gkr.7674@gmail.com

A one-page funding pitch for **FixLoop** — a civic issue tracker that closes the loop in public: photo in → auto-routed to the owning department → fix verified by geo-tagged photo → citizen signs off → published to an open ledger.

---

## The two lines

**Who my decision-maker is:** a municipal commissioner / smart-city grant reviewer — someone who controls pilot budgets, answers for unresolved complaints in public, and needs both social impact and a believable operating model before releasing money.

**The single choice I made to persuade them:** I made the resolution evidence the hero, not the features. Instead of describing what the app does, the page lets the reviewer *play the citizen* — file a complaint, watch it route, and personally sign off the fix in an interactive 30-second demo — then shows the public ledger every closed ticket publishes to. The page argues in evidence, not adjectives.

---

## What I built

One page, one idea: **FixLoop**, a civic issue tracker whose product is the *closing* of complaints, not their collection. The page follows a 30-second-proof hierarchy:

1. **Hero** — the problem in one line (collection works, closure doesn't) with a hard stat.
2. **Cost of inaction** — three sourced count-up stats (9,438 pothole-accident deaths 2020–24 tabled in Parliament; 12,00,000+ complaints logged by one corporation in six years; 60+ day backlogs).
3. **Try it — 30 seconds** — a working, interactive slice of the loop: pick an issue → watch it classify and route with an SLA → receive the geo-tagged fix photo → sign off (or reopen) → see it published. Reopen and sign-off paths are both real.
4. **The solution** — the four-step loop with an animated spotlight sequence, a phone mockup of the citizen's one-screen experience, and a filterable live resolution ledger (All / Closed / Open).
5. **Why now** — money already moving (smart-city spend), stakes rising (deaths tabled in Parliament), tech commoditized (2026 pricing).
6. **FAQ** — the four objections every budget-holder raises, answered in place (vs. existing portal, cost, fake reports, data ownership).
7. **Why me / The ask** — a 90-day single-ward pilot judged on one number (median time-to-fix) and one threshold (80% citizen-verified closures), with the downside stated honestly.

**Stack:** Vite + React 18 + TypeScript (strict) + Tailwind CSS + Framer Motion. Hand-coded, mobile-first, ~92 KB gzipped, no backend — the demo and ledger are authored product states, clearly labeled as a demo.

## Key decisions and why

- **Interactive demo over feature list.** Skeptics don't believe descriptions; they believe a thing they just used. The demo is the "make the case, don't describe it" requirement turned into UI, and it doubles as the walkthrough's centerpiece.
- **Motion budget spent in exactly three places.** The hero text stages in once; the flow steps spotlight in sequence to walk the eye through the loop; the demo's transitions show state changes a citizen would feel. Everything else is `whileInView` reveals — no parallax, no loops for decoration. All motion honors `prefers-reduced-motion` (reduced users skip straight to the demo's decision point).
- **A ledger with a filter, not a screenshot.** An interactive All/Closed/Open ledger looks like a real operating model, which is what a grant reviewer is actually buying.
- **The ask is falsifiable.** One ward, 90 days, one metric, one threshold, published dataset on failure. Reviewers fund pilots that can end cleanly.
- **Numbers with sources on the page.** Every stat carries where it came from; nothing on the page is invented.

## AI failure story

**What AI gave me:** I used AI code assistance to build the interactive resolution ledger's filter. It generated clean-looking filter chips (`all` / `closed` / `open`) and a filter function comparing them against the ticket data — which used capitalized statuses (`"Closed"` / `"Open"`). Strict TypeScript passed, the build passed, and the UI looked perfect.

**How I caught it:** When I clicked through the deployed preview like a user, tapping **Closed** and **Open** emptied the ledger — zero rows rendered for filters that visibly had matching tickets.

**What I changed:** The bug was a case mismatch between UI state and data (`filter === "closed"` vs `r.status === "Closed"`). I fixed the comparison to be case-insensitive (`r.status.toLowerCase() === filter`) and, more importantly, added a click-through-verification pass to my workflow: every interactive element now gets exercised in the running app before I call it done. A build passing is not the same as a feature working — that distinction cost me one real bug here and would have cost me credibility in front of a reviewer.

A second, smaller case: an early full-page screenshot tool returned an image that looked like the entire hero was duplicated dozens of times down the page. It was convincing enough to send me bug-hunting — until I checked the actual DOM (one `<h1>`, six sections, correct order) and realized the capture tool stitches the page while entrance animations replay. Trusting state over visuals saved a pointless "fix."

---

## Run it

```bash
npm install
npm run dev      # local dev
npm run build    # typecheck + production build to dist/
```
