# Market Intelligence and GTM workbench

## Implementation contract

This checkpoint expands a case from product validation into segment research, competitive positioning and a measurable route to market. It uses user-recorded observations and explicit planning assumptions; it does not activate Manus or claim syndicated market coverage. Primary workflow references: [Semrush market overview](https://www.semrush.com/kb/1512-traffic-and-market-market-overview), [Similarweb audience analysis](https://support.similarweb.com/hc/en-us/articles/360018928698-Analyze-Audience-Overlap). Their licensed datasets are not reproduced or connected.

Two first-class case sections share one saved workspace: Market Intelligence and GTM Strategy. Save/CAS/owner checks, draft backup and discard remain common. A bounded optional strategy contract preserves existing cases. Referenced sources must exist in the case. Deleting linked entities requires unlinking first. Strategy changes invalidate earlier business-plan reviews and are retained in written plan snapshots.

## Technical design and visualization inventory

React owns state, SVG structure, accessible controls and geometry; no new renderer dependency is required for these small deterministic charts. The module is lazy loaded and supports at most 8 segments, 12 competitors, 12 monthly signals, 8 channels and 12 launch plays. At most five chart instances coexist per active section, with fewer than 250 SVG marks. Only the active section renders. ResizeObserver recomputes chart geometry in actual CSS pixels; mobile reduces ticks/annotation density instead of shrinking a desktop figure. No animation or background fetch is needed.

Saved business data lives in the owner-scoped workspace, not localStorage. Case section is URL-backed (`view=intelligence|gtm|launch`); chart selections and sensitivity controls are ephemeral and reset safely when an entity disappears. Form drafts survive section switches and rejected saves. Export uses the saved strategy and its revision; HTML includes vector figures and equivalent tables, XLSX retains input and calculated rows. Exports are private and do not unlock paid research.

| Layer / analytical job | Encoding and interaction | Primary specialist / local fresh pass | Fallback and QA |
|---|---|---|---|
| Segment priority / comparison | Fixed-size labeled points, user-assessed accessibility vs urgency (1–5); select point or HTML row for ICP detail | SVG + uncertainty, local pass | Explicit missing ratings, no invented composite score or bubble market size; keyboard selection and data table |
| Competitive value map / relationship | Per-unit price in case currency vs user-assessed job fit (1–5); selected alternative detail | SVG + uncertainty, local pass | All alternatives remain in table; unknown prices/ratings excluded from plot; no currency mixing or inferred market share |
| Monthly market signal / time change | One metric/unit/definition, monthly points with gaps retained; source inspection per point | SVG + uncertainty, local pass | No interpolation, forecast or implied confidence; table includes missing months and source IDs |
| Acquisition funnel and channel return / modeled flow and comparison | One channel's visits → leads → customers; side-by-side contribution bars, spend and CAC labels; 0.7×/1×/1.3× rate sensitivity | SVG + React, local pass | Floor cohort counts, cap rates at 100%, zero customers yields undefined CAC, unknowns remain unknown; channels are independent scenarios, not deduplicated demand |
| Route to market and 13-week rollout / linkage and schedule | Selected ICP → positioning promise → channel → named launch plays; explicit start/end week bars and owner/gate detail | React/SVG, local pass | Schematic links do not certify causality or dependencies; mobile stacks route steps and uses a table for timeline lookup |

Color roles: navy/gray for context and axes, blue for selected segment/alternative, teal for modeled contribution/activation, amber for assumptions/gaps, rust for negative modeled contribution. Labels, selection outlines and signs carry meaning independently of color. Essential values are visible without hover. Every chart has a text description and tabular equivalent. Numeric limits and invalid/missing input states are enforced before calculations.

## Scope and acceptance

Segments retain ICP, problem/job, trigger, alternatives, population/spend assumptions, urgency/accessibility ratings and source links. Alternatives retain configuration, price, fit, strengths/gaps and source links. Signals retain one definition and monthly observations with source links. Positioning retains segment, category, promise, difference, proof and objection. Channel scenarios retain budget, click cost, two conversion rates, revenue and pre-acquisition contribution per customer. Rollout retains owner, week range, channel and decision gate.

Acceptance requires deterministic calculation tests, strict cross-reference validation, save/reload and stale-write regression, export parity, desktop/mobile browser checks, empty/private case and illustrative sample behavior, and actual CI/deployment verification. No factual market finding, market share, audience overlap, supplier verification or AI confidence is synthesized from planning inputs.

Local acceptance: seven strategy/domain/export regressions pass, alongside the existing suite (46 tests total) and three HTTP regressions. A real browser case was created empty, given an ICP and a channel model, saved, reloaded directly into the URL-selected GTM section and compared against its exported brief. The independent example budget 400 / cost-per-visit 1 / lead rate 10% / win rate 20% produces 400 visits, 40 leads, eight customers, CAC 50 and contribution −240 when pre-acquisition contribution is 20 per customer. The public illustrative example also exercises conservative conversion, channel selection and map selection.

Mobile charts were inspected at 390×844 (375px document content width with the browser's scrollbar); page scrollWidth equaled clientWidth. Label geometry recomputes at actual container width, point controls have a 44px target, and chart numbers remain visible without hover. Local console warnings/errors were empty. Screenshots are retained under `.artifacts/strategy-v3/`. Final CI, deployment readiness and live persistence are release-specific checks, not inferred from this local record.

The private browser case was extended with a linked validation play in weeks 3–5, owner, decision gate and explicit first-order revenue horizon. The workbook downloaded through the actual browser route was read back: saved revision 2, eight modeled customers, contribution −240 and the 3–5 week range matched the UI. This workbook is a user-authored planning artifact, not an AI research result.
