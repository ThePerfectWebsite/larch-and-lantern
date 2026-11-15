/* Cottage page: calendar, live price summary, sticky mobile bar. */
(function () {
  "use strict";
  var LL = window.LL, D = LL.date;
  var calEl = document.getElementById("cal");
  var c = LL.cottage(calEl.dataset.cottage);
  var q = LL.qs();
  var state = {
    in: null, out: null, preview: null,
    guests: Math.min(Math.max(1, +q.g || 2), c.sleeps),
    dogs: Math.min(Math.max(0, +q.d || 0), c.maxDogs),
    extras: []
  };
  var sum = document.getElementById("sum-body");
  var lastTotal = null;

  // Season key under the calendar
  function seasonKey() {
    var p = LL.getPricing();
    document.getElementById("season-key").innerHTML = "<strong>Seasons:</strong> " + Object.keys(p.bands).map(function (k) {
      return LL.esc(p.bands[k].label) + " £" + p.rates[c.id][k] + " a night (" + LL.esc(p.bands[k].rule) + ")";
    }).join(" · ") + ".";
  }

  function stepper(id, label, val, min, max, hint) {
    return '<div class="field"><span class="label" id="' + id + '-l">' + label + "</span>" +
      '<div class="stepper" role="group" aria-labelledby="' + id + '-l">' +
      '<button type="button" data-step="' + id + '" data-d="-1" aria-label="Fewer ' + label.toLowerCase() + '"' + (val <= min ? " disabled" : "") + ">−</button>" +
      '<output id="' + id + '" aria-live="polite">' + val + "</output>" +
      '<button type="button" data-step="' + id + '" data-d="1" aria-label="More ' + label.toLowerCase() + '"' + (val >= max ? " disabled" : "") + ">+</button></div>" +
      (hint ? '<span class="hint">' + hint + "</span>" : "") + "</div>";
  }

  function render() {
    var html = '<div class="dates-row"><div><span>Check-in</span><strong>' + (state.in ? D.fmt(state.in) : "Add date") + "</strong></div>" +
      "<div><span>Check-out</span><strong>" + (state.out ? D.fmt(state.out) : state.preview ? D.fmt(state.preview) + "?" : "Add date") + "</strong></div></div>";
    html += '<div class="grid" style="grid-template-columns:' + (c.maxDogs ? "1fr 1fr" : "1fr") + ';gap:.75rem">' +
      stepper("st-guests", "Guests", state.guests, 1, c.sleeps, "Sleeps " + c.sleeps) +
      (c.maxDogs ? stepper("st-dogs", "Dogs", state.dogs, 0, c.maxDogs, "£" + LL.getPricing().petFee + " each per stay") : "") + "</div>";
    if (!c.maxDogs) html += '<p class="small muted mt-0">No pets at ' + LL.esc(c.name) + ". Assistance dogs welcome.</p>";

    var nX = state.extras.length;
    html += '<details class="extras-toggle mt-1"' + (state.extrasOpen ? " open" : "") + '><summary>Optional extras' + (nX ? ' <span class="badge">' + nX + " added</span>" : "") + '</summary><fieldset class="mt-1 mb-0"><legend class="sr-only">Optional extras</legend>' + c.extras.map(function (id) {
      var e = LL.extras[id];
      return '<label class="check"><input type="checkbox" value="' + id + '"' + (state.extras.indexOf(id) > -1 ? " checked" : "") + '><span><strong>' + LL.esc(e.label) + '</strong><br><span class="small muted">' + LL.esc(e.detail) + '</span></span><span class="price-tag">£' + e.price + (e.per === "night" ? "/night" : "") + "</span></label>";
    }).join("") + "</fieldset></details>";

    var endIso = state.out || state.preview;
    if (state.in && endIso) {
      var qt = LL.quote(c.id, state.in, endIso, { dogs: state.dogs, extras: state.extras });
      if (!state.out) html += '<p class="small muted mb-0">Estimate if you leave on ' + D.fmt(endIso, { weekday: "long", day: "numeric", month: "short" }) + ":</p>";
      html += LL.renderBreakdown(qt, { animate: lastTotal !== qt.total });
      lastTotal = qt.total;
    } else {
      html += '<p class="notice notice--green small">' + (state.in ? "Now choose your check-out day on the calendar to see your total." : "Choose your dates on the calendar to see the exact price, including cleaning" + (c.maxDogs ? " and any dog fee." : ".")) + "</p>";
      lastTotal = null;
    }
    if (state.in && state.out) {
      html += '<a class="btn btn-amber btn-block" href="' + bookHref() + '">Book these dates</a>';
      html += '<p class="small muted center mt-1 mb-0">Demo: you won\'t be charged. <button type="button" class="link-btn" id="clear-dates">Clear dates</button></p>';
    } else {
      html += '<a class="btn btn-ghost btn-block" href="#availability">' + (state.in ? "Choose check-out" : "Choose dates") + "</a>";
    }
    var focusedId = document.activeElement && document.activeElement.closest && document.activeElement.closest("#sum-body") ? document.activeElement.getAttribute("data-step") + ":" + document.activeElement.getAttribute("data-d") : null;
    var focusedExtra = document.activeElement && document.activeElement.type === "checkbox" && sum.contains(document.activeElement) ? document.activeElement.value : null;
    sum.innerHTML = html;
    if (focusedId) { var f = sum.querySelector('[data-step="' + focusedId.split(":")[0] + '"][data-d="' + focusedId.split(":")[1] + '"]'); if (f && !f.disabled) f.focus(); else if (f) { var o = sum.querySelector('[data-step="' + focusedId.split(":")[0] + '"]:not([disabled])'); if (o) o.focus(); } }
    if (focusedExtra) { var fe = sum.querySelector('input[value="' + focusedExtra + '"]'); if (fe) fe.focus(); }
    sticky();
  }

  function bookHref() {
    var u = LL.bookUrl(c.id, state.in, state.out, state.guests, state.dogs);
    if (state.extras.length) u += "&x=" + state.extras.join(",");
    return u;
  }

  sum.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]");
    if (b) {
      var key = b.dataset.step === "st-guests" ? "guests" : "dogs";
      var max = key === "guests" ? c.sleeps : c.maxDogs, min = key === "guests" ? 1 : 0;
      state[key] = Math.max(min, Math.min(max, state[key] + +b.dataset.d));
      render();
      return;
    }
    if (e.target.id === "clear-dates") { cal.clear(); document.getElementById("availability").scrollIntoView(); }
  });
  sum.addEventListener("toggle", function (e) { if (e.target.classList && e.target.classList.contains("extras-toggle")) state.extrasOpen = e.target.open; }, true);
  sum.addEventListener("change", function (e) {
    if (e.target.type !== "checkbox") return;
    var i = state.extras.indexOf(e.target.value);
    if (e.target.checked && i === -1) state.extras.push(e.target.value);
    if (!e.target.checked && i > -1) state.extras.splice(i, 1);
    render();
  });

  var cal = new LL.Calendar(calEl, {
    cottageId: c.id,
    double: true,
    onChange: function (s) { state.in = s.checkIn; state.out = s.checkOut; state.preview = null; render(); },
    onPreview: function (iso) { if (iso !== state.preview) { state.preview = iso; render(); } }
  });

  if (D.valid(q.in) && D.valid(q.out)) {
    var v = LL.validateStay(c.id, q.in, q.out);
    if (v.ok) { cal.setStay(q.in, q.out); cal.msg(LL.plural(v.nights, "night") + " selected: " + D.fmt(q.in) + " to " + D.fmt(q.out) + ".", "ok"); }
    else { cal.setStay(null, null, true); cal.view = { y: +q.in.slice(0, 4), m: +q.in.slice(5, 7) - 1 }; cal.render(); cal.msg("Those dates aren't available: " + v.reason, "error"); }
  }
  seasonKey();
  LL.on("change", function () { seasonKey(); render(); });
  render();

  // Sticky "Check dates" bar on mobile
  var bar = document.getElementById("sticky-dates"), btn = document.getElementById("sticky-btn");
  var availSec = document.getElementById("availability"), gallery = document.querySelector(".gallery");
  var calVisible = false, pastGallery = false;
  function sticky() {
    if (!bar) return;
    var show = pastGallery && !calVisible;
    bar.classList.toggle("is-visible", show);
    bar.setAttribute("aria-hidden", show ? "false" : "true");
    btn.tabIndex = show ? 0 : -1;
    if (state.in && state.out) {
      var qt = LL.quote(c.id, state.in, state.out, { dogs: state.dogs, extras: state.extras });
      document.getElementById("sticky-from").textContent = D.fmt(state.in) + " – " + D.fmt(state.out);
      document.getElementById("sticky-label").textContent = LL.money(qt.total, qt.total % 1 !== 0) + " total";
      btn.textContent = "Book now";
      btn.href = bookHref();
    } else {
      document.getElementById("sticky-from").textContent = "From " + LL.money(LL.fromPrice(c.id)) + " a night";
      document.getElementById("sticky-label").textContent = c.name;
      btn.textContent = "Check dates";
      btn.href = "#availability";
    }
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { calVisible = en[0].isIntersecting; sticky(); }, { threshold: 0.15 }).observe(availSec);
    new IntersectionObserver(function (en) { pastGallery = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; sticky(); }).observe(gallery);
  }
  btn.addEventListener("click", function (e) {
    if (btn.getAttribute("href") !== "#availability") return;
    e.preventDefault();
    availSec.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(function () { var d = calEl.querySelector('.day[tabindex="0"]'); if (d) d.focus({ preventScroll: true }); }, 400);
  });
})();
