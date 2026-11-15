/* Book direct (demo): 4 steps, confirmation, .ics, saved to "My bookings". */
(function () {
  "use strict";
  var LL = window.LL, D = LL.date, S = LL.site;
  var app = document.getElementById("book-app");
  var q = LL.qs();
  var c0 = LL.cottage(q.c) || null;
  var st = {
    step: 1,
    cottage: c0 ? c0.id : null,
    in: D.valid(q.in) ? q.in : null,
    out: D.valid(q.out) ? q.out : null,
    adults: Math.max(1, Math.min(+q.g || 2, c0 ? c0.sleeps : 6)),
    children: 0, infants: 0,
    dogs: Math.max(0, Math.min(+q.d || 0, c0 ? c0.maxDogs : 2)),
    extras: (q.x || "").split(",").filter(function (x) { return LL.extras[x]; }),
    guest: { first: "", last: "", email: "", phone: "", arrival: "4pm–5pm", requests: "" },
    payment: "deposit",
    agree: false
  };
  if (st.in && st.out && st.cottage && !LL.validateStay(st.cottage, st.in, st.out).ok) { st.out = null; }
  var cal = null;
  var STEPS = ["Dates & guests", "Your details", "Extras", "Payment"];

  function cottage() { return LL.cottage(st.cottage); }
  function quote() {
    if (!st.cottage || !st.in || !st.out) return null;
    var c = cottage();
    st.extras = st.extras.filter(function (x) { return c.extras.indexOf(x) > -1; });
    return LL.quote(st.cottage, st.in, st.out, { dogs: st.dogs, extras: st.extras });
  }

  /* ---------- Layout ---------- */
  function shell(inner) {
    app.innerHTML = '<div class="book-layout"><div>' +
      '<ol class="stepbar" aria-label="Booking steps">' + STEPS.map(function (s, i) {
        var n = i + 1, cls = n < st.step ? "is-done" : n === st.step ? "is-current" : "";
        return '<li class="' + cls + '"' + (n === st.step ? ' aria-current="step"' : "") + "><span>" + s + "</span>" + (n < st.step ? '<span class="sr-only"> (done)</span>' : "") + "</li>";
      }).join("") + "</ol>" +
      '<div class="panel step-panel" id="step">' + inner + "</div></div>" +
      '<aside aria-labelledby="bs-h"><div class="panel" id="book-summary"></div></aside></div>';
    summary();
  }

  function summary() {
    var el = document.getElementById("book-summary");
    if (!el) return;
    var c = cottage(), qt = quote();
    var html = '<h2 id="bs-h" style="font-size:1.35rem">Your booking</h2>';
    if (!c) { el.innerHTML = html + '<p class="muted mb-0">Choose a cottage to start.</p>'; return; }
    html += '<div class="flex" style="flex-wrap:nowrap"><img src="' + c.gallery[0].src + '" alt="" width="96" height="72" style="border-radius:8px;width:96px"><div><strong>' + LL.esc(c.name) + '</strong><br><span class="small muted">Sleeps ' + c.sleeps + "</span></div></div>";
    if (st.in && st.out) {
      html += '<div class="dates-row mt-1"><div><span>Check-in</span><strong>' + D.fmt(st.in) + '</strong></div><div><span>Check-out</span><strong>' + D.fmt(st.out) + "</strong></div></div>";
      html += '<p class="small mb-0">' + LL.plural(st.adults, "adult") + (st.children ? ", " + LL.plural(st.children, "child", "children") : "") + (st.infants ? ", " + LL.plural(st.infants, "infant") : "") + (st.dogs ? ", " + LL.plural(st.dogs, "dog") : "") + "</p>";
      html += LL.renderBreakdown(qt, { animate: true });
    } else html += '<p class="notice notice--green small mt-1 mb-0">Choose your dates to see the price.</p>';
    el.innerHTML = html;
  }

  function errorsHtml(errs) {
    if (!errs.length) return "";
    return '<div class="error-summary" role="alert" tabindex="-1" id="err-sum"><h2>Please check the following</h2><ul>' + errs.map(function (e) {
      return '<li><a href="#' + e.id + '">' + LL.esc(e.msg) + "</a></li>";
    }).join("") + "</ul></div>";
  }

  function stepperHtml(id, label, val, min, max, hint) {
    return '<div class="field"><span class="label" id="' + id + '-l">' + label + '</span><div class="stepper" role="group" aria-labelledby="' + id + '-l">' +
      '<button type="button" data-step="' + id + '" data-d="-1" aria-label="Fewer ' + label.toLowerCase() + '"' + (val <= min ? " disabled" : "") + ">−</button>" +
      '<output id="' + id + '" aria-live="polite">' + val + '</output><button type="button" data-step="' + id + '" data-d="1" aria-label="More ' + label.toLowerCase() + '"' + (val >= max ? " disabled" : "") + ">+</button></div>" +
      (hint ? '<span class="hint">' + hint + "</span>" : "") + "</div>";
  }

  function go(step) {
    st.step = step;
    render();
    var h = document.querySelector("#step h2");
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    window.scrollTo({ top: app.getBoundingClientRect().top + window.scrollY - 100, behavior: "auto" });
  }

  /* ---------- Step 1 ---------- */
  function step1(errs) {
    var c = cottage();
    var html = "<h2>Dates and guests</h2>" + errorsHtml(errs || []) +
      '<fieldset><legend class="label">Cottage</legend><div class="grid grid-3" style="gap:.6rem">' + LL.cottages.map(function (x) {
        return '<label class="check"><input type="radio" name="cottage" value="' + x.id + '"' + (st.cottage === x.id ? " checked" : "") + (st.cottage ? "" : (x === LL.cottages[0] ? ' id="f-cottage"' : "")) + "><span><strong>" + LL.esc(x.name) + '</strong><br><span class="small muted">Sleeps ' + x.sleeps + ", " + (x.maxDogs ? LL.plural(x.maxDogs, "dog") : "no pets") + "</span></span></label>";
      }).join("") + "</div></fieldset>";
    if (c) {
      html += '<div class="field" id="f-dates" tabindex="-1"><span class="label">Dates</span><div id="book-cal"></div></div>';
      var guestsMax = c.sleeps;
      html += '<div class="grid grid-2" style="gap:.75rem" id="f-guests" tabindex="-1">' +
        stepperHtml("b-adults", "Adults", st.adults, 1, guestsMax - st.children, "") +
        stepperHtml("b-children", "Children (2–17)", st.children, 0, guestsMax - st.adults, "") +
        stepperHtml("b-infants", "Infants (under 2)", st.infants, 0, c.id === "hayloft" ? 0 : 1, c.id === "hayloft" ? "The Hayloft is adults only" : "In a cot; doesn't count towards sleeps") +
        (c.maxDogs ? stepperHtml("b-dogs", "Dogs", st.dogs, 0, c.maxDogs, "£" + LL.getPricing().petFee + " per dog per stay") : '<p class="small muted">No pets at ' + LL.esc(c.name) + ". Assistance dogs are always welcome.</p>") +
        "</div><p class=\"small muted\">" + LL.esc(c.name) + " sleeps " + c.sleeps + "." + (c.id === "hayloft" ? " Adults only." : "") + "</p>";
    }
    html += '<div class="step-actions"><a class="btn btn-plain" href="' + (c ? "/cottages/" + c.slug + "/" : "/cottages/") + '">Back</a><button type="button" class="btn btn-forest" id="next">Continue to your details</button></div>';
    shell(html);
    if (c) {
      if (c.id === "hayloft") st.children = st.infants = 0;
      cal = new LL.Calendar(document.getElementById("book-cal"), {
        cottageId: c.id, double: true, checkIn: st.in, checkOut: st.out,
        onChange: function (s) { st.in = s.checkIn; st.out = s.checkOut; summary(); }
      });
      if (st.in && st.out) cal.msg(LL.plural(D.diff(st.in, st.out), "night") + " selected: " + D.fmt(st.in) + " to " + D.fmt(st.out) + ".", "ok");
    }
    app.querySelectorAll('input[name="cottage"]').forEach(function (r) {
      r.addEventListener("change", function () {
        st.cottage = r.value;
        var nc = cottage();
        st.dogs = Math.min(st.dogs, nc.maxDogs);
        if (st.adults + st.children > nc.sleeps) { st.adults = Math.min(st.adults, nc.sleeps); st.children = Math.max(0, nc.sleeps - st.adults); st.children = Math.min(st.children, nc.sleeps - st.adults); }
        if (st.in && st.out && !LL.validateStay(nc.id, st.in, st.out).ok) { st.in = null; st.out = null; LL.toast("Those dates aren't free at " + nc.name + ", so please choose again."); }
        step1();
        var sel = app.querySelector('input[name="cottage"]:checked'); if (sel) sel.focus();
      });
    });
    app.querySelector("#step").addEventListener("click", function (e) {
      var b = e.target.closest("[data-step]");
      if (!b) return;
      var key = { "b-adults": "adults", "b-children": "children", "b-infants": "infants", "b-dogs": "dogs" }[b.dataset.step];
      st[key] = Math.max(0, st[key] + +b.dataset.d);
      if (st.adults < 1) st.adults = 1;
      var id = b.dataset.step, dir = b.dataset.d;
      var keepIn = st.in, keepOut = st.out;
      step1();
      st.in = keepIn; st.out = keepOut;
      var nb = app.querySelector('[data-step="' + id + '"][data-d="' + dir + '"]');
      if (nb && !nb.disabled) nb.focus(); else { var o = app.querySelector('[data-step="' + id + '"]:not([disabled])'); if (o) o.focus(); }
    });
    document.getElementById("next").addEventListener("click", function () {
      var errs = [], cc = cottage();
      if (!cc) errs.push({ id: "f-cottage", msg: "Choose a cottage." });
      else {
        if (!st.in || !st.out) errs.push({ id: "f-dates", msg: st.in ? "Choose your check-out day on the calendar." : "Choose your check-in and check-out days on the calendar." });
        else { var v = LL.validateStay(cc.id, st.in, st.out); if (!v.ok) errs.push({ id: "f-dates", msg: v.reason }); }
        if (st.adults + st.children > cc.sleeps) errs.push({ id: "f-guests", msg: cc.name + " sleeps " + cc.sleeps + " at most." });
        if (st.dogs > cc.maxDogs) errs.push({ id: "f-guests", msg: cc.maxDogs ? "Up to " + LL.plural(cc.maxDogs, "dog") + " at " + cc.name + "." : "No pets at " + cc.name + "." });
      }
      if (errs.length) { step1(errs); document.getElementById("err-sum").focus(); return; }
      go(2);
    });
  }

  /* ---------- Step 2 ---------- */
  function step2(errs) {
    errs = errs || [];
    var g = st.guest, has = function (id) { return errs.some(function (e) { return e.id === id; }); };
    var err = function (id) { var e = errs.filter(function (x) { return x.id === id; })[0]; return e ? '<span class="field-error" id="' + id + '-err">' + LL.esc(e.msg) + "</span>" : ""; };
    var inv = function (id) { return has(id) ? ' aria-invalid="true" aria-describedby="' + id + '-err"' : ""; };
    var html = "<h2>Your details</h2>" + errorsHtml(errs) +
      '<p class="notice notice--demo small"><strong>Demo:</strong> please don\'t enter real details. Anything you type stays in this browser and is never sent anywhere.</p>' +
      '<form id="details" novalidate><div class="grid grid-2" style="gap:0 1rem">' +
      '<div class="field"><label for="g-first">First name</label>' + err("g-first") + '<input type="text" id="g-first" autocomplete="given-name" value="' + LL.esc(g.first) + '"' + inv("g-first") + "></div>" +
      '<div class="field"><label for="g-last">Last name</label>' + err("g-last") + '<input type="text" id="g-last" autocomplete="family-name" value="' + LL.esc(g.last) + '"' + inv("g-last") + "></div>" +
      '<div class="field"><label for="g-email">Email</label>' + err("g-email") + '<input type="email" id="g-email" autocomplete="email" value="' + LL.esc(g.email) + '"' + inv("g-email") + '><span class="hint">We\'d send your confirmation and arrival guide here.</span></div>' +
      '<div class="field"><label for="g-phone">Mobile (optional)</label><input type="tel" id="g-phone" autocomplete="tel" value="' + LL.esc(g.phone) + '"><span class="hint">Only used on the day of arrival.</span></div>' +
      "</div>" +
      '<div class="field"><label for="g-arrival">Roughly when will you arrive?</label><select id="g-arrival">' + ["4pm–5pm", "5pm–6pm", "6pm–7pm", "7pm–8pm", "After 8pm", "Not sure yet"].map(function (t) { return "<option" + (g.arrival === t ? " selected" : "") + ">" + t + "</option>"; }).join("") + '</select><span class="hint">Check-in is from ' + S.checkIn + ". Late arrivals are fine; there's a key safe.</span></div>" +
      '<div class="field"><label for="g-req">Anything we should know? (optional)</label><textarea id="g-req" placeholder="Celebrating something? Need a cot? Arriving by train?">' + LL.esc(g.requests) + "</textarea></div>" +
      '<div class="step-actions"><button type="button" class="btn btn-plain" id="back">Back</button><button type="submit" class="btn btn-forest">Continue to extras</button></div></form>';
    shell(html);
    var save = function () {
      g.first = val("g-first"); g.last = val("g-last"); g.email = val("g-email"); g.phone = val("g-phone");
      g.arrival = document.getElementById("g-arrival").value; g.requests = document.getElementById("g-req").value;
    };
    document.getElementById("back").addEventListener("click", function () { save(); go(1); });
    document.getElementById("details").addEventListener("submit", function (e) {
      e.preventDefault(); save();
      var errs2 = [];
      if (!g.first.trim()) errs2.push({ id: "g-first", msg: "Enter your first name." });
      if (!g.last.trim()) errs2.push({ id: "g-last", msg: "Enter your last name." });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email.trim())) errs2.push({ id: "g-email", msg: "Enter an email address like name@example.com." });
      if (errs2.length) { step2(errs2); document.getElementById("err-sum").focus(); return; }
      go(3);
    });
  }
  function val(id) { return document.getElementById(id).value; }

  /* ---------- Step 3 ---------- */
  function step3() {
    var c = cottage(), qt = quote();
    var html = "<h2>Extras</h2><p>All optional. Prices are added to your total straight away, so there are no surprises.</p>" +
      '<fieldset><legend class="sr-only">Optional extras</legend>' + c.extras.map(function (id) {
        var e = LL.extras[id];
        var amt = e.per === "night" ? e.price * qt.nights : e.price;
        return '<label class="check"><input type="checkbox" value="' + id + '"' + (st.extras.indexOf(id) > -1 ? " checked" : "") + "><span><strong>" + LL.esc(e.label) + '</strong><br><span class="small muted">' + LL.esc(e.detail) + (e.per === "night" ? " · £" + e.price + " a night" : "") + '</span></span><span class="price-tag">' + LL.money(amt) + "</span></label>";
      }).join("") + "</fieldset>" +
      '<p class="small muted">Travel cots and high chairs are free; just mention them in your requests.</p>' +
      '<div class="step-actions"><button type="button" class="btn btn-plain" id="back">Back</button><button type="button" class="btn btn-forest" id="next">Continue to payment</button></div>';
    shell(html);
    app.querySelectorAll('#step input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        var i = st.extras.indexOf(cb.value);
        if (cb.checked && i === -1) st.extras.push(cb.value);
        if (!cb.checked && i > -1) st.extras.splice(i, 1);
        summary();
      });
    });
    document.getElementById("back").addEventListener("click", function () { go(2); });
    document.getElementById("next").addEventListener("click", function () { go(4); });
  }

  /* ---------- Step 4 ---------- */
  function step4(errs) {
    var qt = quote();
    if (qt.fullRequired) st.payment = "full";
    var html = "<h2>Payment</h2>" + errorsHtml(errs || []) +
      '<fieldset><legend class="label">How would you like to pay?</legend><div class="pay-options">' +
      (qt.fullRequired ? "" :
        '<label class="check"><input type="radio" name="pay" value="deposit"' + (st.payment === "deposit" ? " checked" : "") + '><strong>Pay a ' + S.depositPercent + '% deposit</strong><span class="big">' + LL.money(qt.deposit, true) + '</span><span class="small muted">today, then ' + LL.money(qt.balance, true) + " by " + D.fmt(qt.balanceDue, { day: "numeric", month: "long", year: "numeric" }) + " (6 weeks before arrival)</span></label>") +
      '<label class="check"><input type="radio" name="pay" value="full"' + (st.payment === "full" ? " checked" : "") + '><strong>Pay in full</strong><span class="big">' + LL.money(qt.total, true) + '</span><span class="small muted">' + (qt.fullRequired ? "Your stay is within 6 weeks, so it's paid in full when you book." : "Nothing more to pay before you arrive.") + "</span></label>" +
      "</div></fieldset>" +
      '<div class="notice notice--demo mt-1" role="note"><p class="mb-0"><strong>Demo — no payment taken.</strong> On a real site, a secure card payment form from a payment provider would appear here. This concept has no card fields and takes no money.</p></div>' +
      '<p class="small mt-1">' + LL.esc(S.cancellation.summary) + "</p>" +
      '<label class="check" id="f-agree"><input type="checkbox" id="agree"' + (st.agree ? " checked" : "") + "><span>I've read the house rules and cancellation policy, and I understand this is a demo booking.</span></label>" +
      '<p class="small muted">' + "Concept site by SiteSync Solutions. " + LL.esc(S.concept.text) + "</p>" +
      '<div class="step-actions"><button type="button" class="btn btn-plain" id="back">Back</button><button type="button" class="btn btn-amber" id="confirm">Confirm demo booking</button></div>';
    shell(html);
    app.querySelectorAll('input[name="pay"]').forEach(function (r) { r.addEventListener("change", function () { st.payment = r.value; }); });
    document.getElementById("agree").addEventListener("change", function (e) { st.agree = e.target.checked; });
    document.getElementById("back").addEventListener("click", function () { go(3); });
    document.getElementById("confirm").addEventListener("click", confirmBooking);
  }

  function confirmBooking() {
    if (!st.agree) { step4([{ id: "agree", msg: "Tick the box to confirm you've read the house rules and cancellation policy." }]); document.getElementById("err-sum").focus(); return; }
    var v = LL.validateStay(st.cottage, st.in, st.out);
    if (!v.ok) { st.step = 1; step1([{ id: "f-dates", msg: "Sorry, those dates have just become unavailable. " + v.reason }]); document.getElementById("err-sum").focus(); return; }
    var qt = quote();
    var paid = st.payment === "full" || qt.fullRequired ? qt.total : qt.deposit;
    var b = {
      ref: LL.newRef(), cottage: st.cottage, in: st.in, out: st.out,
      adults: st.adults, children: st.children, infants: st.infants, dogs: st.dogs,
      extras: st.extras.slice(), quote: qt, total: qt.total, paid: paid,
      balance: Math.round((qt.total - paid) * 100) / 100, balanceDue: qt.balanceDue,
      payment: paid === qt.total ? "full" : "deposit",
      status: paid === qt.total ? "paid" : "deposit-paid",
      guest: { first: st.guest.first, last: st.guest.last, arrival: st.guest.arrival, requests: st.guest.requests },
      source: "direct", createdAt: new Date().toISOString()
    };
    LL.bookings.add(b);
    confirmation(b);
  }

  function confirmation(b) {
    var c = LL.cottage(b.cottage);
    app.innerHTML = '<div class="panel narrow" style="margin:0 auto">' +
      '<div class="confirm-hero"><div class="lantern-big">' + LL.icons.lantern + '</div><h2 tabindex="-1" id="conf-h">Your demo stay is booked</h2>' +
      "<p class=\"mb-0\">Booking reference</p><div class=\"ref\">" + b.ref + "</div>" +
      "<p>Thanks, " + LL.esc(b.guest.first) + ". " + LL.esc(c.name) + " is yours from " + D.long(b.in) + " to " + D.long(b.out) + ".</p></div>" +
      LL.renderBreakdown(b.quote, { noDeposit: true }) +
      '<ul class="breakdown"><li><span>Paid today (demo)</span><span>' + LL.money(b.paid, true) + "</span></li>" + (b.balance > 0 ? "<li><span>Balance due " + D.fmt(b.balanceDue, { day: "numeric", month: "long", year: "numeric" }) + "</span><span>" + LL.money(b.balance, true) + "</span></li>" : "") + "</ul>" +
      "<h3>What happens next</h3><ol>" +
      "<li>We'd email your confirmation straight away (not in this demo).</li>" +
      (b.balance > 0 ? "<li>We'll remind you before the balance is due on " + D.fmt(b.balanceDue, { day: "numeric", month: "long" }) + ".</li>" : "") +
      "<li>About a week before you travel, we send arrival instructions: directions, parking, the key-safe code and our welcome book.</li>" +
      "<li>Check in from " + S.checkIn + " on " + D.fmt(b.in, { weekday: "long", day: "numeric", month: "long" }) + ". We're on site if you need anything.</li></ol>" +
      '<div class="flex mt-2"><button type="button" class="btn btn-forest" id="ics">' + LL.icons.download.replace("<svg", '<svg width="20" height="20"') + 'Add to calendar (.ics)</button><a class="btn btn-ghost" href="/my-bookings/">View in My bookings</a><a class="btn btn-plain" href="/explore/">Plan your days out</a></div>' +
      '<p class="notice notice--demo small mt-2 mb-0">This was a demo. ' + LL.esc(S.concept.text) + " These dates are now shown as booked on the calendar in this browser only.</p></div>";
    document.getElementById("ics").addEventListener("click", function () { LL.download("larch-and-lantern-" + b.ref + ".ics", LL.icsForBooking(b)); });
    var h = document.getElementById("conf-h"); h.focus();
    window.scrollTo({ top: app.getBoundingClientRect().top + window.scrollY - 100 });
  }

  function render() {
    ({ 1: step1, 2: step2, 3: step3, 4: step4 })[st.step]();
  }
  render();
})();
