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

  // ============================================================
  // International
  // ============================================================

  // UK & Ireland
  oxford: ["University of Oxford"],
  "ox bridge": ["University of Oxford", "University of Cambridge"],
  oxbridge: ["University of Oxford", "University of Cambridge"],
  cambridge: ["University of Cambridge"],
  imperial: ["Imperial College London"],
  icl: ["Imperial College London"],
  ucl: ["University College London"],
  kcl: ["King's College London"],
  lse: ["London School of Economics and Political Science"],
  edinburgh: ["University of Edinburgh"],
  "st andrews": ["University of St Andrews"],
  tcd: ["Trinity College Dublin"],
  "trinity dublin": ["Trinity College Dublin"],
  ucd_ireland: ["University College Dublin"],

  // Canada
  ubc: ["University of British Columbia"],
  uoft: ["University of Toronto"],
  "u of t": ["University of Toronto"],
  mcgill: ["McGill University"],
  uwaterloo: ["University of Waterloo"],
  waterloo: ["University of Waterloo"],
  "u of waterloo": ["University of Waterloo"],
  sfu: ["Simon Fraser University"],
  "u of montreal": ["Université de Montréal"],
  "hec montreal": ["HEC Montréal"],

  // Australia & NZ
  "u of melbourne": ["University of Melbourne"],
  melbourne: ["University of Melbourne"],
  monash: ["Monash University"],
  usyd: ["University of Sydney"],
  "u of sydney": ["University of Sydney"],
  unsw: ["University of New South Wales"],
  anu: ["Australian National University"],
  uq: ["University of Queensland"],
  "u of auckland": ["University of Auckland"],

  // Germany / Switzerland / Austria
  eth: ["ETH Zurich"],
  ethz: ["ETH Zurich"],
  epfl: ["EPFL"],
  tum: ["Technical University of Munich"],
  lmu: ["Ludwig Maximilian University of Munich"],
  "tu berlin": ["Technical University of Berlin"],
  "rwth aachen": ["RWTH Aachen"],

  // Netherlands / Nordic
  uva_amsterdam: ["University of Amsterdam"],
  "tu delft": ["Delft University of Technology"],
  kuleuven: ["KU Leuven"],
  "ku leuven": ["KU Leuven"],
  ki: ["Karolinska Institute"],
  kth: ["KTH Royal Institute of Technology"],

  // France / Southern Europe
  "sciences po": ["Sciences Po"],
  "hec paris": ["HEC Paris"],
  insead: ["INSEAD"],
  ens: ["École Normale Supérieure Paris"],
  "x paris": ["École Polytechnique"],
  bocconi: ["Bocconi University"],
  polimi: ["Politecnico di Milano"],
  ie: ["IE University", "IE Business School"],

  // Asia — East
  nus: ["National University of Singapore"],
  ntu_singapore: ["Nanyang Technological University"],
  "ntu singapore": ["Nanyang Technological University"],
  tsinghua: ["Tsinghua University"],
  pku: ["Peking University"],
  fudan: ["Fudan University"],
  sjtu: ["Shanghai Jiao Tong University"],
  zju: ["Zhejiang University"],
  hku: ["University of Hong Kong"],
  hkust: ["Hong Kong University of Science and Technology"],
  cuhk: ["Chinese University of Hong Kong"],
  cityu: ["City University of Hong Kong"],
  polyu: ["Hong Kong Polytechnic University"],
  todai: ["University of Tokyo"],
  "u tokyo": ["University of Tokyo"],
  "kyoto u": ["Kyoto University"],
  titech: ["Tokyo Institute of Technology"],
  snu: ["Seoul National University"],
  kaist: ["KAIST"],
  postech: ["POSTECH"],
  ntu_taiwan: ["National Taiwan University"],

  // India
  iitb: ["Indian Institute of Technology Bombay"],
  "iit bombay": ["Indian Institute of Technology Bombay"],
  iitd: ["Indian Institute of Technology Delhi"],
  "iit delhi": ["Indian Institute of Technology Delhi"],
  iitm: ["Indian Institute of Technology Madras"],
  "iit madras": ["Indian Institute of Technology Madras"],
  iitk: ["Indian Institute of Technology Kanpur"],
  "iit kanpur": ["Indian Institute of Technology Kanpur"],
  iitkgp: ["Indian Institute of Technology Kharagpur"],
  "iit kharagpur": ["Indian Institute of Technology Kharagpur"],
  iisc: ["Indian Institute of Science"],
  iima: ["Indian Institute of Management Ahmedabad"],
  "iim ahmedabad": ["Indian Institute of Management Ahmedabad"],
  iimb: ["Indian Institute of Management Bangalore"],
  "iim bangalore": ["Indian Institute of Management Bangalore"],
  iimc: ["Indian Institute of Management Calcutta"],
  "iim calcutta": ["Indian Institute of Management Calcutta"],
  du: ["Delhi University"],
  jnu: ["Jawaharlal Nehru University"],
  bits: ["BITS Pilani"],

  // Middle East / Africa
  technion: ["Technion – Israel Institute of Technology"],
  uct: ["University of Cape Town"],
  wits: ["University of the Witwatersrand"],

  // Latin America
  usp: ["University of São Paulo"],
  unam: ["UNAM — Universidad Nacional Autónoma de México"],
  tec: ["Tecnológico de Monterrey"],
  monterrey: ["Tecnológico de Monterrey"],
};
