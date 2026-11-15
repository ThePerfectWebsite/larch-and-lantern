/* Why book direct: illustrative savings calculator. Example figures only. */
(function () {
  "use strict";
  var LL = window.LL;
  var ids = ["c-rate", "c-nights", "c-guestfee", "c-hostfee"];
  var out = document.getElementById("calc-out");
  function num(id, min, max) { var v = parseFloat(document.getElementById(id).value); if (isNaN(v)) v = 0; return Math.max(min, Math.min(max, v)); }
  function calc() {
    var rate = num("c-rate", 0, 5000), nights = num("c-nights", 1, 28), gf = num("c-guestfee", 0, 50), hf = num("c-hostfee", 0, 50);
    var stay = rate * nights;
    var guestPlatform = stay * (1 + gf / 100), guestSaves = guestPlatform - stay;
    var ownerPlatform = stay * (1 - hf / 100), ownerKeeps = stay - ownerPlatform;
    var keepPct = Math.max(0, 100 - hf);
    out.innerHTML =
      '<div class="calc-stat is-amber"><span>A guest booking direct saves</span><strong>' + LL.money(guestSaves, true) + '</strong><span>Platform total ' + LL.money(guestPlatform, true) + " vs " + LL.money(stay, true) + " direct, for the same " + LL.plural(nights, "night") + ".</span></div>" +
      '<div class="calc-stat"><span>The owner keeps an extra</span><strong>' + LL.money(ownerKeeps, true) + '</strong><span>On a platform they would receive about ' + LL.money(ownerPlatform, true) + " of " + LL.money(stay, true) + ".</span></div>" +
      '<div class="calc-stat"><span>What the owner keeps from a platform booking</span><div class="bar mt-1" role="img" aria-label="Owner keeps ' + keepPct.toFixed(1) + ' percent, platform commission ' + hf.toFixed(1) + ' percent"><i class="keep" style="width:' + keepPct + '%"></i><i class="fee" style="width:' + hf + '%"></i></div><span class="small mt-1">Green: owner keeps ' + keepPct.toFixed(1) + "%. Hatched: commission " + hf.toFixed(1) + "%. Booking direct, they keep it all (before card payment fees).</span></div>" +
      '<p class="small muted mb-0">Example only — fees vary by platform, and some split them differently between guests and owners. Edit the percentages to match a platform you know.</p>';
  }
  ids.forEach(function (id) { document.getElementById(id).addEventListener("input", calc); });
  calc();
})();
