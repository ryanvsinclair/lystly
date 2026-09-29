# Lystly design language — agent handoff

Give this file to an implementing agent. It is the source of truth for matching Lystly on another site.

**Do not recreate the liquid mesh, any shader background, or a decorative animated wash.** Use a flat page color. If you need a dark field, use `#042f2e` with no texture.

Do not invent a second palette. Do not substitute Inter, system-ui, Geist, or a generic blue SaaS look. Do not use `#1754ea` as the product accent — that blue is legacy listing-card ink only.

---

## Brief

Lystly is quiet, tight, and physical. Type is Outfit. Corners are pills or large rounds. Controls live in a dark **well** with a lighter **lid** that slides. Surfaces are grey, white, and black — not navy chrome. Motion is short and directional. Copy is short and literal.

Two surfaces share type, radius, and motion:

| Surface | Use on the new site when | Page | Type | Accent |
| --- | --- | --- | --- | --- |
| **Frost (product)** | App, dashboard, settings, lists | `#f2f2f7` light / `#111111` dark | `#111111` / `#f2f2f7` | Ink, not color |
| **Deep teal (editorial)** | Marketing, auth, full-bleed hero | `#042f2e` flat | `#f4f0e8` | Cream on teal |

Default to **Frost light** unless the page is a full-bleed dark hero or an auth card.

---

## Type

Load from Google Fonts (or `next/font`) exactly:

- **Outfit** — UI, body, wordmark. Weights 400, 500, 600, 700.
- **Montserrat** — listing square / brochure export only. Weights 400–800.
- **Playfair Display** and **Fraunces** — optional listing text styles only. Do not use them for product chrome.

```css
:root {
  --font-outfit: "Outfit", sans-serif;
  --font-montserrat: "Montserrat", Helvetica, sans-serif;
  --font-playfair: "Playfair Display", Georgia, serif;
  --font-fraunces: "Fraunces", Georgia, serif;
}

html, body {
  font-family: var(--font-outfit);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}
```

| Role | Size | Weight | Tracking | Line height |
| --- | --- | --- | --- | --- |
| Display / hero | 40–56px (64px only on very wide) | 700 | `-0.04em` to `-0.05em` | `0.95` |
| Page title | 40px | 700 | `-0.04em` | 1.05 |
| Section title | 22px | 700 | `-0.03em` | 1.15 |
| Card title | 16–18px | 600–700 | `-0.02em` to `-0.03em` | 1.2 |
| Body | 15–18px | 400 | 0 | 1.5 |
| UI / button | 13–14px | 600 | 0 | 1 |
| Meta / time | 13px | 400–500 | 0 | 1.4 |
| Eyebrow / label | 11–12px | 600 | `0.12em`–`0.16em` | 1 |
| Micro label | 10–11px | 600–700 | `0.04em`–`0.08em` | 1 |

Eyebrows are **uppercase + wide tracking**. Headlines are **sentence case**, never title case, never all-caps except status words on a listing square (`JUST LISTED`).

Wordmark: Outfit 700, 22px (26px in the app bar as an SVG mark), tracking `-0.04em`. The tab icon is the **L only**, not the full word.

---

## Color — Frost (product)

Copy these custom properties. Bind every chrome color to them. Mix tints with `color-mix(in srgb, …)` — do not invent extra greys.

### Light (default)

```css
:root, [data-mode="light"] {
  --app-page: #f2f2f7;
  --app-page-type: #111111;
  --app-page-muted: rgba(17, 17, 17, 0.62);
  --app-panel: #ffffff;
  --app-panel-type: #111111;
  --app-panel-muted: rgba(17, 17, 17, 0.62);
  --app-panel-border: rgba(17, 17, 17, 0.12);
  --app-control: #ffffff;
  --app-control-type: #111111;
  --app-control-muted: rgba(17, 17, 17, 0.62);
  --app-ok: #111111;
  --app-danger: #b42318;
  --app-danger-soft: rgba(180, 35, 24, 0.12);
  --app-shadow: rgba(17, 17, 17, 0.12);
  --app-bar: #ffffff;
  --app-bar-type: #111111;
  --app-accent: #111111;
  --app-accent-type: #ffffff;
  --app-accent-soft: rgba(17, 17, 17, 0.08);
  --app-accent-ring: rgba(17, 17, 17, 0.22);
  --app-card: #ffffff;
  --app-stage: #ffffff;
  --app-well: #3a3a3c;
  --app-well-type: #ffffff;
  --app-lid: #ffffff;
  --app-lid-type: #111111;
}
```

### Dark

```css
[data-mode="dark"] {
  --app-page: #111111;
  --app-page-type: #f2f2f7;
  --app-page-muted: rgba(242, 242, 247, 0.68);
  --app-panel: #2c2c2e;
  --app-panel-type: #f2f2f7;
  --app-panel-muted: rgba(242, 242, 247, 0.68);
  --app-panel-border: rgba(242, 242, 247, 0.14);
  --app-control: #2c2c2e;
  --app-control-type: #f2f2f7;
  --app-control-muted: rgba(242, 242, 247, 0.68);
  --app-ok: #f2f2f7;
  --app-danger: #ffb4b4;
  --app-danger-soft: rgba(255, 180, 180, 0.16);
  --app-shadow: rgba(0, 0, 0, 0.4);
  --app-bar: #2c2c2e;
  --app-bar-type: #f2f2f7;
  --app-accent: #f2f2f7;
  --app-accent-type: #111111;
  --app-accent-soft: rgba(242, 242, 247, 0.14);
  --app-accent-ring: rgba(242, 242, 247, 0.32);
  --app-card: #2c2c2e;
  --app-stage: #1c1c1e;
  --app-well: #3a3a3c;
  --app-well-type: #f2f2f7;
  --app-lid: #e5e5ea;
  --app-lid-type: #111111;
}
```

Token jobs:

- **page** — canvas behind everything (`#f2f2f7` is iOS-system grey, not cream).
- **bar / panel / card / control** — white (light) or `#2c2c2e` (dark).
- **well** — charcoal track `#3a3a3c` that holds segmented controls.
- **lid** — the sliding selected chip: white on light, `#e5e5ea` on dark. Always lighter than the well.
- **accent** — ink, inverted. Primary buttons are black (light) or off-white (dark). No colored CTA.
- **danger** — `#b42318` light / `#ffb4b4` dark. Outline, not a red fill, unless deleting.

Tints you will need:

```css
color-mix(in srgb, var(--app-bar-type) 10%, transparent); /* ghost hover */
color-mix(in srgb, var(--app-bar-type) 22%, transparent); /* hairline */
color-mix(in srgb, var(--app-page-type) 7%, var(--app-card)); /* photo mount */
```

---

## Color — Deep teal (editorial / auth, no mesh)

Use a **flat** field. No gradient, no grain, no moving blobs.

```css
--teal: #042f2e;
--cream: #f4f0e8;          /* paper */
--cream-dim: #ece7dc;
--cream-type: rgba(244, 240, 232, 0.82);
--cream-faint: rgba(244, 240, 232, 0.16);
--navy: #081d56;           /* listing-card ink only */
--ink: #10182c;
--danger-on-teal: #ffd2c8;
```

On teal: type and strokes are cream. Primary button is **cream fill, teal type** (`#f4f0e8` on `#042f2e`). Secondary is ghost cream with `inset 0 0 0 1.5px rgba(244, 240, 232, 0.4)`. Inputs are cream pills with teal type.

Do not put Frost white cards on a teal page. Do not put teal on a Frost page.

---

## Radius

| Use | Radius |
| --- | --- |
| Pills (buttons, search, tabs, chips) | `999px` |
| App cards, brochure frames | `18px`–`20px` |
| Auth / settings tiles | `14px`–`16px` |
| Icon buttons, download tiles | `12px`–`16px` |
| Inputs (Frost) | `14px` or pill `999px` |
| Listing glass card | `40px` |
| Slide-well pad | `4px` inside a `999px` well |

If it is a button or a search field, it is a pill. If it is a card, it is ~18px. Do not use 4–8px “Material” corners.

---

## Space

- Page pad: `32px 40px` (desktop), `20px` (narrow).
- App bar: `52px` tall, pad `0 18px`.
- Card pad: `18px`.
- Stack gap: `8–12px` for controls, `16px` for cards, `28px` under a page head.
- Control height: ~`44–48px` for icon squares, `12px 18px` for pill buttons.

---

## Motion

Same easings everywhere. Honor `prefers-reduced-motion: reduce` (instant, no transform).

```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1); /* enter */
--ease-in:  cubic-bezier(0.4, 0, 1, 1);     /* leave */
```

| Event | Time | Move |
| --- | --- | --- |
| Lid slide | `280ms` `--ease-out` | `translateX` by slot width |
| Page enter | `340ms` `--ease-out` | fade + `translateX(36px)` → 0 |
| Page leave | `280ms` `--ease-in` | fade + `translateX(-36px)` |
| Card / title in | `260–320ms` `--ease-out` | fade + 12–16px |
| Card / title out | `220–280ms` `--ease-in` | fade + opposite 10–12px |
| Hover fade | `160ms` ease | opacity only |

Do not add a new spinner, wash, or fade for a route change if a directional slide already exists. Never hard-cut between product pages.

---

## Elevation

Prefer a **1px inset hairline** over a drop shadow.

```css
/* default card / input */
box-shadow: inset 0 0 0 1px var(--app-panel-border);

/* raised card only when it must lift */
box-shadow: 0 10px 30px var(--app-shadow);

/* brochure / photo frame */
box-shadow: 0 24px 48px rgba(16, 24, 44, 0.16), 0 0 0 1px rgba(16, 24, 44, 0.06);
```

No glow. No colored shadow. No 2px grey border.

---

## Focus

Kill the browser ring on inputs. Restore a quiet accent ring only when the field is being edited in a tool panel:

```css
input:focus, textarea:focus, select:focus, [contenteditable]:focus {
  outline: none;
}
/* tool fields only */
input:focus {
  box-shadow: 0 0 0 2px var(--app-accent-ring);
}
```

---

## Icons

Inline SVG, 24 viewBox, `fill="none"`, `stroke="currentColor"`.

- Stroke `1.75`–`1.9` for chrome, `2.2` for a check.
- `stroke-linecap="round"` and `stroke-linejoin="round"`.
- Size in UI: 18–22px. Do not use filled brand-color icons.

---

## Components

### Primary button

Pill. Ink fill. No shadow.

```css
.btn-primary {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 600;
  font-size: 14px;
  background: var(--app-accent);
  color: var(--app-accent-type);
  cursor: pointer;
}
```

On teal: `background: #f4f0e8; color: #042f2e`.

### Secondary / ghost

Transparent, `inset 0 0 0 1.5px var(--app-panel-border)`, same pill, `color: var(--app-page-type)`.

App-bar ghost: no inset ring; hover `color-mix(in srgb, var(--app-bar-type) 10%, transparent)`.

### Danger

Text + inset 1.5px danger stroke. Not a red fill. Confirm-in-place (icon swap or second click), do not open a modal if a small control can arm itself.

### Slide well (signature control)

A charcoal pill. A lighter lid slides under the active slot. Labels sit above the lid and change to lid-type when selected. This is the segmented control, theme switch, and listing/brochure toggle.

```html
<div class="slide-well" data-index="0" style="--slots:2">
  <b class="slide-lid" aria-hidden="true"></b>
  <button class="is-active">Listing</button>
  <button>Brochure</button>
</div>
```

```css
.slide-well {
  --slide-pad: 4px;
  --slots: 2;
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--slots), minmax(0, 1fr));
  padding: var(--slide-pad);
  border-radius: 999px;
  background: var(--app-well);
}
.slide-lid {
  position: absolute;
  inset: var(--slide-pad) auto var(--slide-pad) var(--slide-pad);
  width: calc((100% - var(--slide-pad) * 2) / var(--slots));
  border-radius: inherit;
  background: var(--app-lid);
  pointer-events: none;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-well[data-index="1"] .slide-lid { transform: translateX(100%); }
.slide-well > :not(.slide-lid) {
  position: relative;
  z-index: 1;
  border: 0;
  background: transparent;
  color: var(--app-well-type);
  font-weight: 600;
}
.slide-well > .is-active { color: var(--app-lid-type); }
```

Never implement this as two outlined pills or a Material underline tab.

### Search / text field (Frost)

```css
input[type="text"], input[type="search"], input[type="email"] {
  width: 100%;
  border: 0;
  border-radius: 999px;
  padding: 12px 16px;
  background: var(--app-card);
  color: var(--app-page-type);
  box-shadow: inset 0 0 0 1px var(--app-panel-border);
}
input::placeholder { color: var(--app-page-muted); }
```

On teal: cream fill, no hairline, teal type, pill.

### App bar

52px, `--app-bar` fill, no bottom border. Logo left. Title after a vertical hairline. Actions right, ghost pills + optional slide-well. Title changes with a horizontal wipe, not a fade.

### Cards

White (or `#2c2c2e`), radius 18–20px, pad 18px. Hairline inset **or** `0 10px 30px var(--app-shadow)`, not both unless the card is a photo mount. Titles 18px / `-0.03em`. Meta 13px muted.

Photo mount under a listing thumb: `color-mix(in srgb, var(--app-page-type) 7%, var(--app-card))`.

### Status

Success is ink (`--app-ok`), not green. Error is `--app-danger`. 13–14px, no banners, no toast stacks if a line next to the control will do. Status text slides **out of the control**, it does not shove the control.

### Listing glass card (only if you ship a listing preview)

1080×1080. Bottom sheet radius **40px**. Frost: white 24–36% over a blurred photo. Corner glare, not a heavy drop shadow. Type on the square is **Montserrat**, navy `#081d56`. This is a composition, not the product chrome.

---

## Layout

- Product canvas is full viewport, `100dvh`, no document bounce (`overscroll-behavior: none` on app shells).
- Studio / tool pages: sidebar ~400px + fluid stage.
- Projects: `auto-fill`, `minmax(240px, 1fr)`, gap 16px.
- Auth card: centered, ~420px, cream fields on a flat teal page.
- One hairline logo, never a colored header bar.

---

## Copy

- Short. Literal. Sentence case.
- Buttons: “Log in”, “Get started”, “Save”, “Continue” — not “Submit” or “Let’s go”.
- Errors: “Those passwords do not match.” / “Could not save.”
- Empty: one line, muted, no illustration dump.

---

## Do not

1. Liquid mesh, WebGL blobs, aurora, noise overlays, or animated gradients as a page background.
2. Blue primary buttons, purple accents, or a rainbow theme switcher.
3. Inter / Roboto / system-ui as the UI font.
4. 4–8px radii on buttons.
5. Thick 1px grey box borders. Use inset hairlines or nothing.
6. Browser focus outlines on every input.
7. Hard cuts between pages. Use the motion table.
8. Mixing teal chrome onto a Frost page or white Frost cards onto teal.
9. Green “success” chips. Success is ink.
10. Recreating Lystly’s wordmark as a new logo. Use Outfit 700 tracking `-0.04em`, or a single letter mark.

---

## Implementation checklist

- [ ] Outfit loaded; body is Outfit 400
- [ ] Frost tokens on `:root`; dark tokens on `[data-mode="dark"]`
- [ ] Page background is `#f2f2f7` or `#111111` or flat `#042f2e` — nothing else
- [ ] Primary button is ink (or cream-on-teal), pill, 600
- [ ] Segmented controls use well + sliding lid
- [ ] Cards 18px radius; searches and CTAs 999px
- [ ] No mesh, no `#1754ea` product accent
- [ ] `prefers-reduced-motion` skips transforms
- [ ] Copy is sentence case and short
