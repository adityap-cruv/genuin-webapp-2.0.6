export type FoilBeyondStoryFact = {
  label: string;
  value: string;
};

export type FoilBeyondStory = {
  slug: string;
  tag: string;
  title: string;
  byline: string;
  summary: string;
  paragraphs: readonly string[];
  facts: readonly FoilBeyondStoryFact[];
  outlookTitle: string;
  outlook: readonly string[];
};

const stories: readonly FoilBeyondStory[] = [
  {
    slug: "americas-cup-next-ac75",
    tag: "America's Cup",
    title: "Team New Zealand unveils the first AC75 of the next cycle — and it's smaller than anyone expected.",
    byline: "By R. Kawhena · 5 min read",
    summary:
      "A more compact AC75 concept shifts the design conversation from scale alone toward packaging, control and repeatable speed across a wider range of conditions.",
    paragraphs: [
      "The first look at Team New Zealand's next-generation AC75 immediately changes the visual language of the class. The platform appears tighter and more integrated, with less unused volume and a clearer relationship between the hull, foil systems and crew positions.",
      "That smaller profile should not be read as a retreat from performance. In foiling design, reduced size can lower drag and sharpen control, provided the team can preserve power through manoeuvres and maintain stable flight when the breeze becomes uneven. The design challenge is therefore less about producing one headline speed and more about making speed accessible throughout a race.",
      "Crew ergonomics are equally important. A compact layout shortens communication paths and can make repeated manoeuvres cleaner, but it leaves less tolerance for systems that are difficult to service or operate under load. Every control, camera, line and access point has to earn its place.",
    ],
    facts: [
      { label: "Design direction", value: "Compact platform with tightly integrated systems" },
      { label: "Potential gain", value: "Lower drag and faster mode changes" },
      { label: "Primary risk", value: "Reduced packaging and setup tolerance" },
    ],
    outlookTitle: "What the smaller platform changes",
    outlook: [
      "The decisive evidence will arrive when the boat is asked to accelerate from displacement, turn through a crowded pre-start and recover after a marginal manoeuvre. Those transitions will show whether the compact approach delivers usable race pace rather than isolated straight-line speed.",
      "For rival teams, the reveal provides an early reference point rather than a finished answer. The next phase of the cycle will be shaped by how quickly each programme can translate its simulations into reliable time on the water.",
    ],
  },
  {
    slug: "olympic-49er-hyeres",
    tag: "Olympic 49er",
    title: "Italy stamped their authority all over the Bay of Hyères this week. Here's how.",
    byline: "By F. Rossi · 6 min read",
    summary:
      "Clean starts, disciplined mode selection and low-risk consistency gave the Italian programme control of a demanding week on the Bay of Hyères.",
    paragraphs: [
      "Hyères rarely rewards a single strength. The shoreline, thermal pressure and changing sea state force 49er crews to connect several small decisions, and the Italian sailors built their week around doing exactly that.",
      "Their starts were assertive without becoming desperate. Rather than fighting for one fragile lane, the crews protected enough space to accelerate and then used coordinated trim and steering to keep the boat moving through the first uneven patches of pressure.",
      "The greatest advantage appeared after the opening exchange. When other boats chased isolated gusts or overcommitted to a side, Italy kept the platform stable and accepted short-term losses that protected the larger route. That restraint turned a series of difficult races into a consistently strong scorecard.",
    ],
    facts: [
      { label: "Key strength", value: "Repeatable acceleration from the start" },
      { label: "Race model", value: "Protect the average lane, then attack pressure" },
      { label: "Technical edge", value: "Stable transitions through changing sea state" },
    ],
    outlookTitle: "A benchmark for the next regatta",
    outlook: [
      "The result gives the Italian squad a useful reference for venues where the breeze is unstable and tactical patience matters. It also gives rivals a clear problem to solve: matching the Italians' speed without sacrificing the calm decision-making that made the programme so effective.",
      "The next test will be whether the same approach holds when the fleet faces stronger pressure and shorter reaction times. If it does, Hyères will look less like an exceptional week and more like the beginning of a durable competitive pattern.",
    ],
  },
  {
    slug: "ocean-race-inshore-intensity",
    tag: "Ocean Race",
    title: "Offshore at inshore intensity — that is the new reality of ocean racing.",
    byline: "By S. Larsen · 8 min read",
    summary:
      "Modern ocean racing now demands the endurance of an offshore campaign and the precision, data speed and tactical aggression of an inshore sprint.",
    paragraphs: [
      "The traditional separation between offshore patience and inshore intensity is disappearing. Crews still need to protect people and equipment over long distances, but they are now making high-frequency tactical decisions from the opening minutes until the final approach.",
      "Better weather models and richer onboard data have increased the number of useful choices available to a navigator. They have also reduced the time allowed to act. A route that once remained viable for hours can now be challenged by a new pressure signal, a rival's speed mode or a small shift in sea state.",
      "That pressure changes how teams organise themselves. Watch systems must preserve enough energy for heavy-weather work while keeping the right specialists available for decisive transitions. The strongest crews treat recovery, maintenance and tactical preparation as one continuous performance system.",
    ],
    facts: [
      { label: "Modern demand", value: "Endurance with sprint-level decision speed" },
      { label: "Operational focus", value: "Integrated navigation, maintenance and recovery" },
      { label: "Competitive signal", value: "Faster response to changing pressure and sea state" },
    ],
    outlookTitle: "The new offshore advantage",
    outlook: [
      "Winning programmes will be the ones that can create inshore-quality decisions without exhausting the crew or damaging the boat. That balance depends on robust systems, clear role ownership and a culture that can move quickly without becoming chaotic.",
      "The next generation of ocean racers will therefore be judged on more than speed in a single mode. Their real advantage will be the ability to stay tactically sharp while the platform and crew absorb days of accumulated load.",
    ],
  },
];

export function getFoilBeyondStory(slug: string) {
  return stories.find((story) => story.slug === slug);
}
