/*
 * Sample booked dates, so the calendars look like a real, busy holiday let.
 *
 * Two parts:
 *  1. `fixed`: explicit sample bookings. Dates are "YYYY-MM-DD", and `out` is
 *     the departure day (the last night is the day before).
 *  2. `generated`: a repeatable pattern that fills the calendar with
 *     believable bookings that respect each season's changeover days and
 *     minimum stays. The same seed always gives the same calendar.
 *
 * `source` shows where a booking came from in the owner dashboard:
 *   "direct" (this website) or "platform" (imported from a booking platform's
 *   calendar feed). It's illustrative only.
 */
(function (root) {
  root.LL = root.LL || {};
  root.LL.sampleBookings = {
    fixed: [
      { cottage: "granary", in: "2026-12-23", out: "2026-12-28", source: "direct" },
      { cottage: "keepers", in: "2026-12-29", out: "2027-01-02", source: "platform" },
      { cottage: "hayloft", in: "2026-12-31", out: "2027-01-04", source: "direct" }
    ],
    generated: {
      seed: 1180,
      from: "2026-09-01",
      days: 760,
      // Chance that an allowed arrival day starts a booking, by season.
      occupancy: { low: 0.26, mid: 0.4, high: 0.62, festive: 0.55 },
      // Share of generated bookings shown as coming from booking platforms.
      platformShare: 0.4
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
