export interface Graph {
  id: string;
  imageUrl: string;
  caption: string;
  type: string;
  extractedData?: Array<{
    x: number;
    y: number;
  }>;
}

export interface Article {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  abstract: string;
  doi: string;
  license: string;
  pmid: string;
  graphCount: number;
  graphs: Graph[];
}

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Pharmacokinetics of Propofol in Patients Undergoing General Anesthesia",
    authors: ["Silva J", "Santos M", "Oliveira P"],
    year: 2023,
    journal: "Journal of Anesthesia",
    abstract: "This study investigates the pharmacokinetic properties of propofol in adult patients undergoing general anesthesia. Blood samples were collected at multiple time points to measure propofol concentrations. The data shows typical time-concentration profiles with rapid distribution and elimination phases.",
    doi: "10.1234/ja.2023.001",
    license: "CC-BY",
    pmid: "PMC12345678",
    graphCount: 2,
    graphs: [
      {
        id: "g1",
        imageUrl: "/placeholder-graph.png",
        caption: "Figure 1: Plasma concentration of propofol over time following a single bolus injection of 2 mg/kg",
        type: "Line graph",
        extractedData: [
          { x: 0, y: 0 },
          { x: 1, y: 4.5 },
          { x: 2, y: 3.8 },
          { x: 4, y: 2.5 },
          { x: 6, y: 1.7 },
          { x: 8, y: 1.1 },
          { x: 10, y: 0.7 },
          { x: 12, y: 0.4 }
        ]
      },
      {
        id: "g2",
        imageUrl: "/placeholder-graph.png",
        caption: "Figure 2: Correlation between propofol dose and peak plasma concentration",
        type: "Scatter plot"
      }
    ]
  },
  {
    id: "2",
    title: "Comparative Study of Opioid Analgesics: Pharmacodynamic Responses",
    authors: ["Johnson R", "Williams T", "Brown K", "Davis L"],
    year: 2022,
    journal: "Pain Medicine",
    abstract: "A comprehensive analysis comparing the pharmacodynamic responses of various opioid analgesics. The study includes pain relief measurements, respiratory depression monitoring, and adverse effects documentation across different patient populations.",
    doi: "10.1234/pm.2022.045",
    license: "CC-BY-NC",
    pmid: "PMC87654321",
    graphCount: 3,
    graphs: [
      {
        id: "g3",
        imageUrl: "/placeholder-graph.png",
        caption: "Figure 1: Pain intensity scores over 24 hours for different opioid treatments",
        type: "Line graph"
      },
      {
        id: "g4",
        imageUrl: "/placeholder-graph.png",
        caption: "Figure 2: Dose-response curves for respiratory depression",
        type: "Dose-response curve"
      },
      {
        id: "g5",
        imageUrl: "/placeholder-graph.png",
        caption: "Figure 3: Frequency of adverse events by opioid type",
        type: "Bar chart"
      }
    ]
  },
  {
    id: "3",
    title: "Bioavailability of Oral Midazolam in Pediatric Patients",
    authors: ["Chen W", "Zhang L"],
    year: 2024,
    journal: "Pediatric Pharmacology",
    abstract: "Investigation of the bioavailability and pharmacokinetics of oral midazolam in pediatric patients aged 2-12 years. The study demonstrates age-dependent variations in drug absorption and metabolism.",
    doi: "10.1234/pp.2024.012",
    license: "CC-BY",
    pmid: "PMC11223344",
    graphCount: 1,
    graphs: [
      {
        id: "g6",
        imageUrl: "/placeholder-graph.png",
        caption: "Figure 1: Plasma midazolam concentration-time profiles in different age groups",
        type: "Line graph"
      }
    ]
  }
];
