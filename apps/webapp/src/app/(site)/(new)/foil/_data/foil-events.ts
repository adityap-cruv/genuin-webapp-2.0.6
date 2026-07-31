export type FoilEventNote = {
  label: string;
  value: string;
};

export type FoilEventSession = {
  day: string;
  title: string;
  detail: string;
};

export type FoilEvent = {
  slug: string;
  venue: string;
  country: string;
  dates: string;
  status: string;
  title: string;
  summary: string;
  overview: readonly string[];
  courseNotes: readonly FoilEventNote[];
  sessions: readonly FoilEventSession[];
};

const events: readonly FoilEvent[] = [
  {
    slug: "sydney",
    venue: "Sydney",
    country: "Australia",
    dates: "14–16 Feb",
    status: "Done",
    title: "Sydney set the early championship benchmark",
    summary:
      "A compressed harbour course rewarded decisive starts, clean manoeuvres and teams that could turn shifting pressure into immediate speed.",
    overview: [
      "Sydney opened the season with the fleet racing inside a tight, high-consequence harbour arena. Short approach times and rapidly changing pressure made positioning as important as outright pace, with small errors carrying through an entire leg.",
      "The strongest teams protected the inside lanes, stayed composed through crowded mark roundings and converted every stable patch of breeze. The event established the tactical themes that will shape the championship: efficient starts, disciplined communication and reliable boat handling under pressure.",
    ],
    courseNotes: [
      { label: "Race area", value: "Urban harbour with compressed boundaries" },
      { label: "Primary test", value: "Starts, traffic management and rapid transitions" },
      { label: "Key signal", value: "Clean exits from the first mark" },
    ],
    sessions: [
      { day: "Friday", title: "Practice review", detail: "Teams mapped pressure lanes and rehearsed high-traffic starts." },
      { day: "Saturday", title: "Fleet racing", detail: "Short-course execution established the leading contenders." },
      { day: "Sunday", title: "Finals recap", detail: "Consistency and low-error manoeuvres decided the podium." },
    ],
  },
  {
    slug: "auckland",
    venue: "Auckland",
    country: "New Zealand",
    dates: "20–22 Mar",
    status: "Next up",
    title: "Home-water knowledge meets an unpredictable Hauraki Gulf",
    summary:
      "Auckland's open-water pressure lanes and local current reward teams that can read the course early and change modes without hesitation.",
    overview: [
      "Auckland brings the fleet onto water where local knowledge matters but never guarantees control. The Hauraki Gulf can present clean speed lanes one moment and fragmented pressure the next, demanding constant communication between the wing trimmer, flight controller and driver.",
      "New Zealand will carry the home-water spotlight, while the chasing teams focus on matching its confidence through the start box and first reach. The decisive question is whether crews can remain stable when the breeze shifts between marginal foiling and full-power racing.",
    ],
    courseNotes: [
      { label: "Race area", value: "Hauraki Gulf with open-water pressure changes" },
      { label: "Primary test", value: "Mode changes and current awareness" },
      { label: "Key signal", value: "First-reach speed after a contested start" },
    ],
    sessions: [
      { day: "Friday", title: "Course familiarisation", detail: "Crews validate current models and foil settings." },
      { day: "Saturday", title: "Opening races", detail: "Start-line accuracy and pressure selection come into focus." },
      { day: "Sunday", title: "Final fleet", detail: "Championship points are decided under home-water pressure." },
    ],
  },
  {
    slug: "saint-tropez",
    venue: "Saint-Tropez",
    country: "France",
    dates: "17–19 Apr",
    status: "Upcoming",
    title: "Mediterranean shifts turn Saint-Tropez into a precision test",
    summary:
      "Thermal breeze, coastal effects and the possibility of stronger offshore pressure make setup range and patient decision-making essential.",
    overview: [
      "Saint-Tropez places the fleet between a technical shoreline and an exposed Mediterranean racecourse. Crews must prepare for changing wind character across the day, balancing low-drag settings with enough control for stronger gusts.",
      "France arrives with a natural home-event incentive, but the venue generally rewards the team that adapts fastest rather than the one carrying the most familiar playbook. Keeping manoeuvres smooth while the course shifts will be central to protecting position.",
    ],
    courseNotes: [
      { label: "Race area", value: "Mediterranean coast with thermal influence" },
      { label: "Primary test", value: "Setup range and patient tactical timing" },
      { label: "Key signal", value: "Stable flight through uneven pressure" },
    ],
    sessions: [
      { day: "Friday", title: "Weather window", detail: "Teams compare thermal and offshore setup options." },
      { day: "Saturday", title: "Qualifying races", detail: "Adaptability across changing conditions drives position." },
      { day: "Sunday", title: "Event final", detail: "Execution under coastal pressure determines the winner." },
    ],
  },
  {
    slug: "plymouth",
    venue: "Plymouth",
    country: "Great Britain",
    dates: "15–17 May",
    status: "Upcoming",
    title: "Plymouth combines Atlantic power with a tactical shoreline",
    summary:
      "Headlands, current and Atlantic pressure create a demanding venue where confident boat handling must be paired with disciplined route selection.",
    overview: [
      "Plymouth Sound can compress the fleet before releasing it into stronger, less sheltered pressure. The transition asks crews to manage acceleration, sea state and boundary decisions without sacrificing the tactical position established at the start.",
      "For the British team, the home event raises expectations. Rivals will look for gains in the current and along the shoreline, while flight controllers work to keep the platform settled whenever the Atlantic swell reaches the course.",
    ],
    courseNotes: [
      { label: "Race area", value: "Plymouth Sound with Atlantic exposure" },
      { label: "Primary test", value: "Current strategy and heavy-air control" },
      { label: "Key signal", value: "Acceleration out of sheltered sections" },
    ],
    sessions: [
      { day: "Friday", title: "Heavy-air preparation", detail: "Crews assess sea state and high-load manoeuvres." },
      { day: "Saturday", title: "Fleet programme", detail: "Boundary choices and current strategy shape the order." },
      { day: "Sunday", title: "Final showdown", detail: "The most complete all-condition package is rewarded." },
    ],
  },
  {
    slug: "halifax",
    venue: "Halifax",
    country: "Canada",
    dates: "12–14 Jun",
    status: "Upcoming",
    title: "Halifax introduces cold-water speed and an Atlantic unknown",
    summary:
      "A new harbour challenge brings colder water, possible fog and Atlantic swell into a race weekend built around preparation and fast learning.",
    overview: [
      "Halifax asks every team to build a useful race model quickly. Harbour geometry, colder conditions and Atlantic influence can change both the breeze and the way the boats accelerate, making practice data unusually valuable.",
      "The crews that establish reliable reference points early will be best positioned when racing begins. Expect teams to prioritise visibility, clean communication and conservative setup choices before progressively unlocking more speed.",
    ],
    courseNotes: [
      { label: "Race area", value: "Atlantic harbour with cold-water conditions" },
      { label: "Primary test", value: "Rapid learning and visibility management" },
      { label: "Key signal", value: "Practice-to-race setup improvement" },
    ],
    sessions: [
      { day: "Friday", title: "Venue discovery", detail: "Teams establish baselines for breeze, swell and current." },
      { day: "Saturday", title: "Opening contest", detail: "Fast learners convert limited data into race pace." },
      { day: "Sunday", title: "Atlantic final", detail: "Preparation and adaptability decide the event." },
    ],
  },
];

export function getFoilEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

