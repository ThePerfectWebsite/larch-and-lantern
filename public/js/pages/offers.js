/* Offers: generated from gaps in the calendar data. */
(function () {
  "use strict";
  var LL = window.LL;
  var el = document.getElementById("offers-list");
  function render() {
    var offers = LL.findOffers(10);
    el.innerHTML = offers.length ? offers.map(LL.offerCard).join("") : '<p class="muted">No offers at the moment: the calendars are nicely full. <a href="/book/">Check availability</a> for other dates.</p>';
  }
  LL.on("change", render);
  render();
})();
