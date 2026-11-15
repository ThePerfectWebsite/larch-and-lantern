/* My bookings (demo): list, cancel by policy, add to calendar, saved cottages. */
(function () {
  "use strict";
  var LL = window.LL, D = LL.date;
  var list = document.getElementById("mb-list"), saved = document.getElementById("mb-saved");
  var confirming = null;
  var STATUS = {
    "deposit-paid": ["Deposit paid (demo)", "badge--amber"],
    paid: ["Paid in full (demo)", ""],
    provisional: ["Provisional", "badge--grey"],
    confirmed: ["Confirmed", ""],
    cancelled: ["Cancelled", "badge--red"]
  };

  function render() {
    var all = LL.bookings.all().slice().sort(function (a, b) { return a.in < b.in ? -1 : 1; });
    if (!all.length) {
      list.innerHTML = '<div class="panel"><h2 style="font-size:1.4rem">No bookings yet</h2><p>When you make a demo booking, it appears here, and its dates are blocked on the calendar in this browser.</p><a class="btn btn-amber" href="/book/">Make a demo booking</a></div>';
    } else {
      list.innerHTML = all.map(function (b) {
        var c = LL.cottage(b.cottage), s = STATUS[b.status] || STATUS.confirmed;
        var past = D.toNum(b.out) <= D.toNum(D.today());
        var html = '<article class="booking-card" aria-labelledby="h-' + b.ref + '"><header><div><h2 id="h-' + b.ref + '" style="font-size:1.4rem;margin:0">' + LL.esc(c.name) + '</h2><span class="small muted">Ref ' + b.ref + '</span></div><span class="badge ' + s[1] + '">' + s[0] + "</span></header>" +
          '<p class="mb-0">' + D.long(b.in) + " to " + D.long(b.out) + " · " + LL.plural(D.diff(b.in, b.out), "night") + "<br>" +
          LL.plural(b.adults, "adult") + (b.children ? ", " + LL.plural(b.children, "child", "children") : "") + (b.infants ? ", " + LL.plural(b.infants, "infant") : "") + (b.dogs ? ", " + LL.plural(b.dogs, "dog") : "") + "</p>" +
          '<p class="mb-0">Total ' + LL.money(b.total, true) + " · paid " + LL.money(b.paid, true) + (b.balance > 0 && b.status !== "cancelled" ? " · balance " + LL.money(b.balance, true) + " due " + D.fmt(b.balanceDue, { day: "numeric", month: "long", year: "numeric" }) : "") + "</p>";
        if (b.status === "cancelled") {
          html += '<p class="small muted mb-0">Cancelled ' + (b.cancelledAt ? D.fmt(b.cancelledAt.slice(0, 10), { day: "numeric", month: "long" }) : "") + ". " + (b.refund > 0 ? "Refund (demo): " + LL.money(b.refund, true) + "." : "We'd refund you if the dates are re-let.") + " The dates are free again.</p>";
        } else if (confirming === b.ref) {
          var t = LL.cancellationTerms(b);
          html += '<div class="notice" role="alert"><p><strong>Cancel this booking?</strong> ' + LL.esc(t.text) + '</p><div class="flex"><button type="button" class="btn btn-forest btn-sm" data-cancel-yes="' + b.ref + '">Yes, cancel booking</button><button type="button" class="btn btn-plain btn-sm" data-cancel-no>Keep my booking</button></div></div>';
        } else {
          html += '<div class="flex"><button type="button" class="btn btn-ghost btn-sm" data-ics="' + b.ref + '">' + "Add to calendar" + '</button><a class="btn btn-plain btn-sm" href="/cottages/' + c.slug + '/">View cottage</a>' + (past ? "" : '<button type="button" class="link-btn small" data-cancel="' + b.ref + '">Cancel booking</button>') + "</div>";
        }
        return html + "</article>";
      }).join("");
    }
    var w = LL.wishlist.all();
    saved.innerHTML = w.length ? w.map(function (id) {
      var c = LL.cottage(id);
      if (!c) return "";
      return '<article class="card"><div class="card-media"><img src="' + c.gallery[0].src + '" alt="" width="800" height="600" loading="lazy"></div><div class="card-body"><h3><a href="/cottages/' + c.slug + '/">' + LL.esc(c.name) + '</a></h3><p class="muted mb-0">' + LL.esc(c.short) + '</p><div class="from"><a class="btn btn-ghost btn-sm" href="/cottages/' + c.slug + '/#availability">See dates</a><button type="button" class="link-btn small" data-save="' + c.id + '">Remove</button></div></div></article>';
    }).join("") : '<p class="muted">Tap the heart on any cottage to save it here.</p>';
  }

  list.addEventListener("click", function (e) {
    var t = e.target;
    if (t.dataset.ics) { var b = LL.bookings.get(t.dataset.ics); LL.download("larch-and-lantern-" + b.ref + ".ics", LL.icsForBooking(b)); return; }
    if (t.dataset.cancel) { confirming = t.dataset.cancel; render(); var y = list.querySelector("[data-cancel-yes]"); if (y) y.focus(); return; }
    if (t.hasAttribute("data-cancel-no")) { var ref = confirming; confirming = null; render(); var cb = list.querySelector('[data-cancel="' + ref + '"]'); if (cb) cb.focus(); return; }
    if (t.dataset.cancelYes) {
      var bk = LL.bookings.get(t.dataset.cancelYes), terms = LL.cancellationTerms(bk);
      LL.bookings.update(bk.ref, { status: "cancelled", cancelledAt: new Date().toISOString(), refund: terms.refund });
      confirming = null;
      render();
      LL.toast("Booking " + bk.ref + " cancelled. The dates are free again.");
      var h = document.getElementById("h-" + bk.ref); if (h) { h.tabIndex = -1; h.focus(); }
    }
  });
  LL.on("change", render);
  render();
})();
