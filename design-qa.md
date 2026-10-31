# Precision Desk design QA

Date: 31 October 2026. Selected target: first displayed generated image from the three-concept set. Scope: existing production case workspace, with full existing persistence and export behavior retained.

## Visual truth and evidence

- Source visual: `C:/Users/PC/.codex/generated_images/01a17da8-09d0-7961-a81b-925e9612a8d9/exec-b0390250-345d-4104-9ada-2258ed88d3f1.png` (1487 × 1058 pixels).
- Local implementation: `http://localhost:3100/reports/sample?view=intelligence`.
- CSS viewport: 1487 × 1058, devicePixelRatio 1. DOM content width 1472 due to the scrollbar. Browser capture reports 1472 × 1047 pixels; the small capture-frame difference is not treated as layout drift. Neither image was stretched.
- State: light theme, English, public illustrative travel-mug case, Daily commuters selected. Actual saved sample values are retained, including ratings that differ from the generated mockup.
- Final implementation: `.artifacts/precision-v4/desktop-final.png`.
- Combined full-view comparison, opened and inspected: `.artifacts/precision-v4/comparison-final.png`. The source and implementation are placed together at native pixel dimensions; any viewer downsampling applies to both.
- Additional inspected captures: `mobile-final.png`, `mobile-editor.png`, `gtm-final.png` in the same folder. Artifacts are local and gitignored.

## Findings and iteration

1. Initial comparison: primary data type and inspector attributes were too small relative to the source. Increased principal body/table values to 14px, case heading to 30px, analysis heading to 26px and inspector heading to 25px. Added direct point labels and two-dimensional grid guides. Re-captured and compared.
2. Initial mobile capture: stacked global navigation and draft controls delayed the plot. Removed redundant mobile global navigation, retained Workspace back navigation and Library in the account menu, compacted draft controls and the add action. Re-captured. At the tested narrow viewport there is no page-wide horizontal overflow; tables and case navigation scroll internally.
3. The primary ICP action was too low in the inspector. Moved it ahead of the long context/attributes. Final comparison confirms it is visible near the start of the detail panel.
4. Long inline editors were replaced with independently scrolling inspector content. Mobile editing occupies the full viewport, focuses the first input, contains keyboard navigation, supports Escape and restores the previous focus/body scrolling. The segment editor has an explicit completion footer; alternative/channel inspectors use the same return pattern.

No remaining actionable P0/P1/P2 issue was found in the final scoped comparison.

## Required fidelity surfaces

- Typography: Inter UI family retained. Navy headings, quieter slate metadata, tabular numeric values. Source hierarchy is preserved; mobile inputs use 16px to avoid automatic zoom. No display font substitutions were introduced.
- Spacing/layout: compact left rail, white analysis canvas, approximately 1.9:1 main/inspector split, thin separators, restrained radii and no nested card stack. Inspector scrolling is separate from page scrolling.
- Color: owner logo navy/cobalt/teal, neutral canvas, blue selection and pale blue inspector. Teal action is slightly darker than the mockup for readable white labels. Loss colors remain semantic and paired with signed values.
- Assets: canonical raster logo reused unchanged with existing non-destructive symbol/wordmark windows. Existing Lucide icons provide standard product controls. No decorative images or approximated logo were introduced. Chart SVG geometry encodes actual planning data; it is not used as replacement brand artwork.
- Copy/content: source title and main task preserved; actual sample buyer descriptions and numeric values take precedence over generated illustration text. Sample, assumption, missing-source and modeled-result language remains visible or directly inspectable.

## Deliberate production adaptations and limits

- Added contextual market/GTM view navigation and retained explicit save, backup and status controls absent from the generated mockup. They serve existing production workflows. No invented "last updated" date is shown.
- Plot uses direct point labels plus linked HTML buttons/table instead of the mockup's decorative colored legend and score dots. Selection color does not imply evidence verification.
- At 1280 × 720, chart content begins at approximately y=504 versus y=707 in the prior live capture. Meaningful point marks are visible in that first viewport. The table is below the fold at that short height. The research brief's proposed y=220–260 target is **not achieved**; the selected visual direction and retained production controls take precedence for this release. This report does not claim that earlier aspirational target passed.
- Mobile is an adaptation of the selected desktop source, not a comparison against a separate approved mobile image. Tested width 390 (375 content width when the page scrollbar is present), height 844; full-screen editor uses the full 390 width while body scrolling is locked.
- Visual checks are not WCAG certification or a full assistive-technology audit. Private owner-isolation/entitlement checks remain covered by the existing automated contracts; production authenticated owner flows are not re-certified by screenshots of a public sample.

## Interaction verification

- Row selection updates the inspector; chart selection remains keyboard operable and has an HTML alternative.
- Segment name edits update the table and inspector. Selecting an ICP survives switching to GTM positioning and back.
- Conversion sensitivity changes modeled output without overwriting saved/input conversion rates.
- Competition, market signals (including missing month), positioning and thirteen-week rollout views render.
- Mobile segment editing, initial focus, Escape close and body-scroll restoration were checked in the browser.
- `npm run check`: typecheck, 49 tests and production build passed; four integration tests skipped without opt-in configuration.
- Opt-in local HTTP journey: three tests passed, covering save/access/export behavior through the running app.

## Follow-up polish

- A future compact mode can bring table rows into the first 720px-high viewport while retaining readable labels.
- Broader authenticated production and assistive-technology coverage can extend this bounded visual release verification.

final result: passed
