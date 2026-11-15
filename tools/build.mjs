// Generates the static HTML pages in public/ from the data files in public/js/data.
// Optional: the site needs NO build step to deploy. Run this only after changing
// cottage text, the guide or FAQs, or adding a cottage:  node tools/build.mjs
// (Prices, seasons and sample bookings are read live in the browser, so editing
// pricing.js or bookings.js needs no rebuild.)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");
const ctx = { console, Date, Math, JSON, Uint32Array };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["data/site", "data/cottages", "data/pricing", "data/bookings", "data/guide", "data/faqs", "icons", "core"]) {
  vm.runInContext(fs.readFileSync(path.join(PUB, "js", f + ".js"), "utf8"), ctx);
}
const LL = ctx.LL;
const S = LL.site, I = LL.icons;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const abs = (p) => S.url + p;
const money = (n) => "£" + n.toLocaleString("en-GB");

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */
const CORE_JS = ["data/site", "data/cottages", "data/pricing", "data/bookings", "icons", "core", "ui"];
const NAV = [
  { href: "/cottages/", label: "Cottages", key: "cottages" },
  { href: "/explore/", label: "Explore", key: "explore" }
];
const DISCLAIMER = `Concept site by <a href="${S.concept.agencyUrl}">${S.concept.agency}</a>. ${esc(S.concept.text)}`;

function brand(tag = "a") {
  return `<a class="brand" href="/" aria-label="${esc(S.name)}, home">${I.lantern}<span>Larch &amp; Lantern<small>Cottages · Sherwood Forest</small></span></a>`;
}

function layout(p) {
  const title = p.title.includes("Larch & Lantern") ? p.title : `${p.title} | Larch & Lantern`;
  const jsonld = (p.jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n");
  const scripts = [...CORE_JS, ...(p.js || [])].map((s) => `<script src="/js/${s}.js" defer></script>`).join("\n");
  const og = p.ogImage || "/img/og-image.png";
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${abs(p.path)}">
<meta name="theme-color" content="#2f5d46">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Larch &amp; Lantern Cottages (concept)">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${abs(p.path)}">
<meta property="og:image" content="${abs(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/dm-serif-display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/styles.css">
${p.noindex ? '<meta name="robots" content="noindex">' : ""}
${jsonld}
</head>
<body${p.bodyClass ? ` class="${p.bodyClass}"` : ""}>
<a class="skip" href="#main">Skip to content</a>
<div class="concept-bar" role="note"><div class="wrap">${DISCLAIMER}</div></div>
<header class="site-header">
  <div class="wrap header-in">
    ${brand()}
    <nav class="nav" aria-label="Main">
      ${NAV.map((n) => `<a href="${n.href}"${p.nav === n.key ? ' aria-current="page"' : ""}>${n.label}</a>`).join("\n      ")}
      <a class="btn btn-amber btn-sm" href="/book/"${p.nav === "book" ? ' aria-current="page"' : ""}>Book</a>
    </nav>
  </div>
</header>
<main id="main">
${p.body}
</main>
${footer()}
${scripts}
</body>
</html>
`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        ${brand()}
        <p>Three self-catering cottages on the edge of Sherwood Forest, near Worksop, run by ${esc(S.owners)}.</p>
        <p class="mb-0"><a href="tel:${S.phoneHref}">${S.phone}</a><br><a href="mailto:${S.email}">${S.email}</a></p>
      </div>
      <div>
        <h2>Stay</h2>
        <ul>
          ${LL.cottages.map((c) => `<li><a href="/cottages/${c.slug}/">${esc(c.name)}</a></li>`).join("\n          ")}
          <li><a href="/offers/">Offers &amp; late availability</a></li>
          <li><a href="/book/">Book direct</a></li>
        </ul>
      </div>
      <div>
        <h2>Plan</h2>
        <ul>
          <li><a href="/explore/">Explore Sherwood</a></li>
          <li><a href="/why-book-direct/">Why book direct</a></li>
          <li><a href="/faqs/">FAQs &amp; house rules</a></li>
          <li><a href="/contact/">Contact &amp; directions</a></li>
        </ul>
      </div>
      <div>
        <h2>Your stay</h2>
        <ul>
          <li><a href="/my-bookings/">My bookings &amp; saved</a></li>
          <li><a href="/owner/" class="owner-link">Owner login (demo)</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <p class="mb-0">${DISCLAIMER}</p>
      <p class="mb-0">Illustrations are original artwork for this concept. Local attractions are real places; Larch &amp; Lantern has no connection with them.</p>
    </div>
  </div>
</footer>`;
}

function crumbs(items) {
  return `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${items
    .map((it, i) => (i === items.length - 1 ? `<li><span aria-current="page">${esc(it.name)}</span></li>` : `<li><a href="${it.path}">${esc(it.name)}</a></li>`))
    .join("")}</ol></nav>`;
}
function crumbLd(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })) };
}
const HOME_CRUMB = { name: "Home", path: "/" };

const businessLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": abs("/#business"),
  name: S.name + " (concept)",
  description: "A fictional collection of three self-catering holiday cottages on the edge of Sherwood Forest, created as a concept website by SiteSync Solutions. Not a real business.",
  url: abs("/"),
  telephone: S.phone,
  email: S.email,
  image: abs("/img/og-image.png"),
  logo: abs("/apple-touch-icon.png"),
  address: { "@type": "PostalAddress", streetAddress: S.address.street, addressLocality: "Worksop", addressRegion: S.address.region, addressCountry: S.address.country },
  areaServed: [{ "@type": "Place", name: "Sherwood Forest" }, { "@type": "Place", name: "Worksop" }, { "@type": "AdministrativeArea", name: "Nottinghamshire" }],
  checkinTime: "16:00",
  checkoutTime: "10:00",
  petsAllowed: true,
  priceRange: "££",
  currenciesAccepted: "GBP"
};

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */
function img(src, alt, w = 800, h = 600, eager = false, cls = "") {
  return `<img src="${src}" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${cls ? ` class="${cls}"` : ""}>`;
}
const heart = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-9-9.5A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 9 4.5C19.5 15.4 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;

function cottageCard(c, headingLevel = 3) {
  const h = `h${headingLevel}`;
  return `<article class="card reveal">
  <div class="card-media">
    <a href="/cottages/${c.slug}/" tabindex="-1" aria-hidden="true">${img(c.gallery[0].src, c.gallery[0].alt)}</a>
    <button class="save-btn" type="button" data-save="${c.id}" aria-pressed="false" aria-label="Save ${esc(c.name)} to your saved cottages">${heart}</button>
  </div>
  <div class="card-body">
    <${h}><a href="/cottages/${c.slug}/">${esc(c.name)}</a></${h}>
    <p class="mb-0 muted">${esc(c.short)}</p>
    <div class="meta"><span>Sleeps ${c.sleeps}</span><span>${esc(c.bedroomsLabel)}</span><span>${c.maxDogs ? (c.maxDogs === 1 ? "1 dog welcome" : `Up to ${c.maxDogs} dogs`) : "No pets"}</span></div>
    <ul class="chips" aria-label="Highlights">${c.highlights.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <div class="from"><span><span class="muted small">From</span> <strong class="price-big" data-from="${c.id}">${money(LL.fromPrice(c.id))}</strong> <span class="muted small">a night</span></span><a class="btn btn-ghost btn-sm" href="/cottages/${c.slug}/#availability">See dates<span class="sr-only"> for ${esc(c.name)}</span></a></div>
  </div>
</article>`;
}

function floorPlan(c) {
  const f = c.floorPlan, pad = 10;
  const rooms = f.rooms.map((r) => {
    const x = r.x + pad, y = r.y + pad;
    return `<g><rect x="${x}" y="${y}" width="${r.w}" height="${r.h}" fill="${r.outside ? "#e3ece6" : "#fffdf8"}" stroke="#2f5d46" stroke-width="${r.outside ? 1.5 : 3}" ${r.outside ? 'stroke-dasharray="6 5"' : ""}/>
<text x="${x + r.w / 2}" y="${y + r.h / 2 + 5}" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" fill="#1f2a22">${esc(r.label)}</text></g>`;
  }).join("");
  const div = f.divider ? `<line x1="${f.divider.x + pad}" y1="4" x2="${f.divider.x + pad}" y2="${f.height + pad + 6}" stroke="#4d5a51" stroke-dasharray="3 4"/><text x="${pad}" y="${f.height + pad + 22}" font-family="Inter, sans-serif" font-size="12" fill="#4d5a51">${f.divider.labelLeft} floor</text><text x="${f.divider.x + pad + 12}" y="${f.height + pad + 22}" font-family="Inter, sans-serif" font-size="12" fill="#4d5a51">${f.divider.labelRight} floor</text>` : "";
  const H = f.height + pad * 2 + (f.divider ? 18 : 0);
  return `<figure class="floorplan mt-0"><svg viewBox="0 0 ${f.width + pad * 2} ${H}" role="img" aria-labelledby="fp-${c.id}"><title id="fp-${c.id}">Floor plan of ${esc(c.name)}: ${esc(f.rooms.map((r) => r.label).join(", "))}</title>${rooms}${div}</svg><figcaption class="illus-note">${esc(f.title)}. Simplified, not to scale.</figcaption></figure>`;
}

function areaMap(highlight, opts = {}) {
  const G = LL.guide, cm = G.cottagesOnMap;
  const places = G.places.map((p) => {
    const on = !highlight || highlight === p.id;
    const lx = p.mapPos.x + (p.id === "creswell" ? 0 : 14), anchor = p.id === "creswell" ? "middle" : "start", ly = p.id === "creswell" ? p.mapPos.y + 30 : p.mapPos.y + 5;
    const short = { sherwood: "Sherwood Forest & Major Oak", clumber: "Clumber Park", creswell: "Creswell Crags", rufford: "Rufford Abbey", worksop: "Worksop" }[p.id];
    return `<g opacity="${on ? 1 : 0.55}"><circle cx="${p.mapPos.x}" cy="${p.mapPos.y}" r="8" fill="#2f5d46" stroke="#fff" stroke-width="3"/><text x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="Inter, sans-serif" font-size="15" font-weight="600" fill="#1f2a22" paint-order="stroke" stroke="#f5f1e8" stroke-width="5">${short}</text></g>`;
  }).join("");
  return `<figure class="map-wrap mt-0"><svg viewBox="0 0 600 460" role="img" aria-labelledby="map-t-${opts.id || "x"}"><title id="map-t-${opts.id || "x"}">Illustrated map showing the cottages' approximate location on the edge of Sherwood Forest, south of Worksop, with Clumber Park, Creswell Crags, Sherwood Forest and Rufford Abbey nearby</title>
<rect width="600" height="460" fill="#efe9db"/>
<path d="M0 0h600v460H0z" fill="url(#mapdots)"/>
<defs><pattern id="mapdots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#d9d0bd"/></pattern>
<pattern id="trees" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="5" fill="#9cb8a3"/></pattern></defs>
<path d="M250 260c30-40 110-50 150-20s40 100 20 150-90 70-140 50-60-140-30-180z" fill="#b9cfbe"/><path d="M250 260c30-40 110-50 150-20s40 100 20 150-90 70-140 50-60-140-30-180z" fill="url(#trees)" opacity=".7"/>
<path d="M290 120c40-20 100-10 110 30s-20 70-60 70-80-20-80-50 10-40 30-50z" fill="#c4d6c8"/><path d="M290 120c40-20 100-10 110 30s-20 70-60 70-80-20-80-50 10-40 30-50z" fill="url(#trees)" opacity=".55"/>
<path d="M300 160c20 6 40 2 62 10" stroke="#8fb3c9" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M100 190c20-10 40-12 60 0" stroke="#8fb3c9" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M360 400c14-6 28-6 40 2" stroke="#8fb3c9" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M20 70C120 90 200 92 260 90s200 0 320-20" stroke="#fff" stroke-width="7" fill="none"/><path d="M20 70C120 90 200 92 260 90s200 0 320-20" stroke="#d9c79e" stroke-width="3" fill="none"/>
<path d="M430 20c-20 120-60 200-90 270s-40 120-50 170" stroke="#fff" stroke-width="7" fill="none"/><path d="M430 20c-20 120-60 200-90 270s-40 120-50 170" stroke="#d9c79e" stroke-width="3" fill="none"/>
<path d="M250 95c20 60 60 110 78 150s-10 60-6 75" stroke="#fff" stroke-width="5" fill="none"/>
<path d="M140 180c50 10 120 40 188 68" stroke="#fff" stroke-width="5" fill="none"/>
${places}
<g><circle cx="${cm.x}" cy="${cm.y}" r="30" fill="#d9993b" opacity=".22"/><circle cx="${cm.x}" cy="${cm.y}" r="13" fill="#d9993b" stroke="#1f2a22" stroke-width="2.5"/><text x="${cm.x - 20}" y="${cm.y + 4}" text-anchor="end" font-family="Inter, sans-serif" font-size="15" font-weight="700" fill="#1f2a22" paint-order="stroke" stroke="#f5f1e8" stroke-width="5">Larch &amp; Lantern (approx.)</text></g>
<g font-family="Inter, sans-serif" font-size="12" fill="#4d5a51"><path d="M560 30v30M552 40l8-10 8 10" stroke="#4d5a51" stroke-width="2" fill="none"/><text x="560" y="76" text-anchor="middle">N</text></g>
</svg><figcaption class="illus-note">Illustrated map, not to scale. Locations are approximate; we send exact directions when you book.</figcaption></figure>`;
}

function heroArt() {
  // Layered woodland at dawn: drifting mist and a glowing lantern (scroll-linked).
  const trees = (n, y0, h0, col, seed, spread = 1) => {
    let s = seed, out = "";
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < n; i++) {
      const x = (i / n) * 1600 + r() * 60 * spread;
      const h = h0 * (0.75 + r() * 0.5), w = h * (0.22 + r() * 0.08);
      out += `<path d="M${x.toFixed(0)} ${y0}l${(w / 2).toFixed(0)} -${h.toFixed(0)} ${(w / 2).toFixed(0)} ${h.toFixed(0)}z"/>`;
    }
    return `<g fill="${col}">${out}</g>`;
  };
  const oaks = (n, y0, col, seed) => {
    let s = seed, out = "";
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < n; i++) {
      const x = (i / n) * 1600 + r() * 90, rr = 70 + r() * 60;
      out += `<rect x="${(x - 8).toFixed(0)}" y="${(y0 - rr * 0.6).toFixed(0)}" width="16" height="${(rr * 0.9).toFixed(0)}"/><circle cx="${x.toFixed(0)}" cy="${(y0 - rr).toFixed(0)}" r="${rr.toFixed(0)}"/><circle cx="${(x - rr * 0.7).toFixed(0)}" cy="${(y0 - rr * 0.6).toFixed(0)}" r="${(rr * 0.6).toFixed(0)}"/><circle cx="${(x + rr * 0.7).toFixed(0)}" cy="${(y0 - rr * 0.65).toFixed(0)}" r="${(rr * 0.62).toFixed(0)}"/>`;
    }
    return `<g fill="${col}">${out}</g>`;
  };
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b5a52"/><stop offset=".45" stop-color="#9fb2a0"/><stop offset=".7" stop-color="#e8d2a6"/><stop offset="1" stop-color="#f1dcb2"/></linearGradient>
<radialGradient id="hsun" cx=".68" cy=".52" r=".35"><stop offset="0" stop-color="#fff2cf" stop-opacity=".9"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient>
<linearGradient id="hmist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe0" stop-opacity="0"/><stop offset=".5" stop-color="#f6efe0" stop-opacity=".75"/><stop offset="1" stop-color="#f6efe0" stop-opacity="0"/></linearGradient>
<radialGradient id="hglow"><stop offset="0" stop-color="#ffd28a" stop-opacity=".95"/><stop offset=".35" stop-color="#d9993b" stop-opacity=".45"/><stop offset="1" stop-color="#d9993b" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1600" height="900" fill="url(#hsky)"/>
<rect width="1600" height="900" fill="url(#hsun)"/>
<g class="layer-far">${trees(46, 600, 200, "#7f998a", 7)}${oaks(9, 640, "#748f80", 3)}</g>
<g class="mist"><rect x="-200" y="470" width="2000" height="180" fill="url(#hmist)"/></g>
<g>${oaks(7, 760, "#4f6d5d", 11)}${trees(30, 760, 300, "#4a6858", 19, 2)}</g>
<g class="mist mist-2"><rect x="-200" y="600" width="2000" height="160" fill="url(#hmist)" opacity=".85"/></g>
<g class="cottage" transform="translate(980 600)">
  <path d="M0 150V70L110 0l110 70v80z" fill="#cdbb9b"/><path d="M-14 74L110-8l124 82" fill="none" stroke="#3a4a3f" stroke-width="18" stroke-linejoin="round"/>
  <rect x="160" y="-10" width="26" height="50" fill="#8c7a62"/><rect x="90" y="88" width="40" height="62" fill="#3a4a3f"/>
  <rect x="26" y="86" width="40" height="34" fill="#ffcf7a"/><rect x="154" y="86" width="40" height="34" fill="#ffcf7a"/>
  <path d="M26 103h40M46 86v34M154 103h40M174 86v34" stroke="#cdbb9b" stroke-width="3"/>
  <circle cx="46" cy="103" r="60" fill="url(#hglow)" opacity=".5"/><circle cx="174" cy="103" r="60" fill="url(#hglow)" opacity=".5"/>
</g>
<g class="layer-near">${oaks(5, 980, "#2c4337", 29)}<path d="M0 820c300-40 520-30 800-10s520 20 800-10v100H0z" fill="#2a3f33"/></g>
<g class="mist mist-3"><rect x="-200" y="740" width="2000" height="160" fill="url(#hmist)" opacity=".7"/></g>
<g transform="translate(1310 720)">
  <circle class="lantern-glow" cx="0" cy="40" r="150" fill="url(#hglow)"/>
  <path d="M0-30v22" stroke="#1d2a23" stroke-width="5"/><path d="M-22-8h44l-6-12h-32z" fill="#1d2a23"/>
  <rect x="-20" y="-8" width="40" height="62" rx="6" fill="#ffe3a8" stroke="#1d2a23" stroke-width="5"/>
  <path class="flicker" d="M0 6c4 7 9 10 9 18a9 9 0 0 1-18 0c0-5 3-8 5-11 1 3 3 4 4 3z" fill="#e8962e"/>
  <path d="M-26 54h52v8a4 4 0 0 1-4 4h-44a4 4 0 0 1-4-4z" fill="#1d2a23"/>
  <path d="M0 66v90" stroke="#1d2a23" stroke-width="6"/>
</g>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */
const pages = [];

// HOME ---------------------------------------------------------------
pages.push({
  file: "index.html", path: "/", nav: "home",
  title: "Larch & Lantern | Self-catering cottages on the edge of Sherwood Forest",
  description: "Three cosy self-catering cottages on the edge of Sherwood Forest, near Worksop. See live availability and the price for your dates, then book direct with no booking fees.",
  js: ["calendar", "pages/home"],
  jsonld: [businessLd],
  body: `
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-art">${heroArt()}</div>
  <div class="wrap hero-in">
    <span class="eyebrow">Three cottages · Sherwood Forest, Nottinghamshire</span>
    <h1 id="hero-title">${esc(S.tagline)}</h1>
    <p>Ancient oaks, morning mist and a log burner waiting. Three self-catering cottages for 2, 4 and 6, with dogs welcome in two of them. Book direct and pay no booking fees.</p>
    <div class="search-panel" id="search">
      <form class="search-form" id="search-form" data-demo novalidate>
        <div class="field"><label for="s-in">Check-in</label><input type="date" id="s-in" name="in" required></div>
        <div class="field"><label for="s-out">Check-out</label><input type="date" id="s-out" name="out" required></div>
        <div class="field"><label for="s-guests">Guests</label><select id="s-guests" name="guests">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}"${n === 2 ? " selected" : ""}>${n} ${n === 1 ? "guest" : "guests"}</option>`).join("")}</select></div>
        <div class="field"><label for="s-dogs">Dogs</label><select id="s-dogs" name="dogs"><option value="0">No dogs</option><option value="1">1 dog</option><option value="2">2 dogs</option></select></div>
        <div class="field field--btn"><button class="btn btn-amber" type="submit">Check availability</button></div>
      </form>
      <div id="search-out" aria-live="polite"></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="cottages-title">
  <div class="wrap">
    <div class="section-head"><div><span class="eyebrow">The cottages</span><h2 id="cottages-title">Three cottages, one quiet corner of the forest</h2></div><p class="muted">Each has its own parking, garden or patio and log burner. Fees are shown up front, always.</p></div>
    <div class="grid grid-3">${LL.cottages.map((c) => cottageCard(c)).join("\n")}</div>
  </div>
</section>

<section class="section section--white" aria-labelledby="why-title">
  <div class="wrap">
    <div class="split">
      <div>
        <span class="eyebrow">Why book direct</span>
        <h2 id="why-title">Book with us, not a middleman</h2>
        <p class="lead">When you book through a booking platform, guests usually pay a service fee and owners pay commission. Book here and neither of us does, so our best price is always on this site.</p>
        <ul class="ticks">
          <li><strong>No booking fees.</strong> The price you see is the price you pay.</li>
          <li><strong>Our best price.</strong> Lower than anywhere else we list.</li>
          <li><strong>Talk to the owners.</strong> Early check-in, a cot, a birthday cake: just ask.</li>
          <li><strong>A 25% deposit</strong> secures your dates; the balance is due 6 weeks before you arrive.</li>
        </ul>
        <p class="mt-1"><a class="btn btn-ghost" href="/why-book-direct/">See how much you save</a></p>
      </div>
      <div class="media-frame">${img("/img/hayloft-living.svg", "Illustration of a beamed cottage room with a glowing log burner", 800, 600)}</div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="offers-title">
  <div class="wrap">
    <div class="section-head"><div><span class="eyebrow">Late availability</span><h2 id="offers-title">Seasonal offers</h2></div><a href="/offers/">All offers</a></div>
    <div class="grid grid-3" id="home-offers"><p class="muted">Finding gaps in the calendar…</p></div>
  </div>
</section>

<section class="section section--tint" aria-labelledby="how-title">
  <div class="wrap">
    <span class="eyebrow">How booking works</span>
    <h2 id="how-title">Booked in three steps</h2>
    <ol class="steps-3 mt-1">
      <li><h3>Pick your dates</h3><p class="mb-0">The calendar shows what's free and the exact price for your dates, including cleaning and any dog fee.</p></li>
      <li><h3>Pay a deposit or in full</h3><p class="mb-0">Secure it with 25% now and the balance 6 weeks before you arrive, or pay it all at once.</p></li>
      <li><h3>Arrive and unwind</h3><p class="mb-0">We email directions and the key-safe code a week before. Check-in is from 4pm.</p></li>
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="explore-title">
  <div class="wrap">
    <div class="section-head"><div><span class="eyebrow">Explore</span><h2 id="explore-title">On the doorstep</h2></div><a href="/explore/">The full local guide</a></div>
    <div class="grid grid-3">
      ${LL.guide.places.slice(0, 3).map((p) => `<article class="card reveal"><div class="card-media">${img(p.image, p.imageAlt)}</div><div class="card-body"><h3><a href="/explore/#${p.id}">${esc(p.name)}</a></h3><p class="mb-0 muted">${esc(p.summary)}</p><p class="small mb-0"><strong>${esc(p.drive)}</strong> by car</p></div></article>`).join("\n      ")}
    </div>
  </div>
</section>`
});

// COTTAGES INDEX -----------------------------------------------------
const yes = (t) => `<span class="yes">${t}</span>`, no = (t) => `<span class="no">${t}</span>`;
pages.push({
  file: "cottages/index.html", path: "/cottages/", nav: "cottages",
  title: "Our cottages near Sherwood Forest: sleeps 2, 4 and 6",
  description: "Compare The Hayloft (sleeps 2), Keeper's Cottage (sleeps 4, dog-friendly) and The Old Granary (sleeps 6, hot tub). Self-catering cottages near Sherwood Forest.",
  jsonld: [crumbLd([HOME_CRUMB, { name: "Cottages", path: "/cottages/" }])],
  body: `${crumbs([HOME_CRUMB, { name: "Cottages", path: "/cottages/" }])}
<section class="wrap page-head"><span class="eyebrow">The cottages</span><h1>Find the right cottage</h1><p class="lead">Three converted farm buildings on the edge of the forest, a few steps apart but each with its own space. Here's how they compare.</p></section>
<section class="wrap"><div class="grid grid-3">${LL.cottages.map((c) => cottageCard(c, 2)).join("\n")}</div></section>
<section class="section"><div class="wrap">
  <h2>At a glance</h2>
  <div class="table-wrap"><table class="compare">
    <caption class="sr-only">Comparison of the three cottages</caption>
    <thead><tr><th scope="col">Feature</th>${LL.cottages.map((c) => `<th scope="col">${esc(c.name)}</th>`).join("")}</tr></thead>
    <tbody>
      <tr><th scope="row">Sleeps</th>${LL.cottages.map((c) => `<td>${c.sleeps}</td>`).join("")}</tr>
      <tr><th scope="row">Bedrooms</th>${LL.cottages.map((c) => `<td>${esc(c.bedroomsLabel)}</td>`).join("")}</tr>
      <tr><th scope="row">Dogs</th>${LL.cottages.map((c) => `<td>${c.maxDogs ? yes(c.maxDogs === 1 ? "1 dog" : `Up to ${c.maxDogs}`) : no("No pets")}</td>`).join("")}</tr>
      <tr><th scope="row">Hot tub</th>${LL.cottages.map((c) => `<td>${c.amenities.some((a) => a.icon === "hottub") ? yes("Private") : no("No")}</td>`).join("")}</tr>
      <tr><th scope="row">Ground-floor bedroom</th>${LL.cottages.map((c) => `<td>${c.id === "granary" ? yes("Yes") : no("No")}</td>`).join("")}</tr>
      <tr><th scope="row">EV charging</th>${LL.cottages.map((c) => `<td>${c.ev ? yes("Yes") : no("Bookable nearby")}</td>`).join("")}</tr>
      <tr><th scope="row">From (a night)</th>${LL.cottages.map((c) => `<td><strong data-from="${c.id}">${money(LL.fromPrice(c.id))}</strong></td>`).join("")}</tr>
    </tbody>
  </table></div>
</div></section>`
});

// COTTAGE PAGES ------------------------------------------------------
for (const c of LL.cottages) {
  const path_ = `/cottages/${c.slug}/`;
  const cr = [HOME_CRUMB, { name: "Cottages", path: "/cottages/" }, { name: c.name, path: path_ }];
  const amenityLd = c.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.label, value: true }));
  const rentalLd = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "@id": abs(path_ + "#rental"),
    name: c.name + " (concept)",
    description: c.metaDescription,
    url: abs(path_),
    image: c.gallery.map((g) => abs(g.src)),
    identifier: "larch-lantern-" + c.id,
    containedInPlace: { "@id": abs("/#business") },
    address: businessLd.address,
    checkinTime: "16:00",
    checkoutTime: "10:00",
    containsPlace: {
      "@type": "Accommodation",
      additionalType: "EntirePlace",
      name: c.name,
      occupancy: { "@type": "QuantitativeValue", maxValue: c.sleeps },
      numberOfBedrooms: c.bedrooms,
      numberOfBathroomsTotal: c.bathrooms,
      amenityFeature: amenityLd,
      petsAllowed: c.maxDogs > 0
    }
  };
  const details = [
    ["Sleeps", `${c.sleeps} guests`],
    ["Bedrooms and beds", `${c.bedroomsLabel}: ${c.beds}`],
    ["Bathrooms", c.bathroomsLabel],
    ["Pets", c.petsPolicy],
    ["Parking", c.parking],
    ["Wifi", c.wifi],
    ["EV charging", (c.ev ? "Yes. " : "No. ") + c.evNote],
    ["Accessibility", c.accessibility],
    ["Check-in and out", `Check-in from ${S.checkIn}, check-out by ${S.checkOut}`]
  ];
  const others = LL.cottages.filter((o) => o.id !== c.id);
  pages.push({
    file: `cottages/${c.slug}/index.html`, path: path_, nav: "cottages",
    title: c.seoTitle, description: c.metaDescription,
    ogImage: `/img/og-${c.id}.png`,
    bodyClass: "has-sticky",
    js: ["calendar", "pages/cottage"],
    jsonld: [rentalLd, crumbLd(cr)],
    body: `${crumbs(cr)}
<div class="wrap" data-cottage="${c.id}">
  <div class="page-head" style="padding-bottom:1.25rem">
    <div class="flex" style="justify-content:space-between;align-items:flex-end">
      <div><span class="eyebrow">Sleeps ${c.sleeps} · ${esc(c.bedroomsLabel)}</span><h1 class="mb-0">${esc(c.name)}</h1><p class="lead mt-1 mb-0">${esc(c.short)}</p></div>
      <button class="btn btn-plain btn-sm" type="button" data-save="${c.id}" aria-pressed="false">${heart}<span>Save</span></button>
    </div>
  </div>
  <div class="gallery" data-lightbox>
    ${c.gallery.map((g, i) => `<button type="button" data-full="${g.src}" data-caption="${esc(g.alt)}" aria-label="${i === 0 ? `${c.gallery.length} illustrations. ` : ""}Open image ${i + 1} of ${c.gallery.length}: ${esc(g.alt)}">${img(g.src, "", 1200, 800, i === 0)}${i === 0 ? `<span class="count" aria-hidden="true">${c.gallery.length} illustrations</span>` : ""}</button>`).join("\n    ")}
  </div>

  <div class="cottage-layout">
    <div>
      <ul class="facts" aria-label="Key facts">
        <li><strong>${c.sleeps}</strong><span>guests</span></li>
        <li><strong>${c.bedrooms}</strong><span>${c.bedrooms === 1 ? "bedroom (studio)" : "bedrooms"}</span></li>
        <li><strong>${c.bathrooms}</strong><span>${c.bathrooms === 1 ? "bathroom" : "bathrooms"}</span></li>
        <li><strong>${c.maxDogs || "No"}</strong><span>${c.maxDogs === 1 ? "dog welcome" : c.maxDogs ? "dogs welcome" : "pets"}</span></li>
      </ul>

      <section class="block" aria-labelledby="about">
        <h2 id="about">About ${esc(c.name)}</h2>
        <p class="lead">${esc(c.intro)}</p>
        ${c.description.map((d) => `<p>${esc(d)}</p>`).join("\n        ")}
      </section>

      <section class="block" aria-labelledby="amen">
        <h2 id="amen">What's here</h2>
        <ul class="amenities">${c.amenities.map((a) => `<li>${I[a.icon] || I.leaf}<span>${esc(a.label)}</span></li>`).join("")}</ul>
      </section>

      <section class="block" id="availability" aria-labelledby="avail-h" tabindex="-1">
        <h2 id="avail-h">Availability and prices</h2>
        <p class="muted">Choose your check-in day, then your check-out day. Prices are per night for the whole cottage; cleaning${c.maxDogs ? " and dog fees are" : " is"} added clearly in the summary, with no booking fee.</p>
        <div class="panel"><div id="cal" data-cottage="${c.id}"></div><p class="season-key" id="season-key"></p></div>
      </section>

      <section class="block" aria-labelledby="ask">
        <h2 id="ask">Things guests always ask</h2>
        <div class="acc">${c.guestsAsk.map((x) => `<details><summary>${esc(x.q)}</summary><div><p class="mb-0">${esc(x.a)}</p></div></details>`).join("")}</div>
      </section>

      <section class="block" aria-labelledby="fp">
        <h2 id="fp">Floor plan</h2>
        ${floorPlan(c)}
      </section>

      <section class="block" aria-labelledby="details">
        <h2 id="details">The details</h2>
        <table class="detail-table"><caption class="sr-only">${esc(c.name)} details</caption><tbody>${details.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
        <h3 class="mt-2">Good to know</h3>
        <ul class="ticks">${c.goodToKnow.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
      </section>

      <section class="block" aria-labelledby="loc">
        <h2 id="loc">Location</h2>
        <p>On the edge of Sherwood Forest, about 15 minutes' drive south of Worksop. Clumber Park is around 10 minutes away and the Major Oak about 15. We'll send exact directions when you book.</p>
        ${areaMap(null, { id: c.id })}
        <p class="mt-1"><a href="/explore/">Explore the local guide</a></p>
      </section>

      <section class="block" aria-labelledby="rules">
        <h2 id="rules">House rules and cancellation</h2>
        <div class="grid grid-2">
          <div><h3>House rules</h3><ul class="ticks">${c.houseRules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
          <div><h3>Cancellation policy</h3><p>${esc(S.cancellation.summary)}</p><p class="mb-0">Pay a ${S.depositPercent}% deposit to book, with the balance due 6 weeks before arrival, or pay in full. <a href="/faqs/">All FAQs</a></p></div>
        </div>
      </section>
    </div>

    <aside class="booking-aside" aria-labelledby="sum-h">
      <div class="panel" id="summary">
        <h2 id="sum-h">Your stay</h2>
        <p class="muted small mb-0">From <strong data-from="${c.id}">${money(LL.fromPrice(c.id))}</strong> a night · no booking fee</p>
        <div class="mt-1" id="sum-body"><noscript><p>Turn on JavaScript to see live availability, or call us on ${S.phone}.</p></noscript></div>
      </div>
    </aside>
  </div>

  <section class="section" aria-labelledby="more-h">
    <h2 id="more-h">You might also like</h2>
    <div class="grid grid-2">${others.map((o) => cottageCard(o)).join("")}</div>
  </section>
</div>
<div class="sticky-dates" id="sticky-dates" aria-hidden="true">
  <div><span class="from" id="sticky-from">From ${money(LL.fromPrice(c.id))} a night</span><strong id="sticky-label">${esc(c.name)}</strong></div>
  <a class="btn btn-amber" href="#availability" id="sticky-btn" tabindex="-1">Check dates</a>
</div>`
  });
}

// BOOK ----------------------------------------------------------------
pages.push({
  file: "book/index.html", path: "/book/", nav: "book",
  title: "Book direct (demo)",
  description: "Book a Larch & Lantern cottage direct: choose dates, add extras and pay a 25% deposit or in full. This is a demo: no payment is taken.",
  js: ["calendar", "pages/book"],
  jsonld: [crumbLd([HOME_CRUMB, { name: "Book direct", path: "/book/" }])],
  body: `${crumbs([HOME_CRUMB, { name: "Book direct", path: "/book/" }])}
<section class="wrap page-head" style="padding-bottom:1rem"><span class="eyebrow">Book direct · no booking fees</span><h1>Book your stay</h1>
<p class="notice notice--demo"><strong>Demo booking.</strong> ${DISCLAIMER} Bookings you make here are saved only in this browser.</p></section>
<section class="wrap" style="padding-bottom:4rem"><div id="book-app"><noscript><p>The booking demo needs JavaScript. You can call us on ${S.phone} instead.</p></noscript></div></section>`
});

// MY BOOKINGS ---------------------------------------------------------
pages.push({
  file: "my-bookings/index.html", path: "/my-bookings/", nav: "",
  title: "My bookings and saved cottages (demo)",
  description: "See demo bookings you've made on this concept site, cancel them according to the policy, and view your saved cottages. Stored only in your browser.",
  sitemap: false,
  js: ["pages/my-bookings"],
  jsonld: [crumbLd([HOME_CRUMB, { name: "My bookings", path: "/my-bookings/" }])],
  body: `${crumbs([HOME_CRUMB, { name: "My bookings", path: "/my-bookings/" }])}
<section class="wrap page-head"><span class="eyebrow">Demo</span><h1>My bookings</h1><p class="lead">Demo bookings made in this browser appear here. They're stored on your device only and never sent anywhere.</p></section>
<section class="wrap" style="padding-bottom:2rem"><div id="mb-list" class="grid" aria-live="polite"></div></section>
<section class="section section--tint"><div class="wrap"><h2>Saved cottages</h2><div id="mb-saved" class="grid grid-3"></div></div></section>`
});

// WHY BOOK DIRECT -----------------------------------------------------
pages.push({
  file: "why-book-direct/index.html", path: "/why-book-direct/", nav: "",
  title: "Why book direct: no booking fees, our best price",
  description: "Booking your Sherwood Forest cottage direct means no booking fees, our best price and talking to the owners. Try the illustrative savings calculator.",
  js: ["pages/why"],
  jsonld: [crumbLd([HOME_CRUMB, { name: "Why book direct", path: "/why-book-direct/" }])],
  body: `${crumbs([HOME_CRUMB, { name: "Why book direct", path: "/why-book-direct/" }])}
<section class="wrap page-head"><span class="eyebrow">Why book direct</span><h1>Book direct, keep it simple</h1><p class="lead">We list on booking platforms too, because that's how many people find us. But booking here is better for you and for us. Here's an honest comparison.</p></section>
<section class="wrap"><div class="table-wrap"><table class="compare">
  <caption class="sr-only">Booking direct compared with booking through a booking platform</caption>
  <thead><tr><th scope="col"></th><th scope="col">Book direct with us</th><th scope="col">Via a booking platform</th></tr></thead>
  <tbody>
    <tr><th scope="row">Booking fees</th><td>${yes("None. The price you see is the total.")}</td><td>${no("Guest service fees are often added")}</td></tr>
    <tr><th scope="row">Price</th><td>${yes("Our best price, always")}</td><td>${no("Usually higher, to cover commission")}</td></tr>
    <tr><th scope="row">Talk to the owners</th><td>${yes("Call or email us before and during your stay")}</td><td>${no("Messages go through the platform")}</td></tr>
    <tr><th scope="row">Flexible requests</th><td>${yes("Early check-in, late check-out, a cot, a cake: just ask")}</td><td>${no("Harder to arrange extras")}</td></tr>
    <tr><th scope="row">Paying</th><td>${yes("25% deposit, balance 6 weeks before")}</td><td>${no("Depends on the platform's rules")}</td></tr>
    <tr><th scope="row">Changing dates</th><td>${yes("Move your stay once, free of charge")}</td><td>${no("Depends on the platform's policy")}</td></tr>
    <tr><th scope="row">Reviews and protection</th><td>${no("You're trusting us directly")}</td><td>${yes("Platform reviews and support")}</td></tr>
  </tbody>
</table></div>
<p class="small muted mt-1">We've tried to be fair: booking platforms do offer reviews and support, and they're a great way to discover places. Fees and policies vary by platform.</p></section>
<section class="section"><div class="wrap">
  <span class="eyebrow">Illustrative calculator</span>
  <h2>What booking direct saves</h2>
  <p class="lead">Change the numbers to see what a guest might save and what an owner keeps. <strong>Example only — fees vary by platform.</strong></p>
  <div class="calc mt-1">
    <form class="panel" id="calc" data-demo>
      <div class="field"><label for="c-rate">Nightly rate (£)</label><input type="number" id="c-rate" min="20" max="2000" step="5" value="150" inputmode="numeric"></div>
      <div class="field"><label for="c-nights">Nights</label><input type="number" id="c-nights" min="1" max="28" value="4" inputmode="numeric"></div>
      <div class="field"><label for="c-guestfee">Guest service fee on a platform (%)</label><input type="number" id="c-guestfee" min="0" max="30" step="0.5" value="14" inputmode="decimal"><span class="hint">Example — fees vary by platform. Some charge guests nothing and owners more.</span></div>
      <div class="field mb-0"><label for="c-hostfee">Owner commission on a platform (%)</label><input type="number" id="c-hostfee" min="0" max="30" step="0.5" value="15" inputmode="decimal"><span class="hint">Example — fees vary by platform.</span></div>
    </form>
    <div class="calc-out" aria-live="polite" id="calc-out"></div>
  </div>
</div></section>
<section class="section section--white"><div class="wrap center narrow"><h2>Ready to pick your dates?</h2><p class="lead" style="margin-inline:auto">See live availability and your exact price, with every fee shown up front.</p><a class="btn btn-amber" href="/book/">Check availability</a></div></section>`
});

// EXPLORE -------------------------------------------------------------
const G = LL.guide;
pages.push({
  file: "explore/index.html", path: "/explore/", nav: "explore",
  title: "Explore Sherwood Forest, Clumber Park and the Dukeries",
  description: "A plain-English local guide to Sherwood Forest and the Major Oak, Clumber Park, Creswell Crags, Rufford Abbey and Worksop, with drive times, dog tips, walks and rainy-day ideas.",
  jsonld: [crumbLd([HOME_CRUMB, { name: "Explore", path: "/explore/" }])],
  body: `${crumbs([HOME_CRUMB, { name: "Explore", path: "/explore/" }])}
<section class="wrap page-head"><span class="eyebrow">Local guide</span><h1>Explore Sherwood and the Dukeries</h1><p class="lead">Our favourite places nearby, with honest notes on drive times and dogs. Opening times and prices change, so we link to each place's official website rather than listing them here.</p></section>
<section class="wrap"><div class="split" style="align-items:start">${areaMap(null, { id: "explore" })}<div><h2>At a glance</h2><table class="detail-table"><caption class="sr-only">Approximate drive times from the cottages</caption><tbody>${G.places.map((p) => `<tr><th scope="row"><a href="#${p.id}">${esc(p.name)}</a></th><td>${esc(p.drive)}</td></tr>`).join("")}<tr><th scope="row">Sherwood Pines</th><td>About 20 minutes</td></tr><tr><th scope="row">Nottingham</th><td>About 45 minutes</td></tr></tbody></table><p class="small muted mt-1">Drive times are approximate and from the cottages, which are on the edge of Sherwood Forest near Worksop.</p></div></div></section>
<section class="wrap section" style="padding-top:2rem">
  ${G.places.map((p) => `<article class="place" id="${p.id}" aria-labelledby="${p.id}-h">
    <div><div class="media-frame">${img(p.image, p.imageAlt)}</div><p class="illus-note">Illustration${p.id === "clumber" || p.id === "sherwood" ? " (illustrative, not an exact depiction)" : ""}</p></div>
    <div>
      <span class="eyebrow">${esc(p.kind)}</span>
      <h2 id="${p.id}-h">${esc(p.name)}</h2>
      <ul class="place-facts"><li>${I.car}<span>${esc(p.drive)} by car</span></li><li>${I.dog}<span>${esc(p.dogs.split(".")[0])}</span></li></ul>
      ${p.body.map((b) => `<p>${esc(b)}</p>`).join("")}
      <p><strong>Dogs:</strong> ${esc(p.dogs)}</p>
      <p class="tip">${esc(p.tip)}</p>
      <p class="mb-0">${p.links.map((l) => `<a href="${l.url}" rel="noopener">${esc(l.label)}</a>`).join("<br>")}</p>
    </div>
  </article>`).join("\n  ")}
</section>
<section class="section section--tint"><div class="wrap">
  <h2>Walking and cycling</h2>
  <div class="grid grid-3 mt-1">${G.routes.map((r) => `<div class="route"><span class="tag">${esc(r.type)}</span><h3 class="mt-0">${esc(r.title)}</h3><p class="small muted">${esc(r.distance)}</p><p class="mb-0">${esc(r.detail)}${r.url ? ` <a href="${r.url}" rel="noopener">Official site</a>` : ""}</p></div>`).join("")}</div>
</div></section>
<section class="section"><div class="wrap grid grid-2">
  <div><h2>Rainy-day ideas</h2><ul class="ticks">${G.rainyDay.map((r) => `<li><strong>${esc(r.title)}.</strong> ${esc(r.detail)}</li>`).join("")}</ul></div>
  <div><h2>Food and drink</h2><p class="muted">We'd rather tell you our current favourites in person, so here's the lie of the land:</p><ul class="ticks">${G.food.map((r) => `<li><strong>${esc(r.title)}.</strong> ${esc(r.detail)}</li>`).join("")}</ul></div>
</div></section>
<section class="section section--white"><div class="wrap narrow"><p class="small muted mb-0">Larch &amp; Lantern is a fictional concept business and has no partnership with the National Trust, RSPB, English Heritage, Forestry England, Nottinghamshire County Council or any attraction mentioned. Always check official websites before you travel.</p></div></section>`
});

// OFFERS --------------------------------------------------------------
pages.push({
  file: "offers/index.html", path: "/offers/", nav: "",
  title: "Cottage offers and late availability near Sherwood Forest",
  description: "Late-availability deals and midweek short breaks at our Sherwood Forest cottages, generated from real gaps in the calendar. Book direct with no booking fees.",
  js: ["pages/offers"],
  jsonld: [crumbLd([HOME_CRUMB, { name: "Offers", path: "/offers/" }])],
  body: `${crumbs([HOME_CRUMB, { name: "Offers", path: "/offers/" }])}
<section class="wrap page-head"><span class="eyebrow">Offers</span><h1>Late availability and short breaks</h1><p class="lead">These deals come straight from gaps in our calendars, so they change as dates are booked. Each one opens the booking page with the dates already chosen.</p></section>
<section class="wrap"><div class="grid grid-2">${LL.pricing.offers.map((o) => `<div class="feature"><div class="icon">${I.tag}</div><h2 class="h3" style="font-size:1.35rem">${esc(o.title)}</h2><p class="mb-0">${esc(o.description)} Applied automatically when your dates match; offers don't combine.</p></div>`).join("")}</div></section>
<section class="section"><div class="wrap"><h2>Available now</h2><div id="offers-list" class="grid grid-2 mt-1" aria-live="polite"><p class="muted">Finding gaps in the calendar…</p></div></div></section>`
});

// FAQS ----------------------------------------------------------------
const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: LL.faqs.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))) };
pages.push({
  file: "faqs/index.html", path: "/faqs/", nav: "",
  title: "FAQs and house rules",
  description: "Check-in and keys, dogs, the hot tub, cleaning, linen, cots, accessibility, EV charging, deposits and cancellation at Larch & Lantern Cottages.",
  jsonld: [faqLd, crumbLd([HOME_CRUMB, { name: "FAQs", path: "/faqs/" }])],
  body: `${crumbs([HOME_CRUMB, { name: "FAQs", path: "/faqs/" }])}
<section class="wrap page-head"><span class="eyebrow">FAQs and house rules</span><h1>Good to know</h1><p class="lead">Everything guests usually ask before they book. Can't find it? <a href="/contact/">Get in touch</a>.</p></section>
<section class="wrap narrow" style="padding-bottom:4rem">
  ${LL.faqs.map((g) => `<h2 class="mt-2">${esc(g.group)}</h2><div class="acc">${g.items.map((i) => `<details><summary>${esc(i.q)}</summary><div><p class="mb-0">${esc(i.a)}</p></div></details>`).join("")}</div>`).join("\n  ")}
  <h2 class="mt-2">House rules for every cottage</h2>
  <ul class="ticks"><li>Check-in from ${S.checkIn}, check-out by ${S.checkOut}</li><li>No smoking or vaping inside</li><li>No parties or events</li><li>Dogs only where stated, never left alone in the cottage</li><li>Please respect quiet after 11pm: sound carries in the forest</li></ul>
</section>`
});

// CONTACT -------------------------------------------------------------
pages.push({
  file: "contact/index.html", path: "/contact/", nav: "",
  title: "Contact us and directions",
  description: "Call, email or send the Larch & Lantern owners a message (demo). Directions to our cottages on the edge of Sherwood Forest, near Worksop.",
  js: ["pages/contact"],
  jsonld: [crumbLd([HOME_CRUMB, { name: "Contact", path: "/contact/" }])],
  body: `${crumbs([HOME_CRUMB, { name: "Contact", path: "/contact/" }])}
<section class="wrap page-head"><span class="eyebrow">Contact</span><h1>Talk to the owners</h1><p class="lead">We're ${esc(S.owners)}, and we live on site. Ask us anything, from whether your dog will fit through the garden gate to where to find the best bluebells.</p></section>
<section class="wrap" style="padding-bottom:4rem"><div class="split" style="align-items:start">
  <div>
    <form class="panel" id="contact-form" data-demo novalidate>
      <p class="notice notice--demo small"><strong>Demo form.</strong> Nothing is sent, and what you type isn't stored.</p>
      <div id="contact-errors"></div>
      <div class="field"><label for="cf-name">Your name</label><input type="text" id="cf-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="cf-email">Email</label><input type="email" id="cf-email" name="email" autocomplete="email" required></div>
      <div class="field"><label for="cf-about">What's it about?</label><select id="cf-about" name="about"><option>A question before booking</option><option>An existing booking</option><option>Accessibility</option><option>Something else</option></select></div>
      <div class="field"><label for="cf-msg">Message</label><textarea id="cf-msg" name="message" required></textarea></div>
      <button class="btn btn-forest" type="submit">Send message (demo)</button>
      <p class="cal-msg" id="contact-status" role="status" aria-live="polite"></p>
    </form>
  </div>
  <div>
    <h2>Call or email</h2>
    <p><strong>Phone:</strong> <a href="tel:${S.phoneHref}">${S.phone}</a><br><strong>Email:</strong> <a href="mailto:${S.email}">${S.email}</a></p>
    <h3>Best time to call</h3>
    <p>${esc(S.bestTimeToCall)}</p>
    <h3>Finding us</h3>
    <p>We're on the edge of Sherwood Forest, about 15 minutes' drive south of Worksop. Worksop is the nearest railway station; we can recommend local taxis.</p>
    <p>We send exact directions, what3words and the key-safe code a week before you arrive. Sat navs can lead you up a farm track, so please follow our directions for the last mile.</p>
    ${areaMap(null, { id: "contact" })}
    <p class="small muted mt-1">Address (fictional): ${esc(S.address.street)}, ${esc(S.address.locality)}, ${esc(S.address.region)}.</p>
  </div>
</div></section>`
});

// OWNER -------------------------------------------------------------
pages.push({
  file: "owner/index.html", path: "/owner/", nav: "",
  title: "Owner dashboard (demo)",
  description: "Demo owner dashboard for Larch & Lantern: block dates, manage bookings, edit seasonal prices and export iCal calendar feeds.",
  sitemap: false,
  js: ["calendar", "pages/owner"],
  body: `<section class="wrap page-head"><span class="demo-flag">Demo</span><h1 class="mt-1">Owner dashboard</h1><p class="lead">This shows how the owners would run their calendar and prices. Changes save in this browser only and update the public site straight away.</p></section>
<section class="wrap" style="padding-bottom:4rem"><div id="owner-app"><noscript><p>The owner demo needs JavaScript.</p></noscript></div></section>`
});

// 404 -----------------------------------------------------------------
pages.push({
  file: "404.html", path: "/404.html", nav: "",
  title: "Lost in the forest (page not found)",
  description: "That page couldn't be found.",
  sitemap: false,
  body: `<section class="wrap err-page">
<svg viewBox="0 0 360 220" aria-hidden="true"><rect width="360" height="220" rx="16" fill="#e3ece6"/><g fill="#4f6d5d"><path d="M40 190l30-110 30 110z"/><path d="M260 190l35-130 35 130z"/><path d="M90 190l22-80 22 80z"/></g><path d="M0 190h360v30H0z" fill="#2a3f33"/><g transform="translate(180 120)"><circle r="60" fill="#d9993b" opacity=".25"/><path d="M0-36v12" stroke="#1d2a23" stroke-width="4"/><rect x="-14" y="-24" width="28" height="42" rx="5" fill="#ffe3a8" stroke="#1d2a23" stroke-width="4"/><path d="M0-12c3 5 6 7 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 2z" fill="#e8962e"/></g><text x="180" y="212" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#f5f1e8">404</text></svg>
<span class="eyebrow">Page not found</span>
<h1>You've wandered off the path</h1>
<p class="lead" style="margin-inline:auto">Even Robin Hood got lost in Sherwood sometimes. The page you're after has moved or never existed.</p>
<div class="flex" style="justify-content:center"><a class="btn btn-amber" href="/">Back to the cottages</a><a class="btn btn-ghost" href="/explore/">Explore the forest</a></div>
</section>`
});

/* ------------------------------------------------------------------ */
/* Write                                                               */
/* ------------------------------------------------------------------ */
for (const p of pages) {
  const out = path.join(PUB, p.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, layout(p));
}

const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter((p) => !p.noindex && p.sitemap !== false);
fs.writeFileSync(path.join(PUB, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(PUB, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${abs("/sitemap.xml")}
`);
console.log(`Built ${pages.length} pages.`);
