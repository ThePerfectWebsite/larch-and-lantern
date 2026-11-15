# Larch & Lantern Cottages (live concept)

A working concept website for **Larch & Lantern Cottages**, a fictional collection of three self-catering holiday cottages on the edge of Sherwood Forest, near Worksop, Nottinghamshire. It was built by [SiteSync Solutions](https://sitesync-solutions.co.uk) as a portfolio piece.

> **Concept only.** Larch & Lantern Cottages is not a real business. No stays are booked, no payments are taken and no details are collected. Bookings, owner changes, saved cottages and "My bookings" are simulated in your browser with `localStorage`, and nothing leaves your device.

**The pitch:** owners pay commission and fees on every booking from the big booking platforms. A beautiful site that takes **direct bookings** pays for itself. Every page supports that story: live availability, the exact price for your dates up front, a deposit-or-full demo checkout, and an owner dashboard that blocks dates and exports an iCal feed, so there's no need to manage two calendars.

- **Industry:** Holiday lets
- **Live:** https://larch.sitesync-solutions.co.uk (also served at https://larch-and-lantern.solutionssitesync.workers.dev)
- **Stack:** static HTML, CSS and vanilla JavaScript in `public/`, served by a Cloudflare Worker with static assets. No framework and no build step.

## Pages

| Path | What it does |
| --- | --- |
| `/` | Hero ("Wake up on the edge of Sherwood.") with drifting mist and a lantern that glows as you scroll. A date, guests and dogs search shows which cottages are free and the total price for those dates. Also: the cottages, why book direct, offers generated from calendar gaps, how booking works, a local guide taster. |
| `/cottages/` | All three cottages and an at-a-glance comparison table. |
| `/cottages/the-hayloft/`, `/keepers-cottage/`, `/the-old-granary/` | Gallery with lightbox, key facts, amenities, **availability calendar** with a live price breakdown and extras, "Things guests always ask", SVG floor plan, details, illustrated map, house rules and cancellation. Sticky "Check dates" bar on mobile. |
| `/book/` | 4-step booking demo: dates and guests, your details, extras, payment (25% deposit with the balance 6 weeks before arrival, or pay in full). Then a confirmation with a reference, summary, what happens next and an `.ics` add-to-calendar file. The booking blocks its dates in this browser. |
| `/my-bookings/` | Demo bookings, with cancellation according to policy, plus saved cottages. |
| `/why-book-direct/` | An honest comparison and an illustrative savings calculator (editable fee percentages, labelled "example — fees vary by platform"). |
| `/explore/` | Plain-English guide to Sherwood Forest and the Major Oak, Clumber Park, Creswell Crags, Rufford Abbey, Worksop and the Dukeries, plus walks, cycling, rainy days, and food and drink. It links to official sites and gives no opening hours or prices. |
| `/offers/` | Late-availability and midweek offers found from gaps in the calendar data, each linking to the booking page with dates preselected. |
| `/faqs/` | FAQs and house rules (with `FAQPage` structured data). |
| `/contact/` | Demo contact form (nothing sent), phone, email, best time to call, directions. |
| `/owner/` | **Owner dashboard (demo)**, linked in the footer. Any login works. Block or unblock dates per cottage, see and change booking statuses, edit seasonal prices, minimum stays and fees (updates the public site instantly), reset to sample data, and download each cottage's iCal feed. |
| `404.html` | Styled not-found page. |

## Where the data lives

Everything you'd want to edit is plain JavaScript in `public/js/data/`:

| File | Contents |
| --- | --- |
| `site.js` | Business name, fictional address, phone (Ofcom drama range), email, deposit %, balance due days, cancellation policy, check-in/out times |
| `cottages.js` | The three cottages (facts, descriptions, amenities, good to know, guest questions, house rules, gallery, floor plan, available extras) and the extras price list |
| `pricing.js` | Season bands (minimum stay, allowed arrival days, Saturday-to-Saturday rule), the yearly season calendar, nightly rates per cottage, cleaning and dog fees, and offer rules |
| `bookings.js` | Sample booked dates: a few fixed bookings plus a seeded generator that fills the calendar believably (same seed = same calendar) |
| `guide.js` | Local guide places, routes, rainy-day ideas, food and drink |
| `faqs.js` | FAQs |

Logic lives in `public/js/core.js` (dates, pricing, availability rules, offers, bookings, iCal) and `public/js/calendar.js` (the accessible calendar). Page behaviour is in `public/js/pages/`.

## Changing prices

Edit `public/js/data/pricing.js`:

```js
rates: {
  hayloft: { low: 95, mid: 120, high: 160, festive: 150 },
  ...
}
```

Season dates, minimum stays and changeover days are in the same file. Prices are read in the browser, so **no rebuild is needed**: commit and push. For a quick demo you can also change prices in the owner dashboard (saved in that browser only).

## Adding a cottage

1. Copy a cottage object in `public/js/data/cottages.js` and give it a new `id` and `slug`.
2. Add its rates and cleaning fee in `public/js/data/pricing.js`.
3. Add illustrations or photos in `public/img/` and list them in `gallery`.
4. Run `node tools/build.mjs` to generate its page, the cottage cards, the sitemap and the structured data, then commit.

`tools/build.mjs` only stamps the shared header, footer, SEO tags and structured data into the static HTML files. It's a convenience for editors; the deployed site has **no build step**. `tools/art.mjs` regenerates the SVG illustrations, favicon and Open Graph images.

## Images

All illustrations are original SVG artwork made for this concept (`tools/art.mjs`), with no photos of real cottages, people or businesses. Landmark scenes in the guide are labelled illustrative. To use photography instead, add free-licence images (e.g. Unsplash or Pexels) as WebP in `public/img/`, update the `gallery` paths, credit them below, and keep `width`/`height` and lazy loading.

Fonts: DM Serif Display and Inter, self-hosted (SIL Open Font License).

## SEO and accessibility

- A unique title and meta description per page, plus canonical, Open Graph images (per cottage), favicon and web manifest.
- Structured data: `LodgingBusiness`, `VacationRental` with `Accommodation` (occupancy, bedrooms, amenities, pets), `BreadcrumbList` and `FAQPage`. There's deliberately **no review or rating markup**, because the business is fictional.
- `robots.txt` and `sitemap.xml`.
- The calendar works with the keyboard (arrow keys, Page Up/Down, Home/End, Enter) and screen readers, with full spoken labels. Available, booked, changeover and no-arrival states never rely on colour alone (hatching, strikethrough, split days, dots, In/Out labels).
- Respects `prefers-reduced-motion`. Colours are checked against WCAG AA (amber is only used behind dark text).
- Lighthouse (mobile, local test): 97–99 performance and 100 for accessibility, best practices and SEO on every page.

## Run locally

```bash
npx wrangler dev
```

Then open http://localhost:8787. Any static server pointed at `public/` also works.

## Deploy

The site deploys to Cloudflare Workers from GitHub. Every push to `main` deploys through Cloudflare's Git integration.

- Worker name: `larch-and-lantern` (see `wrangler.jsonc`)
- Build command: *(empty)*
- Deploy command: `npx wrangler deploy`

To deploy by hand: `npx wrangler deploy`.

**Domain:** canonical tags, Open Graph URLs, structured data, `sitemap.xml` and `robots.txt` all use `https://larch.sitesync-solutions.co.uk`, set by `url` in `public/js/data/site.js`. To change it, edit that line and run `node tools/build.mjs`. Add the domain to the Worker under Settings → Domains & Routes → Custom domain.

---

Concept site by [SiteSync Solutions](https://sitesync-solutions.co.uk). Larch & Lantern Cottages is not a real business; no stays are booked and no payments or details are taken. Local attractions are real places; Larch & Lantern has no connection with them.
