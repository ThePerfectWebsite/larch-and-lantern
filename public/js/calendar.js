/*
 * Accessible availability calendar.
 * - Two months side by side on wider screens, one on mobile.
 * - Arrow keys move by day/week, PageUp/PageDown by month, Home/End to week start/end,
 *   Enter or Space selects. Each day announces its state, price and rules.
 * - States never rely on colour alone: booked nights are hatched and struck through,
 *   changeover days are split diagonally, no-arrival days carry a dot, and the
 *   selected stay shows "In"/"Out" labels.
 */
(function (root) {
  "use strict";
  var LL = root.LL, D = LL.date;
  var MAX_MONTHS_AHEAD = 18;
  var uid = 0;

  function Calendar(el, opts) {
    this.el = el;
    this.o = Object.assign({ mode: "guest", double: true, checkIn: null, checkOut: null }, opts);
    this.id = "cal" + (++uid);
    this.checkIn = this.o.checkIn;
    this.checkOut = this.o.checkOut;
    var start = this.checkIn || D.today();
    this.view = { y: +start.slice(0, 4), m: +start.slice(5, 7) - 1 };
    this.focusIso = this.checkIn || D.today();
    this.hoverIso = null;
    var self = this;
    this.mq = root.matchMedia ? root.matchMedia("(min-width: 760px)") : null;
    if (this.mq) {
      var onMq = function () { self.render(); };
      this.mq.addEventListener ? this.mq.addEventListener("change", onMq) : this.mq.addListener(onMq);
    }
    LL.on("change", function () { if (document.contains(self.el)) self.render(); });
    this.build();
    this.render();
  }

  Calendar.prototype.months = function () {
    return this.o.double && (!this.mq || this.mq.matches) ? 2 : 1;
  };

  Calendar.prototype.build = function () {
    var I = LL.icons;
    this.el.classList.add("cal");
    if (this.o.double) this.el.classList.add("is-double");
    this.el.innerHTML =
      '<div class="cal-head">' +
        '<p class="title-row mb-0" id="' + this.id + '-title" aria-live="polite"></p>' +
        '<div class="cal-nav">' +
          '<button type="button" class="cal-prev" aria-label="Previous month">' + I.chevL + "</button>" +
          '<button type="button" class="cal-next" aria-label="Next month">' + I.chevR + "</button>" +
        "</div>" +
      "</div>" +
      '<p class="sr-only" id="' + this.id + '-help">Use the arrow keys to move between days, Page Up and Page Down to change month, and Enter to choose a day.' +
        (this.o.mode === "guest" ? " Choose your check-in day first, then your check-out day." : " Press Enter on a free night to block it, or on a blocked night to unblock it.") + "</p>" +
      '<div class="cal-months"></div>' +
      '<ul class="cal-legend" aria-label="Calendar key">' +
        '<li><span class="sw sw-avail"></span>Available (nightly price shown)</li>' +
        '<li><span class="sw sw-booked"></span>Booked (hatched, struck through)</li>' +
        '<li><span class="sw sw-change"></span>Changeover (split day)</li>' +
        (this.o.mode === "guest" ? '<li><span class="sw sw-noarr"></span>No arrivals (dot)</li><li><span class="sw sw-sel"></span>Your stay</li>' : '<li><span class="sw sw-blocked"></span>Blocked by owner</li>') +
      "</ul>" +
      '<p class="cal-msg" role="status" aria-live="polite"></p>';
    var self = this;
    this.el.querySelector(".cal-prev").addEventListener("click", function () { self.shift(-1); });
    this.el.querySelector(".cal-next").addEventListener("click", function () { self.shift(1); });
    var months = this.el.querySelector(".cal-months");
    months.addEventListener("click", function (e) {
      var b = e.target.closest(".day");
      if (b && b.dataset.iso) self.choose(b.dataset.iso);
    });
    months.addEventListener("keydown", function (e) { self.key(e); });
    months.addEventListener("mouseover", function (e) {
      var b = e.target.closest(".day");
      if (b && self.checkIn && !self.checkOut && self.hoverIso !== b.dataset.iso) { self.hoverIso = b.dataset.iso; self.paintPreview(); }
    });
    months.addEventListener("mouseleave", function () { self.hoverIso = null; self.paintPreview(); });
    months.addEventListener("focusin", function (e) {
      var b = e.target.closest(".day");
      if (b) { self.focusIso = b.dataset.iso; if (self.checkIn && !self.checkOut) { self.hoverIso = b.dataset.iso; self.paintPreview(); } }
    });
  };

  Calendar.prototype.minView = function () { var t = D.today(); return { y: +t.slice(0, 4), m: +t.slice(5, 7) - 1 }; };
  function idx(v) { return v.y * 12 + v.m; }
  function fromIdx(i) { return { y: Math.floor(i / 12), m: i % 12 }; }

  Calendar.prototype.shift = function (k, keepFocus) {
    var min = idx(this.minView()), max = min + MAX_MONTHS_AHEAD - this.months() + 1;
    var next = Math.max(min, Math.min(max, idx(this.view) + k));
    this.view = fromIdx(next);
    if (!keepFocus) {
      var first = next === min ? D.today() : D.iso(D.toNum(this.view.y + "-" + pad(this.view.m + 1) + "-01"));
      this.focusIso = first;
    }
    this.render();
  };
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  Calendar.prototype.setStay = function (inIso, outIso, silent) {
    this.checkIn = inIso || null;
    this.checkOut = outIso || null;
    if (inIso) {
      this.view = { y: +inIso.slice(0, 4), m: +inIso.slice(5, 7) - 1 };
      var min = idx(this.minView());
      if (idx(this.view) < min) this.view = this.minView();
      this.focusIso = inIso;
    }
    this.render();
    if (!silent) this.emit();
  };

  Calendar.prototype.msg = function (text, kind) {
    var m = this.el.querySelector(".cal-msg");
    m.textContent = text || "";
    m.className = "cal-msg" + (kind ? " is-" + kind : "");
  };

  Calendar.prototype.emit = function () {
    if (this.o.onChange) this.o.onChange({ checkIn: this.checkIn, checkOut: this.checkOut });
  };

  Calendar.prototype.choose = function (iso) {
    var c = this.o.cottageId;
    if (D.toNum(iso) < D.toNum(D.today())) { this.msg("That date has passed.", "error"); return; }
    if (this.o.mode === "owner") { if (this.o.onDayClick) this.o.onDayClick(iso); return; }

    if (!this.checkIn || this.checkOut || D.toNum(iso) <= D.toNum(this.checkIn)) {
      var a = LL.canArrive(c, iso);
      if (!a.ok) {
        // If they've picked a check-in already and click an earlier day, explain clearly.
        this.msg(a.reason + " Please choose a different check-in day.", "error");
        return;
      }
      this.checkIn = iso; this.checkOut = null; this.hoverIso = null;
      var b = LL.getPricing().bands[a.band];
      var earliest = LL.earliestOut(c, iso);
      this.msg("Check-in " + D.fmt(iso, { weekday: "long", day: "numeric", month: "long" }) + ". " + b.label + ": " + b.rule + ". Now choose your check-out day." + (earliest ? "" : " There's no valid stay from this day, so try another."), earliest ? "ok" : "error");
      this.render();
      this.emit();
      return;
    }
    var v = LL.validateStay(c, this.checkIn, iso);
    if (!v.ok) { this.msg(v.reason, "error"); return; }
    this.checkOut = iso;
    this.hoverIso = null;
    this.msg(LL.plural(v.nights, "night") + " selected: " + D.fmt(this.checkIn) + " to " + D.fmt(iso) + ".", "ok");
    this.render(true);
    this.emit();
  };

  Calendar.prototype.clear = function () {
    this.checkIn = null; this.checkOut = null; this.msg(""); this.render(); this.emit();
  };

  Calendar.prototype.key = function (e) {
    var map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var cur = this.focusIso, next = null;
    if (map[e.key] != null) next = D.add(cur, map[e.key]);
    else if (e.key === "PageUp" || e.key === "PageDown") {
      var dt = new Date(D.toNum(cur) * 86400000);
      dt.setUTCMonth(dt.getUTCMonth() + (e.key === "PageUp" ? -1 : 1));
      next = dt.toISOString().slice(0, 10);
    } else if (e.key === "Home") next = D.add(cur, -((D.dow(cur) + 6) % 7));
    else if (e.key === "End") next = D.add(cur, 6 - ((D.dow(cur) + 6) % 7));
    else return;
    e.preventDefault();
    if (D.toNum(next) < D.toNum(D.today())) next = D.today();
    var vi = { y: +next.slice(0, 4), m: +next.slice(5, 7) - 1 };
    var first = idx(this.view), last = first + this.months() - 1, ni = idx(vi);
    var maxI = idx(this.minView()) + MAX_MONTHS_AHEAD;
    if (ni > maxI) return;
    this.focusIso = next;
    if (ni < first) { this.view = vi; this.render(); }
    else if (ni > last) { this.view = fromIdx(ni - this.months() + 1); this.render(); }
    else this.updateRoving();
    var btn = this.el.querySelector('.day[data-iso="' + next + '"]');
    if (btn) btn.focus();
  };

  Calendar.prototype.updateRoving = function () {
    var self = this;
    this.el.querySelectorAll(".day[data-iso]").forEach(function (b) { b.tabIndex = b.dataset.iso === self.focusIso ? 0 : -1; });
  };

  Calendar.prototype.paintPreview = function () {
    var self = this;
    var days = this.el.querySelectorAll(".day[data-iso]");
    var valid = this.checkIn && !this.checkOut && this.hoverIso && D.toNum(this.hoverIso) > D.toNum(this.checkIn) &&
      LL.validateStay(this.o.cottageId, this.checkIn, this.hoverIso).ok;
    days.forEach(function (b) {
      var n = D.toNum(b.dataset.iso);
      var on = valid && n > D.toNum(self.checkIn) && n <= D.toNum(self.hoverIso);
      b.classList.toggle("is-preview", !!on);
    });
    if (this.o.onPreview && this.checkIn && !this.checkOut) this.o.onPreview(valid ? this.hoverIso : null);
  };

  Calendar.prototype.dayInfo = function (iso, occ, p) {
    var c = this.o.cottageId, n = D.toNum(iso), today = D.toNum(D.today());
    var night = occ[n], prev = occ[n - 1];
    var info = { iso: iso, cls: ["day"], label: D.long(iso), price: "", disabled: false };
    var band = LL.bandFor(iso, p), rate = p.rates[c][band];
    if (n === today) info.cls.push("is-today");
    if (n < today) { info.cls.push("is-past"); info.label += ". Past date"; info.disabled = true; return info; }
    var inN = this.checkIn ? D.toNum(this.checkIn) : null, outN = this.checkOut ? D.toNum(this.checkOut) : null;

    if (night) {
      if (night.kind === "blocked") { info.cls.push("is-blocked"); info.label += ". Not available" + (this.o.mode === "owner" ? ", blocked: " + night.reason : ""); }
      else { info.cls.push("is-booked"); info.label += ". Booked"; }
      if (!prev) { info.cls.push("is-change-out"); info.label += " from tonight; you can check out this morning"; }
      info.disabled = this.o.mode === "guest" && !(this.checkIn && !this.checkOut && n > inN);
      if (this.o.mode === "owner") { info.price = ""; }
    } else {
      info.price = "£" + rate;
      info.cls.push("is-avail");
      if (prev) { info.cls.push("is-changeover"); info.label += ". Changeover day: a stay ends this morning, arrive from " + LL.site.checkIn; }
      else info.label += ". Available";
      info.label += ", £" + rate + " a night, " + p.bands[band].shortLabel.toLowerCase() + " season";
      if (this.o.mode === "guest") {
        var a = LL.canArrive(c, iso);
        if (!a.ok) { info.cls.push("is-noarrive"); info.label += ". No arrivals on this day: " + a.reason.replace(/\.$/, ""); }
      } else {
        info.label += ". Press Enter to block this night";
      }
    }
    if (this.o.mode === "guest") {
      if (inN === n) { info.cls.push("is-start"); info.price = "In"; info.label += ". Selected as check-in"; }
      else if (outN === n) { info.cls.push("is-end"); info.price = "Out"; info.label += ". Selected as check-out"; }
      else if (inN != null && outN != null && n > inN && n < outN) { info.cls.push("is-range"); info.label += ". In your stay"; }
    }
    return info;
  };

  Calendar.prototype.render = function (animate) {
    var p = LL.getPricing(), occ = LL.occupancy(this.o.cottageId);
    var months = this.months(), html = "", self = this;
    var min = idx(this.minView());
    if (idx(this.view) < min) this.view = this.minView();
    var maxStart = min + MAX_MONTHS_AHEAD - months + 1;
    if (idx(this.view) > maxStart) this.view = fromIdx(maxStart);
    // Keep focus target within view
    var fv = this.focusIso ? idx({ y: +this.focusIso.slice(0, 4), m: +this.focusIso.slice(5, 7) - 1 }) : -1;
    if (fv < idx(this.view) || fv > idx(this.view) + months - 1) {
      this.focusIso = idx(this.view) === min ? D.today() : this.view.y + "-" + pad(this.view.m + 1) + "-01";
    }
    var titles = [];
    for (var k = 0; k < months; k++) {
      var v = fromIdx(idx(this.view) + k);
      var title = D.monthName(v.m) + " " + v.y;
      titles.push(title);
      var first = v.y + "-" + pad(v.m + 1) + "-01";
      var lead = (D.dow(first) + 6) % 7; // Monday first
      var dim = new Date(Date.UTC(v.y, v.m + 1, 0)).getUTCDate();
      var hid = this.id + "-m" + k;
      html += '<div class="cal-month"><h3 id="' + hid + '">' + title + '</h3><table class="cal-grid" role="grid" aria-labelledby="' + hid + '" aria-describedby="' + this.id + '-help"><thead><tr>' +
        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (d, i) { return '<th scope="col" abbr="' + D.dayName((i + 1) % 7) + '">' + d.slice(0, 2) + "</th>"; }).join("") +
        "</tr></thead><tbody><tr>";
      for (var i = 0; i < lead; i++) html += "<td></td>";
      for (var d = 1; d <= dim; d++) {
        var iso = v.y + "-" + pad(v.m + 1) + "-" + pad(d);
        var info = this.dayInfo(iso, occ, p);
        html += '<td role="gridcell"><button type="button" class="' + info.cls.join(" ") + '" data-iso="' + iso + '" tabindex="' + (iso === this.focusIso ? 0 : -1) + '" aria-label="' + LL.esc(info.label) + '"' +
          (info.disabled ? ' aria-disabled="true"' : "") + '><span class="n" data-t="' + d + '"></span><span class="p" data-t="' + LL.esc(info.price || "\u00a0") + '"></span></button></td>';
        if ((lead + d) % 7 === 0 && d < dim) html += "</tr><tr>";
      }
      var tail = (7 - ((lead + dim) % 7)) % 7;
      for (i = 0; i < tail; i++) html += "<td></td>";
      html += "</tr></tbody></table></div>";
    }
    var had = this.el.contains(document.activeElement) && document.activeElement.classList.contains("day");
    this.el.querySelector(".cal-months").innerHTML = html;
    this.el.querySelector("#" + this.id + "-title").textContent = "Showing " + titles.join(" and ");
    this.el.querySelector(".cal-prev").disabled = idx(this.view) <= min;
    this.el.querySelector(".cal-next").disabled = idx(this.view) >= maxStart;
    if (had) { var f = this.el.querySelector('.day[data-iso="' + this.focusIso + '"]'); if (f) f.focus(); }
    if (animate && this.checkIn && this.checkOut) {
      var reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) {
        var j = 0;
        this.el.querySelectorAll(".is-start, .is-range, .is-end").forEach(function (b) {
          b.style.animationDelay = (j++ * 45) + "ms";
          b.classList.add("lit");
        });
      }
    }
    this.paintPreview();
  };

  LL.Calendar = Calendar;

  /* Shared price breakdown renderer (cottage page, booking flow, owner preview). */
  LL.renderBreakdown = function (q, opts) {
    opts = opts || {};
    var rows = q.lines.map(function (l) {
      return "<li><span>" + LL.plural(l.nights, "night") + " × £" + l.rate + ' <span class="muted small">(' + l.label.toLowerCase() + ")</span></span><span>" + LL.money(l.subtotal) + "</span></li>";
    });
    if (q.discount) rows.push('<li class="discount"><span>' + LL.esc(q.discount.title) + "</span><span>−" + LL.money(q.discount.amount, q.discount.amount % 1 !== 0) + "</span></li>");
    rows.push("<li><span>Cleaning fee</span><span>" + LL.money(q.cleaning) + "</span></li>");
    if (q.dogs) rows.push("<li><span>Dog fee (" + LL.plural(q.dogs, "dog") + " × £" + LL.getPricing().petFee + ")</span><span>" + LL.money(q.pets) + "</span></li>");
    q.extras.forEach(function (e) {
      rows.push("<li><span>" + LL.esc(e.label) + (e.per === "night" ? " (" + LL.plural(q.nights, "night") + ")" : "") + "</span><span>" + LL.money(e.amount) + "</span></li>");
    });
    rows.push('<li><span>Booking fee</span><span>£0</span></li>');
    rows.push('<li class="total"><span>Total</span><span class="' + (opts.animate ? "grow" : "") + '">' + LL.money(q.total, q.total % 1 !== 0) + "</span></li>");
    if (!opts.noDeposit) {
      rows.push('<li class="sub"><span>' + (q.fullRequired ? "Paid in full when you book (arrival within 6 weeks)" : LL.site.depositPercent + "% deposit today " + LL.money(q.deposit, true) + ", balance " + LL.money(q.balance, true) + " by " + D.fmt(q.balanceDue, { day: "numeric", month: "short", year: "numeric" })) + "</span><span></span></li>");
    }
    return '<ul class="breakdown" aria-label="Price breakdown">' + rows.join("") + "</ul>";
  };
})(window);
