/* Home: date and guest search across all three cottages, plus offers. */
(function () {
  "use strict";
  var LL = window.LL, D = LL.date;
  var form = document.getElementById("search-form");
  var out = document.getElementById("search-out");
  var fin = document.getElementById("s-in"), fout = document.getElementById("s-out");
  var fg = document.getElementById("s-guests"), fd = document.getElementById("s-dogs");
  var today = D.today();

  fin.min = D.add(today, 1);
  fout.min = D.add(today, 2);
  fin.max = fout.max = D.add(today, 540);

  // Suggest the next Friday-to-Monday break that at least one cottage has free.
  function suggest() {
    for (var k = 2; k < 120; k++) {
      var d = D.add(today, k);
      if (D.dow(d) !== 5) continue;
      var o = D.add(d, 3);
      if (LL.search(d, o, 2, 0).some(function (r) { return r.ok; })) return [d, o];
    }
    return [D.add(today, 7), D.add(today, 10)];
  }
  var s = suggest();
  fin.value = s[0]; fout.value = s[1];

  fin.addEventListener("change", function () {
    if (!D.valid(fin.value)) return;
    fout.min = D.add(fin.value, 1);
    if (!D.valid(fout.value) || D.toNum(fout.value) <= D.toNum(fin.value)) fout.value = D.add(fin.value, 3);
  });

  function card(r, g, d) {
    var c = r.cottage, img = '<img src="' + c.gallery[0].src + '" alt="" width="176" height="132" loading="lazy">';
    if (r.ok) {
      return '<div class="result">' + img + "<div><h2>" + LL.esc(c.name) + '</h2><p class="status mb-0"><span class="status-ok">Available</span> · sleeps ' + c.sleeps + '</p>' +
        '<p class="mb-0"><span class="price">' + LL.money(r.quote.total, r.quote.total % 1 !== 0) + '</span> <span class="small muted">total, ' + LL.plural(r.quote.nights, "night") + (r.quote.discount ? ", offer applied" : "") + "</span></p>" +
        '<p class="mb-0 small"><a href="' + LL.bookUrl(c.id, fin.value, fout.value, g, d) + '">Book these dates<span class="sr-only"> at ' + LL.esc(c.name) + '</span></a> · <a href="/cottages/' + c.slug + "/?in=" + fin.value + "&out=" + fout.value + "&g=" + g + "&d=" + d + '#availability">Details</a></p></div></div>';
    }
    return '<div class="result is-unavailable">' + img + "<div><h2>" + LL.esc(c.name) + '</h2><p class="status mb-0"><span class="status-no">Not available for these dates.</span> ' + LL.esc(r.reason) + "</p>" +
      '<p class="mb-0 small"><a href="/cottages/' + c.slug + '/#availability">See its calendar<span class="sr-only"> for ' + LL.esc(c.name) + "</span></a></p></div></div>";
  }

  function run(focus) {
    var a = fin.value, b = fout.value, g = +fg.value, d = +fd.value;
    if (!D.valid(a) || !D.valid(b)) { out.innerHTML = '<p class="cal-msg is-error">Please choose a check-in and check-out date.</p>'; return; }
    if (D.toNum(b) <= D.toNum(a)) { out.innerHTML = '<p class="cal-msg is-error">Check-out needs to be after check-in.</p>'; return; }
    var res = LL.search(a, b, g, d);
    var n = res.filter(function (r) { return r.ok; }).length;
    out.innerHTML = '<p class="mt-1 mb-0" tabindex="-1" id="search-sum"><strong>' + (n ? LL.plural(n, "cottage") + " free" : "Nothing free") + "</strong> for " + D.fmt(a) + " to " + D.fmt(b) + ", " + LL.plural(g, "guest") + (d ? ", " + LL.plural(d, "dog") : "") + ". Prices include cleaning" + (d ? " and dog fees" : "") + ", with no booking fee.</p>" +
      '<div class="search-results">' + res.map(function (r) { return card(r, g, d); }).join("") + "</div>" +
      (n ? "" : '<p class="small mt-1 mb-0">Try different dates, or see <a href="/offers/">late availability offers</a>.</p>');
    if (focus) document.getElementById("search-sum").focus();
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); run(true); });
  run(false);

  var ho = document.getElementById("home-offers");
  if (ho) {
    var offers = LL.findOffers(3);
    ho.innerHTML = offers.length ? offers.map(LL.offerCard).join("") : '<p class="muted">No offers right now. We\'re nicely booked up! <a href="/book/">Check availability</a>.</p>';
    ho.className = "grid grid-3";
  }
})();
