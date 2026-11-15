/*
 * Larch & Lantern core: dates, storage, pricing, availability, bookings, iCal.
 * Everything runs in the browser. Nothing is ever sent anywhere.
 */
(function (root) {
  "use strict";
  var LL = (root.LL = root.LL || {});

  /* ---------- Dates (ISO "YYYY-MM-DD", arithmetic in whole UTC days) ---------- */
  var DAY = 86400000;
  var D = {
    toNum: function (iso) {
      var p = iso.split("-");
      return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / DAY);
    },
    iso: function (n) {
      return new Date(n * DAY).toISOString().slice(0, 10);
    },
    today: function () {
      var t = new Date();
      return D.iso(Math.round(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY));
    },
    add: function (iso, k) { return D.iso(D.toNum(iso) + k); },
    diff: function (a, b) { return D.toNum(b) - D.toNum(a); },
    dow: function (iso) { return new Date(D.toNum(iso) * DAY).getUTCDay(); },
    valid: function (s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(D.toNum(s)); },
    fmt: function (iso, opts) {
      return new Date(D.toNum(iso) * DAY).toLocaleDateString("en-GB", Object.assign({ timeZone: "UTC" }, opts || { weekday: "short", day: "numeric", month: "short" }));
    },
    long: function (iso) { return D.fmt(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" }); },
    dayName: function (d) { return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d]; },
    monthName: function (m) { return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m]; }
  };
  LL.date = D;

  /* ---------- Safe storage ---------- */
  var mem = {};
  var store = {
    get: function (key, fallback) {
      try {
        var v = root.localStorage.getItem(key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) {
        return key in mem ? mem[key] : fallback;
      }
    },
    set: function (key, val) {
      mem[key] = val;
      try { root.localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage blocked: keep in memory */ }
      LL.emit && LL.emit("change", key);
    },
    remove: function (key) {
      delete mem[key];
      try { root.localStorage.removeItem(key); } catch (e) {}
      LL.emit && LL.emit("change", key);
    }
  };
  LL.store = store;
  var KEYS = { bookings: "ll.bookings.v1", blocks: "ll.blocks.v1", pricing: "ll.pricing.v1", wishlist: "ll.wishlist.v1", statuses: "ll.sampleStatus.v1" };
  LL.KEYS = KEYS;

  // Tiny event bus so open calendars refresh when data changes.
  var handlers = {};
  LL.on = function (ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); };
  LL.emit = function (ev, a) { (handlers[ev] || []).forEach(function (fn) { try { fn(a); } catch (e) {} }); };
  try { root.addEventListener && root.addEventListener("storage", function () { cache = {}; LL.emit("change"); }); } catch (e) {}

  /* ---------- Helpers ---------- */
  LL.money = function (n, pence) {
    var v = pence ? (Math.round(n * 100) / 100).toFixed(2) : Math.round(n).toString();
    var parts = v.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "£" + parts.join(".");
  };
  LL.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  LL.cottage = function (idOrSlug) {
    return (LL.cottages || []).filter(function (c) { return c.id === idOrSlug || c.slug === idOrSlug; })[0] || null;
  };
  LL.plural = function (n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); };

  /* ---------- Pricing (data + owner overrides) ---------- */
  var cache = {};
  LL.on("change", function () { cache = {}; });

  LL.getPricing = function () {
    if (cache.pricing) return cache.pricing;
    var base = JSON.parse(JSON.stringify(LL.pricing));
    var o = store.get(KEYS.pricing, null);
    if (o) {
      if (o.rates) Object.keys(o.rates).forEach(function (c) {
        base.rates[c] = Object.assign({}, base.rates[c], o.rates[c]);
      });
      if (o.minNights) Object.keys(o.minNights).forEach(function (b) {
        if (base.bands[b] && o.minNights[b] > 0) base.bands[b].minNights = +o.minNights[b];
      });
      if (o.cleaningFee) base.cleaningFee = Object.assign({}, base.cleaningFee, o.cleaningFee);
      if (o.petFee != null) base.petFee = +o.petFee;
    }
    // Keep the band rule text in step with any edited minimum stay.
    Object.keys(base.bands).forEach(function (k) {
      var b = base.bands[k];
      b.rule = b.weekly ? "Saturday to Saturday, minimum " + b.minNights + " nights"
        : (b.arrivalDays.length ? b.arrivalDays.map(D.dayName).join(" or ") + " arrivals, minimum " + b.minNights + " nights"
        : "Arrive any day, minimum " + b.minNights + " nights");
    });
    cache.pricing = base;
    return base;
  };
  LL.isPricingEdited = function () { return !!store.get(KEYS.pricing, null); };

  LL.bandFor = function (iso, pricing) {
    var p = pricing || LL.getPricing();
    var md = iso.slice(5);
    for (var i = 0; i < p.seasons.length; i++) {
      var s = p.seasons[i];
      var hit = s.from <= s.to ? (md >= s.from && md <= s.to) : (md >= s.from || md <= s.to);
      if (hit) return s.band;
    }
    return "low";
  };
  LL.rate = function (cottageId, iso) {
    var p = LL.getPricing();
    return p.rates[cottageId][LL.bandFor(iso, p)];
  };
  LL.fromPrice = function (cottageId) {
    var r = LL.getPricing().rates[cottageId];
    return Math.min.apply(null, Object.keys(r).map(function (k) { return r[k]; }));
  };

  /* ---------- Seeded sample bookings ---------- */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function sampleFor(cottageId) {
    var key = "sample-" + cottageId;
    if (cache[key]) return cache[key];
    var cfg = LL.sampleBookings, base = LL.pricing;
    var out = [], taken = {};
    cfg.fixed.forEach(function (b, i) {
      if (b.cottage !== cottageId) return;
      out.push({ ref: "S-" + cottageId.slice(0, 2).toUpperCase() + "F" + i, cottage: cottageId, in: b.in, out: b.out, source: b.source || "direct", sample: true });
      for (var n = D.toNum(b.in); n < D.toNum(b.out); n++) taken[n] = 1;
    });
    var g = cfg.generated;
    var seedOffset = { hayloft: 11, keepers: 23, granary: 37 }[cottageId] || cottageId.length * 7;
    var r = rng(g.seed + seedOffset);
    var start = D.toNum(g.from), end = start + g.days, d = start, count = 0;
    while (d < end) {
      var iso = D.iso(d), band = LL.bandFor(iso, base), b = base.bands[band];
      var dow = D.dow(iso);
      var arriveOk = !b.arrivalDays.length || b.arrivalDays.indexOf(dow) > -1;
      if (!taken[d] && arriveOk && r() < g.occupancy[band]) {
        var nights;
        if (b.weekly) nights = r() < 0.2 ? 14 : 7;
        else if (band === "mid") nights = dow === 5 ? 3 : 4;
        else nights = b.minNights + Math.floor(r() * 3);
        var clash = false;
        for (var k = 0; k < nights; k++) if (taken[d + k]) { clash = true; break; }
        if (!clash) {
          count++;
          out.push({ ref: "S-" + cottageId.slice(0, 2).toUpperCase() + count, cottage: cottageId, in: iso, out: D.iso(d + nights), source: r() < g.platformShare ? "platform" : "direct", sample: true });
          for (k = 0; k < nights; k++) taken[d + k] = 1;
          d += nights;
          continue;
        }
      }
      d++;
    }
    out.sort(function (a, b) { return a.in < b.in ? -1 : 1; });
    cache[key] = out;
    return out;
  }
  LL.sampleBookingsFor = function (cottageId) {
    var st = store.get(KEYS.statuses, {});
    return sampleFor(cottageId).map(function (b) {
      return Object.assign({}, b, { status: st[b.ref] || "confirmed" });
    });
  };

  /* ---------- Browser bookings, blocks, wishlist ---------- */
  LL.bookings = {
    all: function () { return store.get(KEYS.bookings, []); },
    get: function (ref) { return LL.bookings.all().filter(function (b) { return b.ref === ref; })[0] || null; },
    add: function (b) { var list = LL.bookings.all(); list.push(b); store.set(KEYS.bookings, list); },
    update: function (ref, patch) {
      var list = LL.bookings.all().map(function (b) { return b.ref === ref ? Object.assign({}, b, patch) : b; });
      store.set(KEYS.bookings, list);
    }
  };
  LL.setSampleStatus = function (ref, status) {
    var st = store.get(KEYS.statuses, {});
    st[ref] = status;
    store.set(KEYS.statuses, st);
  };
  LL.blocks = {
    all: function () { return store.get(KEYS.blocks, {}); },
    forCottage: function (c) { return LL.blocks.all()[c] || {}; },
    set: function (c, iso, reason) {
      var all = LL.blocks.all();
      all[c] = all[c] || {};
      if (reason) all[c][iso] = reason; else delete all[c][iso];
      store.set(KEYS.blocks, all);
    },
    setRange: function (c, fromIso, toIsoExclusive, reason) {
      var all = LL.blocks.all();
      all[c] = all[c] || {};
      for (var n = D.toNum(fromIso); n < D.toNum(toIsoExclusive); n++) {
        if (reason) all[c][D.iso(n)] = reason; else delete all[c][D.iso(n)];
      }
      store.set(KEYS.blocks, all);
    }
  };
  LL.wishlist = {
    all: function () { return store.get(KEYS.wishlist, []); },
    has: function (id) { return LL.wishlist.all().indexOf(id) > -1; },
    toggle: function (id) {
      var l = LL.wishlist.all(), i = l.indexOf(id);
      if (i > -1) l.splice(i, 1); else l.push(id);
      store.set(KEYS.wishlist, l);
      return i === -1;
    }
  };
  LL.resetDemo = function () {
    [KEYS.bookings, KEYS.blocks, KEYS.pricing, KEYS.statuses].forEach(store.remove);
  };

  /* ---------- Occupancy ---------- */
  // Returns { dayNum: { kind: "booked" | "blocked", ref, reason } } for every occupied NIGHT.
  LL.occupancy = function (cottageId) {
    var key = "occ-" + cottageId;
    if (cache[key]) return cache[key];
    var occ = {};
    function mark(b, kind) {
      for (var n = D.toNum(b.in); n < D.toNum(b.out); n++) occ[n] = { kind: kind, ref: b.ref };
    }
    LL.sampleBookingsFor(cottageId).forEach(function (b) { if (b.status !== "cancelled") mark(b, "booked"); });
    LL.bookings.all().forEach(function (b) { if (b.cottage === cottageId && b.status !== "cancelled") mark(b, "booked"); });
    var bl = LL.blocks.forCottage(cottageId);
    Object.keys(bl).forEach(function (iso) { occ[D.toNum(iso)] = { kind: "blocked", reason: bl[iso] }; });
    cache[key] = occ;
    return occ;
  };
  LL.nightFree = function (cottageId, iso) { return !LL.occupancy(cottageId)[D.toNum(iso)]; };

  /* ---------- Rules ---------- */
  LL.canArrive = function (cottageId, iso) {
    var p = LL.getPricing();
    if (D.toNum(iso) < D.toNum(D.today())) return { ok: false, reason: "That date has passed." };
    if (!LL.nightFree(cottageId, iso)) return { ok: false, reason: "That night is already booked." };
    var band = LL.bandFor(iso, p), b = p.bands[band], dow = D.dow(iso);
    if (b.arrivalDays.length && b.arrivalDays.indexOf(dow) === -1) {
      var days = b.arrivalDays.map(D.dayName);
      var when = band === "high" ? "in high season (summer holidays)" : "in " + b.label.toLowerCase();
      return { ok: false, reason: (days.length === 1 ? days[0] + " arrivals only " : days.join(" or ") + " arrivals only ") + when + "." };
    }
    return { ok: true, band: band };
  };

  LL.validateStay = function (cottageId, inIso, outIso) {
    var p = LL.getPricing(), site = LL.site;
    var a = LL.canArrive(cottageId, inIso);
    if (!a.ok) return a;
    var nights = D.diff(inIso, outIso);
    if (nights < 1) return { ok: false, reason: "Check-out must be after check-in." };
    var b = p.bands[a.band];
    for (var n = 0; n < nights; n++) {
      if (!LL.nightFree(cottageId, D.add(inIso, n))) {
        return { ok: false, reason: "Some nights in that stay are already booked. The latest you can leave is " + D.fmt(D.add(inIso, n), { weekday: "long", day: "numeric", month: "long" }) + "." };
      }
    }
    if (nights < b.minNights) {
      var monthName = D.monthName(+inIso.slice(5, 7) - 1);
      var label = a.band === "high" ? "in " + monthName + " (summer holidays)" : a.band === "festive" ? "over Christmas and New Year" : "in " + b.label.toLowerCase();
      return { ok: false, reason: "Minimum " + b.minNights + " nights " + label + "." };
    }
    if (b.weekly && nights % 7 !== 0) {
      return { ok: false, reason: "Stays in high season run Saturday to Saturday (7 or 14 nights)." };
    }
    if (nights > site.maxNights) return { ok: false, reason: "For stays longer than " + site.maxNights + " nights, please give us a call." };
    return { ok: true, nights: nights, band: a.band };
  };

  // Earliest valid check-out for a given check-in (or null).
  LL.earliestOut = function (cottageId, inIso) {
    for (var k = 1; k <= LL.site.maxNights; k++) {
      var out = D.add(inIso, k);
      var v = LL.validateStay(cottageId, inIso, out);
      if (v.ok) return out;
      if (!LL.nightFree(cottageId, D.add(inIso, k - 1))) return null;
    }
    return null;
  };

  /* ---------- Quotes ---------- */
  LL.quote = function (cottageId, inIso, outIso, opts) {
    opts = opts || {};
    var p = LL.getPricing(), site = LL.site;
    var nights = D.diff(inIso, outIso);
    var groups = {}, order = [], nightly = [];
    for (var n = 0; n < nights; n++) {
      var iso = D.add(inIso, n), band = LL.bandFor(iso, p), r = p.rates[cottageId][band];
      nightly.push(r);
      var key = band + ":" + r;
      if (!groups[key]) { groups[key] = { band: band, label: p.bands[band].shortLabel, rate: r, nights: 0 }; order.push(key); }
      groups[key].nights++;
    }
    var lines = order.map(function (k) { var g = groups[k]; g.subtotal = g.rate * g.nights; return g; });
    var accommodation = nightly.reduce(function (a, b) { return a + b; }, 0);
    var discount = LL.bestOffer(cottageId, inIso, outIso, nightly);
    var cleaning = p.cleaningFee[cottageId] || 0;
    var dogs = Math.max(0, opts.dogs || 0);
    var pets = dogs * p.petFee;
    var extras = (opts.extras || []).map(function (id) {
      var e = LL.extras[id];
      if (!e) return null;
      return { id: id, label: e.label, amount: e.per === "night" ? e.price * nights : e.price, per: e.per, price: e.price };
    }).filter(Boolean);
    var extrasTotal = extras.reduce(function (a, e) { return a + e.amount; }, 0);
    var total = accommodation - (discount ? discount.amount : 0) + cleaning + pets + extrasTotal;
    var daysToArrival = D.diff(D.today(), inIso);
    var fullRequired = daysToArrival <= site.balanceDueDays;
    var deposit = Math.round(total * site.depositPercent) / 100;
    return {
      cottage: cottageId, in: inIso, out: outIso, nights: nights, lines: lines,
      accommodation: accommodation, discount: discount, cleaning: cleaning,
      dogs: dogs, pets: pets, extras: extras, extrasTotal: extrasTotal, total: total,
      deposit: fullRequired ? total : deposit,
      balance: fullRequired ? 0 : Math.round((total - deposit) * 100) / 100,
      balanceDue: D.add(inIso, -site.balanceDueDays),
      fullRequired: fullRequired
    };
  };

  LL.bestOffer = function (cottageId, inIso, outIso, nightly) {
    var p = LL.getPricing(), best = null;
    var nights = D.diff(inIso, outIso), days = D.diff(D.today(), inIso);
    p.offers.forEach(function (o) {
      var amount = 0;
      if (o.type === "lateAvailability" && days >= 0 && days <= o.withinDays) {
        amount = Math.round(nightly.reduce(function (a, b) { return a + b; }, 0) * o.percentOff) / 100;
      } else if (o.type === "freeNight" && nights === o.nights && D.dow(inIso) === o.arrivalDay && LL.bandFor(inIso, p) === o.band) {
        amount = Math.min.apply(null, nightly);
      }
      if (amount > 0 && (!best || amount > best.amount)) best = { id: o.id, title: o.title, amount: amount };
    });
    return best;
  };

  /* ---------- Search across cottages ---------- */
  LL.search = function (inIso, outIso, guests, dogs) {
    return LL.cottages.map(function (c) {
      var res = { cottage: c, ok: false, reason: "" };
      if (guests > c.sleeps) { res.reason = "Sleeps " + c.sleeps + " at most."; return res; }
      if (dogs > c.maxDogs) { res.reason = c.maxDogs === 0 ? "No pets at this cottage." : "Up to " + LL.plural(c.maxDogs, "dog") + " here."; return res; }
      var v = LL.validateStay(c.id, inIso, outIso);
      if (!v.ok) { res.reason = v.reason; return res; }
      res.ok = true;
      res.quote = LL.quote(c.id, inIso, outIso, { dogs: dogs });
      return res;
    });
  };

  /* ---------- Gaps -> offers ---------- */
  LL.findOffers = function (limit) {
    var p = LL.getPricing(), found = [], today = D.today();
    LL.cottages.forEach(function (c) {
      var lateDone = 0, midDone = 0;
      for (var k = 1; k < 150; k++) {
        var inIso = D.add(today, k);
        var late = p.offers.filter(function (o) { return o.type === "lateAvailability"; })[0];
        var mid = p.offers.filter(function (o) { return o.type === "freeNight"; })[0];
        if (late && k <= late.withinDays && lateDone < 2) {
          var out = LL.earliestOut(c.id, inIso);
          if (out && LL.validateStay(c.id, inIso, out).ok) {
            var q = LL.quote(c.id, inIso, out, {});
            if (q.discount && q.discount.id === "late") { found.push({ cottage: c, offer: late, in: inIso, out: out, quote: q }); lateDone++; k += D.diff(inIso, out); continue; }
          }
        }
        if (mid && midDone < 2 && D.dow(inIso) === mid.arrivalDay && LL.bandFor(inIso, p) === mid.band) {
          var out2 = D.add(inIso, mid.nights);
          if (LL.validateStay(c.id, inIso, out2).ok) {
            var q2 = LL.quote(c.id, inIso, out2, {});
            if (q2.discount && q2.discount.id === "midweek") { found.push({ cottage: c, offer: mid, in: inIso, out: out2, quote: q2 }); midDone++; }
          }
        }
      }
    });
    found.sort(function (a, b) { return a.in < b.in ? -1 : 1; });
    return limit ? found.slice(0, limit) : found;
  };

  /* ---------- References and iCal ---------- */
  LL.newRef = function () {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    var arr = new Uint32Array(6);
    try { root.crypto.getRandomValues(arr); } catch (e) { for (var i = 0; i < 6; i++) arr[i] = Math.floor(Math.random() * 1e9); }
    for (var j = 0; j < 6; j++) s += chars[arr[j] % chars.length];
    return "LL-" + s;
  };

  function icsDate(iso) { return iso.replace(/-/g, ""); }
  function icsText(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function stamp() { return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""); }
  function wrapCal(name, events) {
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Larch & Lantern (concept)//Availability//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:" + icsText(name)]
      .concat(events).concat(["END:VCALENDAR"]).join("\r\n") + "\r\n";
  }
  function vevent(uid, startIso, endIso, summary, desc, timed) {
    var ev = ["BEGIN:VEVENT", "UID:" + uid + "@larch-and-lantern.example", "DTSTAMP:" + stamp()];
    if (timed) {
      ev.push("DTSTART;TZID=Europe/London:" + icsDate(startIso) + "T160000");
      ev.push("DTEND;TZID=Europe/London:" + icsDate(endIso) + "T100000");
    } else {
      ev.push("DTSTART;VALUE=DATE:" + icsDate(startIso));
      ev.push("DTEND;VALUE=DATE:" + icsDate(endIso));
    }
    ev.push("SUMMARY:" + icsText(summary));
    if (desc) ev.push("DESCRIPTION:" + icsText(desc));
    ev.push("TRANSP:OPAQUE", "END:VEVENT");
    return ev.join("\r\n");
  }

  // A guest's add-to-calendar file for one booking.
  LL.icsForBooking = function (b) {
    var c = LL.cottage(b.cottage);
    var desc = "Your demo stay at " + c.name + ". Check-in from " + LL.site.checkIn + ", check-out by " + LL.site.checkOut + ". Booking reference " + b.ref + ". Concept site: no real stay is booked.";
    return wrapCal(c.name + " (demo stay)", [vevent(b.ref, b.in, b.out, "Stay at " + c.name + " (demo)", desc, true)]);
  };

  // The owner's feed for one cottage: booked and blocked nights, no guest details.
  LL.icsFeed = function (cottageId) {
    var c = LL.cottage(cottageId), events = [];
    LL.sampleBookingsFor(cottageId).concat(LL.bookings.all().filter(function (b) { return b.cottage === cottageId; }))
      .forEach(function (b) {
        if (b.status === "cancelled") return;
        events.push(vevent(b.ref, b.in, b.out, "Booked", "Not available"));
      });
    var bl = LL.blocks.forCottage(cottageId), days = Object.keys(bl).sort(), run = null;
    days.forEach(function (iso) {
      if (run && D.toNum(iso) === D.toNum(run.end) && bl[iso] === run.reason) { run.end = D.add(iso, 1); return; }
      if (run) events.push(vevent("BLK-" + cottageId + "-" + run.start, run.start, run.end, "Blocked", run.reason));
      run = { start: iso, end: D.add(iso, 1), reason: bl[iso] };
    });
    if (run) events.push(vevent("BLK-" + cottageId + "-" + run.start, run.start, run.end, "Blocked", run.reason));
    return wrapCal(c.name + " availability", events);
  };

  LL.download = function (filename, text, type) {
    try {
      var blob = new Blob([text], { type: type || "text/calendar;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) {}
  };

  /* ---------- Cancellation ---------- */
  LL.cancellationTerms = function (b) {
    var days = D.diff(D.today(), b.in);
    var paid = b.paid || 0;
    if (days >= LL.site.cancellation.fullRefundDays) {
      return { refund: paid, text: "You're cancelling 6 weeks or more before arrival, so everything you've paid (" + LL.money(paid, true) + ") would be refunded." };
    }
    return { refund: 0, text: "You're within 6 weeks of arrival. We'd refund the " + LL.money(paid, true) + " you've paid in full if we can re-let your dates, or you could move your stay to other dates once, free of charge." };
  };
})(typeof window !== "undefined" ? window : globalThis);
