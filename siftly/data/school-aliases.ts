// Common US university abbreviations and nicknames.
// Keys are what people type (lowercased). Values are the exact school names
// as they appear in us-schools.json or supplementary-schools.ts.
//
// For schools where the auto-computed acronym works (e.g. "MIT" from
// "Massachusetts Institute of Technology"), no alias is needed.

export const SCHOOL_ALIASES: Record<string, string[]> = {
  // UC system — all use "University of California, X" with a comma
  cal: ["University of California, Berkeley"],
  ucb: ["University of California, Berkeley"],
  berkeley: ["University of California, Berkeley"],
  ucla: ["University of California, Los Angeles"],
  ucsd: ["University of California, San Diego"],
  ucsb: ["University of California, Santa Barbara"],
  ucd: ["University of California, Davis"],
  ucsc: ["University of California, Santa Cruz"],
  uci: ["University of California, Irvine"],
  ucr: ["University of California, Riverside"],
  ucm: ["University of California, Merced"],

  // Texas A&M
  tamu: ["Texas A&M University - College Station"],
  "texas a&m": ["Texas A&M University - College Station"],

  // UT system
  ut: ["University of Texas at Austin"],
  "ut austin": ["University of Texas at Austin"],

  // Colorado Boulder
  "cu boulder": ["University of Colorado Boulder"],
  cuboulder: ["University of Colorado Boulder"],
  "cu-boulder": ["University of Colorado Boulder"],
  "colorado boulder": ["University of Colorado Boulder"],

  // Michigan
  umich: ["University of Michigan", "University of Michigan-Ann Arbor"],
  "u of m": ["University of Michigan", "University of Michigan-Ann Arbor"],

  // Illinois
  uiuc: ["University of Illinois at Urbana-Champaign", "University of Illinois Urbana-Champaign"],
  uic: ["University of Illinois Chicago"],

  // Washington State (three campuses — "University of Washington" plain is
  // hidden from the list; users pick a campus)
  uw: [
    "University of Washington - Seattle",
    "University of Washington - Tacoma",
    "University of Washington - Bothell",
  ],
  "u dub": ["University of Washington - Seattle"],

  // Wisconsin
  wisc: ["University of Wisconsin-Madison"],
  "wisc madison": ["University of Wisconsin-Madison"],

  // Colorado (short form, since "cu" alone was useful)
  cu: ["University of Colorado Boulder"],

  // Minnesota
  umn: ["University of Minnesota", "University of Minnesota Twin Cities"],

  // Ohio / Oregon / Oklahoma State
  osu: [
    "Ohio State University",
    "The Ohio State University",
    "Oregon State University",
    "Oklahoma State University",
  ],

  // Penn State
  psu: ["Pennsylvania State University", "Penn State University"],
  "penn state": ["Pennsylvania State University", "Penn State University"],

  // Indiana
  iu: ["Indiana University", "Indiana University Bloomington"],
  iub: ["Indiana University Bloomington"],

  // Maryland
  umd: ["University of Maryland", "University of Maryland, College Park"],

  // Virginia
  uva: ["University of Virginia"],
  vt: ["Virginia Tech"],
  "virginia tech": ["Virginia Tech"],

  // Georgia Tech
  gt: ["Georgia Institute of Technology"],
  gatech: ["Georgia Institute of Technology"],
  "georgia tech": ["Georgia Institute of Technology"],

  // Carolinas
  unc: ["University of North Carolina at Chapel Hill"],
  ncsu: ["North Carolina State University"],

  // Florida
  uf: ["University of Florida"],
  fsu: ["Florida State University"],
  ucf: ["University of Central Florida"],
  fiu: ["Florida International University"],
  fau: ["Florida Atlantic University"],
  usf: ["University of South Florida"],

  // Johns Hopkins
  jhu: ["Johns Hopkins University"],

  // Washington University in St. Louis
  wustl: ["Washington University in St. Louis"],
  "wash u": ["Washington University in St. Louis"],

  // NYC
  nyu: ["New York University"],

  // Pitt
  pitt: ["University of Pittsburgh"],

  // Carnegie Mellon
  cmu: ["Carnegie Mellon University"],

  // MIT
  mit: ["Massachusetts Institute of Technology"],

  // Boston
  bc: ["Boston College"],
  bu: ["Boston University"],
  umass: ["University of Massachusetts Amherst"],

  // South Carolina / Southern Cal
  usc: ["University of Southern California"],

  // Missouri
  mizzou: ["University of Missouri"],

  // Arizona
  asu: ["Arizona State University"],

  // Penn (Ivy)
  penn: ["University of Pennsylvania"],
  upenn: ["University of Pennsylvania"],

  // Notre Dame / Vandy
  nd: ["University of Notre Dame"],
  "notre dame": ["University of Notre Dame"],
  vandy: ["Vanderbilt University"],

  // SUNY
  "stony brook": ["Stony Brook University"],
  binghamton: ["Binghamton University"],

  // Cal Poly
  "cal poly": ["California Polytechnic State University-San Luis Obispo"],
  calpoly: ["California Polytechnic State University-San Luis Obispo"],

  // Cal State
  sjsu: ["San Jose State University"],
  sfsu: ["San Francisco State University"],

  // Rutgers
  rutgers: ["Rutgers University"],

  // Michigan State / Georgia
  msu: ["Michigan State University"],
  uga: ["University of Georgia"],

  // Rice / Baylor
  byu: ["Brigham Young University"],
};
