import athleteData from "./athletes.json";

export type FoilAthleteStat = {
  value: string;
  suffix?: string;
  label: string;
};

export type FoilAthleteResult = [
  event: string,
  venue: string,
  race1: string,
  race2: string,
  race3: string,
  overall: string,
];

export type FoilAthlete = {
  slug: string;
  source_url: string;
  name: string;
  tag: string;
  team: string;
  role: string;
  rank: string;
  hero: {
    url: string;
    alt: string;
  };
  stats: FoilAthleteStat[];
  about_title: string;
  about: string[];
  quote: string;
  results: FoilAthleteResult[];
  outlook: string[];
};

type GeneratedAthleteSeed = {
  slug: string;
  name: string;
  team: string;
  country: string;
  rank: string;
  points: string;
  latestFinish: string;
  trend: string;
  heroIndex?: number;
};

const ASSET_ROOT =
  "https://octocanvas-artifacts.s3.ap-south-1.amazonaws.com/sessions/b6695b6a8a0b444699c9337f0723d88e/generated";

const generatedAthleteSeeds: GeneratedAthleteSeed[] = [
  { slug: "mills", name: "Dylan Mills", team: "Emirates GBR SailGP Team", country: "Great Britain", rank: "#4", points: "54", latestFinish: "5th", trend: "Stalling", heroIndex: 4 },
  { slug: "grael", name: "Martine Grael", team: "Brazil SailGP Team", country: "Brazil", rank: "#11", points: "—", latestFinish: "—", trend: "Building", heroIndex: 5 },
  { slug: "barcelo", name: "Diego Barceló", team: "Spain SailGP Team", country: "Spain", rank: "#5", points: "47", latestFinish: "4th", trend: "Steady", heroIndex: 6 },
  { slug: "hogh-christensen", name: "Høgh-Christensen", team: "ROCKWOOL Denmark SailGP Team", country: "Denmark", rank: "#6", points: "42", latestFinish: "7th", trend: "Fading" },
  { slug: "buchan", name: "Buchan", team: "United States SailGP Team", country: "United States", rank: "#7", points: "39", latestFinish: "6th", trend: "Climbing" },
  { slug: "bjorn", name: "Bjorn", team: "Switzerland SailGP Team", country: "Switzerland", rank: "#8", points: "33", latestFinish: "8th", trend: "Steady" },
  { slug: "saunders", name: "Saunders", team: "Canada SailGP Team", country: "Canada", rank: "#9", points: "28", latestFinish: "9th", trend: "Freefall" },
  { slug: "ehman", name: "Ehman", team: "Germany SailGP Team", country: "Germany", rank: "#10", points: "24", latestFinish: "10th", trend: "Lurking" },
];

function createGeneratedAthlete(seed: GeneratedAthleteSeed): FoilAthlete {
  const heroFile = seed.heroIndex ? `athlete-${seed.heroIndex}_v0.png` : "countdown-hero-bg_v0.png";
  const rankNumber = seed.rank.replace("#", "");

  return {
    slug: seed.slug,
    source_url: "",
    name: seed.name,
    tag: "Athlete Profile · Championship Contender",
    team: seed.team,
    role: "Driver",
    rank: `${seed.rank} · ${seed.points} pts`,
    hero: {
      url: `${ASSET_ROOT}/${heroFile}`,
      alt: `${seed.name} — ${seed.team}`,
    },
    stats: [
      { value: seed.points, label: "Points" },
      { value: rankNumber, label: "Championship Rank" },
      { value: seed.latestFinish, label: "Latest Finish" },
      { value: seed.trend, label: "Current Trend" },
    ],
    about_title: `About ${seed.name}`,
    about: [
      `${seed.name} represents ${seed.team} in the 2025 SailGP championship. The campaign currently places the team ${seed.rank} in the standings with ${seed.points} points, reflecting the pace, execution and consistency required across a demanding international season.`,
      `Racing for ${seed.country}, ${seed.name} operates in an environment where starts, pressure changes and high-speed manoeuvres can reshape an event in seconds. The latest listed result is ${seed.latestFinish} in Sydney, while the current championship trend is ${seed.trend.toLowerCase()}.`,
      `The next phase of the season is about converting competitive moments into complete weekends. Clean starts, reliable boat handling and disciplined decisions around the course will determine how far ${seed.team} can move before the final events.`,
    ],
    quote: `Every event is another opportunity for ${seed.team} to turn preparation into championship points.`,
    results: [["SailGP Sydney", "Sydney Harbour", "—", "—", "—", seed.latestFinish]],
    outlook: [
      `${seed.team} enters the remaining events from ${seed.rank} position with ${seed.points} points. The immediate target is to improve on the latest ${seed.latestFinish} result and build momentum through more consistent finishes.`,
      `With the championship still developing, gains at the start and cleaner execution through the first mark offer the clearest route forward for ${seed.name} and the team.`,
    ],
  };
}

const generatedAthletes = generatedAthleteSeeds.map(createGeneratedAthlete);

export const foilAthletes = [...(athleteData.athletes as FoilAthlete[]), ...generatedAthletes];

export function getFoilAthlete(slug: string) {
  return foilAthletes.find((athlete) => athlete.slug === slug);
}
