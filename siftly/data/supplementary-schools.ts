// Schools missing from the Hipolabs us-schools.json dataset.
// These get merged with that dataset in onboarding-form.tsx.
//
// If you spot another major US school that doesn't autocomplete, add it here.

export const SUPPLEMENTARY_US_SCHOOLS: string[] = [
  // Big flagships that Hipolabs dropped
  "University of Colorado Boulder",
  "University of Michigan",
  "University of Michigan-Ann Arbor",
  "University of Illinois",
  "University of Illinois at Urbana-Champaign",
  "University of Texas at Austin",
  "University of Wisconsin-Madison",
  "Ohio State University",
  "The Ohio State University",
  "Indiana University Bloomington",
  "University of Maryland",
  "University of Virginia",
  "University of Massachusetts Amherst",
  "University of Minnesota Twin Cities",
  "University of Nebraska-Lincoln",
  "Washington University in St. Louis",

  // UW split campuses (the plain "University of Washington" from the
  // base dataset is filtered out so only the 3 campuses show)
  "University of Washington - Seattle",
  "University of Washington - Tacoma",
  "University of Washington - Bothell",

  // Major state schools missing
  "Stony Brook University",
  "Binghamton University",
  "Penn State University",
  "University of Alabama in Huntsville",
  "University of Alabama at Birmingham",
  "University of Tennessee Knoxville",
];
