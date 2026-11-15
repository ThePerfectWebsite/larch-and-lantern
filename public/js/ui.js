/* Shared interface behaviour on every page. */
(function (root) {
  "use strict";
  var LL = root.LL, doc = document;
  var reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header border on scroll + hero lantern glow (the signature moment).
  var header = doc.querySelector(".site-header");
  var hero = doc.querySelector(".hero-art");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = root.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (hero) {
      var h = hero.offsetHeight || 1;
      var t = Math.min(1, y / (h * 0.6));
      hero.style.setProperty("--glow", (0.55 + t * 0.45).toFixed(3));
      if (!reduce) {
        var far = hero.querySelector(".layer-far"), near = hero.querySelector(".layer-near");
        if (far) far.setAttribute("transform", "translate(0 " + (y * 0.06).toFixed(1) + ")");
        if (near) near.setAttribute("transform", "translate(0 " + (y * -0.04).toFixed(1) + ")");
      }
    }
  }
  root.addEventListener("scroll", function () { if (!ticking) { ticking = true; root.requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Sticky side panels: if a panel is taller than the screen, let it scroll
  // with the page until its bottom is visible, then hold it there (so the
  // total and the Book button are never stuck off-screen).
  var stickies = doc.querySelectorAll(".booking-aside, .book-layout aside");
  function fitSticky() {
    var vh = root.innerHeight;
    stickies.forEach(function (el) {
      var h = el.offsetHeight, topGap = 88;
      el.style.top = h + topGap + 16 > vh ? Math.round(vh - h - 16) + "px" : "";
    });
  }
  LL.fitSticky = fitSticky;
  root.addEventListener("resize", fitSticky);
  if ("ResizeObserver" in root) {
    var ro = new ResizeObserver(fitSticky);
    stickies.forEach(function (el) { ro.observe(el); });
  }
  root.addEventListener("load", fitSticky);
  fitSticky();
  // Booking page builds its aside after load, so watch for it too.
  var bookApp = doc.getElementById("book-app");
  if (bookApp && "MutationObserver" in root && "ResizeObserver" in root) {
    new MutationObserver(function () {
      stickies = doc.querySelectorAll(".booking-aside, .book-layout aside");
      stickies.forEach(function (el) { ro.observe(el); });
      fitSticky();
    }).observe(bookApp, { childList: true });
  }

  // Toast
  var toastEl;
  LL.toast = function (text) {
    if (!toastEl) {
      toastEl = doc.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add("is-show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("is-show"); }, 3200);
  };

  // Wishlist ("Save") buttons
  function paintSaves() {
    doc.querySelectorAll("[data-save]").forEach(function (b) {
      var on = LL.wishlist.has(b.dataset.save);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var c = LL.cottage(b.dataset.save);
      b.setAttribute("aria-label", (on ? "Remove " : "Save ") + (c ? c.name : "cottage") + (on ? " from your saved cottages" : " to your saved cottages"));
    });
  }
  doc.addEventListener("click", function (e) {
    var b = e.target.closest("[data-save]");
    if (!b) return;
    e.preventDefault();
    var on = LL.wishlist.toggle(b.dataset.save);
    paintSaves();
    var c = LL.cottage(b.dataset.save);
    LL.toast(on ? c.name + " saved. Find it under My bookings." : c.name + " removed from saved cottages.");
  });
  paintSaves();
  LL.paintSaves = paintSaves;

  // Reveal on scroll
  var els = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in root && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("is-in"); });

  // Lightbox for galleries: <div class="gallery" data-lightbox> <button data-full data-caption>
  var gal = doc.querySelector("[data-lightbox]");
  if (gal) {
    var items = Array.prototype.slice.call(gal.querySelectorAll("button[data-full]"));
    var lb = doc.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Gallery");
    lb.innerHTML = '<button type="button" class="lb-close" aria-label="Close gallery">' + LL.icons.close + '</button>' +
      '<button type="button" class="lb-prev" aria-label="Previous image">' + LL.icons.chevL + '</button>' +
      '<figure><img alt="" width="1200" height="800"><figcaption aria-live="polite"></figcaption></figure>' +
      '<button type="button" class="lb-next" aria-label="Next image">' + LL.icons.chevR + "</button>";
    doc.body.appendChild(lb);
    var img = lb.querySelector("img"), cap = lb.querySelector("figcaption"), cur = 0, opener = null;
    var show = function (i) {
      cur = (i + items.length) % items.length;
      var it = items[cur];
      img.src = it.dataset.full;
      img.alt = it.dataset.caption;
      cap.textContent = it.dataset.caption + " (" + (cur + 1) + " of " + items.length + ")";
    };
    var close = function () { lb.classList.remove("is-open"); doc.body.style.overflow = ""; if (opener) opener.focus(); };
    items.forEach(function (b, i) {
      b.addEventListener("click", function () { opener = b; show(i); lb.classList.add("is-open"); doc.body.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
      else if (e.key === "Tab") {
        var f = lb.querySelectorAll("button"), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // Demo forms that should never submit anywhere.
  doc.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) { e.preventDefault(); });
  });

  // Query string helper
  LL.qs = function () {
    var o = {};
    (root.location.search || "").replace(/^\?/, "").split("&").forEach(function (kv) {
      if (!kv) return;
      var p = kv.split("=");
      o[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " "));
    });
    return o;
  };
  // Keep "from" prices in step with any owner price edits (demo dashboard).
  function paintFrom() {
    doc.querySelectorAll("[data-from]").forEach(function (el) { el.textContent = LL.money(LL.fromPrice(el.dataset.from)); });
  }
  if (LL.isPricingEdited()) paintFrom();
  LL.on("change", paintFrom);

  // Offer card, used on the home page and /offers.
  LL.offerCard = function (o) {
    var c = o.cottage, q = o.quote, D = LL.date;
    var full = q.total + q.discount.amount;
    return '<article class="offer">' +
      '<img src="' + c.gallery[0].src + '" alt="" width="320" height="240" loading="lazy" decoding="async">' +
      '<div class="offer-body"><span class="offer-tag">' + LL.esc(o.offer.title) + "</span>" +
      '<h3 class="mb-0" style="font-size:1.25rem">' + LL.esc(c.name) + "</h3>" +
      '<p class="mb-0 small">' + D.fmt(o.in, { weekday: "short", day: "numeric", month: "long" }) + " to " + D.fmt(o.out, { weekday: "short", day: "numeric", month: "long" }) + " · " + LL.plural(q.nights, "night") + "</p>" +
      '<p class="mb-0"><span class="was">' + LL.money(full, full % 1 !== 0) + '</span><strong>' + LL.money(q.total, q.total % 1 !== 0) + '</strong> <span class="small muted">total incl. cleaning</span></p>' +
      '<p class="mb-0"><a href="' + LL.bookUrl(c.id, o.in, o.out, Math.min(2, c.sleeps)) + '">Book these dates<span class="sr-only"> at ' + LL.esc(c.name) + "</span></a> · <a href=\"/cottages/" + c.slug + "/?in=" + o.in + "&out=" + o.out + '#availability">See on calendar</a></p>' +
      "</div></article>";
  };

  LL.bookUrl = function (cottageId, inIso, outIso, guests, dogs) {
    var p = ["c=" + cottageId];
    if (inIso) p.push("in=" + inIso);
    if (outIso) p.push("out=" + outIso);
    if (guests) p.push("g=" + guests);
    if (dogs) p.push("d=" + dogs);
    return "/book/?" + p.join("&");
  };
})(window);
