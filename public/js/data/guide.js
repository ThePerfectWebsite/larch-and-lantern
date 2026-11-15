/*
 * Local guide. Real places, described accurately and generally.
 * No opening hours or prices (they change); link to official sites instead.
 * Drive times are approximate, from "the cottages" (fictional, on the edge of
 * Sherwood Forest near Worksop). Larch & Lantern has no partnership with any
 * organisation listed here.
 * Map positions (x, y) are for the illustrated map (viewBox 600 x 460).
 */
(function (root) {
  root.LL = root.LL || {};
  root.LL.guide = {
    cottagesOnMap: { x: 328, y: 248 },
    places: [
      {
        id: "sherwood",
        name: "Sherwood Forest and the Major Oak",
        kind: "Ancient woodland",
        drive: "About 15 minutes",
        dogs: "Dog-friendly. Keep dogs on a lead near livestock and ground-nesting birds, and follow the reserve's signs.",
        image: "/img/guide-oak.svg",
        imageAlt: "Illustration of a huge, ancient spreading oak tree in woodland",
        summary: "The heart of the old royal forest, near the village of Edwinstowe, and the place most people mean when they say 'Sherwood'.",
        body: [
          "Sherwood Forest National Nature Reserve is home to more than a thousand ancient oaks, many of them over 500 years old. The most famous, the Major Oak, is thought to be somewhere between 800 and 1,000 years old, and its huge spreading limbs have been supported since Victorian times. Local legend says Robin Hood and his men sheltered beneath it.",
          "The Major Oak is about a 15-minute walk along a well-made path from the visitor centre, and there are longer waymarked trails through the oaks, birches and heathland. It's lovely in every season: bluebells in spring, deep shade in summer, and golden leaves and fungi in autumn. Entry to the forest is free, but there's a charge for the car park. Barbecues aren't allowed."
        ],
        tip: "Go early on a weekday morning, when the mist hangs in the hollows and the paths are quiet.",
        mapPos: { x: 322, y: 320 },
        links: [
          { label: "Sherwood Forest reserve information (RSPB)", url: "https://www.rspb.org.uk/days-out/reserves/sherwood-forest" },
          { label: "Visit Nottinghamshire", url: "https://www.visit-nottinghamshire.co.uk/" }
        ]
      },
      {
        id: "clumber",
        name: "Clumber Park",
        kind: "Country estate and parkland",
        drive: "About 10 minutes",
        dogs: "Very dog-friendly across most of the park. Some trails and areas ask for dogs on leads or have livestock, so check the signs.",
        image: "/img/guide-lake.svg",
        imageAlt: "Illustration of a calm lake with a Gothic-style chapel spire among trees (illustrative, not an exact depiction)",
        summary: "Around 3,800 acres of woods, heath and parkland around a serpentine lake, once the seat of the Dukes of Newcastle.",
        body: [
          "Clumber Park is cared for by the National Trust. The great house was demolished in the 1930s, but the estate survives: a long lake, a Gothic Revival chapel, a walled kitchen garden and miles of quiet paths and lanes. The famous Lime Tree Avenue, a double row of lime trees around two miles long, is said to be the longest of its kind in Europe.",
          "It's brilliant for an easy day out: flat-ish walks around the lake, family cycling (bikes can be hired), and plenty of space for dogs. The Clumber spaniel takes its name from the park, where the breed was developed. There's an admission charge for non-members; check the official site for the current details."
        ],
        tip: "Drive in along Lime Tree Avenue in May for bluebells beneath the limes, or October for the colour.",
        mapPos: { x: 338, y: 157 },
        links: [
          { label: "Clumber Park (National Trust)", url: "https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/clumber-park" }
        ]
      },
      {
        id: "creswell",
        name: "Creswell Crags",
        kind: "Ice Age gorge and caves",
        drive: "About 20 minutes",
        dogs: "Dogs on leads are welcome in the gorge, but not on cave tours (assistance dogs excepted).",
        image: "/img/guide-gorge.svg",
        imageAlt: "Illustration of a limestone gorge with cave mouths above a small lake",
        summary: "A dramatic limestone gorge on the Nottinghamshire–Derbyshire border, where Ice Age people sheltered in the caves.",
        body: [
          "The caves at Creswell Crags were used during the last Ice Age, and in 2003 archaeologists found engravings of animals on the walls of Church Hole cave. They're Britain's only known Ice Age cave art, around 13,000 years old. The caves are also known for the largest collection of 'witches' marks' (protective symbols) found in a British cave.",
          "You can walk around the gorge and its small lake for free, and visit the museum and guided cave tours, which are well worth booking ahead. Some tours run seasonally, partly to protect roosting bats, so check before you go."
        ],
        tip: "Book a cave tour for a rainy afternoon; it's one of the most memorable things to do in the area.",
        mapPos: { x: 130, y: 178 },
        links: [
          { label: "Creswell Crags official website", url: "https://www.creswell-crags.org.uk/" }
        ]
      },
      {
        id: "rufford",
        name: "Rufford Abbey Country Park",
        kind: "Abbey ruins, lake and gardens",
        drive: "About 20 minutes",
        dogs: "Dogs welcome in most of the country park; some areas such as the formal gardens and play spaces may be restricted.",
        image: "/img/guide-abbey.svg",
        imageAlt: "Illustration of ruined abbey arches beside a lake with ducks",
        summary: "A 150-acre country park with the remains of a 12th-century Cistercian abbey at its centre.",
        body: [
          "Rufford Abbey was founded by Cistercian monks in the 1140s and became a grand country house after the Dissolution of the Monasteries. What survives is said to be England's best-preserved Cistercian west range, dating mainly from around 1170; the remains are looked after by English Heritage and free to visit.",
          "Around them, the country park has a lake, woodland walks, formal gardens, a sculpture trail and play areas, which makes it an easy half-day with children. There's usually a charge for the car park."
        ],
        tip: "Combine it with Sherwood Forest on the same day; they're only a short drive apart.",
        mapPos: { x: 384, y: 392 },
        links: [
          { label: "Rufford Abbey (English Heritage)", url: "https://www.english-heritage.org.uk/visit/places/rufford-abbey/" },
          { label: "Rufford Abbey Country Park (Nottinghamshire County Council)", url: "https://www.nottinghamshire.gov.uk/ruffordcp" }
        ]
      },
      {
        id: "worksop",
        name: "Worksop and the Dukeries",
        kind: "Market town and historic estates",
        drive: "About 15 minutes to Worksop",
        dogs: "Town centre and riverside paths are fine for dogs on leads; check individual attractions.",
        image: "/img/guide-town.svg",
        imageAlt: "Illustration of a market town with rooftops and a priory church tower",
        summary: "The nearest town, with a priory church, a canal towpath and easy access to the great estates known as the Dukeries.",
        body: [
          "The Dukeries is the old name for the cluster of grand estates south of Worksop, so called because several of them were the seats of dukes: Clumber, Welbeck, Thoresby and Worksop Manor. Today Clumber is open as a park, and you can glimpse the others from public roads and footpaths.",
          "In Worksop itself, the Priory Church and its medieval gatehouse are worth a look, and the Chesterfield Canal towpath makes a flat, easy walk or cycle. Mr Straw's House, an Edwardian family home kept almost exactly as it was, is cared for by the National Trust and is visited by pre-booked tour, so plan ahead."
        ],
        tip: "Worksop is the place for a big supermarket shop, fuel and a train station.",
        mapPos: { x: 248, y: 92 },
        links: [
          { label: "Mr Straw's House (National Trust)", url: "https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/mr-straws-house" },
          { label: "Visit Nottinghamshire", url: "https://www.visit-nottinghamshire.co.uk/" }
        ]
      }
    ],
    routes: [
      {
        title: "From the cottage gate: the forest-edge loop",
        type: "Walk",
        distance: "About 3 miles, 1.5 hours",
        detail: "Our own favourite, described in the welcome book: out along the field edge, into the birch and oak woods and back past the pond. Muddy in winter, so bring boots. Dog-friendly, with one stile that has a dog gate."
      },
      {
        title: "Major Oak trails",
        type: "Walk",
        distance: "From about 1 mile",
        detail: "Waymarked trails start at the Sherwood Forest visitor centre. The path to the Major Oak is well surfaced and suitable for most pushchairs; longer loops head out across the heath."
      },
      {
        title: "Clumber Park lake circuit",
        type: "Walk or cycle",
        distance: "About 3.5 miles",
        detail: "A gentle loop around the lake on mostly level paths, passing the chapel and Clumber Bridge. Good for families and dogs."
      },
      {
        title: "National Cycle Network Route 6",
        type: "Cycle",
        distance: "Ride as much or as little as you like",
        detail: "Route 6 passes through Clumber Park and links it with Sherwood Forest and Sherwood Pines, mostly on quiet lanes and estate roads."
      },
      {
        title: "Sherwood Pines forest trails",
        type: "Cycle",
        distance: "Family trails to technical singletrack",
        detail: "A large Forestry England forest park with waymarked cycle trails for all abilities, plus walking trails and play areas.",
        url: "https://www.forestryengland.uk/sherwood-pines"
      },
      {
        title: "The Robin Hood Way",
        type: "Long-distance walk",
        distance: "Pick a section",
        detail: "A long-distance footpath across Nottinghamshire that passes through Sherwood Forest and Clumber Park. Short sections make excellent day walks."
      }
    ],
    rainyDay: [
      { title: "Cave tour at Creswell Crags", detail: "Underground and out of the rain, with a small museum. Book ahead." },
      { title: "Mr Straw's House, Worksop", detail: "A fascinating time capsule of an Edwardian home (National Trust, pre-booked tours)." },
      { title: "Nottingham for the day", detail: "About 45 minutes' drive: museums, the castle, caves under the city and plenty of shops." },
      { title: "A long lunch by the fire", detail: "There's a traditional pub with a real fire 5 minutes' drive from the cottages. Ask us for our current favourites." },
      { title: "Stay in", detail: "Light the log burner, raid the board games cupboard and let the rain do its thing." }
    ],
    food: [
      { title: "A traditional village pub", detail: "About 5 minutes' drive away, with a real fire, local ales and a dog-friendly bar." },
      { title: "A farm shop and café", detail: "About 10 minutes' drive away: local meat, cheese, cakes and good coffee." },
      { title: "Village shop", detail: "About 4 minutes' drive away, for milk, papers and the basics." },
      { title: "Supermarkets", detail: "In Worksop, about 15 minutes' drive away. Most major supermarkets deliver to the cottages." }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
