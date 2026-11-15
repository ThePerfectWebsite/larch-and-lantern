/*
 * Seasons, nightly prices, minimum stays, changeover days and fees.
 *
 * - Seasons repeat every year. Dates are "MM-DD" and inclusive.
 *   Any night not covered by a range below is "low" season.
 * - The season of the ARRIVAL night decides the minimum stay and allowed
 *   arrival days. Each night is priced at its own season's rate, so a stay
 *   that crosses seasons is priced fairly.
 * - Owners can override rates and minimum stays from the demo dashboard at /owner
 *   (saved in the browser only).
 */
(function (root) {
  root.LL = root.LL || {};
  root.LL.pricing = {
    bands: {
      low: {
        label: "Low season",
        shortLabel: "Low",
        minNights: 3,
        // 0 = Sunday ... 6 = Saturday. Empty array = any day.
        arrivalDays: [],
        weekly: false,
        rule: "Arrive any day, minimum 3 nights"
      },
      mid: {
        label: "Mid season",
        shortLabel: "Mid",
        minNights: 3,
        arrivalDays: [1, 5], // Monday or Friday
        weekly: false,
        rule: "Monday or Friday arrivals, minimum 3 nights"
      },
      high: {
        label: "High season (summer holidays)",
        shortLabel: "High",
        minNights: 7,
        arrivalDays: [6], // Saturday
        weekly: true, // Saturday to Saturday: 7 or 14 nights etc.
        rule: "Saturday to Saturday, minimum 7 nights"
      },
      festive: {
        label: "Christmas & New Year",
        shortLabel: "Festive",
        minNights: 4,
        arrivalDays: [],
        weekly: false,
        rule: "Arrive any day, minimum 4 nights"
      }
    },

    // Season calendar (repeats yearly). Ranges may wrap over New Year.
    seasons: [
      { band: "mid", from: "02-14", to: "02-22", note: "February half term" },
      { band: "mid", from: "03-28", to: "05-22", note: "Easter and spring" },
      { band: "high", from: "05-23", to: "05-31", note: "May half term" },
      { band: "mid", from: "06-01", to: "07-17", note: "Early summer" },
      { band: "high", from: "07-18", to: "08-31", note: "Summer holidays" },
      { band: "mid", from: "09-01", to: "10-31", note: "Autumn and October half term" },
      { band: "festive", from: "12-20", to: "01-04", note: "Christmas & New Year" }
    ],

    // Nightly rates in pounds, per cottage, per band.
    rates: {
      hayloft: { low: 95, mid: 120, high: 160, festive: 150 },
      keepers: { low: 125, mid: 150, high: 210, festive: 195 },
      granary: { low: 190, mid: 235, high: 320, festive: 295 }
    },

    // Fees shown up front, never added as a surprise.
    cleaningFee: { hayloft: 45, keepers: 55, granary: 75 },
    petFee: 25, // per dog, per stay

    // Offers apply automatically to any stay that matches.
    // They're also listed on /offers, generated from gaps in the calendar.
    offers: [
      {
        id: "late",
        title: "Late escape",
        description: "Arrive within the next 3 weeks and take 10% off the nightly rate.",
        type: "lateAvailability",
        withinDays: 21,
        percentOff: 10
      },
      {
        id: "midweek",
        title: "Midweek winter: 3 nights for the price of 2",
        description: "Arrive on a Monday in low season, stay 3 nights and the cheapest night is free.",
        type: "freeNight",
        band: "low",
        arrivalDay: 1,
        nights: 3
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
