# SHOP.CO — Shopify Theme Documentation

**Developer:** Afiqah  
**Theme Version:** 1.0.0  
**Shopify Version:** Online Store 2.0  
**Reference Design:** [Figma – E-commerce Website Template (Freebie)](https://www.figma.com/community/file/1273571982885059508)

---

## Overview

This Shopify theme faithfully implements the **SHOP.CO** Figma design — a modern fashion e-commerce store featuring clean typography, bold section headers, a black-and-white colour palette with warm accent tones, and smooth interactive elements.

---

## Pages Implemented

| Page | Template | Status |
|---|---|---|
| Homepage | `templates/index.json` | ✅ Complete |
| Collection (Shop) | `templates/collection.json` | ✅ Complete |
| Product Detail | `templates/product.json` | ✅ Complete |
| Cart | `templates/cart.json` | ✅ Complete |
| Search Results | `templates/search.json` | ✅ Complete |
| 404 Error | `templates/404.json` | ✅ Complete |

---

## Theme Structure

```
shopco-theme/
├── assets/
│   ├── theme.css          # All styles — variables, layout, components, responsive
│   └── theme.js           # All JS — cart AJAX, sliders, tabs, mobile menu, toast
├── config/
│   ├── settings_schema.json   # Theme editor settings (colours, fonts, cart type)
│   └── settings_data.json     # Default values
├── layout/
│   └── theme.liquid       # Root layout — <head>, header, main, footer
├── locales/
│   └── en.default.json    # English translations
├── sections/
│   ├── announcement-bar.liquid
│   ├── header.liquid
│   ├── hero.liquid
│   ├── brand-ticker.liquid
│   ├── featured-products.liquid
│   ├── browse-by-style.liquid
│   ├── reviews.liquid
│   ├── newsletter.liquid
│   ├── footer.liquid
│   ├── divider.liquid
│   ├── main-collection.liquid
│   ├── main-product.liquid
│   ├── related-products.liquid
│   ├── main-cart.liquid
│   ├── main-search.liquid
│   └── main-404.liquid
├── snippets/
│   ├── product-card.liquid
│   └── product-card-placeholder.liquid
└── templates/
    ├── index.json
    ├── collection.json
    ├── product.json
    ├── cart.json
    ├── search.json
    └── 404.json
```

---

## Key Development Decisions

### 1. Online Store 2.0 Architecture
All templates use **JSON template files** (not `.liquid` templates) so every section is editable and reorderable via the Shopify Theme Editor — no code changes required to rearrange content.

### 2. CSS Custom Properties
Design tokens (colours, radii, spacing, max-width) are defined as CSS variables in `:root`, with values controllable from the Theme Editor via `settings_schema.json`. This allows merchants to rebrand without touching code.

### 3. AJAX Cart
Add-to-cart uses Shopify's `/cart/add.js` endpoint for a seamless, no-page-reload experience. Cart count updates live. A toast notification confirms the action. Quantity changes on the cart page also submit via `/cart/change.js`.

### 4. Responsive Design
- **Desktop:** Full sidebar filters, 4-column product grid, side-by-side hero
- **Tablet (≤1024px):** 3-column grid, compact footer
- **Mobile (≤768px):** Hamburger menu, 2-column grid, stacked layouts, slide-in filter drawer
- **Small mobile (≤480px):** 2-column grid, single-column footer, smaller typography

### 5. Performance
- All product images use `srcset` and `sizes` for responsive loading
- Images below the fold use `loading="lazy"`; hero uses `loading="eager" fetchpriority="high"`
- Brand ticker animation is CSS-only (`@keyframes ticker`) — no JavaScript overhead
- Scroll-triggered animations use `IntersectionObserver` (no scroll event listeners)
- Zero external JS dependencies

### 6. Accessibility
- Semantic HTML: `<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`, `<aside>`
- All interactive elements have `aria-label` attributes
- Colour contrast meets WCAG AA for text on backgrounds
- Keyboard navigation supported via native focus management
- Screen reader–only utility class (`.visually-hidden`) for icon buttons

### 7. Sections & Blocks
Every homepage section is configurable in the Theme Editor:
- **Hero:** heading, subtext, CTA buttons, hero image, stat blocks
- **Brand Ticker:** unlimited brand name/logo blocks
- **Featured Products:** linked to any collection, configurable count
- **Browse by Style:** image + label + URL per style card
- **Reviews:** star rating, author name, review text per block
- **Newsletter:** heading, placeholder, button text
- **Footer:** social links, 4 configurable link columns

---

## Setup Instructions

1. **Upload theme:** Go to *Online Store → Themes → Upload theme* and upload `shopco-theme.zip`
2. **Add a navigation menu** named `main-menu` under *Online Store → Navigation*
3. **Create collections:** New Arrivals, Top Selling (or any names), then link them in the Theme Editor under "Featured Products" sections
4. **Customise content:** Open Theme Editor, click each section to update text, images, and links
5. **Add products:** Ensure products have images, prices, and variants (Color, Size) for full functionality
6. **Connect reviews app** (optional): Apps like Judge.me or Okendo will populate the Reviews tab on product pages using `product.metafields.reviews.rating`

---

## Tools Used

| Tool | Purpose |
|---|---|
| Shopify Liquid | Templating language for all `.liquid` files |
| CSS Custom Properties | Design token system |
| Vanilla JavaScript (ES6+) | Cart AJAX, UI interactions — no jQuery |
| Shopify Cart API (`/cart/add.js`, `/cart/change.js`) | Headless cart operations |
| IntersectionObserver API | Scroll-triggered animations |
| Shopify Online Store 2.0 | JSON templates, sections everywhere |

---

## Customisation Notes

- **Fonts:** The design references "Integral CF" and "Satoshi" (paid fonts). The theme falls back to `Inter` via Google Fonts (free). To use the original fonts, upload the font files as theme assets and update the `@font-face` declarations in `theme.css`.
- **Product metafields:** Star ratings on product and collection cards read from `product.metafields.reviews.rating`. Install a reviews app to populate real data.
- **Promo code field** on the cart page is UI-only; actual discount codes are handled natively at Shopify checkout.
