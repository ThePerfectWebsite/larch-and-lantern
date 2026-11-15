/* Owner dashboard (demo): block dates, manage bookings, edit prices, export iCal. */
(function () {
  "use strict";
  var LL = window.LL, D = LL.date, S = LL.site;
  var app = document.getElementById("owner-app");
  var SESSION = "ll.owner.v1";
  var tab = "calendar", cottageId = LL.cottages[0].id, cal = null, selected = null;
  var STATUS_OPTS = [["provisional", "Provisional"], ["deposit-paid", "Deposit paid"], ["paid", "Paid in full"], ["confirmed", "Confirmed"], ["cancelled", "Cancelled"]];
  var REASONS = ["Maintenance", "Family use", "Deep clean", "Other"];

  function loggedIn() { try { return sessionStorage.getItem(SESSION) === "1"; } catch (e) { return !!window.__llOwner; } }
  function setLogin(on) { try { on ? sessionStorage.setItem(SESSION, "1") : sessionStorage.removeItem(SESSION); } catch (e) { window.__llOwner = on; } }

  function login() {
    app.innerHTML = '<form class="panel narrow" id="login" style="max-width:460px" novalidate>' +
      '<h2 style="font-size:1.6rem">Owner login</h2>' +
      '<p class="notice notice--demo small"><strong>Demo login.</strong> Any details work, and nothing is checked or sent. Please don\'t use a real password.</p>' +
      '<div class="field"><label for="o-email">Email</label><input type="email" id="o-email" autocomplete="off" value="owner@larch-and-lantern.example"></div>' +
      '<div class="field"><label for="o-pass">Password</label><input type="password" id="o-pass" autocomplete="off" value="demo"></div>' +
      '<button class="btn btn-forest btn-block" type="submit">Log in to the demo</button></form>';
    document.getElementById("login").addEventListener("submit", function (e) {
      e.preventDefault(); setLogin(true); dashboard();
      var h = app.querySelector("h2"); if (h) { h.tabIndex = -1; h.focus(); }
    });
  }

  function dashboard() {
    var tabs = [["calendar", "Calendar"], ["bookings", "Bookings"], ["prices", "Prices & minimum stays"], ["sync", "Calendar export"]];
    app.innerHTML = '<div class="flex" style="justify-content:space-between;margin-bottom:1rem"><h2 class="mb-0" style="font-size:1.6rem">Welcome back</h2><button type="button" class="btn btn-plain btn-sm" id="logout">Log out</button></div>' +
      '<div class="tabs" role="tablist" aria-label="Dashboard sections">' + tabs.map(function (t) {
        return '<button type="button" role="tab" id="tab-' + t[0] + '" aria-controls="panel" aria-selected="' + (tab === t[0]) + '" tabindex="' + (tab === t[0] ? 0 : -1) + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
      }).join("") + '</div><div id="panel" role="tabpanel" aria-labelledby="tab-' + tab + '" tabindex="0"></div>';
    document.getElementById("logout").addEventListener("click", function () { setLogin(false); login(); });
    var tl = app.querySelector(".tabs");
    tl.addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) { tab = b.dataset.tab; dashboard(); document.getElementById("tab-" + tab).focus(); } });
    tl.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var i = tabs.map(function (t) { return t[0]; }).indexOf(tab);
      tab = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length][0];
      dashboard(); document.getElementById("tab-" + tab).focus();
    });
    ({ calendar: calendarTab, bookings: bookingsTab, prices: pricesTab, sync: syncTab })[tab]();
  }

  function cottagePicker() {
    return '<div class="flex" role="group" aria-label="Choose cottage" style="margin-bottom:1rem">' + LL.cottages.map(function (c) {
      return '<button type="button" class="btn btn-sm ' + (c.id === cottageId ? "btn-forest" : "btn-plain") + '" data-pick="' + c.id + '" aria-pressed="' + (c.id === cottageId) + '">' + LL.esc(c.name) + "</button>";
    }).join("") + "</div>";
  }
  function bindPicker(fn) {
    app.querySelectorAll("[data-pick]").forEach(function (b) { b.addEventListener("click", function () { cottageId = b.dataset.pick; selected = null; fn(); var nb = app.querySelector('[data-pick="' + cottageId + '"]'); if (nb) nb.focus(); }); });
  }

  /* ---------- Calendar tab ---------- */
  function allBookings(cid) {
    return LL.sampleBookingsFor(cid).concat(LL.bookings.all().filter(function (b) { return b.cottage === cid; }).map(function (b) { return Object.assign({ browser: true }, b); }));
  }
  function findBooking(cid, iso) {
    var n = D.toNum(iso);
    return allBookings(cid).filter(function (b) { return b.status !== "cancelled" && D.toNum(b.in) <= n && n < D.toNum(b.out); })[0];
  }
  function blockRuns(cid) {
    var bl = LL.blocks.forCottage(cid), days = Object.keys(bl).sort(), runs = [], run = null;
    days.forEach(function (iso) {
      if (run && D.toNum(iso) === D.toNum(run.end) && bl[iso] === run.reason) { run.end = D.add(iso, 1); return; }
      run = { start: iso, end: D.add(iso, 1), reason: bl[iso] }; runs.push(run);
    });
    return runs.filter(function (r) { return D.toNum(r.end) > D.toNum(D.today()); });
  }

  function calendarTab() {
    var p = document.getElementById("panel");
    var c = LL.cottage(cottageId);
    p.innerHTML = cottagePicker() + '<div class="owner-grid"><div class="panel"><h3 class="mt-0">' + LL.esc(c.name) + ' calendar</h3><p class="small muted">Select a free night to block it with the reason below, or a blocked night to unblock it. Select a booked night to see the booking.</p>' +
      '<div class="field" style="max-width:280px"><label for="o-reason">Reason for new blocks</label><select id="o-reason">' + REASONS.map(function (r) { return "<option>" + r + "</option>"; }).join("") + "</select></div>" +
      '<div id="o-cal"></div></div><div class="grid" style="gap:1.25rem"><div class="panel" id="o-side" aria-live="polite"></div>' +
      '<form class="panel" id="o-range" novalidate><h3 class="mt-0">Block a range</h3><div class="grid grid-2" style="gap:0 .75rem"><div class="field"><label for="r-from">First night</label><input type="date" id="r-from" min="' + D.today() + '"></div><div class="field"><label for="r-to">Last night</label><input type="date" id="r-to" min="' + D.today() + '"></div></div>' +
      '<div class="field"><label for="r-reason">Reason</label><select id="r-reason">' + REASONS.map(function (r) { return "<option>" + r + "</option>"; }).join("") + '</select></div><p class="field-error" id="r-err" role="alert"></p><button class="btn btn-forest btn-sm" type="submit">Block these nights</button></form>' +
      '<div class="panel"><h3 class="mt-0">Blocked dates</h3><div id="o-blocks"></div></div></div></div>';
    bindPicker(calendarTab);
    cal = new LL.Calendar(document.getElementById("o-cal"), {
      cottageId: cottageId, mode: "owner", double: true,
      onDayClick: function (iso) {
        var occ = LL.occupancy(cottageId)[D.toNum(iso)];
        if (occ && occ.kind === "blocked") { LL.blocks.set(cottageId, iso, null); cal.msg("Unblocked " + D.long(iso) + ".", "ok"); selected = null; }
        else if (occ) { selected = findBooking(cottageId, iso); cal.msg("Booked night: details shown alongside.", "ok"); }
        else { var r = document.getElementById("o-reason").value; LL.blocks.set(cottageId, iso, r); cal.msg("Blocked " + D.long(iso) + " (" + r + "). It's now unavailable on the public calendar.", "ok"); selected = null; }
        side();
      }
    });
    document.getElementById("o-range").addEventListener("submit", function (e) {
      e.preventDefault();
      var a = document.getElementById("r-from").value, b = document.getElementById("r-to").value, err = document.getElementById("r-err");
      if (!D.valid(a) || !D.valid(b)) { err.textContent = "Choose the first and last nights."; return; }
      if (D.toNum(b) < D.toNum(a)) { err.textContent = "The last night must be on or after the first night."; return; }
      var clash = [];
      for (var n = D.toNum(a); n <= D.toNum(b); n++) { var o = LL.occupancy(cottageId)[n]; if (o && o.kind === "booked") clash.push(D.iso(n)); }
      if (clash.length) { err.textContent = "That range includes booked nights (" + D.fmt(clash[0]) + (clash.length > 1 ? " and " + (clash.length - 1) + " more" : "") + "). Move or cancel the booking first."; return; }
      err.textContent = "";
      LL.blocks.setRange(cottageId, a, D.add(b, 1), document.getElementById("r-reason").value);
      LL.toast("Blocked " + LL.plural(D.diff(a, b) + 1, "night") + " at " + LL.cottage(cottageId).name + ".");
      e.target.reset();
      side();
    });
    side();
  }

  function side() {
    var el = document.getElementById("o-side");
    if (!el) return;
    var c = LL.cottage(cottageId);
    if (selected) {
      el.innerHTML = '<h3 class="mt-0">Booking ' + selected.ref + "</h3>" + bookingBlock(selected, true);
    } else {
      var up = allBookings(cottageId).filter(function (b) { return b.status !== "cancelled" && D.toNum(b.out) >= D.toNum(D.today()); }).sort(function (a, b) { return a.in < b.in ? -1 : 1; }).slice(0, 4);
      el.innerHTML = '<h3 class="mt-0">Next arrivals</h3><ul class="list-plain">' + up.map(function (b) { return '<li class="small"><strong>' + D.fmt(b.in) + " – " + D.fmt(b.out) + "</strong> · " + sourceLabel(b) + "</li>"; }).join("") + '</ul><p class="small muted mb-0 mt-1">Select a booked night on the calendar to manage it.</p>';
    }
    var runs = blockRuns(cottageId), bl = document.getElementById("o-blocks");
    bl.innerHTML = runs.length ? '<ul class="list-plain">' + runs.map(function (r) {
      return '<li class="flex" style="justify-content:space-between"><span class="small"><strong>' + D.fmt(r.start) + (D.diff(r.start, r.end) > 1 ? " – " + D.fmt(D.add(r.end, -1)) : "") + "</strong> · " + LL.esc(r.reason) + '</span><button type="button" class="link-btn small" data-unblock="' + r.start + "|" + r.end + '">Unblock<span class="sr-only"> ' + D.fmt(r.start) + "</span></button></li>";
    }).join("") + "</ul>" : '<p class="small muted mb-0">No dates blocked for ' + LL.esc(c.name) + ".</p>";
    bl.querySelectorAll("[data-unblock]").forEach(function (b) {
      b.addEventListener("click", function () { var p = b.dataset.unblock.split("|"); LL.blocks.setRange(cottageId, p[0], p[1], null); LL.toast("Dates unblocked."); side(); });
    });
    bindStatus(el);
  }

  function sourceLabel(b) {
    if (b.browser) return "Direct booking (made in this browser)";
    return b.source === "platform" ? "Sample: imported from a booking platform" : "Sample: direct booking";
  }
  function bookingBlock(b, withStatus) {
    var c = LL.cottage(b.cottage);
    var html = '<p class="small mb-0"><strong>' + LL.esc(c.name) + "</strong><br>" + D.long(b.in) + " to " + D.long(b.out) + " (" + LL.plural(D.diff(b.in, b.out), "night") + ")<br>" + sourceLabel(b) + "</p>";
    if (b.browser) html += '<p class="small mb-0">Guest: ' + LL.esc(b.guest.first) + " " + LL.esc((b.guest.last || "").charAt(0)) + ". · " + LL.plural(b.adults + b.children, "guest") + (b.dogs ? ", " + LL.plural(b.dogs, "dog") : "") + " · arriving " + LL.esc(b.guest.arrival) + "<br>Total " + LL.money(b.total, true) + ", paid " + LL.money(b.paid, true) + (b.guest.requests ? "<br>Requests: " + LL.esc(b.guest.requests) : "") + "</p>";
    if (withStatus) {
      html += '<div class="field mt-1 mb-0"><label for="st-' + b.ref + '">Status</label><select id="st-' + b.ref + '" data-status="' + b.ref + '" data-browser="' + (b.browser ? 1 : 0) + '">' + STATUS_OPTS.map(function (o) { return '<option value="' + o[0] + '"' + (b.status === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select><span class="hint">Setting a booking to Cancelled frees its dates on the public calendar.</span></div>';
    }
    return html;
  }
  function bindStatus(scope) {
    scope.querySelectorAll("[data-status]").forEach(function (s) {
      s.addEventListener("change", function () {
        if (s.dataset.browser === "1") LL.bookings.update(s.dataset.status, { status: s.value });
        else LL.setSampleStatus(s.dataset.status, s.value);
        LL.toast("Booking " + s.dataset.status + " marked " + s.options[s.selectedIndex].text.toLowerCase() + ".");
        if (selected && selected.ref === s.dataset.status) selected = Object.assign({}, selected, { status: s.value });
      });
    });
  }

  /* ---------- Bookings tab ---------- */
  function bookingsTab() {
    var p = document.getElementById("panel");
    var mine = LL.bookings.all().map(function (b) { return Object.assign({ browser: true }, b); }).sort(function (a, b) { return a.in < b.in ? -1 : 1; });
    var upcoming = [];
    LL.cottages.forEach(function (c) { upcoming = upcoming.concat(LL.sampleBookingsFor(c.id).filter(function (b) { return D.toNum(b.in) >= D.toNum(D.today()); }).slice(0, 3)); });
    upcoming.sort(function (a, b) { return a.in < b.in ? -1 : 1; });
    p.innerHTML = '<div class="grid grid-2"><div><h3>Direct bookings made in this browser</h3>' +
      (mine.length ? '<ul class="list-plain">' + mine.map(function (b) { return '<li class="owner-booking"><strong>' + b.ref + "</strong>" + bookingBlock(b, true) + "</li>"; }).join("") + "</ul>"
        : '<div class="panel"><p class="mb-0">No demo bookings yet. <a href="/book/">Make one on the public site</a> and it appears here, with its dates blocked everywhere.</p></div>') +
      '</div><div><h3>Upcoming sample bookings</h3><p class="small muted">Sample data showing a mix of direct bookings and bookings imported from booking-platform calendars.</p><ul class="list-plain">' +
      upcoming.map(function (b) { return '<li class="owner-booking"><strong>' + b.ref + "</strong>" + bookingBlock(b, true) + "</li>"; }).join("") + "</ul></div></div>";
    bindStatus(p);
  }

  /* ---------- Prices tab ---------- */
  function pricesTab() {
    var p = document.getElementById("panel"), pr = LL.getPricing(), bands = Object.keys(pr.bands);
    p.innerHTML = '<form id="prices" novalidate><p>Edit nightly rates, minimum stays and fees. Saving updates the public calendars and prices in this browser straight away.' + (LL.isPricingEdited() ? ' <span class="badge badge--amber">Edited</span>' : "") + "</p>" +
      '<div class="table-wrap"><table class="price-table"><caption class="sr-only">Nightly rates by season</caption><thead><tr><th scope="col">Season</th>' + LL.cottages.map(function (c) { return '<th scope="col">' + LL.esc(c.name) + "</th>"; }).join("") + '<th scope="col">Minimum nights</th></tr></thead><tbody>' +
      bands.map(function (b) {
        return '<tr><th scope="row">' + LL.esc(pr.bands[b].label) + '<br><span class="small muted">' + LL.esc(pr.bands[b].arrivalDays.length ? pr.bands[b].arrivalDays.map(D.dayName).join("/") + " arrivals" : "Any arrival day") + "</span></th>" +
          LL.cottages.map(function (c) { return '<td><label class="sr-only" for="r-' + c.id + "-" + b + '">' + LL.esc(c.name) + ", " + LL.esc(pr.bands[b].label) + ', nightly rate in pounds</label><input type="number" min="20" max="2000" step="5" id="r-' + c.id + "-" + b + '" value="' + pr.rates[c.id][b] + '" inputmode="numeric"></td>'; }).join("") +
          '<td><label class="sr-only" for="m-' + b + '">' + LL.esc(pr.bands[b].label) + ', minimum nights</label><input type="number" min="1" max="14" id="m-' + b + '" value="' + pr.bands[b].minNights + '" inputmode="numeric"' + (pr.bands[b].weekly ? ' step="7"' : "") + "></td></tr>";
      }).join("") +
      '<tr><th scope="row">Cleaning fee (per stay)</th>' + LL.cottages.map(function (c) { return '<td><label class="sr-only" for="cf-' + c.id + '">' + LL.esc(c.name) + ' cleaning fee</label><input type="number" min="0" max="500" step="5" id="cf-' + c.id + '" value="' + pr.cleaningFee[c.id] + '"></td>'; }).join("") + "<td></td></tr>" +
      '<tr><th scope="row"><label for="petfee">Dog fee (per dog, per stay)</label></th><td><input type="number" min="0" max="200" step="5" id="petfee" value="' + pr.petFee + '"></td><td colspan="' + LL.cottages.length + '"></td></tr>' +
      "</tbody></table></div>" +
      '<p class="field-error" id="p-err" role="alert"></p>' +
      '<div class="flex mt-1"><button class="btn btn-forest" type="submit">Save prices</button><button class="btn btn-plain" type="button" id="reset-prices">Reset to sample data</button></div>' +
      '<p class="small muted mt-1">Season dates live in <code>public/js/data/pricing.js</code>. "Reset to sample data" restores the original prices, removes blocked dates and sample status changes, and clears demo bookings made in this browser.</p></form>' +
      '<div class="panel mt-2"><h3 class="mt-0">Preview</h3><p class="small muted">A 3-night low-season stay, priced with the saved rates:</p><div id="p-prev"></div></div>';
    preview();
    document.getElementById("prices").addEventListener("submit", function (e) {
      e.preventDefault();
      var o = { rates: {}, minNights: {}, cleaningFee: {} }, bad = false;
      LL.cottages.forEach(function (c) {
        o.rates[c.id] = {};
        bands.forEach(function (b) { var v = +document.getElementById("r-" + c.id + "-" + b).value; if (!(v >= 20 && v <= 2000)) bad = true; o.rates[c.id][b] = v; });
        var cf = +document.getElementById("cf-" + c.id).value; if (!(cf >= 0)) bad = true; o.cleaningFee[c.id] = cf;
      });
      bands.forEach(function (b) { var m = +document.getElementById("m-" + b).value; if (!(m >= 1 && m <= 14)) bad = true; if (pr.bands[b].weekly && m % 7) bad = true; o.minNights[b] = m; });
      o.petFee = +document.getElementById("petfee").value;
      if (bad) { document.getElementById("p-err").textContent = "Check the numbers: rates between £20 and £2,000, minimum stays between 1 and 14 nights (high season in whole weeks)."; return; }
      document.getElementById("p-err").textContent = "";
      LL.store.set(LL.KEYS.pricing, o);
      LL.toast("Prices saved. The public calendars now use them.");
      pricesTab();
    });
    document.getElementById("reset-prices").addEventListener("click", function () {
      LL.resetDemo();
      LL.toast("Reset to sample data.");
      pricesTab();
    });
  }
  function preview() {
    var el = document.getElementById("p-prev");
    var start = D.today(), n = 0;
    while (LL.bandFor(start) !== "low" && n++ < 400) start = D.add(start, 1);
    el.innerHTML = '<div class="grid grid-3">' + LL.cottages.map(function (c) {
      var q = LL.quote(c.id, start, D.add(start, 3), {});
      return '<div><strong>' + LL.esc(c.name) + '</strong><p class="mb-0">' + LL.money(q.accommodation) + " + " + LL.money(q.cleaning) + " cleaning = <strong>" + LL.money(q.accommodation + q.cleaning) + "</strong></p></div>";
    }).join("") + "</div>";
  }

  /* ---------- Sync tab ---------- */
  function syncTab() {
    var p = document.getElementById("panel");
    p.innerHTML = '<div class="split" style="align-items:start"><div>' +
      "<h3>One calendar, no double bookings</h3>" +
      "<p>Each cottage has a calendar feed in the standard iCal (.ics) format, listing every booked and blocked night. There are no guest names or details in it.</p>" +
      "<p>In a real setup, you'd paste each cottage's feed link into your booking-platform listing, and paste the platform's own feed link in here. The two calendars then check each other automatically (usually every few hours), so a booking taken in one place closes those dates in the other. That's how you avoid managing two calendars.</p>" +
      '<p class="small muted">In this demo, you can download each feed as a file to see exactly what a platform would read.</p>' +
      '</div><div class="grid" style="gap:1rem">' + LL.cottages.map(function (c) {
        var count = allBookings(c.id).filter(function (b) { return b.status !== "cancelled"; }).length;
        return '<div class="panel"><h3 class="mt-0" style="font-size:1.2rem">' + LL.esc(c.name) + '</h3><p class="small mb-0">Feed link (illustrative):</p><p class="small" style="word-break:break-all"><code>' + S.url + "/ical/" + c.id + ".ics</code></p><p class=\"small muted\">" + count + " bookings and " + Object.keys(LL.blocks.forCottage(c.id)).length + " blocked nights</p>" +
          '<button type="button" class="btn btn-forest btn-sm" data-ics="' + c.id + '">Download ' + LL.esc(c.name) + " .ics</button></div>";
      }).join("") + "</div></div>";
    p.querySelectorAll("[data-ics]").forEach(function (b) {
      b.addEventListener("click", function () { LL.download(b.dataset.ics + "-availability.ics", LL.icsFeed(b.dataset.ics)); LL.toast("Downloaded " + LL.cottage(b.dataset.ics).name + " calendar feed."); });
    });
  }

  if (loggedIn()) dashboard(); else login();
})();
