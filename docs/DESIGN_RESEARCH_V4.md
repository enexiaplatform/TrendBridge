# TrendBridge — design research and redesign brief

Research date: 30 October 2026. Scope: public sample → Market Intelligence → segment editing → GTM channel analysis. Current live product: https://trend-bridge.vercel.app/reports/sample?view=intelligence.

## Verdict

TrendBridge has accumulated useful functionality without a sufficiently coherent working surface. The current layout reads as a long document with forms attached. An analyst needs to compare evidence, select a segment, inspect assumptions and change a scenario while keeping the analysis visible. Those tasks should share a stable screen.

The largest confirmed issue is spatial hierarchy: at a 1280 × 720 desktop viewport, the first analytical plot begins at approximately y=707. Opening the segment editor adds an approximately 781px-high form. More gradients or additional chart types will not solve either problem.

## Current product: captured flow

These screenshots were captured and visually inspected during this research run. They use public illustrative data, not a customer's private case. Image files are in the local, ignored `.artifacts/design-research-v4` folder.

### 1. Enter Market Intelligence — needs structural redesign

![Current Market Intelligence entry](../.artifacts/design-research-v4/01-trendbridge-entry.png)

- Strength: case identity, market, channel and currency are explicit; sample and evidence limitations are disclosed.
- P1: global header, case header, seven-section navigation, saving controls, introduction, status, warning and inventory precede the analysis. The plot starts around y=707 in a 720px viewport.
- P2: too many bold headings compete. The logo and navigation consume space better used for working data inside a case.
- Recommendation: one compact case toolbar, one scope/filter row, then the analytical canvas. Keep a visible provenance status; put the full methodological explanation behind a clearly labelled disclosure.

### 2. Open segment editing — needs interaction redesign

![Current inline segment editor](../.artifacts/design-research-v4/02-trendbridge-inline-editor.png)

- Strength: the user can edit structured buyer context and evidence instead of receiving an opaque narrative.
- P1: the open editor is approximately 781px high, exceeding the viewport. Editing requires moving away from the comparison plot and navigating a long page.
- P2: equally large textareas flatten the distinction between a short name, a buying trigger and a detailed hypothesis.
- Recommendation: a resizable right inspector on desktop, with its own scrolling and grouped fields. Show the selected segment in the plot/table throughout editing. Use a full-screen editing sheet on narrow screens. Make save, unsaved and failure states explicit.

### 3. Inspect GTM channel economics — useful calculations, weak composition

![Current GTM analysis](../.artifacts/design-research-v4/03-trendbridge-gtm.png)

- Strength: exact modeled values, a readable negative contribution, a visible funnel and explicit scenario assumptions.
- P1: channel selection and scenario controls sit at opposite ends; edits expand below the plots. There is no stable shared analytical context when moving through the page.
- P2: sparse chart areas consume large heights. The funnel shows volumes but leaves the user to calculate the transition rates. Labels alternate exact currency and abbreviated numbers without a discoverable formatting convention.
- Recommendation: put channel, scenario and period together; show stage conversion rates alongside volumes; place the comparison table next to the selected channel details. Use exact values in accessible details/tooltips and a consistent abbreviated axis convention. Derive any decision note from actual calculations, and label it as a model implication.

Accessibility risks: small secondary labels and pale control/selected-state treatments warrant contrast and focus testing. Color must not be the sole carrier of positive/negative outcomes or selection. Screenshots do not establish WCAG compliance. Keyboard order, screen reader announcements, zoom, mobile and authenticated save/error flows were not audited in this run.

## What to learn from current products

This is a selection of relevant benchmarks, not a claim that these are objectively the newest or best apps. Public official pages and documentation were reviewed. Competitor authenticated workflows were not tested.

| Product and primary source | Evidence reviewed | Useful pattern | Apply to TrendBridge |
| --- | --- | --- | --- |
| [Linear Dashboards](https://linear.app/docs/dashboards) | Official documentation and an inspected static workspace screenshot | Compact shell; charts, tables and metrics; clicking an insight opens its underlying records | Stable navigation and a short path from summary to supporting evidence |
| [Hex Data Apps](https://hex.tech/product/data-apps/) and [Explore](https://learn.hex.tech/docs/share-insights/explore) | Current product page, official docs and inspected chart toolbar screenshot | Interactive analysis and exploration from a published chart | Chart → filtered rows → source detail, with shared scope visible |
| [Attio record preview](https://attio.com/help/reference/managing-your-data/records/create-and-view-records) | Official documentation; no hands-on logged-in test | Right-side record preview beside the existing table; highlighted selection and adjustable panel | Replace long inline segment/channel editors with contextual inspectors |
| [Clay Use AI](https://university.clay.com/docs/use-ai-integration-overview) and [table versions](https://university.clay.com/docs/table-versions) | Official documentation; no authenticated workflow test | Structured table operations, explicit configuration and execution settings | Make research inputs, outputs and review status inspectable as records |
| [Semrush Market Overview](https://www.semrush.com/kb/1512-traffic-and-market-market-overview) | Official current market-analysis documentation | Market scope, competitor context and comparative views | Define geography, time window, comparison set and metric before showing a market claim |

Clay's documented table versions restore configuration, not historical cell values. This is not evidence for a full data-history feature. Hex's current Data Apps page also advertises generative apps in beta; example images are not proof of a production workflow or quality guarantee.

Linear visual reference — official static image, not an interactive test:

![Linear compact workspace reference](../.artifacts/design-research-v4/ref-linear-workspace.png)

Hex visual reference — a cropped official documentation illustration of chart exploration controls, not a complete app layout:

![Hex chart exploration reference](../.artifacts/design-research-v4/ref-hex-explore.png)

The dark, perspective Linear hero image was rejected as a UI reference because it does not show a sufficiently readable working interface. Marketing polish should not substitute for product-screen evidence.

## Proposed visual direction

An analysis workspace for global founders, researchers and growth teams. A user should understand: What market am I inspecting? What is known? What is assumed? What decision can I make next?

Desktop composition:

1. Compact global navigation, with a small logo and a clear way back to the case library.
2. Case toolbar: case name, research state, saving state and the one primary action appropriate to the current task.
3. Scope row: market, period, currency and relevant channel/scenario. Separate global filters from chart-only filters.
4. Main area: the primary comparison chart and linked data table. Keep a selected object stable across both.
5. Optional right inspector: summary, assumptions, sources and edit controls. Opening it must not push the primary analysis down the document.

Keep Market Intelligence and GTM distinct but connected. Selecting a priority segment should provide an explicit action to use that segment in the GTM plan. Market data and modeled channel economics must retain different truth labels.

Report reading should remain a separate presentation mode with readable narrative and export structure. The analysis workspace should optimize comparison and editing; it should not inherit report-page spacing.

## Proposed design-system rules

These are starting specifications to validate in visual prototypes, not measurements copied from competitors.

| Area | Proposed rule |
| --- | --- |
| Brand | Preserve the supplied logo. Use its navy, blue and teal selectively for identity, primary actions and focus. Keep most working surfaces neutral. |
| Surfaces | Off-white canvas, white panels, subtle neutral dividers; avoid nested cards around every heading. |
| Typography | Case title 22–24px; section labels 14–16px; controls/body 13–14px where readable; tabular numerals for metrics. Validate zoom and mobile legibility. |
| Spacing | Consistent 4px base scale. Spend space on comparisons and readable rows, reduce repeated introductory gaps. |
| Density | Desktop data rows approximately 36–40px; mobile targets at least 44px. Offer wrapping/details for long labels rather than silent truncation. |
| Inspector | Approximately 320–360px at suitable desktop widths; drawer when space is constrained; full-screen sheet on mobile. |
| Charts | Consistent axes, units, scales, palettes and hover/focus states. Visible selection must match table and inspector. |
| Semantics | Teal/blue for identity and selected data; positive/negative/warning colors reserved for meaning. Pair color with text or shape. |
| Provenance | Clearly distinguish illustrative, user-supplied, sourced, modeled and reviewed information. Show source date and inspectable calculation where available. |
| Motion | Brief transitions to explain selection or panel changes; respect reduced motion. No decorative animation during analysis. |
| Global readiness | English-first content structure; support translated labels, long names, locale-aware dates and numbers, explicit currencies and time zones. |

## Visualization priorities

- Segment selection: linked comparison table and priority plot. Ratings are assessed scores; point area must not imply unsupported market size.
- Competition: comparable price/unit and buyer/job fit; disclose missing or incomparable observations.
- Market signals: dated series with missing intervals preserved; never interpolate unknown values silently.
- Channel economics: funnel volumes plus transition rates, contribution comparison with a visible zero baseline, and a scenario table.
- GTM execution: compact timeline with milestones, dependencies and owner/status details when those fields exist.
- Market sizing: only build TAM/SAM/SOM graphics after inputs, units, method and uncertainty are explicitly defined. Do not invent numbers to populate an attractive chart.

Avoid adding radar charts, Sankey diagrams, world maps or 3D charts solely for visual variety. Introduce each only when the underlying data and decision require it.

## Implementation sequence

1. **Visual target:** create three image-based directions for the same Market Intelligence screen using identical sample data. Compare a light, dense workspace; a stronger dark analytical interface; and a restrained executive presentation. Select one before writing the redesign.
2. **System foundations:** implement type, spacing, color, surface, control, table and chart tokens for the selected direction; preserve existing brand assets.
3. **First complete slice:** rebuild Market Intelligence entry, selection and segment inspector together. Validate the full interaction before spreading the shell across the app.
4. **GTM slice:** reuse the shell and inspector; consolidate scenario controls, chart details and channel comparison.
5. **Report and monetization:** apply a coherent reading/export mode. Free preview should show a useful sourced basic result and a clear report outline; locked sections should explain their specific value. Never blur fabricated findings to imply hidden research exists.
6. **Research execution states:** later integrate Manus status, partial results, source review and failures into the same workspace. No live AI capability or verification badge should be implied before it exists.
7. **Validation:** desktop, narrow-screen, keyboard, zoom, loading, empty, partial, error and long-content states; verify existing save/isolation/access behavior remains correct.

## Acceptance targets for the redesign

- At the same 1280 × 720 viewport, meaningful chart marks and supporting rows are visible without scrolling; aim for the first analytical area to begin within roughly 220–260px rather than 707px.
- Changing selection, opening sources or editing a segment preserves the user's analytical context.
- Scope and scenario are clear; per-chart overrides cannot silently masquerade as global scope.
- Exact data and calculation details remain accessible even when chart labels are abbreviated.
- No page-wide horizontal overflow; wide data tables scroll within their own region.
- Mobile has an intentional sequence and editing surface, not a squeezed desktop grid.
- Source limitations remain discoverable and truthful; no unearned confidence scores or synthetic market shares.
- Compare before/after screenshots with the same viewport, sample data and selected object. Validate performance and existing workflows after implementation.

## Evidence limits and deliverable status

This report combines a three-step live desktop audit, current official product documentation, two inspected static competitor references and proposed design decisions. It is not a competitive usability study, an accessibility certification or evidence that TrendBridge already has external market datasets. No app code, database schema, permissions, payment behavior or deployment was changed in this research task.
