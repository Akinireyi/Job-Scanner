// Common US university abbreviations and nicknames that aren't obvious from
// the full name. Keys are what people type (lowercased). Values are the
// canonical school names as they appear in us-schools.json (or close
// variants — the matcher does case-insensitive comparison).
//
// This is for cases where the auto-computed acronym doesn't work, e.g.
//   "GT" vs "Georgia Institute of Technology" (auto would give "GIT")
//   "Cal" vs "University of California, Berkeley"
//   "UW" vs "University of Washington-Seattle Campus" (auto gives "UWSC")
//
// For schools where the acronym does match ("MIT" for "Massachusetts
// Institute of Technology"), no alias is needed — the acronym matcher
// handles it.

export const SCHOOL_ALIASES: Record<string, string[]> = {
  // UC system
  cal: ["University of California-Berkeley", "University of California, Berkeley"],
  // GT / Georgia Tech
  gt: ["Georgia Institute of Technology-Main Campus", "Georgia Institute of Technology"],
  gatech: ["Georgia Institute of Technology-Main Campus", "Georgia Institute of Technology"],
  // Washington campuses
  uw: [
    "University of Washington-Seattle Campus",
    "University of Washington-Tacoma Campus",
    "University of Washington-Bothell Campus",
  ],
  "uw seattle": ["University of Washington-Seattle Campus"],
  "uw tacoma": ["University of Washington-Tacoma Campus"],
  "uw bothell": ["University of Washington-Bothell Campus"],
  // Indiana
  iu: ["Indiana University-Bloomington"],
  iub: ["Indiana University-Bloomington"],
  iupui: ["Indiana University-Purdue University-Indianapolis"],
  // Ohio / Oregon / Oklahoma State (all OSU)
  osu: [
    "Ohio State University-Main Campus",
    "Oregon State University",
    "Oklahoma State University-Main Campus",
  ],
  // Penn / Portland State
  psu: [
    "Pennsylvania State University-Main Campus",
    "Portland State University",
  ],
  // Texas
  ut: ["The University of Texas at Austin"],
  "ut austin": ["The University of Texas at Austin"],
  "ut dallas": ["The University of Texas at Dallas"],
  "ut arlington": ["The University of Texas at Arlington"],
  // Michigan
  umich: ["University of Michigan-Ann Arbor"],
  "u of m": ["University of Michigan-Ann Arbor", "University of Minnesota-Twin Cities"],
  // Maryland
  umd: ["University of Maryland-College Park"],
  // Virginia
  uva: ["University of Virginia-Main Campus"],
  "virginia tech": ["Virginia Polytechnic Institute and State University"],
  vt: ["Virginia Polytechnic Institute and State University"],
  // Carolinas
  unc: ["University of North Carolina at Chapel Hill"],
  ncsu: ["North Carolina State University at Raleigh"],
  // Florida
  uf: ["University of Florida"],
  fsu: ["Florida State University"],
  ucf: ["University of Central Florida"],
  fiu: ["Florida International University"],
  fau: ["Florida Atlantic University"],
  usf: ["University of South Florida-Main Campus"],
  // Missouri / Missouri Columbia
  mizzou: ["University of Missouri-Columbia"],
  // Boston
  bc: ["Boston College"],
  bu: ["Boston University"],
  // Washington U
  wustl: ["Washington University in St Louis"],
  // Southern California / South Carolina ambiguity
  usc: ["University of Southern California", "University of South Carolina-Columbia"],
  // Arizona
  asu: ["Arizona State University-Tempe"],
  // Wisconsin
  wisc: ["University of Wisconsin-Madison"],
  // Minnesota
  umn: ["University of Minnesota-Twin Cities"],
  // Pittsburgh
  pitt: ["University of Pittsburgh-Pittsburgh Campus"],
  // Louisiana State
  lsu: ["Louisiana State University and Agricultural & Mechanical College"],
  // Cal Poly
  "cal poly": ["California Polytechnic State University-San Luis Obispo"],
  calpoly: ["California Polytechnic State University-San Luis Obispo"],
  slo: ["California Polytechnic State University-San Luis Obispo"],
  // SJSU / SFSU
  sjsu: ["San Jose State University"],
  sfsu: ["San Francisco State University"],
  csulb: ["California State University-Long Beach"],
  csun: ["California State University-Northridge"],
  // Penn (the Ivy)
  penn: ["University of Pennsylvania"],
  upenn: ["University of Pennsylvania"],
  // Notre Dame
  nd: ["University of Notre Dame"],
  "notre dame": ["University of Notre Dame"],
  // Vanderbilt
  vandy: ["Vanderbilt University"],
  // Short common
  cu: ["University of Colorado Boulder", "Clemson University"],
  uga: ["University of Georgia"],
  byu: ["Brigham Young University"],
};
