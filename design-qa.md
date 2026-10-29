# Research Workbench — direction 2 acceptance

final result: passed

Date: 2026-10-29. Scope: selected visual direction and core local journey, not production research or commerce acceptance.

## Evidence and normalization

- Source visual truth: `C:/Users/PC/.codex/generated_images/01a17da8-09d0-7961-a81b-925e9612a8d9/exec-6b45c72d-ce31-4c93-a716-cf453079ced8.png`.
- Rendered implementation: `http://localhost:3000/reports/sample`, Economics, English, Higher acquisition cost selected, no unsaved edits.
- Source: 1487 × 1058 pixels. Implementation screenshot: `.artifacts/workbench-v2/desktop-final.png`, 1487 × 1058 pixels at a 1487 × 1058 CSS viewport. No density rescaling of either capture.
- Full-view combined comparison: `.artifacts/workbench-v2/comparison-final.png` (reference left, implementation right, 32px labels added outside both captures).
- Focused combined comparison: `.artifacts/workbench-v2/comparison-detail.png`, crops of the actual heading/table/chart at native resolution. Both composites were opened and inspected together.
- Additional captures: `intake-desktop.png`, `mobile-economics.png`, `mobile-final.png` (390 × 844 CSS viewport, Vietnamese; full-page capture), `mobile-vietnamese-inputs.png`.
- These local evidence files are intentionally ignored by Git; this record preserves their exact paths. The supplied original logo is versioned in `public/brand/trendbridge-logo.png`.

## Comparison history and fixes

1. First pass: `desktop-before.png` / `comparison-before.png`. P2: analytical text was too small, input order differed from the selected reference and the next-action panel fell below the first viewport. Increased heading/body/table/control sizing; moved selling price and scenario metadata into progressive disclosure; kept the four principal cost controls first.
2. Second pass: `desktop-after.png`. P2: next-action panel was still displaced by scenario metadata. Moved the panel inside the inspector before optional metadata. Added min-width and wrapping protection for long product names.
3. Final capture and combined comparisons above: the analysis/inspector split, selected scenario controls, complete comparison table, signed bars and next action are visible together. No actionable P0/P1/P2 findings remain in this bounded scope.

## Required fidelity surfaces

- Fonts/typography: Inter throughout the analytical workbench; navy weighted headings, quieter body, tabular figures and differentiated metadata. Focused comparison confirms readable table headings, signed values and input labels. The original logo remains artwork, not a typeset replacement.
- Spacing/layout: white horizontal navigation and case header, four section controls, approximately 70/30 analysis/inspector split. The next-action panel is visible in the desktop viewport. At 390px the inspector stacks and the table scrolls independently; persistent navigation remains reachable.
- Colors/tokens: navy/cobalt/cyan/teal follow the supplied mark. Positive teal and negative rust accompany exact signed values. Selection uses blue plus active underline/pressed state. Neutral separators replace nested decorative cards.
- Image quality: original owner-provided raster used for symbol/wordmark, without tracing or regeneration. No invented product photography or account portrait is introduced.
- Copy/content: values match the selected example: 6.65 / 22.93% / 21.18 baseline; -0.35 / -1.21% / 29.41 higher acquisition. The application explicitly distinguishes assumptions, fixtures, unknowns and external evidence.

## Intentional adaptations

- Public sample Save is disabled with an explanation; saving works in private cases. The concept's enabled sample button would imply persistence that is unavailable.
- Added genuine export menu, report language controls, local draft states, limitations and saved-scenario metadata. These cause some additional vertical content below the initial desktop viewport.
- Neutral TB account menu replaces the concept's invented personal initials; no arbitrary date is displayed.
- Chart axes adapt to actual scenario values, including larger losses. Currency signs, tooltip and accessible table preserve precise values; a fixed demo axis is inappropriate for user inputs.
- Next action opens the real validation plan. It does not claim to run unavailable external research.

## Interaction and accessibility checks

- Created a private scope-only preview through the rendered form; Overview correctly showed unknown financial inputs.
- Entered 29 selling price, 9 purchase, 4 logistics, 5 acquisition and 15% fee; saved a named scenario; reloaded the page and confirmed 6.65 contribution persisted while original inputs stayed unknown.
- Sample draft acquisition changes update calculations immediately; blank amounts remain unknown. Changing section preserves the draft.
- Empty product submission exposes field validation; entered draft survives reload.
- Opened the local free fixture report through Research and downloaded its actual XLSX file through the export menu.
- English/Vietnamese switching, localized currency/percentage formatting and mobile section navigation inspected.
- Visible focus styles, associated labels, skip link, native disclosure, reduced-motion CSS and table alternative to the chart are implemented. This is not a complete screen-reader/WCAG conformance audit.
- Browser console warning/error log was empty on the inspected sample state. HTTP ownership, idempotency, persistence, conflict and export suite passed separately (2/2); domain/storage/export/draft tests passed with one worker (26/26). An unrestricted concurrent test run exhausted local memory; the sequential rerun passed.

## Follow-up polish and remaining acceptance

- P3: consolidate legacy public marketing and analytical catalogue specimens in a later design-system iteration.
- Full report narrative templates can retain the requested report language independently of the interface; complete narrative translation remains a roadmap item.
- Live Manus research, payment fulfillment, hosted deployment and authenticated Supabase acceptance are outside this visual/local acceptance result.

## Implementation checklist

- [x] Exact selected option mapped and original logo retained.
- [x] Desktop full-view and focused comparisons inspected after fixes.
- [x] Mobile and bilingual states captured.
- [x] Core create/save/reload/open/export journey verified locally.
- [x] Design-system documentation and catalogue updated.
