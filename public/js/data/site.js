/*
 * Larch & Lantern — business details, fees and policies.
 * Everything here is fictional. Edit freely; the whole site reads from this file.
 */
(function (root) {
  root.LL = root.LL || {};
  root.LL.site = {
    name: "Larch & Lantern Cottages",
    shortName: "Larch & Lantern",
    tagline: "Wake up on the edge of Sherwood.",
    url: "https://larch-and-lantern.solutionssitesync.workers.dev",
    // Obviously fictional address and a phone number from Ofcom's drama range.
    address: {
      street: "Larch Lane (fictional)",
      locality: "near Worksop",
      region: "Nottinghamshire",
      country: "GB"
    },
    phone: "01632 960 418",
    phoneHref: "+441632960418",
    email: "stay@larch-and-lantern.example",
    bestTimeToCall: "We're usually free to chat 9am–12pm and 2pm–6pm, Monday to Saturday. Changeover days (Fridays and Mondays) are busiest, so mornings before 10am are best then.",
    owners: "the Hollins family",
    concept: {
      agency: "SiteSync Solutions",
      agencyUrl: "https://sitesync-solutions.co.uk",
      text: "Larch & Lantern Cottages is not a real business; no stays are booked and no payments or details are taken."
    },
    // Payment policy
    depositPercent: 25,
    balanceDueDays: 42, // 6 weeks before arrival
    cancellation: {
      // Cancel this many days or more before arrival for a full refund of everything paid.
      fullRefundDays: 42,
      summary: "Cancel 6 weeks or more before arrival and we'll refund everything you've paid. Inside 6 weeks we'll refund in full if we can re-let the dates, and we're always happy to move your stay to other dates once, free of charge."
    },
    checkIn: "4pm",
    checkOut: "10am",
    maxNights: 28
  };
})(typeof window !== "undefined" ? window : globalThis);
