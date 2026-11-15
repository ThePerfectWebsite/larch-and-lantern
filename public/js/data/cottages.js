/*
 * The three cottages. All fictional.
 * To add a cottage: copy one object, give it a new unique `id` and `slug`,
 * add its nightly rates in pricing.js, then run `node tools/build.mjs`
 * to create its page (see README).
 */
(function (root) {
  root.LL = root.LL || {};
  root.LL.cottages = [
    {
      id: "hayloft",
      slug: "the-hayloft",
      name: "The Hayloft",
      short: "A romantic studio for two",
      seoTitle: "The Hayloft, romantic cottage for two near Sherwood Forest",
      metaDescription: "The Hayloft is a romantic studio cottage for two on the edge of Sherwood Forest, with a log burner, freestanding bath and private patio. Book direct with no booking fees.",
      sleeps: 2,
      bedrooms: 1,
      bedroomsLabel: "Studio",
      beds: "1 super-king bed (can't be split)",
      bathrooms: 1,
      bathroomsLabel: "1 bathroom with freestanding bath and walk-in shower",
      maxDogs: 0,
      petsPolicy: "No pets, sorry. The Hayloft is kept pet-free for guests with allergies. Assistance dogs are always welcome.",
      parking: "1 space on the gravel drive, right by the steps.",
      wifi: "Fibre broadband, usually around 60 Mbps.",
      ev: false,
      evNote: "No EV charger here. Keeper's Cottage has a 7kW charger guests in any cottage can book for £10 a night (subject to availability).",
      accessibility: "The Hayloft is upstairs, reached by 14 stone steps with a handrail. Inside, everything is on one level. It isn't suitable for guests who can't manage stairs; The Old Granary has ground-floor bedrooms.",
      intro: "Climb the old stone steps to a vaulted studio under oak beams, with a log burner, a deep freestanding bath and a sun-trap patio that looks over the paddock towards the forest edge.",
      description: [
        "The Hayloft sits above the old cart shed, its oak trusses and lime-washed walls left just as they were. We've kept it simple: a big, comfortable bed, a sofa pulled up to the log burner, and a freestanding copper bath under the window, so you can watch the light fade over the trees.",
        "There's a compact, well-equipped kitchen for proper breakfasts, and a private patio with a bistro table that catches the evening sun. It's the cottage couples come back to for anniversaries, proposals and quiet winter weekends."
      ],
      highlights: ["Log burner", "Freestanding bath", "Private patio", "Vaulted oak beams"],
      amenities: [
        { icon: "fire", label: "Log burner (first basket of logs included)" },
        { icon: "bath", label: "Freestanding copper bath" },
        { icon: "shower", label: "Walk-in rainfall shower" },
        { icon: "wifi", label: "Fibre wifi" },
        { icon: "kitchen", label: "Kitchen with hob, combi oven and dishwasher" },
        { icon: "coffee", label: "Bean-to-cup coffee machine" },
        { icon: "tv", label: "Smart TV" },
        { icon: "patio", label: "Private patio with bistro table" },
        { icon: "linen", label: "Linen, towels and robes included" },
        { icon: "parking", label: "Private parking for 1 car" }
      ],
      goodToKnow: [
        "Up 14 stone steps with a handrail",
        "Strictly adults only, so it stays peaceful",
        "No pets (assistance dogs welcome)",
        "Patio is private, but shares the drive with the other cottages",
        "Phone signal is patchy indoors; wifi calling works well"
      ],
      guestsAsk: [
        { q: "Can I bring my dog?", a: "Not to The Hayloft, sorry. It's kept pet-free for guests with allergies. Keeper's Cottage and The Old Granary both welcome dogs." },
        { q: "Where do I park?", a: "There's one space on the gravel drive at the foot of the Hayloft steps. If you've two cars, there's room for a second in the yard." },
        { q: "Is there a hot tub?", a: "Not at The Hayloft, but the freestanding bath is big enough for two." },
        { q: "Where's the nearest pub and shop?", a: "There's a traditional village pub with a real fire about 5 minutes' drive away, and a village shop for milk and papers 4 minutes' drive away. A larger supermarket is about 15 minutes' drive away in Worksop." },
        { q: "Is there mobile signal?", a: "Patchy indoors (one bar on most networks), better on the patio. The wifi is reliable, so wifi calling is the easy fix." },
        { q: "Are there stairs?", a: "Yes, 14 external stone steps with a handrail up to the front door. Inside, it's all on one level." }
      ],
      houseRules: [
        "Check-in from 4pm, check-out by 10am",
        "Maximum 2 guests, adults only",
        "No smoking or vaping inside",
        "No parties or events",
        "Please only burn the logs we provide"
      ],
      gallery: [
        { src: "/img/hayloft-exterior.svg", alt: "Illustration of a stone barn with external steps up to a hayloft door, lit window and trees behind" },
        { src: "/img/hayloft-living.svg", alt: "Illustration of a beamed studio with a log burner glowing and a sofa" },
        { src: "/img/hayloft-bath.svg", alt: "Illustration of a copper freestanding bath beneath a window looking out to trees" },
        { src: "/img/hayloft-bedroom.svg", alt: "Illustration of a large bed under oak beams with a warm lamp" },
        { src: "/img/hayloft-patio.svg", alt: "Illustration of a small patio with a bistro table at dusk" }
      ],
      floorPlan: {
        title: "First floor studio",
        width: 360, height: 220,
        rooms: [
          { x: 0, y: 0, w: 220, h: 140, label: "Living & sleeping" },
          { x: 220, y: 0, w: 140, h: 90, label: "Bathroom" },
          { x: 220, y: 90, w: 140, h: 50, label: "Hall" },
          { x: 0, y: 140, w: 160, h: 80, label: "Kitchen" },
          { x: 160, y: 140, w: 200, h: 80, label: "Patio (outside)", outside: true }
        ]
      },
      mapPos: { x: 318, y: 214 },
      extras: ["hamper", "logs", "flowers", "latecheckout", "ev"]
    },
    {
      id: "keepers",
      slug: "keepers-cottage",
      name: "Keeper's Cottage",
      short: "A dog-friendly cottage with a woodland view",
      seoTitle: "Keeper's Cottage, dog-friendly cottage near Sherwood Forest",
      metaDescription: "Keeper's Cottage sleeps 4 in a double and a twin, with a garden, woodland views and one dog welcome. A dog-friendly cottage near Sherwood Forest. Book direct, no booking fees.",
      sleeps: 4,
      bedrooms: 2,
      bedroomsLabel: "2 bedrooms",
      beds: "1 king-size double, 1 twin (two singles)",
      bathrooms: 1,
      bathroomsLabel: "1 family bathroom with bath and overhead shower, plus a downstairs WC",
      maxDogs: 1,
      petsPolicy: "One well-behaved dog is welcome (£25 per stay). Dogs stay downstairs and off the furniture, please. There's a boot room with a dog shower for muddy paws.",
      parking: "2 spaces in front of the cottage.",
      wifi: "Fibre broadband, usually around 60 Mbps.",
      ev: true,
      evNote: "7kW charger beside the parking spaces. Charging is charged at cost: £10 a night, added as an extra.",
      accessibility: "Living room, kitchen and WC are on the ground floor with one small step at the front door. Both bedrooms and the bathroom are upstairs via a steep cottage staircase with a handrail.",
      intro: "The old gamekeeper's cottage looks straight out to the woods. Big windows, a garden made for muddy boots and a welcome for your dog.",
      description: [
        "Keeper's Cottage was home to the estate's gamekeeper for more than a century. Now it's a bright, cosy cottage for four, with a farmhouse kitchen, a sitting room with a wood burner and deep sofas, and a window seat facing the trees, where you'll often spot deer at dusk.",
        "Upstairs there's a king-size double and a twin room, both with blackout blinds and woodland views. Outside, the garden is fully fenced with a picnic bench and fire pit, and a gate leads straight onto the footpath into the forest."
      ],
      highlights: ["1 dog welcome", "Fenced garden", "Woodland view", "EV charger"],
      amenities: [
        { icon: "dog", label: "1 dog welcome (£25 per stay)" },
        { icon: "fire", label: "Wood burner" },
        { icon: "garden", label: "Fully fenced garden with fire pit" },
        { icon: "ev", label: "7kW EV charger" },
        { icon: "wifi", label: "Fibre wifi" },
        { icon: "kitchen", label: "Farmhouse kitchen with range cooker" },
        { icon: "washer", label: "Washer-dryer in the boot room" },
        { icon: "tv", label: "Smart TV" },
        { icon: "linen", label: "Linen and towels included" },
        { icon: "parking", label: "Parking for 2 cars" }
      ],
      goodToKnow: [
        "Steep cottage staircase to the bedrooms",
        "Garden is fully fenced, with a gate onto the footpath",
        "Dog shower and towels in the boot room",
        "Travel cot and high chair free on request",
        "Woodland footpath starts at the garden gate"
      ],
      guestsAsk: [
        { q: "Can I bring my dog?", a: "Yes, one dog is welcome for £25 per stay. We leave a bed, bowls and a towel in the boot room. Dogs stay downstairs, please, and shouldn't be left alone in the cottage." },
        { q: "Where do I park?", a: "Two cars fit in front of the cottage. The EV charger is right beside them." },
        { q: "Is there a hot tub?", a: "Not at Keeper's Cottage. The Old Granary has one." },
        { q: "Where's the nearest pub and shop?", a: "A dog-friendly traditional pub is about 5 minutes' drive away (or a 25-minute walk across the fields), and a village shop is 4 minutes' drive away. The nearest big supermarket is about 15 minutes' drive away." },
        { q: "Is there mobile signal?", a: "Usually 2–3 bars on the main networks upstairs, less on the ground floor. The wifi is reliable." },
        { q: "Are there stairs?", a: "Yes, a steep cottage staircase with a handrail. The bedrooms and bathroom are upstairs; there's a WC downstairs." }
      ],
      houseRules: [
        "Check-in from 4pm, check-out by 10am",
        "Maximum 4 guests (plus a baby in a cot)",
        "1 dog maximum, not left alone in the cottage",
        "No smoking or vaping inside",
        "No parties or events"
      ],
      gallery: [
        { src: "/img/keepers-exterior.svg", alt: "Illustration of a red-brick cottage with a porch and garden at the edge of a wood" },
        { src: "/img/keepers-living.svg", alt: "Illustration of a cosy sitting room with a wood burner and a sleeping dog" },
        { src: "/img/keepers-kitchen.svg", alt: "Illustration of a farmhouse kitchen with a range cooker and table" },
        { src: "/img/keepers-bedroom.svg", alt: "Illustration of a twin bedroom with a window onto trees" },
        { src: "/img/keepers-garden.svg", alt: "Illustration of a fenced garden with a fire pit and picnic bench" }
      ],
      floorPlan: {
        title: "Ground floor and first floor",
        width: 360, height: 220,
        rooms: [
          { x: 0, y: 0, w: 170, h: 120, label: "Sitting room" },
          { x: 0, y: 120, w: 170, h: 100, label: "Kitchen" },
          { x: 190, y: 0, w: 170, h: 90, label: "Double bed" },
          { x: 190, y: 90, w: 100, h: 70, label: "Twin" },
          { x: 290, y: 90, w: 70, h: 70, label: "Bath" },
          { x: 190, y: 160, w: 170, h: 60, label: "Landing" }
        ],
        divider: { x: 180, labelLeft: "Ground", labelRight: "First" }
      },
      mapPos: { x: 330, y: 222 },
      extras: ["hamper", "logs", "dogpack", "latecheckout", "ev"]
    },
    {
      id: "granary",
      slug: "the-old-granary",
      name: "The Old Granary",
      short: "Room for six, a hot tub and two dogs",
      seoTitle: "The Old Granary, cottage with hot tub near Sherwood Forest, sleeps 6",
      metaDescription: "The Old Granary sleeps 6 in 3 bedrooms, with an enclosed garden, private hot tub, ground-floor bedroom access and up to 2 dogs welcome. Near Sherwood Forest. Book direct.",
      sleeps: 6,
      bedrooms: 3,
      bedroomsLabel: "3 bedrooms",
      beds: "1 king-size (ground floor), 1 double, 1 twin (zip-and-link, can be a super-king)",
      bathrooms: 2,
      bathroomsLabel: "2 bathrooms: ground-floor wet room, upstairs bathroom with bath",
      maxDogs: 2,
      petsPolicy: "Up to 2 dogs welcome (£25 per dog per stay). Dogs are welcome downstairs and in the enclosed garden; please keep them off beds and out of the hot tub area.",
      parking: "3 spaces in the private courtyard.",
      wifi: "Fibre broadband, usually around 60 Mbps, with a mesh booster upstairs.",
      ev: true,
      evNote: "Shared 7kW charger at Keeper's Cottage, 30 metres away. Bookable as an extra for £10 a night.",
      accessibility: "Level access from the courtyard. The king-size bedroom and a wet room with grab rails are on the ground floor, as are the kitchen and living space. The other two bedrooms are upstairs.",
      intro: "A long stone granary with a vaulted living space, a big kitchen table, an enclosed garden for the dogs and a private hot tub under the stars.",
      description: [
        "The Old Granary is the biggest of our three, made for families and old friends. The ground floor opens into one long, vaulted room: a kitchen with an island and a table for eight at one end, sofas and a log burner at the other, and glass doors onto the garden.",
        "There's a king-size bedroom and a wet room on the ground floor, so it works well for grandparents or anyone who'd rather avoid stairs. Upstairs are a double and a twin, and a bathroom with a roll-top bath. The garden is fully enclosed (a good height for most dogs), with a private hot tub, outdoor dining and a fire pit."
      ],
      highlights: ["Private hot tub", "Up to 2 dogs", "Ground-floor bedroom", "Enclosed garden"],
      amenities: [
        { icon: "hottub", label: "Private hot tub, drained and cleaned between every stay" },
        { icon: "dog", label: "Up to 2 dogs (£25 per dog per stay)" },
        { icon: "access", label: "Ground-floor bedroom and wet room" },
        { icon: "garden", label: "Enclosed garden with fire pit" },
        { icon: "fire", label: "Log burner" },
        { icon: "wifi", label: "Fibre wifi with mesh booster" },
        { icon: "kitchen", label: "Big kitchen with island, dishwasher and range" },
        { icon: "washer", label: "Washing machine and tumble dryer" },
        { icon: "tv", label: "Smart TV and board games" },
        { icon: "parking", label: "Parking for 3 cars" }
      ],
      goodToKnow: [
        "Level access, with a ground-floor bedroom and wet room",
        "Hot tub is drained, cleaned and refilled before every stay",
        "Enclosed garden fence is about 1.2m high",
        "Travel cot and high chair free on request",
        "Upstairs bedrooms have sloping ceilings"
      ],
      guestsAsk: [
        { q: "Can I bring my dogs?", a: "Yes, up to two, at £25 per dog per stay. The garden is fully enclosed with a fence about 1.2m high. Please keep dogs off beds and away from the hot tub." },
        { q: "Where do I park?", a: "There are three spaces in the private courtyard, a few steps from the front door." },
        { q: "What are the hot tub rules?", a: "It's yours alone for your stay, and it's drained, cleaned and refilled before every arrival. Please shower first, no glass in or around the tub, no under-8s, and children under 16 must be supervised. Keep the lid on when it's not in use. It's available until 11pm out of courtesy to the other cottages." },
        { q: "Where's the nearest pub and shop?", a: "A traditional pub that serves food is about 5 minutes' drive away, and a village shop is 4 minutes' drive away. For a big shop, the nearest supermarket is about 15 minutes' drive away, and most of the big chains deliver here." },
        { q: "Is there mobile signal?", a: "Usually 2 bars in the living room and good in the garden. Wifi is reliable throughout thanks to a mesh booster." },
        { q: "Are there stairs?", a: "Only to the two upstairs bedrooms and bathroom. The king-size bedroom, wet room, kitchen and living space are all on the level ground floor." }
      ],
      houseRules: [
        "Check-in from 4pm, check-out by 10am",
        "Maximum 6 guests (plus a baby in a cot)",
        "Up to 2 dogs, not left alone in the cottage",
        "Hot tub until 11pm, no glass, under-16s supervised",
        "No smoking or vaping inside, no parties or events"
      ],
      gallery: [
        { src: "/img/granary-exterior.svg", alt: "Illustration of a long stone granary building with glowing windows at dusk" },
        { src: "/img/granary-living.svg", alt: "Illustration of a vaulted open-plan room with a long table and log burner" },
        { src: "/img/granary-hottub.svg", alt: "Illustration of a steaming hot tub in a garden under a starry sky" },
        { src: "/img/granary-bedroom.svg", alt: "Illustration of a ground-floor bedroom with a king-size bed" },
        { src: "/img/granary-garden.svg", alt: "Illustration of an enclosed garden with outdoor dining and a fire pit" }
      ],
      floorPlan: {
        title: "Ground floor (first floor has a double, a twin and a bathroom)",
        width: 360, height: 220,
        rooms: [
          { x: 0, y: 0, w: 230, h: 130, label: "Kitchen, dining & living" },
          { x: 230, y: 0, w: 130, h: 80, label: "King bedroom" },
          { x: 230, y: 80, w: 130, h: 50, label: "Wet room" },
          { x: 0, y: 130, w: 120, h: 90, label: "Hall & stairs" },
          { x: 120, y: 130, w: 240, h: 90, label: "Garden & hot tub (outside)", outside: true }
        ]
      },
      mapPos: { x: 342, y: 210 },
      extras: ["hamper", "logs", "dogpack", "latecheckout", "ev", "celebration"]
    }
  ];

  // Optional extras offered at booking. `per`: "stay" or "night".
  root.LL.extras = {
    hamper: { label: "Welcome hamper", detail: "Local bread, eggs, bacon, cheese, chutney and a bottle of fizz", price: 45, per: "stay" },
    logs: { label: "Extra basket of logs", detail: "Kiln-dried, for the log burner", price: 12, per: "stay" },
    flowers: { label: "Flowers and chocolates", detail: "Waiting for you on arrival", price: 30, per: "stay" },
    dogpack: { label: "Dog welcome pack", detail: "Treats, a toy and a map of our favourite dog walks", price: 10, per: "stay" },
    celebration: { label: "Celebration set-up", detail: "Bunting, balloons and a cake from a local baker", price: 55, per: "stay" },
    latecheckout: { label: "Late check-out (1pm)", detail: "Only when nobody arrives that day; we'll confirm", price: 30, per: "stay" },
    ev: { label: "EV charging", detail: "7kW charger, charged at cost", price: 10, per: "night" }
  };
})(typeof window !== "undefined" ? window : globalThis);
