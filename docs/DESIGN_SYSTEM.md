# TrendBridge Design System

Version 1.2 — October 2026

## Official logo source

The owner-supplied TB bridge-arrow symbol and TrendBridge wordmark are canonical. The unchanged raster master is stored at `public/brand/trendbridge-logo.png`. Do not regenerate, trace, recolor, stretch or add an AI suffix to this artwork.

Compact navigation uses non-destructive CSS windows into the original symbol and wordmark on a white protective surface. Full lockup presentations retain the original composition. The source has an opaque white background; it must not be described as a transparent asset.

Brand palette approximated from the supplied raster:

- Logo navy: `#002B67`
- Logo cobalt: `#005BC9`
- Logo cyan: `#00ADEF`
- Logo teal: `#00ABAA`
- Gradient: cobalt → cyan → `#00C9A7`

Use the gradient for brand accents and selected emphasis; keep dense content on neutral surfaces. The original wordmark remains artwork. Manrope and Inter are supporting interface fonts, not replacements for its letterforms. Brand teal and verified evidence remain distinct roles: verified status always includes an explicit icon and label.

## Product principle

**Trust, made visible.** TrendBridge is a commercial intelligence product. Its interface must help users distinguish four things at a glance:

1. Verified observations
2. User-provided or calculated assumptions
3. Unresolved risks
4. Unavailable evidence

The system must never use visual confidence to disguise weak data. Empty states are a first-class component, not an error to hide.

## Brand character

Intelligent, precise, premium, modern and trustworthy. The visual system combines editorial decision-making with operational software density.

- Midnight navy establishes authority and anchors analytical surfaces.
- True white protects readability and avoids a muddy enterprise aesthetic.
- Cyan indicates interaction and active intelligence.
- Brand teal represents the Bridge wordmark; evidence teal is paired with an explicit verification icon and label.
- Amber means estimated, conditional or pending verification.
- Red means risk, failure or destructive action.

## Typography

- **Manrope**: public marketing display and legacy catalogue specimens.
- **Inter**: Research Workbench headings, navigation, controls, body copy, tables and numerical outputs. Analytical headings use 700–750 weight; body and tabular data remain quieter.
- Maximum body line length: 70 characters for long-form content.
- Data values use tabular numerals where alignment matters.
- Controls never inherit browser-default typography.

## Spacing and containers

The base spacing unit is 4px. Product spacing uses 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 and 96px.

- Workbench controls: 6px radius; contextual menus: 8px
- Workbench panels: open white regions with thin dividers
- Marketing feature surfaces retain the larger original radii
- Desktop navigation: horizontal header, 78px minimum height
- Desktop economics grid: 2.35:1, inspector at least 300px
- At 850px: stack the inspector below the analysis
- At 540px: wrap primary navigation and scroll wide tables independently
- Minimum interactive target: 42px

Avoid nested cards. Use open layout, separators and typography before adding another border.

## Evidence language

| State | Color | Required meaning | Example |
| --- | --- | --- | --- |
| Verified | Teal | Directly supported by a legitimate source | Public listed price retrieved at a known time |
| Estimated | Amber | Calculated, modeled or user-provided assumption | Contribution margin based on entered costs |
| Risk | Red | Requires investigation or action | Food-contact compliance not verified |
| Unavailable | Slate | No valid data exists or provider is disabled | Supplier quotations unavailable |

Never label AI-generated recommendations as verified. Use “Giả thuyết” or “Đề xuất cần kiểm chứng”.

## Components

Reusable primitives live in `components/ui`:

- `Button`: primary, accent, secondary, ghost and danger variants; small, medium and large sizes.
- `EvidenceBadge`: verified, estimated, risk and unavailable semantics with icons.
- `Surface`: base, raised and floating elevation levels.

The interactive catalogue is available at `/design-system`.

## Data visualization

1. Every chart includes unit, scope and retrieval or assumption time.
2. Never display historical trends without timestamped historical observations.
3. Use an empty state instead of generating synthetic data.
4. Red and amber are semantic; do not use them for arbitrary series.
5. Tooltips supplement visible information; they cannot be the only location of a critical value.
6. Avoid 3D charts, misleading axes, decorative gauges and artificial precision.

## Content voice

Write calmly and directly. State the decision, then the reason and next action.

- Preferred: “Chưa đủ dữ liệu đã xác minh để kết luận nhu cầu.”
- Avoid: “Sản phẩm hot, tiềm năng bùng nổ 93/100.”

English is the global product default. Vietnamese localization preserves meaning and evidence qualifiers. UI language and requested report language are independent. Raw user-entered names and report narratives retain their original language.

## Research Workbench patterns

`app/workbench.css` scopes the selected direction to `.workbench-shell`; public marketing styles remain separate. Use navy `#002B67` for analytical headings, cobalt `#005BC9` for focus/selection, action blue `#0061DF`, teal `#009EAA` for the next-step action, white canvas and `#E1E9F2` separators. Contribution series use teal `#00A5A7` and negative rust `#BD5145`; exact signed values always accompany color.

- Case navigation: Overview / Research / Economics / Next steps. Keep unsaved economics inputs while changing sections.
- Intake: product, market and channel first; reference, configuration and financial assumptions disclosed progressively. Preserve a validated local draft until successful submission.
- Economics: immutable original inputs, named saved scenarios, explicitly unsaved drafts, table plus chart and a next-action inspector. Unknown amounts never become zero.
- Library: real saved records, query and access filters, retry and empty states. Never manufacture recent research, account identities or counts.
- Evidence: observed source excerpts and limitations remain inspectable. An illustrative fixture never becomes verified evidence through styling.

Reference mapping: `DESIGN_DIRECTIONS_2026-10-29.md`. Visual acceptance and intentional deviations: `../design-qa.md`.

## Accessibility

- WCAG 2.2 AA contrast is the baseline.
- All inputs have programmatically associated labels.
- Keyboard focus is always visible.
- State meaning uses color plus icon plus language.
- Motion respects `prefers-reduced-motion`.
- Responsive acceptance viewports: 1440×900 and 390×900.

## Governance

### Launch workspace extension

The selected Research Workbench now supports an opportunity shortlist, a private cross-case research collection and six contextual launch tools: opportunity, evidence, cash, business plan, validation and decisions. Keep these tools within the case; do not add six global navigation destinations. The main Workspace compares opportunities; Library retrieves research reports.

Launch surfaces use the same white/navy/cobalt/teal system, 6px controls, open headings and independently scrolling tables. Cash charts use signed numerical values and a zero reference with the exact schedule available below. Empty, unsaved, incomplete, stale and infeasible states must remain distinct. A reviewed plan is a user acknowledgment, not a verified-market badge. Controls and workflow labels support English/Vietnamese; raw source excerpts and user-authored content retain their language.

- New tokens require a documented semantic role; do not add one-off colors.
- New components must demonstrate default, hover, focus, disabled, loading and error states when applicable.
- Design changes are accepted only after desktop and mobile visual comparison.
- The catalogue and this document must be updated in the same pull request as a material system change.
