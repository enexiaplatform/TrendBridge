# TrendBridge Design System

Version 1.1 — October 2026

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

- **Manrope**: display, page titles, panel titles and material numerical outputs.
- **Inter**: navigation, controls, body copy, tables and dense metadata.
- Maximum body line length: 70 characters for long-form content.
- Data values use tabular numerals where alignment matters.
- Controls never inherit browser-default typography.

## Spacing and containers

The base spacing unit is 4px. Product spacing uses 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 and 96px.

- Controls: 10px radius
- Panels: 14px radius
- Feature surfaces: 18px radius
- Desktop application rail: 224px
- Compact tablet rail: 76px
- Mobile navigation: fixed 64px bottom rail
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

Vietnamese is the source language. English localization should preserve meaning and evidence qualifiers, not translate word-for-word.

## Accessibility

- WCAG 2.2 AA contrast is the baseline.
- All inputs have programmatically associated labels.
- Keyboard focus is always visible.
- State meaning uses color plus icon plus language.
- Motion respects `prefers-reduced-motion`.
- Responsive acceptance viewports: 1440×900 and 390×900.

## Governance

- New tokens require a documented semantic role; do not add one-off colors.
- New components must demonstrate default, hover, focus, disabled, loading and error states when applicable.
- Design changes are accepted only after desktop and mobile visual comparison.
- The catalogue and this document must be updated in the same pull request as a material system change.
