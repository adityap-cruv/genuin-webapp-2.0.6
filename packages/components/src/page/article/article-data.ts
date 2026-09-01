// Article data + accessors for the on-domain /article/<slug> pages.
//
// Server-safe (NO "use client"): the route (server component) and home.tsx both import
// from here. The content is an auto-generated snapshot from thefoil.com; getArticleBySlug
// is the single seam to later swap the static snapshot for the real publisher DB.

/**
 * Data model for on-domain article pages.
 *
 * The home page's editorial links (Intelligence "Latest News" / "Relevant News",
 * "Latest Interviews", the podcast wheel, and the Upcoming Races event cards) used
 * to open thefoil.com in a new tab. They now point at `/article/<slug>`, which
 * renders the article's content on our own domain from {@link Article} records.
 *
 * The content currently lives in a static snapshot (`article-content.ts`), read
 * through {@link getArticleBySlug}. That accessor is the single seam to later back
 * these pages with the real publisher DB/API without touching any component.
 */

/** A single block of an article's body, rendered in order. */
export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string };

/** What kind of editorial content an article represents (drives the header label). */
export type ArticleKind = "news" | "interview" | "podcast" | "event";

/** Where an article was sourced from (attribution back to the original). */
export type ArticleSource = {
  /** Human-readable publisher name, e.g. "The Foil". */
  name: string;
  /** The original canonical URL the content was snapshotted from. */
  url: string;
};

/** A publisher article rendered on our own domain. */
export type Article = {
  /**
   * URL slug — the last path segment of the source article. Doubles as the
   * `/article/<slug>` route param, so it must be unique and URL-safe.
   */
  slug: string;
  kind: ArticleKind;
  title: string;
  /** Dek / standfirst shown under the headline (optional). */
  standfirst?: string;
  /** Byline (name + role) as displayed on the source (optional). */
  author?: string;
  /** Publish date, as displayed on the source (optional). */
  publishedAt?: string;
  heroImage: { src: string; alt: string };
  /** Ordered body content. */
  body: ArticleBlock[];
  /** Event-only: the date range shown in the event header. */
  eventDate?: string;
  /** Event-only: the venue / city shown in the event header. */
  location?: string;
  source: ArticleSource;
};

/** Slug → article lookup, the shape of the static snapshot in `article-content.ts`. */
export type ArticleContentMap = Record<string, Article>;

// AUTO-GENERATED editorial snapshot — do not hand-edit.
//
// Content captured from thefoil.com for the home page's on-domain article pages.
// Keyed by slug and read through `getArticleBySlug` (see get-article.ts); replace
// this map with a DB/API fetch when the real content store is available.

export const ARTICLE_CONTENT: ArticleContentMap = {
  "the-week-in-racing-31-august-26": {
    slug: "the-week-in-racing-31-august-26",
    kind: "news",
    title: "The week in racing - 31 August '26",
    standfirst:
      "This week we've seen a new ILCA 7 world champion crowned in Dublin Bay, the 52 Super Series title race turned on its head in Lanzarote, and the IMOCA fleet limbering up for a transatlantic sprint that gets under way on Tuesday. Plenty more on the horizon too, with three more world championships kicking off in the next week. Let's get into it…",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "31st August 2026 8:09pm",
    heroImage: {
      src: "https://thefoil.com/media/V2AOSGzowX882GEvCSH1btIYLouzhrxlvmXJFvPz9nQ/resize:fill-down:1500:500/gravity:fp:0.5340425532:0.5096842222/quality:60/dpr:1/2026/08/ilca-mens-medal-race76900-jordan-roberts-down-under-sail.jpg",
      alt: "The week in racing - 31 August '26",
    },
    body: [
      {
        type: "heading",
        text: "Vadnai writes Hungary into the record books at ILCA 7 Worlds",
      },
      {
        type: "paragraph",
        text: 'Hungary had never won a sailing world title in the ILCA 7 fleet, nor a medal of any colour, so Jonatán Vadnai\'s victory at Dún Laoghaire last week is a proper landmark. He came into the final day needing a big score and delivered exactly that, a 4-1 sealing the title on 47 points. "Yesterday I had a super tough day, and thanks to this new format, I was back in the game," said Vadnai. "I just went for it, and I\'m so happy I managed to do it."',
      },
      {
        type: "paragraph",
        text: "The win clearly meant a lot to the 28-year-old Hungarian: \"I've been sailing this boat since I was a little kid, and I've always looked up to the idols in this class and the World Championship titles. We have this beautiful blue plaque with the biggest names in sailing, and to write my name there is just really incredible – especially coming from Hungary. We're not a huge sailing nation, and it means so much. I believe we have a lot of talent coming up, but we haven't had many results yet – we're starting to perform. So I hope the young guys back home can see this and jump in a boat, and feel motivated that they can do it too.\"",
      },
      {
        type: "paragraph",
        text: "Behind him, Matt Wearn was the man everyone was watching. The Australian had won every Sailing Grand Slam event he'd raced this season, arriving in Dublin as the man to beat, only to sit ninth overnight going into the final day. He answered with a win and a second to jump to silver, his seventh ILCA 7 Worlds medal.",
      },
      {
        type: "paragraph",
        text: "\"Crossing the finish line, I didn't really have any idea what the scores were,\" Wearn said after. \"I knew it was going to be super close, but to come away with a Silver medal feels pretty good. I think it's probably a bit of experience showing – I've had plenty of regattas over the years where it hasn't gone well and I haven't been able to pick myself up, and you learn from that too. This year has been really good for me, and I haven't had to do that as much – a bit of a shame it happened at the Worlds, so I just had to keep chipping away. It goes to show you need to keep the consistency there and save every point you can, to make sure you're in the hunt towards the end of the regatta.\"",
      },
      {
        type: "paragraph",
        text: "Mickey Beckett took bronze for Britain, edging out a fleet so tightly bunched that just three points separated the top seven when the racing was done. The next ILCA 7 Worlds isn't far off, at the Fortaleza 2027 World Sailing Championships in January, which will double as the first LA 2028 qualification event. Full results here.",
      },
      {
        type: "heading",
        text: "52SS: Platoon Aviation seal fourth Royal Cup crown in Puerto Calero",
      },
      {
        type: "paragraph",
        text: 'Platoon Aviation banked their fourth Royal Cup title in Puerto Calero, a result that marked a proper return to form for Harm Müller-Spreer\'s German crew, two years on from their last regatta win in Valencia, September 2024. They wrapped it up with a race to spare. "It is a while since that has been achieved in the 52 SUPER SERIES," said Müller-Spreer. "For me it feels good, very special on the day after the donor of the Cup passed away, King Harald … I am very proud, a bit emotional but we need to focus because right now, we are 11 points ahead in the whole season and if somebody told me that before, that we\'d be here after this week, 11 points ahead, I would sign it right away."',
      },
      {
        type: "paragraph",
        text: "The real battle was for second place. Brazil's Crioula, helmed by brothers Eduardo and Renato Plass, spent most of the week picking their way up from the back of the fleet, only to snatch the runner-up spot on the final day by a single point from Turkey's Provezza – cruel timing for Ergin Imre's crew, who'd sat second overall going into that last race. \"Finally a great result!\" said Crioula co-owner Plass. \"After bad starts and bad days we came from the back of the fleet. We never started first, always the last or 11th place but we managed to get there. We never gave up. That's our thing.\"",
      },
      {
        type: "paragraph",
        text: "It wasn't such a happy week for Takashi Okura's Sled. The reigning champions arrived with a commanding 17-point championship lead and left trailing Platoon Aviation in second by 11, after a broken forestay ram cost them time and results ahead of October's finale in Valencia, where Platoon now carry the advantage. \"We didn't do a good job on the last race,\" said Sled tactician Francesco Bruni. \"I'm not very happy with how I sailed the week and unfortunately, we lost a lot of points. But, I mean, we are still a strong team, we still in touch for a potential win of the season, so we will fight it out in Valencia.\"",
      },
      {
        type: "paragraph",
        text: "We streamed the whole regatta on The Foil's YouTube channel – catch up on the replays here, and check full results and standings here.",
      },
      {
        type: "heading",
        text: "Scheidt and Sperry seal Star Europeans crown in Medemblik",
      },
      {
        type: "paragraph",
        text: "Last week 70 teams from 17 nations headed to Medemblik for the Star Europeans, and by the end of a rain-lashed week it was Robert Scheidt and Austin Sperry who stood clear. The five-time Olympic medallist and his American crew wrapped up the title with a race to spare, riding out squalls that reduced visibility to nothing on the final downwind of the deciding race before rounding it off with two more wins on the last day for four victories out of seven overall.",
      },
      {
        type: "paragraph",
        text: '"Today was very tough, especially physically," said Scheidt. "The German team pushed us to the limit, hats off to them. In the first race they were ahead of us going into the final run, but we made the right call to gybe early as the wind shifted. Suddenly we saw the finish line in front of us and managed to pass five boats. That race put us in a better position, but they kept fighting all the way through the second race."',
      },
      {
        type: "paragraph",
        text: "Italy's Diego Negri and Sergio Lambertenghi took second overall, with Germany's Nick Heuwinkel and Jesper Spehr completing the podium in third and picking up the U30 European title along the way. Next up for the class: the North American Championship in October, followed by the Worlds in Miami in November. Full results here.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/_-Q4BiqRZ_uNwoEMGUE9Ce8zMB_jIWZaD0OPUTZthak/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/stareuros-matias-capizzano-iscyra.webp",
        alt: "Matias Capizzano / ISCYRA",
        caption: "Matias Capizzano / ISCYRA",
      },
      {
        type: "heading",
        text: "NYYC challenges America's Cup Partnership over Deed of Gift",
      },
      {
        type: "paragraph",
        text: "The America's Cup's oldest institution has gone legal on the event's newest one. New York Yacht Club, which held the Cup for 132 years before losing it to Australia in 1983, has asked the New York Attorney General's Charities Bureau to examine whether the newly formed America's Cup Partnership can be squared with the Deed of Gift – the 1887 charitable trust that's governed the event since the trophy first landed in New York.",
      },
      {
        type: "paragraph",
        text: "NYYC's argument centres on structure. The Deed sets up a two-way relationship: Defender and Challenger of Record agree the terms of each match by mutual consent, cycle by cycle. The Club contends the ACP creates a standing authority the Deed never envisaged, one that under its Protocol could effectively block a club's challenge if it refuses to join, and that could set rules for matches involving clubs not yet in the picture. NYYC also wants the AG to obtain the ACP's undisclosed Partnership Agreements, arguing the whole restructuring has happened without transparency or court approval. Expect this one to run and run before it's settled.",
      },
      {
        type: "heading",
        text: "TO WATCH THIS WEEK:",
      },
      {
        type: "heading",
        text: "The Ocean Race Atlantic sets sail from New York to Lorient",
      },
      {
        type: "paragraph",
        text: "The IMOCA fleet is back in action this week as The Ocean Race Atlantic gets underway, starting from New York on 1 September for a straight 3,300-nautical mile sprint across to Lorient, with the fleet expected in as little as eight days if the Gulf Stream cooperates. Six mixed-gender crews take on the North Atlantic, each boat carrying two women and two men, with an on-board reporter aboard every boat this time round.",
      },
      {
        type: "paragraph",
        text: "Where things get really interesting, though, is in the boats themselves. Two brand new IMOCAs race for the first time here: DMG MORI Global One, featuring a striking, America's Cup-inspired bustle running the length of the hull, up against Team Malizia's twin-chined new build, an evolution of designer Antoine Koch's previous winners.",
      },
      {
        type: "paragraph",
        text: "Both teams are already convinced they're onto something quick. \"The boat is like a rocketship,\" said DMG MORI's Sam Davies. \"Once it starts going you are like: 'Whoa! Are we really going that quick and we haven't even trimmed the sails yet.'\" Malizia's Boris Herrmann was similarly blown away: \"We knew after five minutes of flight that this is something spectacular. The boat is amazing.\"",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/aI-JWxf3UcHgHJABmV-IEy0iMWdpyrlGboOmBTrm9D0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/260712-mlz-imoca-dronestills-ac-still009.jpg",
        alt: "Team Malizia",
        caption: "Team Malizia",
      },
      {
        type: "paragraph",
        text: "On the North Atlantic, Davies added: \"One of the keys to doing well on this course is not to expect anything classic, to expect the unexpected, and to have no ideas of what it's going to be like before you leave because, at any time of year, the north Atlantic is pretty crazy. This is going to be a quick race, so it's going to be a no-regrets-race where every second counts and you can sleep when you get to the finish.\"",
      },
      {
        type: "paragraph",
        text: "Three earlier-generation boats (11th Hour Racing, United by the Ocean, Embrace The Challenge) and one 2007-vintage non-foiler (MSIG Europe) round out the fleet. If conditions are right, there's even a chance of the 24-hour distance record of 641 nautical miles coming under threat.",
      },
      {
        type: "paragraph",
        text: "Last week we got an exclusive look aboard Malizia 4 with Will Harris ahead of the start. See it for yourself here:",
      },
      {
        type: "heading",
        text: "The ILCA 6 Women's fleet takes over Dublin Bay next",
      },
      {
        type: "paragraph",
        text: "There's hardly a pause in Dún Laoghaire before the women's fleet is back for the ILCA 6 Women's Worlds, running 5-12 September on the same Dublin Bay waters that just delivered Vadnai's win. Over 100 sailors from more than 40 countries are entered, headed by reigning champion Louise Cervera, with Belgium's Emma Plasschaert, Italy's Chiara Benini Floriani and Britain's Daisy Collingridge all fancied to trouble her. Home hopes rest on Paris Olympian Eve McMahon and the returning Annalise Murphy, while Greece's Hermione Ghicas – fresh off the Youth Worlds title – could be the fleet's wildcard.",
      },
      {
        type: "heading",
        text: "iQFOiL Worlds arrive in Weymouth",
      },
      {
        type: "paragraph",
        text: "The iQFOiL Worlds take place in Weymouth-Portland from 4-12 September, with the final Medal Series spots only decided this week at a tense Last Chance Qualifier in Silvaplana. Switzerland's Loïc Huguenin and Poland's Michał Maziarka booked automatic Grand Final places, while Britain's Abi Smith carries good form into the women's fleet. Among the 184 competitors are Britain's defending champions Andy Brown and Emma Wilson, headlining a stacked home fleet, with Brown facing stiff competition from fellow Brits Sam Sills and Finn Hawkins. Keep an eye on Britain's Charlie Baker, too – he only booked his senior Worlds spot after winning last week's iQFOiL Youth & Junior International Games. We'll be streaming all the action on The Foil's YouTube channel, from 7 to 12 September.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/JFYz2flaQe2_KjRc6EkcANk8wxQoicsyb2HAdEZqAOY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/iqfoil-qualifiers-copy.jpg",
        alt: "International iQFOiL Class",
        caption: "International iQFOiL Class",
      },
      {
        type: "heading",
        text: "J/70 Worlds bring 120 teams to Cascais",
      },
      {
        type: "paragraph",
        text: "Cascais hosts the J/70 Worlds from 4-12 September, with the fast-growing one-design sportboat class pulling in over 120 teams from more than 30 countries. Reigning European champions Empeiria, skippered by John Heaton, arrive as favourites after July's Barcelona win, but Spain's Hang Ten and Brazil's OceanPact – both podium finishers at the Europeans – will also fancy their chances.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/WxGDYy-F_qKpygByTEdxQZNftzxI5owZUjLnF9S2C2E/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/j70-neuza-aires-pereira-cascais-j-70-summer-cup-copy.jpg",
        alt: "Neuza Aires Pereira / Cascais J/70 Summer Cup",
        caption: "Neuza Aires Pereira / Cascais J/70 Summer Cup",
      },
      {
        type: "heading",
        text: "Maxi Yacht Rolex Cup returns to Porto Cervo",
      },
      {
        type: "paragraph",
        text: "Porto Cervo hosts the Maxi Yacht Rolex Cup from 6-12 September, the sport's grandest superyacht regatta now in its fifth decade, drawing a fleet of 50 boats all over 18 metres long. Paul Cayard returns aboard the ClubSwan 80 My Song, his association with the event stretching back to its first edition in 1985.",
      },
      {
        type: "paragraph",
        text: '"Ever since Rolex first supported the Maxi Yacht Rolex Cup over 40 years ago, it has always been the defining moment of the year, where you put all your work on the table," says Cayard. "It was racing at competitions like this where I gained the skills and tools of my profession. I learned how to manage teams, develop strategies, think about boat preparation as well as tuning sails and other equipment on a large scale. It is a privilege to have been part of the very beginning of this impactful partnership."',
      },
      {
        type: "paragraph",
        text: "Coming off a year in which he's already claimed the Star and Etchells world titles, Cayard arrives in typically formidable form. Among the 50-strong fleet, past winners Galateia, H20 and Leopard 3 all return to defend on the Costa Smeralda.",
      },
      {
        type: "heading",
        text: "SailGP debuts in Valencia",
      },
      {
        type: "paragraph",
        text: "Valencia gets its first taste of SailGP this week (5-6 September) as the F50 fleet finally gets to race the old America's Cup waters from 2007. Spain's Diego Botín and Florián Trittel head into their home event with back-to-back wins in Halifax and Portsmouth, a podium in every Grand Prix so far this season, and the home fans – the self-styled 'Marea Roja' – expected in force. As usual we'll be there to bring you all the latest over the race weekend.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-week-in-racing-31-august-26/",
    },
  },
  "rate-the-fleet-andy-rice-on-sassnitz-sailgp": {
    slug: "rate-the-fleet-andy-rice-on-sassnitz-sailgp",
    kind: "news",
    title: "Rate the fleet: Andy Rice on Sassnitz SailGP",
    standfirst:
      "Despite the gusty, squally conditions on Saturday, Sassnitz repeated the Portsmouth miracle of 13 boats starting the weekend and all 13 completing the weekend. The split fleet racing between Groups A and B really seems to be making the race track a safer place to be.",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "27th August 2026 2:41pm",
    heroImage: {
      src: "https://thefoil.com/media/B5wy-NCith7W18uw1I5vM66g7a9IIGoNszXby1KS7Jg/resize:fill-down:1500:500/gravity:fp:0.5404255319:0.5701663967/quality:60/dpr:1/2026/08/rp3-3823.jpg",
      alt: "Rate the fleet: Andy Rice on Sassnitz SailGP",
    },
    body: [
      {
        type: "paragraph",
        text: "However, the Groups were very imbalanced in terms of quality. Although just six boats in Group B, this was the much harder fleet, and some of my rankings reflect this.",
      },
      {
        type: "paragraph",
        text: "Here's a reminder of the standings after five thrilling races in Group B:",
      },
      {
        type: "paragraph",
        text: "1 Canada 17 2 Australia 15 3 Sweden 14 4 Germany 12 5 Great Britain 9 6 United States 8",
      },
      {
        type: "paragraph",
        text: "Of these six, five still had a shot at qualifying through to the four-boat final as they headed into the final race. Only the USA missed the cut, and even Taylor Canfield and his team weren't sailing that badly.",
      },
      {
        type: "paragraph",
        text: "Even though there were seven teams in Group A, there was a clear divide between the top three and the rest. It was effectively a three-horse race between New Zealand, Spain and France, with the other four making up the numbers.",
      },
      {
        type: "paragraph",
        text: "Here's a reminder of the standings after five not-quite-as-thrilling races in Group A:",
      },
      {
        type: "paragraph",
        text: "1 New Zealand 19 2 Spain 16 3 France 14 4 Switzerland 9 5 Denmark 8 6 Italy 7 7 Brazil 0",
      },
      {
        type: "paragraph",
        text: "With that imbalance between Groups A and B in mind, as well as my usual sense of who's on the rise and who's on the decline, here are my rankings for Sassnitz.",
      },
      {
        type: "heading",
        text: "Ricey's Order",
      },
      {
        type: "heading",
        text: "1. Canada (NorthStar SailGP)",
      },
      {
        type: "paragraph",
        text: "Finished: 2nd",
      },
      {
        type: "paragraph",
        text: "Driver Giles Scott demonstrated remarkable resilience, steering Canada through a dramatic weekend of well-executed recoveries. Despite suffering a starting penalty in Race 4 of Group B, Scott was able to sniff out clear paths through patchy breeze to climb from the back of the fleet into top finishes. Canada secured their place in the final by prevailing in that nailbiter of a battle in Race 5. In the four-boat final, a mistimed approach to the line was a bad error that opened the door to Australia seizing the lead. But across the finish line, Canada managed to keep their boat moving just enough to nose ahead of Spain and New Zealand to grab second place overall.",
      },
      {
        type: "paragraph",
        text: "Verdict: Top qualifier from the toughest group, and a team on the rise",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/QYZkGlnQc8OoqP8Hg1hGI0hbJQCx0CVxjUG5d5WFj-8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp2-0798-1.jpg",
        alt: "Ricardo Pinto / SailGP",
        caption: "Ricardo Pinto / SailGP",
      },
      {
        type: "heading",
        text: "2. Australia (Bonds Flying Roos)",
      },
      {
        type: "paragraph",
        text: "Finished: 1st",
      },
      {
        type: "paragraph",
        text: "Tom Slingsby's crew delivered a masterclass in high-speed control and tactical execution to secure their fifth event win of the season. The Flying Roos dominated Day 1 in heavy air, winning two of their three Group B races with rock-solid stability while competitors struggled in the 24-knot squalls. Despite a setback in Race 3b where a missed tack relegated them to last, they were still leading Group B overnight. By some margin Australia were the best starters on both days of the weekend, so it was surprising to see them struggle to reach the four-boat final. After being unceremoniously dumped from first to fifth in that patchy fourth Group B race, Slingsby and the team held their nerve. Once in the final, Slingsby capitalised on Canada's start-line error, breaking away early and achieving 100% flight time to cross comfortably ahead as the rest of the fleet fell off their foils in the dying wind.",
      },
      {
        type: "paragraph",
        text: "Verdict: Best starters in the fleet, and huge team resilience",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/-1HCyJZiB4VWlzOhyfV2on_cBwFfz3GiERoWCi4BZ5k/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/ab300052.jpg",
        alt: "Andrew Baker / SailGP",
        caption: "Andrew Baker / SailGP",
      },
      {
        type: "heading",
        text: "3. New Zealand (Black Foils)",
      },
      {
        type: "paragraph",
        text: "Finished: 4th",
      },
      {
        type: "paragraph",
        text: "Pete Burling's Black Foils dominated Group A on Saturday, putting on a clinic in pristine boat speed and positioning to post a 1-2-3 record and become the first team to qualify for the final. However, after reaching their first four-boat final of the season, their good run of form came to an end. Held up by Canada's error at the start line, the Kiwis picked up a boundary penalty while trying to squeeze Spain in the dying moments of the race, leaving them on the wrong side of a photo-finish with Los Gallos and having to settle for 4th and last place across the line.",
      },
      {
        type: "paragraph",
        text: "Verdict: Dominated Group A and deserved better in the final",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/Tr3pkMExfAh3pqgtxHLXjeEjIDgExQHsDXqP0aROZpc/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp2-0112.jpg",
        alt: "Ricardo Pinto / SailGP",
        caption: "Ricardo Pinto / SailGP",
      },
      {
        type: "heading",
        text: "4. France (DS Automobiles France)",
      },
      {
        type: "paragraph",
        text: "Finished: 6th",
      },
      {
        type: "paragraph",
        text: "Quentin Delapierre's squad proved to be the fastest team on the water, officially setting a new SailGP outright speed record of 107.63 km/h (58.1 knots) during Race 3 of Group A. They backed up their raw pace with a fleet race victory in Race 2 earlier. Despite their top-end speed, recurring foil spin-outs and boat-handling errors in Sunday's shifty conditions caused them to finish 6th in Race 5a, narrowly losing the final Group A qualifying spot to Spain. Even so, the French are showing strong signs of getting back to the kind of form we saw in Perth at the start of the year. Leigh McMillan's return to the wing trimming must be a part of that resurgence.",
      },
      {
        type: "paragraph",
        text: "Verdict: The band is back together and they're almost back in tune",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/fFaT-RwpZgn11Ls9VxZGedmokVDcZcNWG8f24MPNF20/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/jl205258.jpg",
        alt: "Jason Ludlow / SailGP",
        caption: "Jason Ludlow / SailGP",
      },
      {
        type: "heading",
        text: "5. Spain (Los Gallos)",
      },
      {
        type: "paragraph",
        text: "Finished: 3rd",
      },
      {
        type: "paragraph",
        text: 'Diego Botín\'s aggressive, high-risk approach yielded another podium finish for Los Gallos. There were times on Saturday when their approach looked too high-risk. Botín went for a gap at the windward mark inside France and incurred a predictable penalty, and they finished an unnecessary last in that particular race. However, as ever, the team repeatedly showed their ability to turn the tide under pressure. Highlights included a victory in Race 3a and a signature "French start" in Race 5a to lock in their final spot. Despite starting last in the final, Spain sliced through to 2nd at gate three before ultimately taking 3rd overall, maintaining their 2nd-place ranking in the global season standings.',
      },
      {
        type: "paragraph",
        text: "Verdict: The shakiest Spanish performance for a while, yet still they made the final",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/9pdDV0a9O4S-MMKHQaW7daIPPL_hGovRL2-whwoYnV0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp2-9469.jpg",
        alt: "Ricardo Pinto / SailGP",
        caption: "Ricardo Pinto / SailGP",
      },
      {
        type: "heading",
        text: "6. Sweden (Artemis)",
      },
      {
        type: "paragraph",
        text: "Finished: 5th",
      },
      {
        type: "paragraph",
        text: "Nathan Outteridge brought his trademark consistency to Group B, opening the regatta with three consecutive 3rd-place finishes. However there were times when even the usually conservative Outteridge pushed the limits in high-speed traffic, executing one of the closest passes of the weekend by ducking Australia by just 50 cm at 70 km/h in Race 5b. However, a poor rounding and subsequent penalty in Race 4b cost the Swedes vital points, leaving them just shy of qualifying for the three-boat final battle.",
      },
      {
        type: "paragraph",
        text: "Verdict: Good, solid performers with flashes of brilliance. Not yet shown the flair to win",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/0uy5zxbw3sX94uQeSWLd9JtpJqg49iiN_Gcawy-zlnU/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp3-3833-2.jpg",
        alt: "Ricardo Pinto / SailGP",
        caption: "Ricardo Pinto / SailGP",
      },
      {
        type: "heading",
        text: "7. Germany (Deutsche Bank Germany)",
      },
      {
        type: "paragraph",
        text: "Finished: 7th",
      },
      {
        type: "paragraph",
        text: 'Erik Kosegarten Heil\'s home team experienced an extreme "snakes and ladders" regatta in front of the Sassnitz crowd. Sailing with the 18-meter wing in patchy breeze, their starts were binary: flat-footed when missing gusts, but dominant when hitting them cleanly. Germany thrilled home fans by winning both Race 3b (at the end of Saturday) and Race 4b (at the start of Sunday) by staying fully foiling while the rest of the fleet splashed down. However, low scores from early races meant a place in the final was hard for the Germans to achieve.',
      },
      {
        type: "paragraph",
        text: "Verdict: As Erik has said all season, when they can get off the line the Germans are capable of winning",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/njaIRKCdp9vzT9GXFnLUUWfKQ-hbUQg8xlACEecXN7s/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/fd2-3454.jpg",
        alt: "Felix Diemer / SailGP",
        caption: "Felix Diemer / SailGP",
      },
      {
        type: "heading",
        text: "8. Great Britain (Emirates GBR)",
      },
      {
        type: "paragraph",
        text: "Finished: 9th",
      },
      {
        type: "paragraph",
        text: "A 9th-place finish masks what was otherwise a reasonably competitive performance by Dylan Fletcher's crew. Emirates GBR set an early practice speed record of 56.6 knots and finished 2nd in Race 2b in a brutally tight Group B. Going into the final group race just two points off the lead, a disappointing 6th-place finish in Race 5b dropped them significantly on the overall event leaderboard. Lower than they probably deserved. Fletcher said there were reasons to be optimistic from their performance, and I think I believe him.",
      },
      {
        type: "paragraph",
        text: "Verdict: Not their world-beating form, but still better than a 9th-place finish",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/KF32PkmflFcOl0EMQcAICaWfVaDyd4kvwTNJo6As3n0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp3-3642.jpg",
        alt: "Ricardo Pinto / SailGP",
        caption: "Ricardo Pinto / SailGP",
      },
      {
        type: "heading",
        text: "9. USA (US SailGP Team)",
      },
      {
        type: "paragraph",
        text: "Finished: 11th",
      },
      {
        type: "paragraph",
        text: "Taylor Canfield's American entry showed strong tactical positioning but suffered from costly execution errors at critical moments. The team lost positions to layline misjudgments in Race 1b and splashed down while leading gate two in Race 5b. Finishing tied on points with Great Britain in Group B, the fine margins of the leaderboard left them in 11th overall.",
      },
      {
        type: "paragraph",
        text: "Verdict: Losing momentum from their great season start, but still in the hunt for the grand final",
      },
      {
        type: "heading",
        text: "10. Switzerland (Explora Swiss)",
      },
      {
        type: "paragraph",
        text: "Finished: 8th",
      },
      {
        type: "paragraph",
        text: "The Swiss team showed clear improvements in straight-line speed, highlighted by rounding mark one alongside New Zealand in Race 1a to earn a 2nd-place finish. Boat handling under pressure remains their primary obstacle, as severe wobbles and foil drops during gate roundings in gusty moments were costing them positions throughout the weekend.",
      },
      {
        type: "paragraph",
        text: "Verdict: Not as impressive as they've been in recent events. Need to rediscover the emerging magic in Valencia",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/8OG2SiBzRe5T2Ln5KZaZsuTm1m_E6NhR-enzFnIpgCs/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/jn1-5209-1.jpg",
        alt: "Jonathan Nackstrand / SailGP",
        caption: "Jonathan Nackstrand / SailGP",
      },
      {
        type: "heading",
        text: "11. Denmark (ROCKWOOL Racing)",
      },
      {
        type: "paragraph",
        text: "Finished: 10th",
      },
      {
        type: "paragraph",
        text: "Nicolai Sehested's crew struggled with foil stability and flight control in the choppy Sassnitz conditions. Although they briefly touched 106 km/h in Race 3a before a heavy nosedive, the team was unable to maintain consistent speed through manoeuvres, ultimately losing their title as the league's fastest boat to France.",
      },
      {
        type: "paragraph",
        text: "Verdict: Sehested believed the teams had been making progress in the training before the event, but it didn't show in the racing",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/YnOEat_NJSZEUPGcNp32JC8PHbSNQ5HnuV-YS-LxKes/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/fd2-4125.jpg",
        alt: "Felix Diemer / SailGP",
        caption: "Felix Diemer / SailGP",
      },
      {
        type: "heading",
        text: "12. Italy (Red Bull Italy)",
      },
      {
        type: "paragraph",
        text: "Finished: 12th",
      },
      {
        type: "paragraph",
        text: "Italy opened their weekend with a promising 3rd-place finish in Race 1a, showing sharp course reading in the opening heat. However, they were unable to maintain that momentum in the heavy-breeze squalls, frequently falling off the pace and being outmanoeuvred by the top Group A contenders.",
      },
      {
        type: "paragraph",
        text: "Verdict: Phil Robertson said there were good signs of progress, but surely this team aspires to much better",
      },
      {
        type: "heading",
        text: "13. Brazil (Mubadala Brazil)",
      },
      {
        type: "paragraph",
        text: "Finished: 13th",
      },
      {
        type: "paragraph",
        text: "The Brazilian team finished at the bottom of the standings with 0 points across the event. Their starting statistics are woeful, and things don't get much better on the open race course. Martine Grael's team have reached a point late in the season where they might as well try some big experiments like they did with the Grael-Goodison switcharound in Halifax. The current setup isn't working.",
      },
      {
        type: "paragraph",
        text: "Verdict: Training time in Pensacola can't come soon enough for Brazil",
      },
      {
        type: "paragraph",
        text: "Germany SailGP final order",
      },
      {
        type: "paragraph",
        text: "1 Australia 10 2 Canada 9 3 Spain 8 4 New Zealand 7 5 Sweden 6 6 France 5 7 Germany 4 8 Switzerland 3 9 Great Britain 2 10 Denmark 1 11 USA 0 12 Italy 0 13 Brazil 0",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/rate-the-fleet-andy-rice-on-sassnitz-sailgp/",
    },
  },
  "luna-rossa-test-new-rudder-and-take-a-knock": {
    slug: "luna-rossa-test-new-rudder-and-take-a-knock",
    kind: "news",
    title: "Luna Rossa test new rudder – and take a knock",
    standfirst:
      "After a fortnight off, Luna Rossa were back on the water off Cagliari yesterday with something new to try on the boat. A reworked rudder – extra blade area up top, less down low, built to sharpen the leading edge – had been fitted over the break, and the sailing team wasted no time putting it through its paces. The morning session, sailed in a gentle seven to nine knots, went smoothly enough. The calm didn't last into the afternoon.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "27th August 2026 11:10am",
    heroImage: {
      src: "https://thefoil.com/media/J6JMBf-QUrNfZ7DOC8HexlhFY02qMtk4SOlMUAojfDE/resize:fill-down:1500:500/gravity:fp:0.496969697:0.4424662796/quality:60/dpr:1/2026/08/260826-lr-b3-d20-207.jpg",
      alt: "Luna Rossa test new rudder – and take a knock",
    },
    body: [
      {
        type: "heading",
        text: "When the rudder let go",
      },
      {
        type: "paragraph",
        text: "Working through a string of full-throttle bear-aways and gybes, sailing with the windward foil half-buried, the AC75 pushed the new blade to its limits – and found them. Mid bear-away, the rudder ventilated and stalled, and for a moment the crew had nothing to steer with.",
      },
      {
        type: "paragraph",
        text: '"We lost the rudder, so we didn\'t have any more control of the blade, the yaw of the boat," Vittorio Bissaro, Luna Rossa\'s flight controller and trimmer told the Cup recon team. "That led the boat to bear away, and pass through the power zone. It was a dangerous situation. So the reaction there was just making sure to put the rudder in the water. So don\'t care about the bow, the distance of the bow from the water. Just keep the elevator in the water, because what really can cause damage in that situation is popping the rudder. So I think it was a well managed save."',
      },
      {
        type: "paragraph",
        text: "The boat pitched bow-up hard and thudded back down onto the hull, but there was no damage, and the crew were back sailing within minutes.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/2M7BmUtnnYaYcVTvuWM45r5-SgobK8NLMahEcYaGcBM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/260826-lr-b3-d20-209.jpg",
        alt: "Ivo Rovira / America's Cup",
        caption: "Ivo Rovira / America's Cup",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/5frfIKikoybu2PoRO_nbNkZH9WLxTvx17nExG9tSwtw/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/260826-lr-b3-d20-213.jpg",
        alt: "Ivo Rovira / America's Cup",
        caption: "Ivo Rovira / America's Cup",
      },
      {
        type: "heading",
        text: "A productive scare",
      },
      {
        type: "paragraph",
        text: 'That moment aside, it was – by Luna Rossa\'s own account – a good day back. "It was the first day after the holiday, a long break," Bissaro says. "We had a lot of stuff to test and it was super productive. We ticked all the boxes."',
      },
      {
        type: "paragraph",
        text: 'Pitch control remains the team\'s ongoing preoccupation as they push their pre-start routines harder, sailing tighter, faster circles with a sharper bow-up attitude through the corners. "It\'s not easy," Bissaro admits, "because today we had a very nice bow up, harder attack... sometimes we are still struggling to keep everything in control. But it\'s a long process and we are happy with the pace so far."',
      },
      {
        type: "paragraph",
        text: "Five sessions and 135 foiling minutes later, Luna Rossa called it a day just after 3pm. They're back out on the water on Friday.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/luna-rossa-test-new-rudder-and-take-a-knock/",
    },
  },
  "freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist": {
    slug: "freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist",
    kind: "news",
    title: "Freddie Carr: The SailGP teams that must decide to stick or twist",
    standfirst:
      "As season six of SailGP moves towards the sharp end, there are clearly teams having seasons they will be proud of. They have improved on where they were 12 months ago, won events, made podiums and put themselves into the fight for the Grand Final.",
    author: "Freddie Carr, Senior Contributor",
    publishedAt: "25th August 2026 6:00pm",
    heroImage: {
      src: "https://thefoil.com/media/B1OMLimzgqxV81G12eBWsSDP-s7FsGIb_V9Sk0nnN6I/resize:fill-down:1500:500/gravity:fp:0.5179487179:0.8522603875/quality:60/dpr:1/2026/08/fd2-2946.jpg",
      alt: "Freddie Carr: The SailGP teams that must decide to stick or twist",
    },
    body: [
      {
        type: "paragraph",
        text: "Conversely, there are teams that have stood still or regressed. They will not be meeting their targets and expectations, and the uncomfortable conversations about why that has happened will already be taking place.",
      },
      {
        type: "paragraph",
        text: "That leaves team CEOs and owners with one of the biggest decisions in professional sport. Do you trust the athletes and coaching staff you currently have, believing that more time together will eventually deliver the performance? Or do you dive into the transfer market and look for somebody who can change the level of the team immediately?",
      },
      {
        type: "paragraph",
        text: "Do you stick, or do you twist?",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/pZONKwQNxAiCS_jWTSwhQNs-J9AGqPw8SJQ7u_y2qaY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/jl206519.jpg",
        alt: "Jason Ludlow/SailGP",
        caption: "Jason Ludlow/SailGP",
      },
      {
        type: "heading",
        text: "The domino effect",
      },
      {
        type: "paragraph",
        text: "We saw during the last off-season how one transfer can create a domino effect across the entire fleet. The arrival of Artemis opened another set of positions within SailGP, with Chris Draper leaving the Bonds Flying Roos to join the new Swedish outfit. It allowed Draper to start building racing relationships with several of his Emirates Team New Zealand team-mates under the Swedish flag, but it also created a very important vacancy onboard the Australian boat.",
      },
      {
        type: "paragraph",
        text: "That vacancy was filled by Iain Jensen, who moved from Emirates GBR into the wing-trimmer position alongside Tom Slingsby. With the benefit of hindsight, that might prove to be the transfer of the season.",
      },
      {
        type: "paragraph",
        text: "In my opinion, Jensen is currently the best sailor in SailGP. He joined an Australian team that was already operating at a top-tier level and somehow helped raise it again to a standard the rest of the fleet has struggled to match. The Flying Roos have won five of the opening nine events this season, and while you can never put that level of improvement down to one athlete, I believe Jensen's arrival has played a huge part in it.",
      },
      {
        type: "paragraph",
        text: "He has fitted into an already talented and highly experienced squad, but he has also added something. Whether that is his communication, his understanding of the F50, his relationship with Slingsby or simply the consistency with which he performs his role, the Australian boat now looks incredibly complete.",
      },
      {
        type: "paragraph",
        text: "That is the attraction of the transfer market. Find the right person and you can change the level of the entire group.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/oc67tau-GydJBSGUAAX6pELTQENgnsZsrzKNYE0GRmM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp3-3833-1.jpg",
        alt: "Ricardo Pinto/SailGP",
        caption: "Ricardo Pinto/SailGP",
      },
      {
        type: "heading",
        text: "Signing on the dotted line",
      },
      {
        type: "paragraph",
        text: "SailGP's most recent off-season saw around 20 significant athlete moves and new signings across the league. With only 13 teams and relatively small sailing squads, that represents a substantial reshuffling of the available talent. It also shows that SailGP's transfer market is starting to feel like a proper part of the sport.",
      },
      {
        type: "paragraph",
        text: "The Athlete Transfer Framework is essentially SailGP putting some formal structure around how sailors move between teams. We are obviously not talking about Premier League numbers, but the principle is becoming increasingly similar. Athletes are contracted to teams, there are defined periods in which movement can happen, and teams now have far more ability to protect the talent they have identified, developed and invested in.",
      },
      {
        type: "paragraph",
        text: "If another team wants one of those sailors, their contractual position matters.",
      },
      {
        type: "paragraph",
        text: "That is a significant change for professional sailing. For years, sailors have effectively been guns for hire. You finished one campaign, picked up the phone, spoke to another team and moved on to the next job. There was very little long-term protection for either the sailor or the team, because so much of the sport was built around campaigns with a defined finishing date.",
      },
      {
        type: "paragraph",
        text: "SailGP is slowly moving away from that model towards something much more recognisable as a professional sports league. The teams are becoming long-term sporting franchises, and that means their athlete rosters have genuine value.",
      },
      {
        type: "paragraph",
        text: "Finding young talent, developing it, getting those sailors under contract and then retaining your best people becomes part of building a successful team. It is no longer simply about selecting the best available group for the next regatta. You have to think about what your squad might look like in two, five or even ten years.",
      },
      {
        type: "heading",
        text: "Taking a leaf from football",
      },
      {
        type: "paragraph",
        text: "The really interesting question is where this goes next. Could we eventually reach a point where one SailGP team pays another a meaningful transfer fee for a world-class driver, flight controller or wing trimmer? Could identifying and developing the next generation of SailGP athletes become a genuine financial asset for a team?",
      },
      {
        type: "paragraph",
        text: "That would have sounded slightly ridiculous a few years ago. Now it really doesn't.",
      },
      {
        type: "paragraph",
        text: "SailGP wants to become a genuine global sports league, and if that is where it is going, a proper transfer market – where the best athletes have real sporting and financial value – feels like another inevitable step along the way.",
      },
      {
        type: "paragraph",
        text: "I have probably got my transfer head on because the European football window has only days remaining and the numbers involved are mind-blowing. At the time of writing, there have been 1109 completed transfers across Europe's five biggest leagues, accounting for around £4.9 billion in transfer value.",
      },
      {
        type: "paragraph",
        text: "The fundamental questions SailGP teams are now asking themselves mirror what happens at football clubs. If you are sitting in the bottom half of the SailGP championship and have not yet made an event podium, how are you going to change that?",
      },
      {
        type: "paragraph",
        text: "Are you going to enter the transfer market, or are you going to trust the process?",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/vtyK_gBgBGnnGLT3wvUdddV7sl7kdWCaS0KFadGiBW8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp2-6742.jpg",
        alt: "Ricardo Pinto/SailGP",
        caption: "Ricardo Pinto/SailGP",
      },
      {
        type: "heading",
        text: "The internal rotation option",
      },
      {
        type: "paragraph",
        text: "Changing one of the six athletes onboard does not necessarily mean trying to take an established SailGP sailor from another team. That is only one option available to an underperforming programme.",
      },
      {
        type: "paragraph",
        text: "You could rotate people within your existing squad and change positions onboard, as we saw from Brazil in Halifax. Sometimes the talent is already there, but the combination or distribution of roles is not quite right. Moving an athlete into a different position can alter the communication onboard, improve decision-making or simply allow somebody's natural strengths to have a greater influence on the boat.",
      },
      {
        type: "paragraph",
        text: "You could also promote one of your reserve sailors. The lower-ranked teams are receiving additional training time, and those extra days could reveal an athlete already sitting inside the programme who deserves an opportunity. When you are struggling for results, introducing somebody hungry and determined to prove themselves can shake up the entire group.",
      },
      {
        type: "paragraph",
        text: "The answer might not be changing an athlete at all. It could be changing the coaching structure, the training programme or the way the team prepares for each event. The performance gap might be technical, tactical or caused by a simple lack of time sailing together.",
      },
      {
        type: "heading",
        text: "The America's Cup talent feed",
      },
      {
        type: "paragraph",
        text: "The final option is to look outside the existing SailGP fraternity.",
      },
      {
        type: "paragraph",
        text: "There are several sailors racing AC40s in the America's Cup world who looked extremely impressive in Cagliari and will be back on stage in Naples in a few weeks. They already understand high-speed foiling, complex onboard systems and the communication required to race these boats properly. They might not have raced an F50, but the transition is nowhere near as large as it once would have been.",
      },
      {
        type: "paragraph",
        text: "If I were running recruitment for a SailGP team, two names from outside the current athlete pool would be right at the top of my list: Marco Gradoni and Margherita Porro.",
      },
      {
        type: "paragraph",
        text: "Gradoni is arguably the standout young sailor of his generation. He became the first sailor to win three consecutive Optimist World Championships, was named World Sailor of the Year at just 15 and then led Luna Rossa to victory in the 2024 Youth America's Cup.",
      },
      {
        type: "paragraph",
        text: "More importantly for a SailGP team looking at him today, he is becoming increasingly integrated into Luna Rossa's senior programme. He is gaining serious AC40 time alongside and against sailors such as Peter Burling and double Olympic champion Ruggero Tita. That is an extraordinary environment in which to learn, and every hour he spends there is adding to his value.",
      },
      {
        type: "paragraph",
        text: "Gradoni has the results, the age, the foiling experience and an enormous ceiling. In transfer-market language, he is not simply somebody who might improve your team today. He is somebody around whom you could potentially build a team for the next decade.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/7tCkFUiwAa7iRKcLBsEpCz7clcml1u63g905ndvxWPE/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/38c-260121-ir205448b.jpg",
        alt: "Ian Roman/America's Cup",
        caption: "Ian Roman/America's Cup",
      },
      {
        type: "paragraph",
        text: "Porro could be just as valuable. A multiple youth world champion, she progressed through the 29er, WASZP and Nacra 17 before joining Luna Rossa. She was co-helm when the Italians won the inaugural Women's America's Cup in Barcelona in 2024, and since then Luna Rossa have continued to invest heavily in her development.",
      },
      {
        type: "paragraph",
        text: "She is receiving significant time driving the AC40 ahead of Naples and already has experience winning under pressure on the America's Cup stage. She is young, technically experienced and comfortable in high-speed foiling boats. Most importantly, she has already shown that she can deliver when the result really matters.",
      },
      {
        type: "paragraph",
        text: "As SailGP teams increasingly look for young athletes who can be developed into major roles within a squad, Porro ticks an awful lot of boxes.",
      },
      {
        type: "paragraph",
        text: "Gradoni and Porro would undoubtedly be two of the hottest young properties in a developing SailGP transfer market. The challenge for any team trying to recruit them would be convincing them that SailGP can offer a pathway as attractive as the one they already have inside Luna Rossa.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/pEF5lm1sRaLGcKwmdMlNfyHfEd-TSnKEiIYgWntmq9g/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/38c-260121-ir205397b.jpg",
        alt: "Ian Roman/America's Cup",
        caption: "Ian Roman/America's Cup",
      },
      {
        type: "heading",
        text: "Trusting the process",
      },
      {
        type: "paragraph",
        text: "But do you need a major new signing, or do you trust the people you already have? The perfect example is the United States SailGP Team.",
      },
      {
        type: "paragraph",
        text: "After a woeful season five in which they finished last, the message coming from Mike Buckley, Taylor Canfield and the rest of the group was always consistent: we trust the roster, we believe in the direction we are taking and we will get there.",
      },
      {
        type: "paragraph",
        text: "Not many people believed them. Now we are all eating our hats.",
      },
      {
        type: "paragraph",
        text: "The USA are comfortably the most improved team in season six. They won their first SailGP event in Sydney and currently sit fifth overall, giving themselves a genuine opportunity to reach the three-boat Grand Final if they can finish the season strongly.",
      },
      {
        type: "paragraph",
        text: "They did not panic. They did not tear the squad apart or go charging into the transfer market searching for a quick fix. They made small adjustments, kept working and became better as a unit.",
      },
      {
        type: "paragraph",
        text: "That decision has paid dividends, and they deserve enormous respect for holding their nerve. It is easy to talk about trusting the process when things are going well. It is much harder to do it when you are finishing last and everybody outside the team is questioning whether the process is working.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/ocy3N96W5QEVb529ChF9KYIjocmNE3JKVuoGWCdw634/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/fd2-2824.jpg",
        alt: "Felix Diemer/SailGP",
        caption: "Felix Diemer/SailGP",
      },
      {
        type: "paragraph",
        text: "I believe Rockwool Racing are thinking along similar lines. They strongly believe in the quality of the athletes they have, but the issue is that they might not sail together often enough compared with the people they are racing against.",
      },
      {
        type: "paragraph",
        text: "Many of their rivals also have America's Cup roles and could be foiling for as many as 20 days a month. That time matters. The more hours you spend sailing high-speed foiling boats, the more natural the communication, timing and decision-making become.",
      },
      {
        type: "paragraph",
        text: "The Danes appear ready to double down by entering other foiling championships outside SailGP. The aim is to increase their time on the water and build the racing relationships that only develop through proper repetitions as a crew.",
      },
      {
        type: "paragraph",
        text: "You can analyse all the data you like, spend hours in the simulator and hold endless debriefs, but there is no complete replacement for sailing together. If the Danish team believe the athletes are good enough, then increasing their time racing foiling boats could be the change that unlocks the performance.",
      },
      {
        type: "paragraph",
        text: "More repetitions should equal better performance when they return to the F50.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/UqdnBZQ-51BXBN1ZXW_0C-opyoYVCESJxfdFavtt7yY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/fd2-4767.jpg",
        alt: "Felix Diemer/SailGP",
        caption: "Felix Diemer/SailGP",
      },
      {
        type: "heading",
        text: "Every point counts",
      },
      {
        type: "paragraph",
        text: "We are now entering a fascinating point in the calendar. The top seven teams are fully focused on making the Grand Final. Every start, every place gained and every championship point could prove decisive over the final four events.",
      },
      {
        type: "paragraph",
        text: "For the teams in the bottom half of the table, however, the planning for Season Seven should already have started.",
      },
      {
        type: "paragraph",
        text: "Do they need an established SailGP athlete who can immediately change the level of the boat? Could one of their reserves step into a bigger role? Is there an America's Cup sailor outside the league capable of becoming the next major SailGP star? Or does the existing group simply need more time, better coaching and more opportunities to sail together?",
      },
      {
        type: "paragraph",
        text: "There is no single correct answer.",
      },
      {
        type: "paragraph",
        text: "The Flying Roos show what one outstanding signing can add to an already successful team. The United States show what can happen when an organisation refuses to panic and gives its existing group time to develop. Rockwool may now show whether increasing the number of racing repetitions can transform an established squad without changing the personnel.",
      },
      {
        type: "paragraph",
        text: "The teams at the bottom of the championship cannot stand still. But changing the performance does not always mean changing the people.",
      },
      {
        type: "paragraph",
        text: "That is the decision now facing them. Stick – or twist?",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist/",
    },
  },
  "the-week-in-racing-24-august-26": {
    slug: "the-week-in-racing-24-august-26",
    kind: "news",
    title: "The week in racing - 24 August '26",
    standfirst:
      "The F50s found a new gear in Sassnitz, America's Cup's lawyers are still busy, and two new junior world champions emerged in Denmark – there's a lot to get through from the last seven days. Here's the rundown, plus what to watch out for next.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "24th August 2026 7:33pm",
    heroImage: {
      src: "https://thefoil.com/media/zm1hWBQgXAUXwE1GYVNZFsXeioZqhzDag3AeNHbB_X0/resize:fill-down:1500:500/gravity:fp:0.3595744681:0.3743615093/quality:60/dpr:1/2026/08/138a2341-peter-brogger-ilca.jpg",
      alt: "The week in racing - 24 August '26",
    },
    body: [
      {
        type: "heading",
        text: "Sassnitz serves up a speed record and a runaway final",
      },
      {
        type: "paragraph",
        text: "Sunday's Final in Sassnitz produced one of the stranger finishes of the season. Tom Slingsby's Flying Roos built such a lead that they'd stepped ashore for the trophy while NorthStar, Los Gallos and the Black Foils were still crawling towards the finish off the foils – a fifth win of the season for Australia, by three minutes nine seconds.",
      },
      {
        type: "paragraph",
        text: 'Saturday\'s headline act was DS Team France smashing SailGP\'s speed record – 107.63km/h (58.1 knots) in the final race of the day, well clear of the old 103.93km/h mark set by Rockwool Racing at the same venue last year. "I was definitely on the edge and it was quite scary on that last bear-away," said driver Quentin Delapierre. "I was just focusing on not putting too much pressure on the foil. At this speed, the first boundary comes up very quickly!"',
      },
      {
        type: "paragraph",
        text: "Makes you wonder if an AC75 will ever top that speed; the Cup's fastest pace on record is still 55.6 knots (102.97km/h), set by Ineos Britannia in Barcelona.",
      },
      {
        type: "heading",
        text: "The America's Cup turns 175, and the lawyers are still at it",
      },
      {
        type: "paragraph",
        text: "Speaking of Britannia – well, we still don't know who really owns it. New court documents published on 18 August, as part of Athena Racing's amended Defence in the ongoing ownership battle, reveal the fate of a peace offer that could have avoided all this. Back in April, Ben Ainslie wrote to Ineos asking them to let Athena keep the disputed AC75 and other 2024 assets to compete in AC38. Athena initially told the court they'd had no reply.",
      },
      {
        type: "paragraph",
        text: "The amended filing now says Ineos rejected the proposal outright, in a letter sent just nine days after Athena's original complaint about the silence. The actual contract between the two parties still hasn't been made public. Ineos has until 15 September to respond.",
      },
      {
        type: "paragraph",
        text: "The America's Cup, meanwhile, turned 175 on Saturday. In all that time, only four nations have ever won it – proof just how hard it is to lift the oldest continually contested trophy in sport.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/9xTw0fw7lwYP7oudhho6vJZFTDMs0EssG8yFMnqceek/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/britannia-job-vermeulen-america-s-cup.jpg",
        alt: "Job Vermeulen / America's Cup",
        caption: "Job Vermeulen / America's Cup",
      },
      {
        type: "heading",
        text: "Aarhus crowns two new Youth World Champions",
      },
      {
        type: "paragraph",
        text: 'Brazil\'s Erik Scheidt – son of 5x Olympic medallist Robert – took the ILCA 6 Youth Worlds title in Aarhus, wrapping up the men\'s crown with a race to spare and a title and a title he was happy to put down to his father\'s influence. "My father is always by my side and helps me a lot with the psychological side," said Scheidt. "I had some expectations coming into the championship, but I did not expect to win this week. In the end, I think consistency was the key."',
      },
      {
        type: "paragraph",
        text: "In the women's fleet, Greece's Hermionie Ghicas turned a one-point deficit into gold by sweeping all three races on the final day, denying Ireland's Sienna Wright. \"I felt very comfortable on the boat with this wind and I'm very happy I managed to be strong both mentally, physically and tactically on the water,\" said Ghicas after. Full results here.",
      },
      {
        type: "heading",
        text: "TO WATCH THIS WEEK:",
      },
      {
        type: "heading",
        text: "52 Super Series returns to Lanzarote for round #4",
      },
      {
        type: "paragraph",
        text: "Puerto Calero, Lanzarote hosts the fourth of five 2026 season regattas from Tuesday 25 to Saturday 29 August, with 13 teams back in the breeze for the second Lanzarote stop in as many months. Takashi Okura's Sled lead the circuit standings after winning the season's first two regattas, but a wobbly finish at Marina Rubicon has left the door open – Harm Müller-Spreer's Platoon Aviation trail by just 17 points and fancy closing the gap over the days ahead.",
      },
      {
        type: "paragraph",
        text: '"We are sailing well, well enough to have won at Marina Rubicon if we had not torn five or six kites," says Müller-Spreer. "And 17 points is nothing considering there should be 20 races left to sail this season. We believe we can still win the season title. That is our objective, to win the 2026 championship."',
      },
      {
        type: "paragraph",
        text: 'One of the big stories of the season so far belongs to Jean-Luc Petithuguenin\'s Paprec, whose fairytale maiden win at Marina Rubicon – their first since joining the circuit back in 2012 – has the French crew riding a wave of confidence into Lanzarote. "We know where we are strong and where we are weak," says Paprec mainsheet trimmer Stéphane Névé. "And if it is breezy again we can have a very strong event but now 50 per cent of the fleet can win a regatta. But now we know we can do it we will be working doubly hard."',
      },
      {
        type: "paragraph",
        text: "Andrea Lacorte's Alkedo, runners-up by just two points last time out, will be desperate to go one better. The Foil is streaming every race live on YouTube this week – tune in for five days of tight, tactical TP52 racing.",
      },
      {
        type: "heading",
        text: "Matt Wearn chases a third ILCA 7 world title in Dublin",
      },
      {
        type: "paragraph",
        text: "Dun Laoghaire, Ireland hosts the ILCA 7 Men's Worlds from Tuesday to Sunday, with 141 sailors from 45 countries fighting it out on Dublin Bay – the first time the venue's held an Olympic-class Worlds. Netherland's defending champion Willem Wiersema is back, but the man to beat is Australia's Matt Wearn: after a perfect Grand Slam season – wins at Palma, Hyères and San Pedro – he arrives chasing a third world title. Just as the Flying Roos look unstoppable in SailGP, so does Wearn in the Laser.",
      },
      {
        type: "paragraph",
        text: '"I think it\'s pretty obvious that Matt Wearn is number one, and maybe Micky Beckett and Elliot Hanson are number two and three at the moment, with Pavlos [Kontides] right in the mix," says German sailor Philipp Buhl. "The thing is, in this class... every competitor gets a brand-new, identical boat – it\'s so simple and so amazing. Everybody is on exactly the same equipment, which means even Matt Wearn, having won every event he\'s competed in this year, still needs to show up and deliver in every single race, over the whole six days." Track the results here.',
      },
      {
        type: "heading",
        text: "Road to Miami's Star Worlds runs through Medemblik",
      },
      {
        type: "paragraph",
        text: "Medemblik, Netherlands hosts the Star European Championship from Monday to Saturday, returning to the Dutch venue exactly 25 years after it staged the 2001 Star Worlds. It's a stacked fleet – 76 teams, over 20 countries, and 12 former Star World Champions among them. One to to watch is 3x Star World Champ Robert Scheidt, racing the week after his son Erik took the ILCA 6 Youth World title. The Europeans double as a key staging post for November's Star Worlds in Miami, where Frithjof Kleen (who's also racing in Medemblik this week) and Paul Cayard defend the Gold Star.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/hvrZ5LQJhXqeDL16quVczAgWpTuwmVbQU3Vz-9HU8yA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/star-euros.webp",
        alt: "Martina Orsini",
        caption: "Martina Orsini",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-week-in-racing-24-august-26/",
    },
  },
  "flying-roos-hit-high-five-with-victory-in-sassnitz": {
    slug: "flying-roos-hit-high-five-with-victory-in-sassnitz",
    kind: "news",
    title: "Flying Roos hit high five with victory in Sassnitz",
    standfirst:
      "Australia's Bonds Flying Roos comfortably beat NorthStar Canada, Spain's Los Gallos and New Zealand's Black Foils to take their fifth win of the SailGP season in the final at Sassnitz and strengthen their position at the top of the championship standings.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "23rd August 2026 2:40pm",
    heroImage: {
      src: "https://thefoil.com/media/A8o2ox77mXdW18xveKYkY5q6wcYt-IsnN0mVIyP2l68/resize:fill-down:1500:500/gravity:fp:0.4787472036:0.6386820846/quality:60/dpr:1/2026/08/jl206387.jpg",
      alt: "Flying Roos hit high five with victory in Sassnitz",
    },
    body: [
      {
        type: "paragraph",
        text: "Here's how it played out, as fortunes swung on the Baltic waters.",
      },
      {
        type: "heading",
        text: "Rain rolls in to change the game",
      },
      {
        type: "paragraph",
        text: "Sunday in Sassnitz was never going to be straightforward. Rain squalls rolled in off the Baltic all morning, dragging the breeze around and punching holes right across the racecourse. In the unpredictable conditions, just keeping the boats up on their foils would turn out to be half the battle.",
      },
      {
        type: "paragraph",
        text: "Saturday had left the Black Foils and France on top of Group A, the Flying Roos and Artemis leading Group B. Would they be able to hold on to make it into the four-boat final?",
      },
      {
        type: "heading",
        text: "Race 4b: Germany fly as the fleet flounders",
      },
      {
        type: "paragraph",
        text: "It was carnage for the opening race of the day: two boats over at the start, NorthStar dumped to the back while Tom Slingsby nailed the timing to lead round mark one ahead of Emirates GBR and Artemis. Artemis's race unravelled at gate two – a horrible rounding dropped the Swedes off their foils, then a penalty for failing to keep clear of the US turned second place into sixth in just a few seconds.",
      },
      {
        type: "paragraph",
        text: "The race, though, belonged to Germany. Erik Heil stole the lead from the Aussies upwind and – with the racecourse now a patchwork of breeze and dead air – kept his boat flying while the rest splashed down.",
      },
      {
        type: "paragraph",
        text: "Behind the runaway Germans it was snakes and ladders, and nobody climbed better than the Canadians, first back on the foils to turn their start-line disaster into second, a full 1min 15sec behind Germany. Artemis recovered to third ahead of Emirates GBR, with the Roos fifth and the US last.",
      },
      {
        type: "paragraph",
        text: "Race 4b 1 Germany 2 Canada 3 Sweden 4 Great Britain 5 Australia 6 United States",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/uTUNKYLDawLFHlNBin5wGYgm1JsWUFwogJderSjvrEY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/fd3-6862.jpg",
        alt: "Felix Diemer/SailGP",
        caption: "Felix Diemer/SailGP",
      },
      {
        type: "heading",
        text: "Race 4a: Black Foils book the final early",
      },
      {
        type: "paragraph",
        text: "Group A's opener was neck and neck off the line between France and the Black Foils, but the Kiwis' pace had them leading by the first mark, with Mubadala Brazil rounding third and promptly pinged for not giving room. France's afternoon started going wrong on leg two: manoeuvring away early on the second leg dropped Quentin Delapierre's crew to fifth.",
      },
      {
        type: "paragraph",
        text: "Nobody was catching the Black Foils out front, and behind them Los Gallos climbed from fifth to second, holding it all the way to the line. France recovered to third, after riding out a hairy moment exiting gate four and then defending a late attack from Rockwool Racing. A second race win put the Kiwis into the final with a race to spare; the real scrap, France v Spain for Group A's last spot, was still to come.",
      },
      {
        type: "paragraph",
        text: "Race 4a 1 New Zealand 2 Spain 3 France 4 Denmark 5 Switzerland 6 Brazil 7 Italy",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/OXW1hPCmjBWuvxtNna4ALAA_lQ2WhIyeLIosM_K9GlY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/jn1-6955.jpg",
        alt: "Jonathan Nackland/SailGP",
        caption: "Jonathan Nackland/SailGP",
      },
      {
        type: "heading",
        text: "Race 5b: NorthStar hold their nerve",
      },
      {
        type: "paragraph",
        text: "With the top four in Group B covered by a single point, the last fleet race was effectively a knockout. Taylor Canfield's US crew nailed the start to lead round mark one ahead of Artemis and the Flying Roos, but got wide at gate two and splashed down.",
      },
      {
        type: "paragraph",
        text: "Artemis inherited the lead, but it didn't last. Just before gate four the Roos, NorthStar and Artemis converged, crossing with barely 50cm to spare at over 70km/h. But no penalty came, and Giles Scott's Canadians emerged in front. They never looked back: race win, and the final booked. Behind, Slingsby dragged the Roos through to second, dashing Swedish hopes of the final, and the US nipped past a deflated Artemis for third.",
      },
      {
        type: "paragraph",
        text: "Race 5b 1 Canada 2 Australia 3 United States 4 Sweden 5 Germany 6 Great Britain",
      },
      {
        type: "paragraph",
        text: "Standings in Group B 1 Canada 17 2 Australia 15 3 Sweden 14 4 Germany 12 5 Great Britain 9 6 United States 8",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/7R0X6ONF5xs_TQnuDLa6-Y0zYqEwPvm8r5EUc5OUuDw/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp2-0798.jpg",
        alt: "Ricardo Pinto/SailGP",
        caption: "Ricardo Pinto/SailGP",
      },
      {
        type: "heading",
        text: "Race 5a: Spain beat France at their own game",
      },
      {
        type: "paragraph",
        text: "Diego Botín pulled off what Los Gallos have been calling the 'French start', weaving through the middle of the pack to fire off the line clear ahead. The Spanish led at mark one at and simply sailed away.",
      },
      {
        type: "paragraph",
        text: "For Quentin Delapierre's crew it was looking dire by leg three: fifth, needing to make up two places to make the final. By gate four Los Gallos were 19 seconds clear of Rockwool Racing, and they controlled it to the finish for a decisive win – and with it, a place in the Sassnitz final alongside the Black Foils, the Flying Roos and NorthStar Canada.",
      },
      {
        type: "paragraph",
        text: "\"It's super hard to achieve, so we don't take it for granted,\" said Botín on the water, now chasing a third straight event win. France's consolation: officially the fastest crew in SailGP.",
      },
      {
        type: "paragraph",
        text: "Race 5a 1 Spain 2 Denmark 3 Italy 4 New Zealand 5 Switzerland 6 France 7 Brazil",
      },
      {
        type: "paragraph",
        text: "Standings in Group A 1 New Zealand 19 2 Spain 16 3 France 14 4 Switzerland 9 5 Denmark 8 6 Italy 7 7 Brazil 0",
      },
      {
        type: "heading",
        text: "Final: Won fast, finished slow",
      },
      {
        type: "paragraph",
        text: "NorthStar promptly handed Australia a gift at the start. Coming into the line too early, they bailed out to avoid a penalty and slowed up the Black Foils and Los Gallos behind. The Roos pounced and flew off into a lead they'd never lose.",
      },
      {
        type: "paragraph",
        text: "NorthStar then dropped off the foils before gate two, falling to third as the chasing trio swapped places in the gusts – Los Gallos, last off the start, sliced past the Black Foils at gate three for second. Out front Slingsby sailed his own race, and the Roos crossed comfortably – a first event win since New York.",
      },
      {
        type: "paragraph",
        text: "Then the wind died. All three of the chasing pack came off their foils at the penultimate mark for a tense, slow-motion finish. The Black Foils, penalised for squeezing Los Gallos at the boundary, had to drop astern, and Canada drifted slightly less slowly than the rest to take second from Spain, with the Kiwis fourth.",
      },
      {
        type: "paragraph",
        text: "Final 1 Australia 2 Canada 3 Spain 4 New Zealand",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/G3a8lD4gbQLaDDQ4v9XZSyv2Z1J9ThtjFeeQUU8EQvo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/jl206300.jpg",
        alt: "Jason Ludlow/SailGP",
        caption: "Jason Ludlow/SailGP",
      },
      {
        type: "heading",
        text: "Five wins and counting",
      },
      {
        type: "paragraph",
        text: "That's five event wins this season for the Flying Roos, who leave Germany on 76 points – a full 14 clear of Los Gallos in second, whose back-to-back winning run is over. Artemis remain third on 53 despite missing the Sassnitz final, still waiting for a first event win since joining the league. And the reigning champions' slide goes on: Emirates GBR could only manage ninth here and now sit fourth overall, level on points with the US.",
      },
      {
        type: "paragraph",
        text: "It caps a weekend that swung from a new outright speed record to a final decided at walking pace, with Sunday's five races producing five different winners. Whatever Sassnitz threw at this fleet, it was Tom Slingsby's crew who handled it best, and they head into this final stage of the season looking formidable.",
      },
      {
        type: "paragraph",
        text: "Germany SailGP final order 1 Australia 10 2 Canada 9 3 Spain 8 4 New Zealand 7 5 Sweden 6 6 France 5 7 Germany 4 8 Switzerland 3 9 Great Britain 2 10 Denmark 1 11 USA 0 12 Italy 0 13 Brazil 0",
      },
      {
        type: "paragraph",
        text: "SailGP 2026 championship standings 1 Australia 76 2 Spain 62 3 Sweden 53 4 Great Britain 46 5 United States 46 6 France 41 7 Canada 40 8 Germany 32 9 Switzerland 28 10 Denmark 25 11 Italy 22 12 New Zealand 21 13 Brazil 8",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/flying-roos-hit-high-five-with-victory-in-sassnitz/",
    },
  },
  "flying-roos-and-black-foils-lead-the-way-in-germany": {
    slug: "flying-roos-and-black-foils-lead-the-way-in-germany",
    kind: "news",
    title: "Flying Roos and Black Foils lead the way in Germany",
    standfirst:
      "The Bonds Flying Roos and Black Foils lead the way at the end of day one at the Germany Sail Grand Prix, on a bright and breezy day that featured a new record top speed being set for SailGP.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "22nd August 2026 2:37pm",
    heroImage: {
      src: "https://thefoil.com/media/tORW2FZKCYDW4Lo-k3bVFxSJFYsWHS6yMjsBEVqAiJI/resize:fill-down:1500:500/gravity:fp:0.758974359:0.8208106473/quality:60/dpr:1/2026/08/fd1-0713.jpg",
      alt: "Flying Roos and Black Foils lead the way in Germany",
    },
    body: [
      {
        type: "paragraph",
        text: "In Group B, Australia got off to a flier with a pair of wins in the first two races – but then finished sixth and last in the third. They lead Artemis Sweden by one point after Nathan Outteridge's crew proved super-consistent with a trio of third places.",
      },
      {
        type: "paragraph",
        text: "But the overnight standings are tight. NorthStar Canada, Emirates Great Britain, Deutsche Bank Germany and even the United States will still be hoping for a stellar Sunday to make the top two in the group and qualify for the four-boat final.",
      },
      {
        type: "paragraph",
        text: "In Group A, running second on Saturday, New Zealand's Black Foils won the opener and followed up with a second and fourth to top the group standings. DS Automobiles France won the second race – and in the third flew to a top speed of 107.63km/h (58.1 knots) to set a stunning new record in the league.",
      },
      {
        type: "paragraph",
        text: "The French sit second in the standings ahead of Spain, who recovered from a poor opening two races to win the third in Group A.",
      },
      {
        type: "heading",
        text: "The sizzle in Sassnitz",
      },
      {
        type: "paragraph",
        text: "Sassnitz turned it on for day one of the Rockwool Germany Sail Grand Prix. With winds topping 24 knots, the fleet went out on the 18-metre wingsails with high-speed foils and rudders. Emirates GBR had already clocked 56.6 knots (104.8km/h) in pre-race practice, breaking the race record. The question was whether anyone would do it again within a race.",
      },
      {
        type: "paragraph",
        text: "Group A = Los Gallos, Explora Swiss, the Black Foils, DS Team France, ROCKWOOL Racing, Red Bull Italy, Mubadala Brazil",
      },
      {
        type: "paragraph",
        text: "Group B = Artemis, NorthStar Canada, the US, BONDS Flying Roos, Germany, Emirates GBR.",
      },
      {
        type: "paragraph",
        text: "Home team first, so Group B had the honours.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/_wgDHPZ2WCHIgEe-25kw2ucY74ZoWCM4wdUpUam3_yM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/fd1-0657.jpg",
        alt: "Felix Diemer/SailGP",
        caption: "Felix Diemer/SailGP",
      },
      {
        type: "heading",
        text: "Race 1b: Roos first, home team last",
      },
      {
        type: "paragraph",
        text: "The Flying Roos nailed the start, rounded mark 1 in first and then absolutely sent it down the second leg, hitting 94km/h at first mark with NorthStar Canada right behind them. Not a good start for the home team, though: Germany sat last after a rocky opening tangled up with the Brits at the bottom of the line.",
      },
      {
        type: "paragraph",
        text: "By the third leg the USA had taken second, but Giles Scott swooped in at gate 3 to put NorthStar ahead of the Americans. A splashdown after the next gate got loose and cost the Canadians metres, but they held second. Australia, meanwhile, were streaking away – 15 seconds clear of Canada and then 24 seconds ahead at the finish.",
      },
      {
        type: "paragraph",
        text: '"Sassnitz really turns it on for us," said Tom Slingsby on the water, before adding that speed records weren\'t on the agenda: "If it happens organically, we\'ll take it, but we\'re not looking for it."',
      },
      {
        type: "paragraph",
        text: "Nightmare finish for the US. Having sailed a tactically brilliant upwind leg, Taylor Canfield misjudged the final layline by a couple of seconds, slipped from second to fourth and let both Canada and Artemis get away. Dylan Fletcher's crew put the pressure on the Americans but took fifth, with the home team dead last.",
      },
      {
        type: "paragraph",
        text: "Race 1b 1 Australia 2 Canada 3 Sweden 4 United States 5 Great Britain 6 Germany",
      },
      {
        type: "heading",
        text: "Race 1a: Burling's back",
      },
      {
        type: "paragraph",
        text: "Switzerland and New Zealand nailed the start, rounding mark 1 side by side at close to 95km/h before the Black Foils surged ahead to lead. Spain, meanwhile, ended up near the back. Diego Botín pushed hard – perhaps too hard – and it looked like Los Gallos were about to steal third from France at gate 3, but the French had entered the zone first and Spain didn't have the room to dive in and were handed a go-behind penalty.",
      },
      {
        type: "paragraph",
        text: "With the Black Foils and Explora Swiss holding the front two spots to the finish, Red Bull Italy read the course well to jump to third ahead of France in fourth.",
      },
      {
        type: "paragraph",
        text: '"Actually quite a nice first race," said Pete Burling after. "We\'re back, starting to perform more at the pointy end of the fleet."',
      },
      {
        type: "paragraph",
        text: "That penalty cost Spain big time. Having briefly got up to third – illegally – they dropped to sixth and then behind Brazil to ultimately finish last. A rare mistake from the form team, a classic risky move that didn't pay off this time, and it happened to be against their America's Cup mates at La Roche-Posay Racing Team.",
      },
      {
        type: "paragraph",
        text: "Race 1a 1 New Zealand 2 Switzerland 3 Italy 4 France 5 Denmark 6 Brazil 7 Spain",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/DL80Mul-9jB7tprr9bw8ejUVFQti8jMRLOXLQcQt2FM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp1-2588.jpg",
        alt: "Ricardo Pinto/SailGP",
        caption: "Ricardo Pinto/SailGP",
      },
      {
        type: "heading",
        text: "Race 2b: Rock solid Roos",
      },
      {
        type: "paragraph",
        text: "Tom Slingsby executed the perfect start, controlling the fleet to cross in first, but Nathan Outteridge kept on his case down the second leg, the Swedes right behind the Aussies. Slingsby pushed Artemis wide at gate 2 and then darted inside so there was no overlap – tactical racing at 60km/h.",
      },
      {
        type: "paragraph",
        text: "From there it was all about control. The Flying Roos looked rock solid stable while everyone else was getting thrown around in the gusts, a boat-handling masterclass the Roos made look effortless.",
      },
      {
        type: "paragraph",
        text: "Emirates GBR had a rocky start in fifth but did a great job getting back, climbing to second by gate 3 and picking the right-hand turns all the way up the course.",
      },
      {
        type: "paragraph",
        text: "Once again the Flying Roos took the race, well ahead of the chasing pack. The Brits needed a good result and that's what they got, crossing second six seconds ahead of Artemis in third. Another fourth for the US, another poor result for the Germans in fifth, and Canada last after digging the bow into the Baltic on a round-up.",
      },
      {
        type: "paragraph",
        text: "Race 2b 1 Australia 2 Great Britain 3 Sweden 4 United States 5 Germany 6 Canada",
      },
      {
        type: "heading",
        text: "Race 2a: France find their Sassnitz form",
      },
      {
        type: "paragraph",
        text: "France nailed it from the start. Quentin Delapierre was hammer down, hitting 94km/h before mark 1, and maintained control at the front from there. Much better from Spain in second after their last-place finish, but the Black Foils were chasing hard despite an early boundary penalty.",
      },
      {
        type: "paragraph",
        text: "Massive gusts were piling down the course, and all teams were struggling to stay in control. Gate 3 was absolute carnage: Spain made a mess of the top mark, broke the boundary and dropped off the foils, while the Swiss had their own wobble, allowing Denmark to go from fifth to third.",
      },
      {
        type: "paragraph",
        text: "Huge win for France. That was their first fleet race win since Perth at the start of the season. Also winners in Sassnitz last year, the big breeze seems to suit them. The Black Foils followed up their opening win with second, Rockwool Racing recovered well for third, form team Los Gallos had dropped to fourth by the finish, and Switzerland went from second to fifth.",
      },
      {
        type: "paragraph",
        text: "Race 2a 1 France 2 New Zealand 3 Denmark 4 Spain 5 Switzerland 6 Italy 7 Brazil",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/ZnQKDVB_FEwzmzURui11RJKmrVFOuLW6S0oGR69cFzA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/br6-1005.jpg",
        alt: "Benjamin Rosewall/SailGP",
        caption: "Benjamin Rosewall/SailGP",
      },
      {
        type: "heading",
        text: "Race 3b: Heil saves the day",
      },
      {
        type: "paragraph",
        text: "Germany hadn't been doing well today, but they led the start and rounded mark 1 in first in front of the home crowd, 10km/h quicker than anyone around them. Behind them NorthStar and the US were pushing hard. Australia hit 100kmh at mark 1, the first to do so in racing, though in fourth. Behind them two more big teams, Emirates GBR and Artemis, were right at the back.",
      },
      {
        type: "paragraph",
        text: 'The Germans were given a penalty for sailing out of bounds, handing Canada the lead, but it didn\'t last: a big windshift gave Erik Heil a passing lane back past NorthStar and the home team held on to win by a wide margin. "It was a bad beginning to the day and we needed that to bring us back in the game," said Heil immediately after. "It was actually the only start we executed so I think I have to dive into starts tonight, and make some more starts possible tomorrow."',
      },
      {
        type: "paragraph",
        text: "Behind Germany it was much closer. NorthStar picked up their second podium of the day, while the US relinquished third in a crazy finish that saw Artemis and GBR slingshot around the Americans for third and fourth. And after back-to-back race wins, the Flying Roos finished dead last.",
      },
      {
        type: "paragraph",
        text: "Race 3b 1 Germany 2 Canada 3 Sweden 4 Great Britain 5 United States 6 Australia",
      },
      {
        type: "heading",
        text: "Race 3a: France set the pace, Spain take the win",
      },
      {
        type: "paragraph",
        text: "A squall came in for the final race of the day, and with it the big numbers. Denmark and Los Gallos rocketed off the line, but mark 1 was carnage. Rockwool Racing briefly set a new record at 106km/h before getting too high on the foils and losing control into a nosedive, then France went round at 107.63km/h – a whopping 58.1 knots and a new SailGP speed record.",
      },
      {
        type: "paragraph",
        text: "France used that pace to lead, but Spain found the dark water on the left of the course and stole it from them by the midpoint. Los Gallos needed a result after a seventh and a fourth, and they held on to the finish, touching 100km/h on the final gate to win.",
      },
      {
        type: "paragraph",
        text: "The Black Foils pushed France but Delapierre's crew held on to second, with Burling's squad third, and the Swiss snatched fourth from Italy right at the line.",
      },
      {
        type: "paragraph",
        text: "Race 3a 1 Spain 2 France 3 New Zealand 4 Switzerland 5 Italy 6 Denmark 7 Brazil",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/XcWeBSUmOOtDvYM9-VzB4v7e7_MIP3fgN5uaEGNisgY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rp2-7577.jpg",
        alt: "Ricardo Pinto/SailGP",
        caption: "Ricardo Pinto/SailGP",
      },
      {
        type: "heading",
        text: "Five winners after six races",
      },
      {
        type: "paragraph",
        text: "So after six races and five different winners, the Black Foils and France top Group A, the Kiwis leading the overall leaderboard on 12 points. In Group B it's the Flying Roos and Artemis, with just one point between them after that sixth for Australia. Los Gallos looked a bit shaken after a couple of poor results, but turned it round at the end with a race win and sit just outside the top two.",
      },
      {
        type: "paragraph",
        text: "Teams were absolutely sending it out there today, with France's 107.63km/h the new record to beat. Join us tomorrow for two more fleet races per group and the four-boat final to see who takes the title in Sassnitz.",
      },
      {
        type: "paragraph",
        text: "Group A standings at the end of Day 1 1 New Zealand 12 2 France 11 3 Spain 7 4 Switzerland 7 5 Italy 4 6 Denmark 4 7 Brazil 0",
      },
      {
        type: "paragraph",
        text: "Group B standings at the end of Day 1 1 Australia 10 2 Sweden 9 3 Canada 8 4 Great Britain 7 5 Germany 6 6 United States 5",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/flying-roos-and-black-foils-lead-the-way-in-germany/",
    },
  },
  "black-foils-dominate-practice-day-in-sassnitz": {
    slug: "black-foils-dominate-practice-day-in-sassnitz",
    kind: "news",
    title: "Black Foils dominate practice day in Sassnitz",
    standfirst:
      "The Black Foils from New Zealand set the benchmark on the waters off Sassnitz, after a three-race practice session on Friday afternoon in marginal foiling conditions.",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "21st August 2026 6:30pm",
    heroImage: {
      src: "https://thefoil.com/media/MUC_x0oTfmV3TKhn1vb3B7bVVF-hMs_RP_kXvXVfsKA/resize:fill-down:1500:500/gravity:fp:0.6787096774:0.5812742086/quality:60/dpr:1/2026/08/260821-sailgp-sassnitz-the-foil-ls1-3878.jpg",
      alt: "Black Foils dominate practice day in Sassnitz",
    },
    body: [
      {
        type: "paragraph",
        text: "Pete Burling's crew dominated Group A with a 1-1-2 record during official practice racing for the SailGP event in Germany. Spain finished second in the seven-boat fleet, recording 2-4-1.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/zlnwj3dutuBN_SK7hUX_U3DvrzL9knDertxi5CVmJJ0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/260821-sailgp-sassnitz-the-foil-ls1-3878.jpg",
        alt: "Lewis Smith / The Foil",
        caption: "Lewis Smith / The Foil",
      },
      {
        type: "paragraph",
        text: "New Zealand's standout drive came in Race 2. After a sluggish start left them off the foils alongside several competitors, the Kiwis rounded Mark 1 in fifth place before carving through the fleet to secure victory, maintaining flight better than anyone in the patchy air.",
      },
      {
        type: "paragraph",
        text: "Group B finished in a dead heat. Australia scored 1-5-1 to tally seven points, a total matched by Nathan Outteridge's Swedish Artemis entry with 4-1-2. Outteridge took Race 2 after spotting a late opening near the windward end of the starting line, bearing away into a gap to lead at Mark 1 before extending his advantage. The bold manoeuvre proved that Outteridge is ready to pounce on short-lived openings - a style more commonly associated with the French or Spanish teams.",
      },
      {
        type: "paragraph",
        text: "The windward end offered strong position but carried heavy risk; both Italy and Switzerland were shut out there in separate starts.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/2qWVbHMLW-EYl5fDHvrWjr6_ERrGlZpVkdb4mR6hHj0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/fd1-3593.jpg",
        alt: "Felix Diemer / SailGP",
        caption: "Felix Diemer / SailGP",
      },
      {
        type: "paragraph",
        text: "It's easy to read too much into practice results. On Friday teams contended with marginal foiling conditions using the medium-sized 24-metre rig. The weekend forecast looks forward to some full-on conditions, prompting a likely shift to the smaller 18-metre wing. While offshore gusts over the stadium and Adrenaline Lounge will keep the breeze patchy near the start line, staying on the foils in the open course should pose little trouble.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/YbXIOqkNv13yBMfxQZUc5cIEi5-q3Rs8Uovlnx4B6Ns/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/260821-sailgp-sassnitz-the-foil-ls1-4014.jpg",
        alt: "Lewis Smith / The Foil",
        caption: "Lewis Smith / The Foil",
      },
      {
        type: "paragraph",
        text: "Diego Botín's Spanish team enters as my event favourite and a victory here would mark three in a row. The expansive Sassnitz racecourse offers a rare opportunity room for teams to stretch their legs and use some raw boat speed, which could work to the advantage of, say, Australia and possibly Great Britain into play if the British can recover from disappointing performances in Halifax and Portsmouth. With the season finale drawing ever closer, there are some other teams who know that they will need to get on the podium this weekend if they're to sustain any hope of reaching the big showdown in Abu Dhabi this November. They'll need to show more than they did in today's practice session, and topple some of the usual suspects who have set the early pace in Sassnitz.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/black-foils-dominate-practice-day-in-sassnitz/",
    },
  },
  "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors": {
    slug: "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors",
    kind: "news",
    title: "Plans uncovered to reinvent SailGP's race weekend – news even to the sailors",
    standfirst:
      "SailGP are seemingly wrestling with their current format – is it the best version of itself it can be? A survey that went out last night reveals some of the concepts the league is weighing up. It was only live for a couple of hours, but The Foil caught the lot.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "21st August 2026 11:41am",
    heroImage: {
      src: "https://thefoil.com/media/-4ZPD175LZGrzt5b0a_99PwDZ5keWWbtLdZk4vpeaNs/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/08/jl108682-1.jpg",
      alt: "Plans uncovered to reinvent SailGP's race weekend – news even to the sailors",
    },
    body: [
      {
        type: "paragraph",
        text: "Curiously, the drivers themselves don't appear to have been in the loop: when we put the graphic below to them at the Sassnitz press conference this morning, it was news to them.",
      },
      {
        type: "paragraph",
        text: "Early days, clearly, but the survey revealed plenty about where the league might be heading. We've broken it all down below…",
      },
      {
        type: "heading",
        text: "Sorting the grid",
      },
      {
        type: "paragraph",
        text: "This is the real thrust of the survey: with the mid-season shift to split fleets, how do you keep the racing both fair and entertaining? SailGP are toying with three ideas.",
      },
      {
        type: "paragraph",
        text: "1- Previous Event Standings",
      },
      {
        type: "paragraph",
        text: "Seeding based purely on the last event's final results, which is what's in place now. The snag with the current setup is that many of the top teams never actually go head-to-head across a weekend until they reach the final. The next idea looks like an attempt to fix that.",
      },
      {
        type: "paragraph",
        text: "2- Tiered Random Draw (pictured)",
      },
      {
        type: "paragraph",
        text: "Teams are split into three tiers based on the previous event (top 4, middle 6, bottom 4), then groups are drawn at random from within those tiers. Variety, but with the groups kept broadly balanced. On The Foil Podcast a few weeks back we kicked around a similar tiered system – introducing Gold and Silver fleets – and it sparked a bit of disagreement within the team about fairness.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/2cO0zBNeyy8Of0IXQv2l0rFwp6UZFD-cnTRiaElTCaM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/weekend-racing-format-proposal.jpeg",
        alt: "Weekend Racing Format Proposal",
      },
      {
        type: "paragraph",
        text: "3- Drivers Draft",
      },
      {
        type: "paragraph",
        text: "This is the one we at The Foil are most excited about. The top two drivers from the last event become captains and pick their own group opponents in a live, broadcast draw – like choosing teams in the playground. Except the best won't necessarily be picked first: to make life easier, a captain might deliberately load up on weaker rivals. It'd add an intriguing new layer to a race weekend, and hands teams a real incentive to finish in that top two.",
      },
      {
        type: "paragraph",
        text: "Underneath it all, this is a question about what fans really want: randomised matchups, even if they're lopsided, or groups engineered for balance. Worth noting too that these ideas assume a fleet of 14, so they're most likely aimed at next season rather than the closing events of season 6 and its 13-boat fleet.",
      },
      {
        type: "heading",
        text: "Two days, two tiers, one last chance",
      },
      {
        type: "paragraph",
        text: 'Here\'s how SailGP explains the proposed "Tiered Group Racing" in its own words:',
      },
      {
        type: "paragraph",
        text: "Day 1 Qualification (6 Races, 3 per group)",
      },
      {
        type: "paragraph",
        text: "Teams compete in two separate groups. Overall performance in these groups directly determines a team's tier placement for Sunday.",
      },
      {
        type: "paragraph",
        text: "Day 2 Finals (6 Races inc. grand final)",
      },
      {
        type: "paragraph",
        text: "The top 4 teams from each Day 1 group combine to form an elite Tier 1. The bottom 3 teams from each group combine to form Tier 2.",
      },
      {
        type: "paragraph",
        text: "The Path to the Grand Final:",
      },
      {
        type: "paragraph",
        text: "Tier 1 completes 2 races, with the top 3 overall boats qualifying for the Grand Final.",
      },
      {
        type: "paragraph",
        text: "Tier 2 completes 2 races.",
      },
      {
        type: "paragraph",
        text: "The top 3 boats from Tier 2 merge with the remaining 5 Tier 1 boats in a last chance qualifier race.",
      },
      {
        type: "paragraph",
        text: "The winner of this race secures the fourth and final Grand Final position.",
      },
      {
        type: "paragraph",
        text: "- - - - - - - - - - -",
      },
      {
        type: "paragraph",
        text: "The survey wants to gauge what fans find exciting and what they find baffling. It asks whether they're drawn to the scramble to make Tier 1, the raised stakes down in Tier 2, the sudden-death last chance qualifier, or the drama of a four-boat grand final. It also asks whether the group splits, the tier placements or the qualifier itself might trip fans up.",
      },
      {
        type: "paragraph",
        text: "All the different tiers and stages may look confusing on paper, but my colleague at The Foil Andy Rice assures us that 'once people have seen it once, they'll get it.' Lewis Smith, meanwhile, has spotted an intriguing wrinkle – under this format the top three skip the third race entirely. Is that a help or a hindrance? On one hand it's a breather and a final spot already banked; on the other, the top three could turn up cold and out of rhythm just as the grand final fires up.",
      },
      {
        type: "paragraph",
        text: "And all this talk of a four-boat final has us increasingly convinced that's where the championship grand final is heading, with the fleet fighting for four – not three – spots in the winner-takes-all title race. Whether that's on the cards for season six, with only a handful of events left, not even the teams seem to know.",
      },
      {
        type: "heading",
        text: "Reward the winners, widen the gaps?",
      },
      {
        type: "paragraph",
        text: "Another revelation: SailGP are also weighing up a change to the scoring, handing more points to the higher-placed teams across both the season championship and individual races. In the survey's own words, it's a choice between keeping the points tight versus heavily rewarding race wins.",
      },
      {
        type: "paragraph",
        text: "That flies in the face of SailGP's long-held desire to keep the league level – most obviously the open data shared between teams so no one runs away with an advantage. Weight the points towards the front and you risk a widening gulf between the haves and the have-nots.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/qSKmN6CilQRPPKrubpGXEON1VhpN13qwguJUIUVJxRw/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/go1-9917.jpg",
        alt: "Gary Oakley / SailGP",
        caption: "Gary Oakley / SailGP",
      },
      {
        type: "heading",
        text: "Bringing fans up to speed",
      },
      {
        type: "paragraph",
        text: 'Finally, SailGP are clearly concerned with making the rules, scoring and standings clearer to their audience. The survey floats a whole menu of fixes: sharper broadcast graphics and live leaderboards, commentators taking more time to walk viewers through the rules mid-race, bite-sized social explainers, and a pre-race segment that breaks down the format before racing begins. For fans in the stadium there\'s talk of big-screen live standings, 60-second explainer videos in the fan zone, a "live event guide" in the app, and even QR codes dotted around the venue linking to a "how it works" sheet.',
      },
      {
        type: "paragraph",
        text: "All useful stuff for newcomers, no doubt – though seasoned fans might find this hand-holding a bit much. It's a tricky balance to strike when you're trying to pull in a new crowd.",
      },
      {
        type: "paragraph",
        text: "The survey signs off with a question that we'd also like to put to you: 'What would make the 2027 format more thrilling and enjoyable to watch?'",
      },
      {
        type: "paragraph",
        text: 'There\'s plenty in here that has us at The Foil excited. Nevertheless, in a league that never sits still, every tweak brings knock-on effects nobody sees coming, for the teams as well as the fans (exhibit A: the so-called "Group of Death"). Does anything in here jump out at you? Let us know in the comments.',
      },
      {
        type: "paragraph",
        text: "We'll do some digging over the weekend in Sassnitz to find out what the athletes make of all this – once they've had a chance to read this and get up to speed, of course! – so stay tuned across our channels.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors/",
    },
  },
  "andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class": {
    slug: "andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class",
    kind: "news",
    title: "Andy Rice: A good Worlds for GBR, and a good Worlds for the 470 Class",
    standfirst:
      "The future of the 470 as an Olympic class is under scrutiny, as it is for the Nacra 17 catamaran and the men's and women's kiteboarding classes. All of them have their obvious weaknesses, the 470 being that it is now the oldest of the Olympic events. When it first featured at the Montreal Olympics in 1976, the 470 was considered to be a fast boat, cutting edge for its time. Now it's very run-of-the-mill, but maybe that's not such a problem.",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "19th August 2026 7:17pm",
    heroImage: {
      src: "https://thefoil.com/media/PoOZr8Sce7tlhLwaN_643Mi71ygmzFNwDszcLfWseuA/resize:fill-down:1500:500/gravity:fp:0.5010989011:0.3081960898/quality:60/dpr:1/2026/08/55457634027-d7ba2b7d10-o.jpg",
      alt: "Andy Rice: A good Worlds for GBR, and a good Worlds for the 470 Class",
    },
    body: [
      {
        type: "paragraph",
        text: "While fast foilers might appear to be more exciting at first glance, the slowness of the 470 in light to medium airs is partly what makes it a fascinating game of chess. The 470 is probably the most representative of the broad spectrum of sailing that takes place around the world beyond the Olympic bubble. When the waves and the wind really kick up, the 470 laps it all up. It just gets faster and faster and, in the right hands, can handle pretty much any conditions up to 35 knots in big, nasty seas.",
      },
      {
        type: "paragraph",
        text: "With the 470 under the spotlight, possibly on the chopping block for Brisbane 2032 and decision time at the World Sailing annual conference this November, the class needed a good world championship. The risk of it taking place in Enoshima, the venue for the Tokyo 2020 Olympic Regatta, would be that numbers might be diminished, being so far from the epicentre of Olympic competition in Europe.",
      },
      {
        type: "paragraph",
        text: "However, the entry of 74 teams was the highest since the start of the Mixed 470 era five years ago. Unfortunately the wind did not really play fair, much as it failed to show up for the Games five years earlier. This is a pity, because Enoshima can deliver amazing big-wind, big-wave conditions. But mostly this was a light air affair. I was brought in as a remote commentator for the final three days of competition, working as part of an 'as live' production.",
      },
      {
        type: "paragraph",
        text: "Ever since Pedro Martinez from the Sailing Energy crew in Spain pioneered the 'as live' concept earlier this season with the dash-for-cash fun races that he filmed with the ILCA and Nacra 17 fleets (I remote commentated on these races too), the idea has taken firmer hold.",
      },
      {
        type: "paragraph",
        text: "Of course, there's nothing to touch the raw excitement of a real live production, but there's not much to touch the high costs and huge logistical challenges of making a live production work reliably. In an age where most sailors below the age of 50 are consuming their media through Instagram, YouTube and the dreaded TikTok, arguably the most important media output is through these channels. Most people are consuming the highlights at a time that's convenient to them. Live doesn't matter as much as it did, although for the major events there is the irreplaceable buzz of enjoying and enduring the nailbiting highs and lows of the shared experience.",
      },
      {
        type: "paragraph",
        text: "For the final two days my co-commentator was Igor Marenic who, with helmsman Šime Fantela, won Croatia's first ever Olympic sailing gold at Rio 2016 when they beat the Aussie favourites Matt Belcher and Will Ryan into silver. Igor also recently became the president of 470 International, and has been wise enough to hire Polish media expert Karolina Soltaniuk to promote the class through all the popular channels. Media output has never been high on the 470's agenda, and that lack of self-promotion is partly what sees the class up for Olympic review. The 470 has a great story to tell, and it's good to see the class at last putting a higher priority on media.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/TgIWqXBgJKSF01iG2CH7MwaTHeinwVg7xzx7RFglPN0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/55468990246-3947136768-o.jpg",
        alt: "470 Olympic Sailing / Junichi Hirai",
        caption: "470 Olympic Sailing / Junichi Hirai",
      },
      {
        type: "paragraph",
        text: "After commentating on the 49er, 49erFX and Nacra 17 World Championships in France a few months ago, this would be my second go at trying to make sense of the new medal race format that was voted in at the end of last year. Trying to work out who had won the FX Worlds after multiple boats crossed the line in short order was excruciating. It took minutes before we could semi-confidently call the actual winners, the Norwegian team of Pia Dahl Andersen and Nora Edland.",
      },
      {
        type: "paragraph",
        text: "Even though I was commentating on a recording sent to me from Japan via WeTransfer, I still didn't want to see what happened before recording my commentary. Trying to keep it spontaneous. After watching the yellow bib wearers - Martin Wrigley and Bettine Harris - suffer an awful first medal race, I wondered if fate was going to work against them. But the British team held their nerve, winning the second race and taking their first world title in fine style.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/47Y-TTFY1MKRr13OYG5rkRvKfSupJbUdwFlX_5AjKHc/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/55469386105-4e2288c55a-o.jpg",
        alt: "470 Olympic Sailing / Junichi Hirai",
        caption: "470 Olympic Sailing / Junichi Hirai",
      },
      {
        type: "paragraph",
        text: "Seeing Theresa Löffler and Christopher Hoerr come back from an awful start in the final race - stopped dead on the line as the gun fired - and then bouncing back to rise from fourth to second overall, that was a vindication of the new medal series format. I still haven't seen enough either way to condone or condemn the new format, but the final day of the 470 Worlds was a mark in its favour.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/dGnOTf_tI1c-_NUSindSx5t49E4CH6TXDdDx1ohsW5E/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/55465259134-f28b5387e5-o.jpg",
        alt: "470 Olympic Sailing / Junichi Hirai",
        caption: "470 Olympic Sailing / Junichi Hirai",
      },
      {
        type: "paragraph",
        text: "While the Germans won a surprise silver, the team to lose out were local heroes Tetsuya Isozaki and Yuri Seki who missed out on the podium. Bronze went to the outgoing World Champions of 2025, Spain's Jordi Xammar and Marta Cardona. Bronze is the same colour of medal that Xammar won with Nico Rodriguez in the men's 470 at the Tokyo 2020 Games five years earlier.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/QSH2mLu_2CBvSeiKM64MyYPV9XhV8owBrpDULdPnOQA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/55460877643-46e9572325-o.jpg",
        alt: "470 Olympic Sailing / Junichi Hirai",
        caption: "470 Olympic Sailing / Junichi Hirai",
      },
      {
        type: "paragraph",
        text: "This was a good Worlds not just for the medallists but for the Japanese hosts, and the 470 class generally. The success of this event will provide some useful ammunition in the class's bid to retain its 50-year Olympic status for a while longer.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/Rj8N43bQRED37of3YbOijXAdX9fyNQ2HsNU4zwN5NKg/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/55459009265-82e1ca07dc-o.jpg",
        alt: "470 Olympic Sailing / Junichi Hirai",
        caption: "470 Olympic Sailing / Junichi Hirai",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class/",
    },
  },
  "the-ocean-race-atlantic": {
    slug: "the-ocean-race-atlantic",
    kind: "event",
    title: "The Ocean Race Atlantic",
    standfirst:
      "The Ocean Race Atlantic starts 1 September, sending six fully-crewed IMOCA teams from New York to Lorient, France, on a transatlantic sprint of roughly 3,600 nautical miles. It's the first point-to-point race in the event's 50-year history – no stopovers, just a straight dash across the Atlantic, with every boat carrying a mandatory 50-50 crew split plus an On Board Reporter (OBR).",
    heroImage: {
      src: "https://thefoil.com/media/jLDnOtI9zVLwE88umhPoSchUzO_fxgHGpd1R9cLVMus/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/08/tora1.webp",
      alt: "The Ocean Race Atlantic",
    },
    body: [
      {
        type: "paragraph",
        text: "The race sits deliberately in the calendar. It follows last year's Ocean Race Europe out of Kiel and doubles as a shakedown for the next round-the-world race, starting from Alicante in January 2027 – a live test of pace, crew rotation, and communication before the bigger campaign begins.",
      },
      {
        type: "paragraph",
        text: "Confirmed entries include Hermann's Team Malizia, Kojiro Shiraishi' DMG Mori Sailing Team, Francesca Clapcich Powered by 11th Hour Racing, Paul Meilhat's United by the Ocean, Oliver Heer Ocean Racing, and Conrad Colman's MSIG Europe, with an onboard ocean science programme running throughout alongside Impact Partner 11th Hour Racing.",
      },
      {
        type: "paragraph",
        text: "Several of the skippers arrive with recent transatlantic form. Paul Meilhat and Boris Herrmann both raced this stretch of ocean before, and Herrmann's crew already holds the 24-hour distance record from the last round-the-world race.",
      },
    ],
    eventDate: "1 Sep 2026",
    location: "New York - Lorient",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/events/the-ocean-race-atlantic/",
    },
  },
  "rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes": {
    slug: "rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes",
    kind: "interview",
    title: "Rising Stars: Nathan Berger, the 17-year-old wingfoiler beating his heroes",
    standfirst:
      "This is the first in our Rising Stars series, on the young athletes in sailing and foiling who are making the rest of the field sit up and take notice.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "2nd May 2026 10:11am",
    heroImage: {
      src: "https://thefoil.com/media/USlycg-OgXTZHUVxCTTrHbiI6X8V9JpZmhUzp4LF1OE/resize:fill-down:1500:500/gravity:fp:0.5757575758:0.4289940828/quality:60/dpr:1/2026/05/nathan-berger8.jpg",
      alt: "Rising Stars: Nathan Berger, the 17-year-old wingfoiler beating his heroes",
    },
    body: [
      {
        type: "paragraph",
        text: "Last week in Leucate, at the season-opening stop of the GWA Wing Foil World Tour, Nathan Berger knocked out several of the sport's top names – including the reigning world champion – on his way to a debut final. Currently ranked 15th in the world, he finished fourth. When we caught up a few days later, Nathan was celebrating his 17th birthday. He's certainly not wasting any time.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/dc_X7k8_Oxq8K8HcCBS1V9FGYUNGrlDg0mQf9U7nGOI/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/05/nathan-berger-gwa-1.jpg",
        alt: "Lukas K Stiller",
        caption: "Lukas K Stiller",
      },
      {
        type: "paragraph",
        text: "Wingfoil freestyle sits at the noisier, more acrobatic end of the foiling world. It's not exactly like racing, but the equipment, the physical demands and the mental game of competing at the top of the sport will all be familiar to a sailing audience. And Nathan, who lives and trains in Tarifa at the southern tip of Spain where the Atlantic meets the Mediterranean, is a case study in what it takes to build a career on the water from scratch.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/GCu-8EOhWfjo0ILRoPT23C8rBx4V1JRyMPd_3spdVRs/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/05/nathan-berger2.jpg",
        alt: "Celtia Rebolledo Heil",
        caption: "Celtia Rebolledo Heil",
      },
      {
        type: "paragraph",
        text: "In Nathan's case, that career began almost by accident. His dad had taken up wingfoiling a few years earlier, and one afternoon he came in from the water exhausted, left his gear on the sand and walked away. His 12-year-old son was watching. \"I saw people winging around me and I thought, 'I'm going to try,'\" Nathan tells The Foil, \"I just took it and flew away. I learned that day on my own.\" Two hours of crashing later, he was foiling out and back. He couldn't gybe, couldn't really stop, so he kept going, clearly a natural. His dad watched from the shore, apparently speechless. They've been on the water together almost every day since.",
      },
      {
        type: "paragraph",
        text: 'What Tarifa offers, Nathan explains, is not just consistent wind but variety. Conditions there can mimic Brazil one week and northern France the next. "Some people can be insanely good in strong wind," he says, "but then if they get light conditions in a competition, they are blocked and they don\'t know what to do." That range of experience, he believes, gives him a meaningful edge, one that delivered his second Spanish championship title in nearby Chiclana just weeks ago.',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/vTXNkwIGK4HPjXFWqLOwuG2VBFNwJxrwmTglGRVr6to/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/05/nathan-berger1.png",
        alt: "Celtia Rebolledo Heil",
        caption: "Celtia Rebolledo Heil",
      },
      {
        type: "paragraph",
        text: "Away from the water he brings that same adaptability. When Leucate's wind went AWOL for the first half of the week, he grabbed a skateboard or an electric foil and got on with enjoying himself. While many athletes at the top levels have visualisation routines, pre-competition rituals, structured mental preparation, Nathan's approach is almost the opposite. \"What works best for me is not to think about it,\" he says. \"If I train my mental state too much I get more nervous. When I don't train too much, I'm chill. And when I'm chill, I'm more confident and I feel like I can do more.\"",
      },
      {
        type: "paragraph",
        text: 'Staying healthy, he\'ll tell you, is as much a competitive advantage as anything he does on the water. He goes to the gym, sleeps well, limits time on the water, all while balancing his school studies. "My mentality is just to not get injured," he says, "because that\'s what allows you to keep progressing. It\'s what makes you better than others."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/kSRNTLh1zEEacdNxWbLYM0mTG7p_i3xW4G9nk0i5p98/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/05/nathan-berger6-1.jpg",
        alt: "Celtia Rebolledo Heil",
        caption: "Celtia Rebolledo Heil",
      },
      {
        type: "paragraph",
        text: "Then there's the board. Nathan recently had his own pro model launched by KT Foiling – the same brand whose chief shaper, Keith Teboul, works with all-round watersports legend Kai Lenny. What's interesting is that the impetus didn't come from KT's design team. The company's background is in speed and wave performance, but Nathan had a completely different set of needs. \"As a freestyler, we don't care how fast the board goes in planing,\" he explains. \"I like when you do a trick and you don't get stuck in the water – you're wingfoiling as if you'd never done a jump. The [existing] boards weren't really meant for that, so I told them I was looking for something wider and shorter.\" None of KT's other athletes had ever come to them with a brief like it. A year of prototypes, testing and iteration later, and the finished board is now on the market with his name on it.",
      },
      {
        type: "paragraph",
        text: 'Nathan is candid about where the current ceiling is. To take the next step, he needs to unlock what he calls the "crazy factor" – more risk, more commitment in the air. But he won\'t be rushed into it. "If you go crazy and you do it well, it goes really well," he says. "But it can go really badly, too. So I\'m taking that step by step." Ask him what advice he\'d give to anyone who wants to follow in his path, and he has a considered answer: "Do it your way. Figure out how you do things, because everybody\'s different."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/dCdpzAGWY_iO2WVQGOy6Km8HnHh3ZLMCntasmJ5HBFs/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/05/nathan-berger3.jpg",
        alt: "Celtia Rebolledo Heil",
        caption: "Celtia Rebolledo Heil",
      },
      {
        type: "paragraph",
        text: 'After Leucate, Nathan is fourth in the overall standings after one event. He heads next to Tarifa – his home break – knowing the conditions better than almost anyone out there. "I\'m so stoked," he said after last week\'s final. "Beating all these guys I looked up to since I was starting – getting into that final – is insane with the level there is right now." He knows what he wants from the rest of the season. "That\'s my biggest goal of course," he says when asked about the number one spot. "I don\'t know if I will achieve it, but I will do everything to get there."',
      },
      {
        type: "paragraph",
        text: "At 17, Nathan is already playing a longer game than most, and from where we're sitting, it looks like he's just warming up. Watch this space.",
      },
      {
        type: "paragraph",
        text: "Photography © Celtia Rebolledo Heil @celtia__",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes/",
    },
  },
  "the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028": {
    slug: "the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028",
    kind: "interview",
    title: "The Olympian windsurfer with a golden future far beyond LA 2028",
    standfirst:
      "Having worn the yellow bib going into the winner-takes-all medal race final at Paris 2024, Grae Morris might be forgiven for harbouring a few regrets at missing out on Olympic gold.",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "7th February 2026 7:35am",
    heroImage: {
      src: "https://thefoil.com/media/b9ONUV8khTo013lRmWjZ2YqR0-jXn1wRSv_SAKJsNMA/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/02/grae-morris-2.jpeg",
      alt: "The Olympian windsurfer with a golden future far beyond LA 2028",
    },
    body: [
      {
        type: "paragraph",
        text: "But the young Australian windsurfer is not built that way. Aged only 20 when he took Olympic silver on the iQFOiL board at Paris 2024, Morris displays a maturity way beyond his years. A man mountain and a big character in every sense, he's sharp, quick-witted and funny. Morris appears to wear life very lightly, yet he rarely drinks alcohol and takes his professional career very seriously.",
      },
      {
        type: "paragraph",
        text: "While Morris is working hard towards Olympic gold at the Los Angeles 2028 Games, the Sydney sailor has been taking an unorthodox approach to his campaign since the end of the Paris cycle.",
      },
      {
        type: "paragraph",
        text: '"It\'s been a great time since Paris," Morris tells The Foil. "I mean, my life has definitely changed a lot. I\'ve been able to travel around, go to different schools across Australia. And I think the best part for me was just showing off an Olympic medal to a lot of aspiring athletes, inspiring kids.',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/7tsOuLAAy_FIXb-FzFbqiDo7NEC4QtKSKGixVyjFhtw/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/grae-morris-wins.jpg",
        alt: "Grae Morris wins",
      },
      {
        type: "heading",
        text: "All-round waterman",
      },
      {
        type: "paragraph",
        text: "\"I had an absolutely great time after the Games, and then I've also made myself a bit more flexible with how I want to approach my next campaign. So I've started doing a few different sports and trying new things. Last year I finished off my IQ racing and then decided to travel around and do a winging event and then a SUP downwind foiling event. It was an awesome experience, opened my eyes to some different racing, different learnings. And I get to bring it all forward into my next year of the campaign.\"",
      },
      {
        type: "paragraph",
        text: "Whereas most Olympic athletes stay in their lane and focus on getting as good as possible at their specialist interest, Morris is actively opting for a more diversified approach of cross-training and cross-learning. So why does he think this unorthodox approach is going to work for him?",
      },
      {
        type: "paragraph",
        text: "\"I'm not sure if it will necessarily work, but I'm very much taking advantage of the fact that I'm quite young. And while I'm young, I have a great body that can do a lot of different things. And I kind of just want to explore and make sure I don't leave anything behind.",
      },
      {
        type: "heading",
        text: "Fear of failure… but doing it anyway",
      },
      {
        type: "paragraph",
        text: "\"Being able to have the flexibility to travel around and do these different sports is... sure, it's scary. I might end up in a different area of the fleet than what I'm used to or where I want to be. But it's also things I can learn and take back into my Olympic campaign, which is overall the most important; winning a gold medal is still the main goal. And so yeah, I think you gotta go through some downs to appreciate the highs.",
      },
      {
        type: "paragraph",
        text: "\"And it's the same in sailing. I've got to explore different crafts, explore different results to appreciate the high results and how to learn how to stay with the high results in every craft by just trying it all, and not leaving anything on the table.\"",
      },
      {
        type: "paragraph",
        text: "Morris embraces the pressure of performing in the iQFOiL, and rather than rising above the fray and solidifying his position at the top of the pecking order, seems to enjoy putting himself in jeopardy. One way of doing that is hurling himself into new challenges, such as taking part in his first wingfoil racing event last October when Morris competed in the Formula Wing World Championships in Sardinia.",
      },
      {
        type: "paragraph",
        text: "\"It's nice that the iQFOiL is so tough and that we've got such a great fleet that you're never guaranteed a good result,\" he says. \"No matter how confident or how good you actually are, it's never actually guaranteed. I work very, very hard to maintain a top 10 or a top 20 result in any event that I do on the IQ.",
      },
      {
        type: "heading",
        text: "Putting himself on the back foot",
      },
      {
        type: "paragraph",
        text: "\"Being able to go to a winging event where I don't have expectations of a top 20, I don't have expectations of winning, it's just a bit more freeing and I can explore a different kind of mental state and how I approach it mentally.\"",
      },
      {
        type: "paragraph",
        text: 'Morris wanted to see how he would cope in the middle to back of the fleet. "I went into the Wing Worlds with no expectations of myself. I knew I had the racing and the tactical skills but board handling and [lack of] speed were potentially my downfall. So how I was gonna turn tactics and turn a tactical race into giving me a result rather than trying to compete against the other guys on speed, which was just gonna be impossible. I just had to use what I knew I was good at to help me get a good result and then over time I got a little faster, a little more board handling and that opened up my boundaries.',
      },
      {
        type: "paragraph",
        text: '"Those [improvements] helped me have a little bit more fun on the race course. So yeah, just constant learning really." For all of his low expectations at the Formula Wing Worlds, Morris ended up sixth overall, beating many full-time professionals at their own game.',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/DkGDRYDL2l3gN9lgGmQfOF-quvlQwnhP9qZHOdT30ac/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/grae-morris.png",
        alt: "The Foil",
        caption: "The Foil",
      },
      {
        type: "heading",
        text: "Aiming for SailGP, but not yet",
      },
      {
        type: "paragraph",
        text: "The Foil caught up with Morris during the SailGP Grand Prix in Perth. Having just completed a block of training with his Perth-based coach Arthur Brett, Morris was given access-all-areas as a guest of the Bonds Flying Roos team. His association with the Aussie SailGP team actually goes deeper still.",
      },
      {
        type: "paragraph",
        text: "\"Tom Slingsby is a member of my sailing club, Woollahra, in Sydney. I remember as a kid going down to sail on my Bic Techno [youth windsurfing board] and he would be there fiddling with his Moth. I've been around him for a long time, just got to watch him for the past 10 years or so and learn from him.",
      },
      {
        type: "paragraph",
        text: '"At SailGP I was fortunate enough to just come [to the team base] and hang out and learn a little bit more. Mainly it\'s just an opportunity for me to learn as much as possible from not only Tom, but Tash [Bryant, the strategist] and everybody in the crew and all the coaches and just kind of see what I can put towards my campaign and see what I can learn to help myself out."',
      },
      {
        type: "heading",
        text: "Head first into the pressure cooker",
      },
      {
        type: "paragraph",
        text: "While Morris sees his eventual future in SailGP, being just 22 years old there's no immediate rush to bust his way into the scene. He loves the high-stakes atmosphere of the league, and wants to experience it for himself once he's got his Olympic career done and dusted. He's targeting LA2028 and then a home Games at Brisbane 2032.",
      },
      {
        type: "paragraph",
        text: 'Although a lot of sailors from a more conventional racing background struggle to get their heads around the sudden-death environment of competing in SailGP, for Morris it\'s a continuation of what he already knows. "My whole life, all the racing I ever did was short, sharp, high-pressure - and every race matters," he says.',
      },
      {
        type: "paragraph",
        text: "\"I actually find that SailGP racing is quite relatable to what I've known. I've never done the hour-long slow hit-outs where you do two races a day. I'm always doing six, sometimes seven races a day, super-short, sharp, and everything really matters. And so when I watch this racing, I actually can quite familiarise myself with everything going on.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/ExGpdDwYeHh7_I9ao3x1UfnJrLplLpHkKrmD99vRByM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/grae-morris-2.jpeg",
        alt: "Grae Morris 2",
      },
      {
        type: "heading",
        text: "High stakes",
      },
      {
        type: "paragraph",
        text: "\"All I know how to do is get good at this format. It's high pressure, high stakes. No matter how good you were throughout the week, it's all about this end format. And that's honestly all I know and all I know how to make work. I've just learned to kind of be accustomed to it, to desensitise it and to make sure I'm the best I can be at executing the format.\"",
      },
      {
        type: "paragraph",
        text: 'Where a lot of iQFOiL sailors - particularly those who competed in the previous, more conservative Olympic windsurfing formats - reluctantly and grudgingly accept the brutal medal finals as a necessary evil of modern competition, Morris embraces the jeopardy. "I think these SailGP athletes are super lucky because they get to perform the format about once a month, maybe sometimes more.',
      },
      {
        type: "paragraph",
        text: "\"They're under the kind of pressure that I'm hunting. They're under it a lot more than I am. I only get the opportunity to go through this maybe four times a year. For the SailGP athletes to go through it once a month, it's awesome. I just want to keep my head inside it and try to learn and experience that pressure more and more, so I can desensitise the pressure for when that time really comes, whether it's in the Worlds or in the next Olympics.\"",
      },
      {
        type: "paragraph",
        text: "It's an interesting philosophy. Most athletes spend their careers trying to avoid pressure. Morris is actively seeking it out, trying to make himself comfortable with discomfort. Whether it works or not, we'll find out in Los Angeles. And perhaps for a long time after that.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028/",
    },
  },
  "andy-rice-rates-the-fleet-after-canada-sailgp": {
    slug: "andy-rice-rates-the-fleet-after-canada-sailgp",
    kind: "news",
    title: "Andy Rice rates the fleet after Canada SailGP",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "25th June 2026 5:32pm",
    heroImage: {
      src: "https://thefoil.com/media/EG0w0w5wHoBs8thBCM0yBrG4ARt9G7WeDVtpvDj8SvY/resize:fill-down:1500:500/gravity:fp:0.5127659574:0.5173727167/quality:60/dpr:1/2026/06/sv3-3959-samo-vidic-for-sailgp.jpg",
      alt: "Andy Rice rates the fleet after Canada SailGP",
    },
    body: [
      {
        type: "heading",
        text: "1. Spain",
      },
      {
        type: "paragraph",
        text: "Finished: 1st",
      },
      {
        type: "paragraph",
        text: "It might have been a very different position in the rankings for Spain if Diego Botín had failed to thread the needle. Los Gallos' move at the start of Race 3 in Group A was the 'move of the season'. With six events still to go, it's hard to imagine a bolder manoeuvre than when Botín went for a gap that no one else saw: to leeward of Australia and just ahead of France also accelerating towards the line. Even Botín admitted to me afterwards that he closed his eyes and hoped for the best. That launch into hyperspace off the line propelled Los Gallos into an early lead which they never relinquished. It was just what they needed to do if they were to stand a chance of breaking out of the 'Group of Death' and into the four-boat final. Another perfectly-judged start put the Spaniards marginally ahead at Mark One and Botín kept Sweden at bay to claim their first event win of 2026. They move into second overall, on equal points with Britain who drop to third in the season rankings. After all the bad luck that has come their way, Los Gallos are the deserving winners from Halifax.",
      },
      {
        type: "paragraph",
        text: "Verdict: The victory Spain has deserved all season",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/M3Z-3utI8SCDLsXx0ANfolIy36ZFiouomvIlVKQwznk/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jl109215.jpg",
        alt: "Jason Ludlow / SailGP",
        caption: "Jason Ludlow / SailGP",
      },
      {
        type: "heading",
        text: "2. Switzerland",
      },
      {
        type: "paragraph",
        text: "Finished: 3rd",
      },
      {
        type: "paragraph",
        text: "Cruise ships are famous, notorious even, for departing on time. Get back too late from your boozy lunch in the port or your duty-free shopping, and the boat has left without you. Since picking up title sponsorship from Explora Journeys, the rebranded blue boat has been flying along quite nicely. Sebastien Schneiter was leaving passengers behind on the start line in Halifax. It began on Friday with some excellently executed launches out of the line in practice racing. Would it carry through to the proper racing on the weekend? Yes it did, combined with some really solid manoeuvres in the difficult, marginal foiling conditions of Saturday. The Swiss were looking set to settle for fourth in the four-boat final, but overhauled Australia before the finish to grab their first podium of the season and $140,000 of prize money.",
      },
      {
        type: "paragraph",
        text: "Verdict: Schneiter has found a winning formula at the start and he won't tell us what it is",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/UnIBRZH_FUOpwLjEow4dWI2VrjtNao8rdZpamGmQTak/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/sv3-7170-samo-vidic-for-sailgp.jpg",
        alt: "Samo Vidic / SailGP",
        caption: "Samo Vidic / SailGP",
      },
      {
        type: "heading",
        text: "3. Sweden",
      },
      {
        type: "paragraph",
        text: "Finished: 2nd",
      },
      {
        type: "paragraph",
        text: "The best Swedish performance of the season so far and, after third place in Rio, only Nathan Outteridge's second time on the podium in 2026. Not that Artemis SailGP were making any bold claims for themselves at the start of the year, but pundits were expecting Sweden to become instant challengers for the top spots. It hasn't worked out that way. Maybe a year and a half of cruising around the world with his young family - ever since co-helming Emirates Team New Zealand to America's Cup victory in October 2024 - does take a while before even someone of Outteridge's calibre rediscovers championship-winning form. This time - unlike Rio - no complaints about sailing with the 27.5m rig in out-of-range conditions for the biggest wing. Just crack on with the job and do their best. Maybe dominating the weaker Group A flatters to deceive, but decisive manoeuvres like that 'JK' tack immediately after rounding the leeward mark along with a really solid performance in the final all add up to a very good outing for Sweden.",
      },
      {
        type: "paragraph",
        text: "Verdict: Carry on like this and Sweden can still contend for the grand final in November",
      },
      {
        type: "heading",
        text: "4. New Zealand",
      },
      {
        type: "paragraph",
        text: "Finished: 5th",
      },
      {
        type: "paragraph",
        text: "The Black Foils are back, and looking almost as strong as ever. A new boat and a new grinder with Stewart Dodson coming in for Louis Sinclair who's still recovering from his injuries in that boat-breaking crash from Auckland in February. The Group A battle with Spain for the last spot in the final was one of the greatest bits of SailGP racing of recent times, with that three-way photo-finish between New Zealand, Spain and Denmark the icing on the cake. Who said Pete Burling can't match race? Between Pistol Pete and his team on the Black Foils, this was precision control and coolness under pressure. OK, it didn't quite yield the required result but the Kiwi performance shows they have come back in right where they left off.",
      },
      {
        type: "paragraph",
        text: "Verdict: Black Foils are almost back to their best",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/F2vFXj452IhNDTSO0twWXa6Dlg3kf1XuhV7_bLB3m3w/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/415800-jonathan-nackstrand-for-sailgp.jpg",
        alt: "Jonathan Nackstrand / SailGP",
        caption: "Jonathan Nackstrand / SailGP",
      },
      {
        type: "heading",
        text: "5. Australia",
      },
      {
        type: "paragraph",
        text: "Finished: 4th",
      },
      {
        type: "paragraph",
        text: "Were Australia just lucky or good to take two race wins from the flukiest of fluky Saturdays in Halifax? If it had been any other team we would have said, 'yeah, just lucky...' But how can you when it is the Bonds Flying Roos, again. After three straight victories, Tom Slingsby looked set to make it a perfect sweep of the Americas. Their performances in the 'Group of Death' were exemplary, almost impeccable. Their start in the final was good, but not quite good enough against the faster trigger pulls of Spain and Sweden. A lap later on the turn downwind, Slingsby saw better breeze on the Halifax stadium side of the course but decided to chance his arm on something different down the Dartmouth side. Almost as soon as the two leaders gybed away you could sense Slingsby regretting a decision that was based more on hope than reason. Not only did Australia lose touch with the race for victory but it allowed Switzerland to close the gap and ultimately steal third place from Slingsby. As he said afterwards to missing out on that $140,000 prize money: \"Ouch!\"",
      },
      {
        type: "paragraph",
        text: "Verdict: One small mistake cost them a lot, but the Roos are still the benchmark",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/QJmtzEMeP6M9MEBvLGAzJQroNkHlL46iLQ3Lb9tnpeo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jl106596-jason-ludlow-for-sailgp.jpg",
        alt: "Jason Ludlow / SailGP",
        caption: "Jason Ludlow / SailGP",
      },
      {
        type: "heading",
        text: "6. USA",
      },
      {
        type: "paragraph",
        text: "Finished: 6th",
      },
      {
        type: "paragraph",
        text: "The USA fell victim to the vagaries of Saturday's less-than-satisfactory racing. Taylor Canfield and the team were leading the race ahead of Britain when they drifted into a hole, falling back to fifth at the finish. A last place in the next drifter made qualifying look unlikely indeed, although Canfield and Co. pulled out all the stops on Sunday, foiling to second place in the first race and winning the last race. Like I wrote after New York, not a great performance but nothing to worry about yet. Even with the 'two-at-the-back-at-all-times' rule which was brought in after the New York crash, the Americans appear to have reconfigured their crew set-up to cope with the changes. Lying fourth in the season standings, USA continue to impress.",
      },
      {
        type: "paragraph",
        text: "Verdict: The second wobble of the season, but still nothing to worry about yet",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/2egZmokdIb8pleVFh5Rtes0c6LvjnI20A3pCSQjbru8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/rp3-7516-ricardo-pinto.jpg",
        alt: "Ricardo Pinto / SailGP",
        caption: "Ricardo Pinto / SailGP",
      },
      {
        type: "heading",
        text: "7. Canada",
      },
      {
        type: "paragraph",
        text: "Finished: 8th",
      },
      {
        type: "paragraph",
        text: "The NorthStar gang pulled a wheelie across the finish line of their final fleet race and the crowd went wild. Even if the overall performance was disappointing, the denizens of Halifax were the biggest fans of their team and SailGP generally. Imagine what it would be like if Giles Scott and the team actually win on home waters! As for the racing itself, Saturday was not great, although the 'Group of Death' was always going to be more difficult than Group B. However on Sunday in proper foiling conditions the Canucks cruised two second places, making them top performers alongside Australia with a first and a third.",
      },
      {
        type: "paragraph",
        text: "Verdict: The result doesn't show it, but Canada are gradually returning to better form",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/o-6fjtxVnpoMDtdm0_m8lGRKQbNowtdKotd2XS5IzBo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/185794-samo-vidic-for-sailgp.jpg",
        alt: "Samo Vidic / SailGP",
        caption: "Samo Vidic / SailGP",
      },
      {
        type: "heading",
        text: "9. France",
      },
      {
        type: "paragraph",
        text: "Finished: 10th",
      },
      {
        type: "paragraph",
        text: "France somewhat disappeared in the 'Group of Death'. There were no great moments of flair as we have come to expect from Quentin Delapierre, although this has been a very disruptive season for DS Automobiles FRA. Manon Audinet was back on strategy for the first time since her injury from the Auckland crash, and this was Moth World Champion Enzo Balanger's second outing as wing trimmer. So there are mitigating circumstances for France's middle-of-the-road performance. However, Delapierre needs to turn the tide if France are to renew their ambitions for making it to the grand final in Abu Dhabi.",
      },
      {
        type: "paragraph",
        text: "Verdict: Sub-par performance despite the disruptions to France's season",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/R6MldlH9XyzUriNs0ajHSz06mSGBpDtuJuqTCvFcCVw/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/rp2-7769-1-ricardo-pinto.jpg",
        alt: "Ricardo Pinto / SailGP",
        caption: "Ricardo Pinto / SailGP",
      },
      {
        type: "heading",
        text: "10. Great Britain",
      },
      {
        type: "paragraph",
        text: "Finished: 11th",
      },
      {
        type: "paragraph",
        text: "Emirates GBR should have emerged from Saturday in good shape. A second place in their second Group B race behind Artemis was a good way to end the session, but Dylan Fletcher had been unfortunate to slide down a snake in the earlier heat while vying for the lead with USA. Falling into the aforementioned wind hole that also swallowed up Canfield's crew, the British were dumped into last place, much less than they deserved. A good performance on Sunday was well within their grasp until a big rudder wobble and subsequent high-speed crash which led to breaking the wingsail. So Emirates GBR never got to show what they could do in the foiling conditions and an opportunity missed.",
      },
      {
        type: "paragraph",
        text: "Verdict: The British have lost their early-season momentum, but Portsmouth gives them all the motivation they need to get back on track",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/wClCAltPSbrQzTX9I5JpbO1cJoLVjrrQMcEtFWY8k00/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jl206017-jason-ludlow.jpg",
        alt: "Jason Ludlow / SailGP",
        caption: "Jason Ludlow / SailGP",
      },
      {
        type: "heading",
        text: "11. Italy",
      },
      {
        type: "paragraph",
        text: "Finished: 9th",
      },
      {
        type: "paragraph",
        text: "A third place in the final fleet race was the high point of a ho-hum showing by Red Bull Italy. Racing in the easier group, the only team that Phil Robertson and Co. managed to beat was Emirates GBR who exited the competition after blowing up their wing before Sunday's racing got underway.",
      },
      {
        type: "paragraph",
        text: "Verdict: As per New York, yet to meet the expectations of team boss Jimmy Spithill",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/PQB5rlfqzja5D7YNX5_Luo2loc3g0cHT1rppLmKLQ5o/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/sv3-1748-samo-vidic-for-sailgp.jpg",
        alt: "Samo Vidic / SailGP",
        caption: "Samo Vidic / SailGP",
      },
      {
        type: "heading",
        text: "12. Brazil",
      },
      {
        type: "paragraph",
        text: "Finished: 13th",
      },
      {
        type: "paragraph",
        text: "Last time my verdict was 'Big rethink required'. Brazil duly did the unthinkable and did a switcharound of the back two, moving Martine Grael into strategy and Paul Goodison on to the wheel. The Brazilians seemed to be more organised in the pre-start, sailing to some better Mark One positions than usual. But then whacking the leeward mark after a tight rounding on Sunday put Brazil out of action. Overall the team were probably right to do the switcharound to allow Grael to get a wider perspective on the racing. Longer term we're likely to see Brazil's golden girl return to the helm.",
      },
      {
        type: "paragraph",
        text: "Verdict: An experiment worth trying",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/TFB16qXhOXSSAsI0YCiecaW-qSxJDL17_Xjx1n8V38M/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/rp2-6742-ricardo-pinto-for-sailgp.jpg",
        alt: "Ricardo Pinto / SailGP",
        caption: "Ricardo Pinto / SailGP",
      },
      {
        type: "heading",
        text: "13. Denmark",
      },
      {
        type: "paragraph",
        text: "Finished: 12th",
      },
      {
        type: "paragraph",
        text: "Since being bought by American Magic, little of that magic has been on display on the water for Rockwool Racing. Nicolai Sehested never tries to sugar-coat things; he's as frustrated as anybody with the team's underperformance. He makes no bones about his dislike for split fleet formats either, although he's probably going to have to suck it up because Halifax points to the more likely future of SailGP competition. Denmark is often seen ploughing its own lonely furrow on the race course, which is not always a bad thing. Sometimes it can free you up to make your own choices and have the space to make the boat sing. But there are times when the Danish need to mix it up more, just as they did when they became the deciding factor in that match race between Spain and New Zealand.",
      },
      {
        type: "paragraph",
        text: "Verdict: Not that far off the pace, but the Danes need to find some Viking spirit",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/andy-rice-rates-the-fleet-after-canada-sailgp/",
    },
  },
  "freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything": {
    slug: "freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything",
    kind: "news",
    title: "Freddie Carr: Cowes Week turns 200 - why Britain's greatest regatta still means everything",
    author: "Freddie Carr, Senior Contributor",
    publishedAt: "28th July 2026 3:59pm",
    heroImage: {
      src: "https://thefoil.com/media/06WQCm_NgY6vhkG_Bhg5IKKbGvKrmNQHmRBoLe7fnCA/resize:fill-down:1500:500/gravity:fp:0.3212765957:0.4967784486/quality:60/dpr:1/2026/07/cowes-week-2018.jpg",
      alt: "Cowes Week turns 200",
    },
    body: [
      {
        type: "paragraph",
        text: "Cowes Week is Britain's regatta.",
      },
      {
        type: "paragraph",
        text: "If you're a British yacht sailor, it's the event you have to do at least once. It's our equivalent of Wimbledon or the Grand National. There are bigger regattas and there are faster boats, but none carry the same history, prestige or uniquely British atmosphere as Cowes Week.",
      },
      {
        type: "paragraph",
        text: "This year feels even more special. Racing has taken place off Cowes for 200 years, making it one of the oldest and most enduring sporting events anywhere in the world.",
      },
      {
        type: "paragraph",
        text: "It's also hard to believe that it's been 30 years since I first tried to compete at Cowes Week.",
      },
      {
        type: "paragraph",
        text: 'I was a 14-year-old Laser sailor desperate to get my first taste of yacht racing. My dad\'s advice was simple: "Go over to Cowes, walk the docks and ask people if they need crew. Someone will give you a ride."',
      },
      {
        type: "paragraph",
        text: "So that's exactly what I did.",
      },
      {
        type: "paragraph",
        text: "Armed with plenty of enthusiasm but very little experience, I spent the week wandering the pontoons asking anyone who would listen if they needed another pair of hands.",
      },
      {
        type: "paragraph",
        text: "I didn't get a single ride.",
      },
      {
        type: "paragraph",
        text: "By the middle of the week I'd accepted defeat and ended up selling ice creams from a local shop just to earn a bit of pocket money instead.",
      },
      {
        type: "paragraph",
        text: "Looking back, it wasn't the Cowes Week I'd imagined.",
      },
      {
        type: "paragraph",
        text: "But it left an enormous impression on me.",
      },
      {
        type: "paragraph",
        text: "Everywhere I looked there were incredible yachts, world-class sailors and larger-than-life characters. The town buzzed from first light until long after the racing had finished. It felt less like a regatta and more like a festival of sailing. To a 14-year-old kid, the crews walking the streets might as well have been rock stars.",
      },
      {
        type: "paragraph",
        text: "I remember standing on the dock looking at these amazing boats thinking, one day I want to sail on those boats. I want to be one of those guys.",
      },
      {
        type: "paragraph",
        text: "Thirty years later, that feeling hasn't changed. Cowes Week remains unlike any other regatta on the calendar. It is where history meets the present, where Olympic medallists, America's Cup sailors, weekend racers and first-time crews all share the same stretch of water. That is what makes this 200th edition so significant.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/q7WTloU8fi18yp-cov5qiEU9irc8jKOcokOOt6xwPt0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes10.png",
        alt: "Cowes Week 2025",
        caption: "Cowes Week 2025",
      },
      {
        type: "heading",
        text: "More than just another regatta",
      },
      {
        type: "paragraph",
        text: "Cowes Week has always been difficult to define because it is so much more than a race meeting.",
      },
      {
        type: "paragraph",
        text: "On any given day there are up to 40 races taking place simultaneously across the Solent, with fleets ranging from classic wooden keelboats that have been racing for generations to the latest high-performance handicap yachts. Around 750 boats and thousands of sailors descend on the Isle of Wight, making it one of the largest sailing regattas anywhere in the world.",
      },
      {
        type: "paragraph",
        text: "It is one of the few events where a professional America's Cup sailor can be lining up alongside someone competing in their very first regatta. That mix is what has always made Cowes Week special.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/GokpMC9sOXrADyl-egjwMMO8uyuCRwb245oFtJd6mjM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes3.png",
        alt: "Cowes Week 2025",
        caption: "Cowes Week 2025",
      },
      {
        type: "heading",
        text: "A week that belongs to every sailor",
      },
      {
        type: "paragraph",
        text: "Unlike many elite sailing events, Cowes Week remains remarkably accessible.",
      },
      {
        type: "paragraph",
        text: "Whether you race a J/70, a Dragon, an XOD, an IRC grand prix yacht or a family cruiser, there is likely to be a start line waiting for you. Every fleet has its own story, its own rivalries and its own heroes.",
      },
      {
        type: "paragraph",
        text: "For many owners and crews this is the biggest week of their season. For others it is simply an excuse to spend seven days racing hard before enjoying the unique atmosphere ashore.",
      },
      {
        type: "paragraph",
        text: "Few sporting events blend competition and social life as naturally as Cowes Week.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/7YOWvCsxKrCfMXunoWxeiDJQarznUjI86p5j0Nenkco/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes-martyn-wright-2.jpg",
        alt: "Cowes Week racing",
        caption: "Martyn Wright",
      },
      {
        type: "heading",
        text: "The Solent never gives anything away",
      },
      {
        type: "paragraph",
        text: "The racing itself remains some of the most tactically demanding anywhere.",
      },
      {
        type: "paragraph",
        text: "Tide dominates almost every decision. Wind bends around the Isle of Wight, funnels through the western Solent and changes character completely depending on where you are on the racecourse.",
      },
      {
        type: "paragraph",
        text: "Local knowledge still counts for plenty, but it rarely guarantees success.",
      },
      {
        type: "paragraph",
        text: "Every race becomes a constant balancing act between current, geography, pressure and fleet positioning. Win the shifts but lose the tide and you'll go backwards. Nail the current but miss a pressure line and the result is exactly the same.",
      },
      {
        type: "paragraph",
        text: "It's one of the reasons so many of the world's best sailors keep returning.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/ilF7jeXJ83A9awKHdWZYsqn7VqGV_t7VrBA6E-hV4QA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes11.png",
        alt: "Cowes Week 2025",
        caption: "Cowes Week 2025",
      },
      {
        type: "heading",
        text: "Celebrating 200 years ashore",
      },
      {
        type: "paragraph",
        text: "The bicentenary isn't just being celebrated on the water. Throughout the week, Cowes will host its biggest shoreside programme in years, turning the town into a festival befitting one of British sport's oldest events.",
      },
      {
        type: "paragraph",
        text: "The return of the iconic Friday night fireworks - absent since 2019 - will provide a spectacular finale to the regatta, lighting up the Solent in celebration of 200 years of racing. Live music, entertainment, exhibitions and family attractions will run throughout the week, while Northwood House, Cowes Yacht Haven and venues across the town will host a packed programme of social events.",
      },
      {
        type: "paragraph",
        text: "The organisers are also embracing the history of the regatta with special bicentenary exhibitions and displays celebrating the evolution of Cowes Week from a two-race regatta in 1826 into one of the world's largest and longest-running sailing events. Visitors will have the opportunity to explore two centuries of yachting heritage while enjoying a modern regatta that continues to attract sailors from every corner of the sport.",
      },
      {
        type: "paragraph",
        text: "For many competitors, the racing will always come first. But this year there is a sense that everyone taking part - whether afloat or ashore - is becoming part of sailing history.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/CryPllFSaK4Fi3584LMtmupQqGczZ9rgO6FqNXCXolo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes-week-fireworks.jpg",
        alt: "Cowes Week fireworks",
        caption: "Cowes Week",
      },
      {
        type: "heading",
        text: "Why it still matters",
      },
      {
        type: "paragraph",
        text: "Sailing has changed beyond recognition over the last 200 years.",
      },
      {
        type: "paragraph",
        text: "Foiling boats now fly above the water. SailGP races at motorway speeds. The America's Cup has become unrecognisable from its origins.",
      },
      {
        type: "paragraph",
        text: "Yet Cowes Week continues to thrive because it has never forgotten what makes sailing enjoyable.",
      },
      {
        type: "paragraph",
        text: "It remains a celebration of every level of the sport. Professionals still want to win it. Club sailors still dream of competing in it. Families continue returning generation after generation.",
      },
      {
        type: "paragraph",
        text: "Few regattas anywhere in the world can claim to have survived for two centuries while remaining relevant to both elite sailors and weekend racers alike.",
      },
      {
        type: "paragraph",
        text: "Cowes Week can.",
      },
      {
        type: "paragraph",
        text: "As the fleet heads out onto the Solent once again this August, Britain's most famous sailing event won't simply be celebrating its past. It will be reminding the sailing world why it still has such an important place in its future.",
      },
      {
        type: "paragraph",
        text: "Two hundred years after the first yachts crossed the start line off Cowes, the challenge remains exactly the same: master the tides, read the breeze, beat your rivals and, if you're lucky enough, become part of one of sailing's greatest traditions.",
      },
      {
        type: "paragraph",
        text: "As I get older, I want to race professionally at the highest level I can for as long as possible. Sailing is in my blood and racing is simply what I do. But there is no escaping the fact that Father Time catches us all. I'll slow down, the boats I race will inevitably get a little slower, and my career will evolve.",
      },
      {
        type: "paragraph",
        text: "One thing, however, will never change.",
      },
      {
        type: "paragraph",
        text: "I hope I'm still racing Cowes Week in my eighties, maybe even my nineties. Long after the America's Cups, the TP52s and all the professional campaigns have passed, this is the regatta I'll keep coming back to.",
      },
      {
        type: "paragraph",
        text: "Because, as a British yacht sailor, Cowes Week is more than just another event on the calendar.",
      },
      {
        type: "paragraph",
        text: "It's a rite of passage.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/DYig0809HlnHkocLYX1r-QPuKLMXjGR2DG-2b8e5xpA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes5.png",
        alt: "Cowes Week 2025",
        caption: "Cowes Week 2025",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything/",
    },
  },
  "full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback": {
    slug: "full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback",
    kind: "news",
    title: "'Full steam ahead and scrambling to keep our heads above water': Grant Simmer on Australia's Cup comeback",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "28th June 2026 8:50am",
    heroImage: {
      src: "https://thefoil.com/media/z-_qGL_VZ2sNwkRNrpGTzTelipenn3i5yoE5mQgniUc/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/grant-auacannouncement-imageteamauac.jpg",
      alt: "'Full steam ahead and scrambling to keep our heads above water': Grant Simmer on Australia's Cup comeback",
    },
    body: [
      {
        type: "paragraph",
        text: "Few people are more bound up in Australia's America's Cup story than Grant Simmer. He was the young navigator aboard Australia II in 1983 – the boat with the wing keel that ended the New York Yacht Club's stranglehold and lodged itself permanently in the national memory. Skipper John Bertrand and backer Alan Bond pushed for him despite his inexperience, and he's been at it ever since: by his own count, thirteen campaigns, a number he reckons might be a record.",
      },
      {
        type: "paragraph",
        text: "So you'd assume Australia's first challenge since 2000, with Simmer in place as CEO, was the product of years of quiet plotting. Not quite.",
      },
      {
        type: "paragraph",
        text: '"I didn\'t really dream about it, it just happened and happened pretty quickly," Simmer tells The Foil. "Actually, Glenny asked me would I like to get involved, and obviously I knew all the players, so it was a pretty simple answer. Yes."',
      },
      {
        type: "paragraph",
        text: 'Glenny is Glenn Ashby, the three-time Cup winner and Emirates Team New Zealand mainstay now signed on as Team Australia\'s head of performance and design – and the link man who made a short-notice challenge possible. Simmer plays it down with a grin. "We don\'t want to make too much of a fuss about that!" he says. "But he was important. He is important. He remains very important." Jokes aside, he adds, Ashby is "very, very much" one of the people who got this thing off the ground.',
      },
      {
        type: "heading",
        text: "Bringing the green and gold home",
      },
      {
        type: "paragraph",
        text: "For Simmer, the pull of this one is obvious. He's a four-time Cup winner, and three of those came in other people's colours: managing director and design coordinator for the Swiss-flagged Alinghi when they took the Cup in 2003, returning for their 2007 defence, then general manager at Oracle Team USA for the 2013 win. This time the challenge is lodged through the Royal Prince Edward Yacht Club, backed by the Winning family.",
      },
      {
        type: "paragraph",
        text: "\"As a country, we're really good at sailing, and we have people spread through all these America's Cup teams that are Australian sailors steering the Kiwi boat, steering the Italian boat, steering the American boat. Now we've got an opportunity, really thanks to the Winning family, to pull all these people back and put them all on a boat.\"",
      },
      {
        type: "paragraph",
        text: "That scattering of Australian talent across rival camps has been the story of Australian sailing for two decades. Getting the band back together, towards the end of his own career, clearly means a lot. \"It's about time!\" as he put it at the team's launch in May.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/XFXzX4ZppOCVz-dticQCCn_GQK9uVuMx3mJK5BXV2eE/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/image-3-C-team-australia-artist-impression.jpg",
        alt: "Team Australia Artist Impression",
        caption: "Team Australia Artist Impression",
      },
      {
        type: "heading",
        text: "Late, lean and leaning on the Kiwis",
      },
      {
        type: "paragraph",
        text: "There's no getting around the timeline: Australia are late. The Louis Vuitton Cup starts on 21 May 2027 in Naples, and they won't have a boat in the water until around the beginning of March. With the Kiwis and Italians having already rolled out their AC75s, it's clear the Aussies have a big task ahead of them. Will they even use their full allocation of sailing days? \"Probably not.\"",
      },
      {
        type: "paragraph",
        text: 'It leaves no doubt about the team\'s biggest constraint. "Time," he says. "We\'ve got a reasonable budget, but time normally gets you in the Cup anyway." He refuses to see the short runway as a handicap, however.',
      },
      {
        type: "paragraph",
        text: "\"The nice thing about starting late and being short on time is we can discard any science project, anything that doesn't look like it's going to deliver performance. We're really quite focused on just doing the important things right, efficiently, and that's a nice tight program, so I like that aspect of it.\"",
      },
      {
        type: "paragraph",
        text: 'That ruthlessness rules out any temptation to swing for the fences. "In the Cup world you always need to be innovative, but are we going to try and hit it out of the park by doing something radical? No, definitely not," he says. "We\'re going to try and win a lot of races, and we\'re going to do that by having a fast boat, a good crew and reliability."',
      },
      {
        type: "paragraph",
        text: "The fast boat comes courtesy of the Kiwis. The deal Ashby brokered with Emirates Team New Zealand hands Australia design resources and the Kiwi boat from the 2021 Cup – a second-iteration hull to be fitted with a new rig, new sails and new foils – which raises the small matter of the constructed-in-country rule, since the Cup doesn't typically allow you to turn up in someone else's boat. But as the Hall of Famer points out, in Bermuda, plenty of boats were built in New Zealand with the teams only obliged to build the bows themselves. \"So we're building a bow at the moment for our boat,\" he says. \"That's a criterion under the protocol.\" Box ticked.",
      },
      {
        type: "heading",
        text: "What still wins the Cup",
      },
      {
        type: "paragraph",
        text: 'Pressed for his favourite campaign, unsurprisingly he goes straight back to the beginning. Australia II, he says, "because it changed the direction of the Cup." That it did. Breaking the New York Yacht Club\'s 132-year grip – the longest winning streak in the history of sport – tipped Australia into national delirium, the moment Prime Minister Bob Hawke told the country that any boss who sacked a worker for not turning up that day was a bum. It remains one of the great days in Australian sport. Simmer was in the thick of it, part of a tight little group of thirty-odd who nearly threw it away at 3–1 down before hauling it back. Thirteen campaigns in, he\'s anything but misty-eyed about it: "It\'s a ridiculous record," he says, "because it goes on for so long."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/JG1d5rCB6mKVIenQWG7Uj--_I_xRo9388E6bEXc9mCE/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/image-1-C-gilles-martin-raget.jpg",
        alt: "Gilles Martin-Raget",
        caption: "Gilles Martin-Raget",
      },
      {
        type: "paragraph",
        text: "Ask Simmer what actually decides the America's Cup, though, and the answer is much the one he'd have given forty years ago, even as the boats have gone from heavy-displacement 12 Metre monohulls to AC75s capable of more than 55 knots.",
      },
      {
        type: "paragraph",
        text: "\"The thing that I've always loved about the Cup is that it's a contest that has sport and technology. You've got to put your resources in the right spot to have a fast boat. You've got to get the technology right, and then the sailors have got to deliver on the day. That's the bit that hasn't changed. It was the same in 1983, and it'll be the same in 2027.\"",
      },
      {
        type: "paragraph",
        text: 'With the AC75 now into its third generation and the class maturing, Simmer believes the boats are converging and the margins are shifting back to the crews. The sailing team is led by Tom Slingsby, who Simmer rates without hesitation as "at the top of his game." He calls the wider squad "fantastic," though for now Tash Bryant is the only other name confirmed. The 25-year-old has been Slingsby\'s strategist in SailGP since season 3, so the pair already know each other\'s instincts inside out.',
      },
      {
        type: "paragraph",
        text: "As for Ashby, whose work spans other high-tech projects such as Ferrari's Hypersail, the design brief comes first. But Simmer isn't ruling out a run on the water: \"I think we'll have a spare wetsuit for him now and then he'll go for a yacht. He's the head of our technology and design, and hopefully, he'll be focused on that. But for sure he'll spend some time sailing.\"",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/kOH5lzCrMEWKahRO-gE3zu73wV7EheGOtNk0dYbo-74/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/team2-auacannouncement-imageteamauac.jpg",
        alt: "Team Australia",
        caption: "Team Australia",
      },
      {
        type: "heading",
        text: "A seat at the table, and the longer game",
      },
      {
        type: "paragraph",
        text: "Under the new America's Cup Partnership model, Team Australia takes a seat on the ACP board, which makes them not just a challenger but a part-owner of the event's future.",
      },
      {
        type: "paragraph",
        text: "\"I think the Winning family are engaged in this new structure and having now a level of ownership in the Cup going forward. It really has engaged them for the future of the Cup, and they're part of the decision-making process going forward. For all participants, this model will keep people in the game longer, and that's the goal of the model.\"",
      },
      {
        type: "paragraph",
        text: "It feeds, too, into the team's biggest ambition this cycle. \"It's important that we win races,\" he says. \"If you were a dud, your chances of doing the next Cup are low. But if we put in a really good, credible performance, i.e. win a lot of races, we're probably doing the next Cup as well.\" He's already looking past Naples – there's a plan to do AC39, and he reckons Australia have a better shot at that one.",
      },
      {
        type: "heading",
        text: "Getting the humans back in shot",
      },
      {
        type: "paragraph",
        text: "A board seat also drags Simmer into a debate nagging at the whole sport: how do you make a flying monohull watchable? A helmet peeping out of a cockpit, after all, doesn't give spectators a whole lot to latch onto.",
      },
      {
        type: "paragraph",
        text: '"There\'s quite a heated discussion about the fact that sailors are hidden aerodynamically," he says of the rule-writing already under way for AC39. "The spectators are really interested in who are the sailors, what are they doing, what are their skills, and can I see them doing their job on the boat?" The grinding and the muscle, he reckons, has had its day – "I don\'t think we\'re going to turn that wheel back in the Cup" – but there\'s scope to write rules that stop the crew being "so buried in the bowels of the boat."',
      },
      {
        type: "paragraph",
        text: 'He\'s not pining for the chaos of the old days, even if he remembers the entertainment value. The last race of the 2007 series in Valencia, on the Version 5 monohulls, had "broken spinnaker poles and chutes going over the side. There was plenty of drama. That made good TV." But the sport has moved on, and Simmer thinks the modern story has to be told from inside the boat: "The images taken from within the sailors\' cockpits and explaining what the sailors are doing, that\'s the modern message about these boats."',
      },
      {
        type: "paragraph",
        text: 'It all ties back to whether the Cup can finally become commercially viable. "That\'s why all the participants are talking about what the event format should look like," he says. "What do the boats look like? How much automation do we have? How do we make the sailors more visible and more interesting to the spectators? We\'ve got a reason to be engaged in that discussion because we\'re all owners of the future of the Cup."',
      },
      {
        type: "paragraph",
        text: 'For now, the goal is straightforward: build the boat, get it sailing, lean on the Kiwi package and point Slingsby\'s crew at the Naples start line trusting them to deliver on the day. "Full steam ahead," he says of the day-to-day, "and scrambling to keep our heads above water, really."',
      },
      {
        type: "paragraph",
        text: "As for Simmer himself, he's got his eye on the guest racer's seat and reckons this one will be his last campaign. He's said that before, though.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback/",
    },
  },
  "how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time": {
    slug: "how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time",
    kind: "news",
    title: "How Pace took line honours in the 2026 Round Britain and Ireland Race, one chapter at a time",
    standfirst:
      "Johnny Vincent's Volvo 70 Pace crossed the Royal Yacht Squadron line off Cowes at 04:17:31 BST on Sunday 16 August, taking monohull line honours in the 2026 RORC Round Britain and Ireland Race. Six days, 14 hours, 47 minutes and 31 seconds after the cannon fired, Vincent - an owner rather than a professional sailor - had sailed the 1,805 nautical miles around Britain and Ireland and come home first, in the 50th anniversary edition of one of offshore racing's most unrelenting challenges.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "17th August 2026 1:38pm",
    heroImage: {
      src: "https://thefoil.com/media/PzEVl35_-WJnP9AbUFUS8zykmJMvc3I1TsHqYn8X1yU/resize:fill-down:1500:500/gravity:fp:0.54:0.525974026/quality:60/dpr:1/2026/08/pace-line-honours-craig-nutter-pace.jpeg",
      alt: "How Pace took line honours in the 2026 Round Britain and Ireland Race",
    },
    body: [
      {
        type: "paragraph",
        text: "Pace carried a crew stacked with offshore pedigree, among them 2008-09 Volvo Ocean Race-winning navigator Jules Salter and fellow round-the-world veterans Neal McDonald and Stu Bannatyne.",
      },
      {
        type: "paragraph",
        text: '"The Round Britain and Ireland Race is not one yacht race," Vincent reflected after. "It is a series of four races joined together. You do it chapter by chapter and then reach the end of the book when you come back to Cowes. That makes it totally unique. The first chapter takes you through familiar Fastnet waters. Chapter two runs from south-west Ireland to Muckle Flugga in a completely different ocean environment. Chapter three begins when you turn at Muckle Flugga. There is this extraordinary emotion that you are going home, but you are further north than Cape Horn is south. Then comes the North Sea, with oil platforms and gas rigs. The final chapter is probably the most challenging navigationally, with obstructions, separation zones, depth, sand and a very narrow passage through Dover. It arrives when everybody is beaten up and tired, but there is still a lot more to do."',
      },
      {
        type: "paragraph",
        text: "From Cowes back to Cowes, here's how each chapter was won.",
      },
      {
        type: "heading",
        text: "First blood at Land's End",
      },
      {
        type: "paragraph",
        text: "Sunday 9 August began with cannon fire and clear skies over Cowes, as 32 boats and 182 sailors from five continents beat cleanly out of the Solent. By the two-hour mark, Pace had already moved to the front, clearing Bembridge Ledge at over ten knots with Jens Kellinghusen's Ker 56 Varuna 6 barely a mile back.",
      },
      {
        type: "paragraph",
        text: "The first real fork came at Land's End and the Isles of Scilly. Pace held the water lead on an inshore line, committing to thread the traffic separation scheme around the Scillies, while Varuna 6 and Antoine Magre's Mach 50 Palanad 4 went further offshore looking to gain. For Palanad, the opening night had been a punishing introduction before the wind finally offered a way out.",
      },
      {
        type: "paragraph",
        text: '"The first six hours of VMG upwind and short tacking in short choppy sea state was not ideal for the \'big spoon\' we call home," reported Joss Creswell aboard Palanad. "As darkness fell the wind veered and we were able to ease sheets and put up a Code Zero. Suddenly we were doing 13 knots in 14 knots of windspeed. A big morale boost having done a wobbly six or seven knots for hours."',
      },
      {
        type: "paragraph",
        text: 'For Pace, staying at the front through that tricky opening was less about one clever move than a habit of squeezing every mile. "There were opportunities to push hard when it was easy to push hard and to gain from a wind shift, a wind bend or something in the forecast," Salter said. "We tried to do that all the way around the course." That approach was about to be handsomely rewarded.',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/_zFatBSBuZzpGHve9XfvVGdjSyOSGGd-0whCfyLC4s/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/pace-day-2-james-tomlinson-rorc.webp",
        alt: "Pace on day two",
        caption: "James Tomlinson / RORC",
      },
      {
        type: "heading",
        text: "The low-pressure express",
      },
      {
        type: "paragraph",
        text: "South-west of Ireland, the race changed character entirely. A big Atlantic low, sitting around 999 hPa, took control of the weather and pointed Pace's bow due north, feeding her a fast lane of southerly breeze up the Irish and Scottish coasts. By Wednesday, she had reeled off 428 nautical miles in a single 24-hour run, averaging close to 18 knots. By the time she was off the Hebrides, the team's lead over Varuna 6 had become a commanding one, with Palanad 4 holding third.",
      },
      {
        type: "paragraph",
        text: "From the deck, boat captain Anthony Haines described what that kind of speed actually feels like: \"Out here off the Hebrides, Pace is thundering along in a solid 25 knots of breeze from the south. We spent the night in 20-25 knots downwind, the boat averaging 17 to 25 knots, with plenty of water sweeping the deck and keeping everyone honest. It's wet, it's noisy, and it's physical, but the crew is settling into life at sea - finding their own ways to stay comfortable, grabbing rest when they can, and even starting to enjoy the freeze-dried meals. The frantic sail changes of the opening days have eased into a more settled rhythm, and with that comes a quiet confidence on board.\"",
      },
      {
        type: "paragraph",
        text: 'None of that speed comes for free on a Volvo 70. "The crew were incredibly sharp at getting the right sails up and down, then making the small angle changes needed to keep the boat fully on pace," Salter explained. "You are looking at the sea state, wave angles and which little shifts to take. If you keep doing that, suddenly the boat covers hundreds of miles relatively easily."',
      },
      {
        type: "paragraph",
        text: 'Behind, Palanad 4 had worked clear of the light stuff and Magre was weighing up what came next. "Pace and Varuna have taken advantage of their larger size and sail area to get away," he said. "But we are doing all we can to keep up and stay within reach for when the breeze comes in."',
      },
      {
        type: "heading",
        text: "The turn for home",
      },
      {
        type: "paragraph",
        text: "Pace's charge carried her past Bull Rock still holding an hour and 34 minutes over Varuna 6 and five and a half hours over Palanad 4, then stretched further still on the run to St Kilda, where the gap over Varuna 6 grew to seven hours 40 minutes. Palanad was quietly finding another gear of her own - faster than Varuna 6 on the same stretch, clawing back the best part of ninety minutes to close to within three hours 36 minutes of the Ker 56 by the time Pace rounded Muckle Flugga.",
      },
      {
        type: "paragraph",
        text: "Meanwhile, Pace had covered the section from St Kilda in just over 18 hours, pushing her advantage over Varuna 6 to almost 18 hours. For Salter - completing his first full lap of Britain and Ireland despite four round-the-world races - it came down to reading the coastline as much as the weather.",
      },
      {
        type: "paragraph",
        text: '"When you are racing around Britain, you are effectively turning right at every corner. You combine that with the weather and keep the boat at its fastest and most efficient angle. If you minimise the distance and sail faster for a shorter distance, you will do better."',
      },
      {
        type: "paragraph",
        text: "That approach was reflected by the numbers. By the finish, Pace's tracker had logged 2,113 nautical miles against a course of 1,805 - strikingly close to the theoretical shortest route, with only two deliberate deviations, after Black Rock and again in the northern North Sea.",
      },
      {
        type: "heading",
        text: "Gybing through the minefield",
      },
      {
        type: "paragraph",
        text: "The run home is the chapter Vincent rates as the toughest, and it's easy to see why. The southern North Sea is a maze of gas and oil fields, shipping separation zones, wind farms and sandbanks, all with hard, invisible edges.",
      },
      {
        type: "paragraph",
        text: '"There were a lot of gybes, sometimes waking people 30 minutes into what was supposed to be a four-hour off-watch because we had to gybe again," said Salter. "That trust between the navigator and the crew is incredibly important."',
      },
      {
        type: "paragraph",
        text: 'Pace ran VMG downwind past Norfolk, Suffolk, Kent, Sussex and Hampshire, gybing through the dark until a favourable tide finally carried her back through the Solent. Pushing this hard, this late in the race, was only possible because of the groundwork laid before. "Preparation gives you the confidence to push the boat really hard," Vincent said. "Not recklessly hard, because there is always a margin, but really hard. My understanding of what this boat can cope with has moved up massively. She is part of the team." Stepping ashore just after four in the morning, it took a moment before anything like celebration set in.',
      },
      {
        type: "paragraph",
        text: '"A big sense of completion is how I would describe it. It has been a long journey and a tremendous adventure. What an amazing race and what an amazing event. We had all sorts of conditions: no wind, lots of wind, flat sea, big waves and some great scenery."',
      },
      {
        type: "heading",
        text: "The races still being written",
      },
      {
        type: "paragraph",
        text: "Pace has her line honours, but she's only one story in a fleet still racing across half a dozen classes.",
      },
      {
        type: "paragraph",
        text: "Over the weekend, Palanad 4 was leading the projected standings for IRC Overall, with Pata Negra out front in IRC One, GameOn edging Bellino by minutes in IRC Two, Mzungu! holding IRC Two-Handed from Kestrel, and Jetpack under pressure from Zanzibar in IRC Three. Further back, Penfret, Gambit and Swift were locked in their own Class40 battle. Two retirements aside - the Class40 Tjoba and the maxi Venomous, both crews safe and well - the rest of the fleet is still on their way back home.",
      },
      {
        type: "paragraph",
        text: "Pace's four chapters are done, but the overall result is still open. Track the fleet via the RORC tracker with live rankings.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/4rLyOlw-HSbat8_JKJsxcvWsq5IRE_IChrQBD0fPU3A/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/pace-finish-26-rbir-credit-haines-films-pch-ch-0547.jpeg",
        alt: "Pace finishing the Round Britain and Ireland Race",
        caption: "Haines Films",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time/",
    },
  },
  "luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement": {
    slug: "luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement",
    kind: "news",
    title: "Luca Rizzotti bought a Moth in 2007 and accidentally started a movement",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "21st March 2026 2:40pm",
    heroImage: {
      src: "https://thefoil.com/media/qvLe0fQuURzX9cYJo3PDFGhXkj9a-EoxcAsxs5DScR8/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/03/54620591537-354128013c-k.jpg",
      alt: "Luca Rizzotti bought a Moth in 2007 and accidentally started a movement",
    },
    body: [
      {
        type: "paragraph",
        text: "When we launched The Foil at the start of this year, it was understandable that quite a few people incorrectly jumped to the conclusion that it must be a Luca Rizzotti project. After all, this passionate Italian has become synonymous with foiling and the whole world around it.",
      },
      {
        type: "paragraph",
        text: "Rizzotti is the founder of the Foiling Organization, founder and president at the Foiling Week and WeAreFoiling, AC40 Class Manager, and a vice president of the International Moth class.",
      },
      {
        type: "paragraph",
        text: "Such is his influence in this cutting edge part of the sport, he even finds himself negotiating health & safety regulations with civil servants and politicians at the European Union in Brussels. It's all a far cry from his first encounter with the wonderful world of foiling.",
      },
      {
        type: "paragraph",
        text: '"I was living in Sydney back in 2007, sailing in 18ft skiffs, and [Australian sailor] Scott Babbage was also in the 18s, but he had a foiling Moth too. Long story short, when I was going back to live in Italy I decided to buy his Moth and bring it back with me. It was the first foiling Moth on Lake Garda, and probably all of Italy, although I\'m not sure. But certainly I was one of the early ones so of course I wanted to help with getting more Moths on the water in Italy."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/1wPaCqr3CVO9gwTeweD26NNYuO07nr6Ii9XV10RGDMM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/03/moth.webp",
        alt: "Tom Slingsby at the 2025 Moth Worlds. Lake Garda",
        caption: "Tom Slingsby at the 2025 Moth Worlds. Lake Garda",
      },
      {
        type: "paragraph",
        text: "Rizzotti soon got involved with the Italian class association and then became president, during which time he brought the Moth fleet to Lake Garda to hold the World Championship in 2012. Then in 2013, at the end of the America's Cup in San Francisco - where the world had just witnessed 72ft foiling catamarans flying around the Bay - a lightbulb went off in Rizzotti's head. \"Well, if catamarans of 72 feet are foiling in San Francisco and we are here foiling with 11-foot Moths, we must be able to connect these dots, right?",
      },
      {
        type: "paragraph",
        text: '"This had to happen. So, what could we do to help this succeed? We were not really event organisers, so we had a blank sheet of paper. We thought if you want to help a new branch of sailing or a new industry grow, you organise racing." So Foiling Week was born, a fledgling idea that first took place in 2014 and has turned into an annual behemoth on Lake Garda.',
      },
      {
        type: "paragraph",
        text: "\"A lot of people who were fans of foiling were all in email contact with each other, sort of 'pen friends', but they had never met in person. I remember Andrew McDougall, of Mach 2 and Waszp fame, met with Tom Speer, who was the wing designer of the big Oracle trimaran. They had been exchanging ideas for a long time but had never met in person. We became the hub of this, and it just grew with Foiling Week. The first event in 2014 was made of, I would say, 60 to 80 boats, and now we are in the range of 500 entries for Foiling Week. It is incredible.\"",
      },
      {
        type: "paragraph",
        text: 'Most sailing events would be very happy with those first year figures, let alone the multi-hundred numbers now. Rizzotti had clearly struck oil. There was a pent-up demand for foiling enthusiasts around the world all to club together and share this pioneering adventure of rapid technical development and high-speed sailing. "We gave the community a home to come back to every year," he says. "I would say even the whole town of Malcesine and Lake Garda eventually benefited from that. Although at the beginning, I remember the yacht club in year one basically told us, \'Do not do this crazy thing again.\' They had a lot of doubts.',
      },
      {
        type: "paragraph",
        text: "\"For a normal yacht club that was running Olympic classes and traditional regattas, this bunch of new boats - all foiling, most of them garage-built back then, with the characters that go together with garage-building - was a unique demographic. They were like-minded, passionate people, but they stood out from the normal sailing demographic you would expect in a yacht club. Especially back then. So the club asked, 'Do you really want to do this again?' and we went, 'Yeah, let's give it one more try.'\" 'One more try' has now turned into an annual event that just continues to grow in size and gather momentum.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/6uAmoDowmt2VnBEBFllPaSVgtu4Tz8XrHmp7MPnPNtM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/03/54621468796-f207b4d016-k.jpg",
        alt: "2025 Foiling Week",
        caption: "2025 Foiling Week",
      },
      {
        type: "paragraph",
        text: "While Malcesine on Lake Garda has become the consistent annual focal point, other editions of the Foiling Week have popped around the world including in Sydney and Pensacola in Florida, the same place that was recently announced as American Magic's training base for the SailGP league.",
      },
      {
        type: "paragraph",
        text: 'The Foiling Awards in Genoa, north Italy, have just completed their ninth edition and along with that goes the Foiling Congress. "The awards are like the Oscars; they are a prize for everything that happened in the previous year. We brought in the Congress to make it more worthwhile for people travelling from everywhere around the globe. Instead of coming for just one evening, we gave them a reason to come beyond the gala dinner.',
      },
      {
        type: "paragraph",
        text: "\"It is a great opportunity to discuss ideas and for networking, but we have a lot of practical topics. At the moment, one of the key bottlenecks for the growth of foiling is that according to European law, foiling is not permitted for recreational crafts. It's not that it is strictly forbidden, but instead of being allowed to use a CE mark, which is the easy way, you need to rate every vessel yourself. This means extra cost for the manufacturer and extra cost for the customer in insurance. We are trying to work with the European Commission to make foiling allowed in four years' time, which is when they update the law.\"",
      },
      {
        type: "paragraph",
        text: 'So does that mean that every time a Moth sailor goes out on Lake Garda or somewhere in Europe, they\'re breaking the law? Fortunately not, according to Rizzotti. "To be clear, this is only for recreational crafts. Sports dinghies and sailing boards are under World Sailing certification, which is a different system that allows those boats to go sailing with no problem. But for full flying, where the hulls are clear of the water, you would need CE marking, which at the moment is impossible to get. I am discussing with people in Brussels how to change the law in Europe."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/w9AE5E4RrVAKij7boQt1qxh-25Ag9Eioi6UawaudhtA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/03/55153761886-9ec50c0cd8-k.jpg",
        alt: "Rizzotti onstage at the 2026 Foiling Awards - IX Edition",
        caption: "Rizzotti onstage at the 2026 Foiling Awards - IX Edition",
      },
      {
        type: "paragraph",
        text: 'Rizzotti can\'t quite believe how he spends his days. From that initial purchase of a second Moth from his Aussie mate Scott Babbage almost 20 years ago, now the passionate Italian is working at every level to promote foiling, from the fun stuff at Lake Garda to wading through the red tape and administrative minefield of Brussels. "It has been a learning experience; I come from organising events and now I am a lobbyist," he half-laughs.',
      },
      {
        type: "paragraph",
        text: 'Not that he\'s complaining. Four years ago, from running the Foiling Organization part time while holding down a job with Italian boatbuilder Persico, now Rizzotti is full time. "I am grateful for the opportunity because, while it is work, it is passion. This idea of foiling can bring so much to the sport and the industry - extra comfort [due to a smoother ride above the waves], reduced emissions, and bringing technology into a world that has been very conservative for a long time... it is a breath of fresh air."',
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement/",
    },
  },
  "rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york": {
    slug: "rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york",
    kind: "news",
    title: "Rate the fleet: Andy Rice's verdict on SailGP New York",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "5th June 2026 8:00am",
    heroImage: {
      src: "https://thefoil.com/media/MzGn-S68hd8DlKixNMC2PH1z8Uj7hHEgqEWaGyk2il4/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/ml3-7515.jpg",
      alt: "Rate the fleet: Andy Rice's verdict on SailGP New York",
    },
    body: [
      {
        type: "heading",
        text: "1. Australia",
      },
      {
        type: "paragraph",
        text: "Finished: 1st Of Australia's three back-to-back victories, the win in New York was by far the messiest and most surprising. For surviving the technical curveballs thrown their way both on Saturday and before the start on Sunday, then to rediscover their composure to get racing and do just enough to scrape through into the final... This, plus their victory in the final after fighting off those valiant attacks from the British, makes them my top performers in the battle for New York. This has been a bogey venue for Tom Slingsby; he sounded not so much triumphant as relieved at having survived an extraordinary weekend of rollercoaster emotions, and delighted to have got that New York monkey off his back. Add to that the announcement by co-owners Hugh Jackman and Ryan Reynolds of a Disney+ docuseries taking a behind-the-scenes look at the Bonds Flying Roos, this could be massive for all of SailGP. If this proves to be the league's 'Drive To Survive' opportunity, then all F50s can be truly grateful for floating on a rising tide.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/05ES5wlxz2x8RZofDUs6DdIKAm-_AteS0MFbW8rvonY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/ml3-7515.jpg",
        alt: "Mike Lawrence/SailGP",
        caption: "Mike Lawrence/SailGP",
      },
      {
        type: "paragraph",
        text: "Canada made it to the three-boat final for the first time in 2026",
      },
      {
        type: "heading",
        text: "2. Canada",
      },
      {
        type: "paragraph",
        text: "Finished: 3rd There were signs of NorthStar SailGP team making progress in Bermuda. Giles Scott's progress towards the three-boat final was scuppered by that port/starboard incident where Sweden ruined one of their races on Sunday. Even so, the Canadian boat looked to be dragging its arse in the marginal foiling moments on the Great Sound. By the looks of Sunday in New York, the Canadian boat has got its mojo back - windward bow aggressively close to kissing the water, leeward rudder riding coquettishly high. This is the mode that Australia and Spain seem able to achieve with ease compared with the rest of the pack. This boatspeed - along with some smart tactical placement around the congested race track - rewarded Giles Scott with the highest number of overtakes for the weekend - a grand total of nine. The next best in this vital category scored just six, with the majority of teams hovering around zero. While Scott will be disappointed not to have featured in the three-boat final, coming in a distant third, this is a minor blip compared with an overall good-news story. After a sorry start to the season, Canada is rediscovering some momentum in the build-up to its home event in Halifax.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/wpcQHFo2n2IJ4k2tdB5U6W37K3fmLgOq8jPimO3mQ_s/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/sb2-7000.jpg",
        alt: "Simon Bruty/SailGP",
        caption: "Simon Bruty/SailGP",
      },
      {
        type: "heading",
        text: "3. Spain",
      },
      {
        type: "paragraph",
        text: "Finished: 12th Why Spain, you ask? Well, when Diego Botin had an operational boat, Los Gallos dominated the small-fleet contest on an ultra-breezy Saturday that would end up counting for nothing other than bragging rights. Not that the ever-smiling, always-humble Botin is one to brag. He probably doesn't complain loudly enough about his frequently malfunctioning boat. When it's working, the oldest boat in the fleet is as fast as any other, possibly faster. But when you ask him, Botin says he's looking forward to taking delivery of a new F50 later this season because he hopes to banish the ongoing technical gremlins that beset his ageing catamaran. With hydraulic problems putting the Spanish out of action for all of Sunday's racing, where to place them in these rankings? This might be a woulda, shoulda kind of thing to place them this high in the order, but like I said, they were on fire on Saturday, and they've been on fire all season - when the boat has not been breaking on them.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/xYTOjFaKRrPBS6YQ5RSkM89iiOZ7bYNBkQEM--SB4Eg/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/km2-7051.jpg",
        alt: "Katelyn Mulcahy/SailGP",
        caption: "Katelyn Mulcahy/SailGP",
      },
      {
        type: "heading",
        text: "4. Great Britain",
      },
      {
        type: "paragraph",
        text: "Finished: 2nd This looked like an Emirates GBR getting back to close to its best. In Saturday's windy races, Dylan Fletcher ruled the starts even if Spain were the better package around the race course. They were fast out of the blocks on Saturday, launching the day with a race win and bouncing back nicely in the next - from dead last off the start line to sixth by the finish. The British overtaking the Aussies in that stellar match race - even if they were subsequently overtaken - showed good speed and tactical decision-making. While Fletcher felt some pangs of regret about missing out on the overall win, coming second in New York should really help banish the demons of that inexplicable last place finish in Rio de Janeiro less than two months ago.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/G3mX0t2QUQWtK4Y6vOl_4KjZpP4EYbjQzBHNHdw9mR8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jj054692.jpg",
        alt: "Jed Jacobsohn/SailGP",
        caption: "Jed Jacobsohn/SailGP",
      },
      {
        type: "heading",
        text: "5. United States",
      },
      {
        type: "paragraph",
        text: "Finished: 6th The USA had been my pick to win this event. In fact they've been my pick ever since they took victory in Sydney. When am I going to wake up to the idea of backing Australia instead! But my belief in Taylor Canfield's team was backed up by their performance in the first two races of Sunday when they scored a second and a first. The stats support that notion that the Americans have been the fastest finger first out of the starts and the all-important race to Mark One. Canfield's late charge out of the leeward end of the start line of Race 2 was beautifully judged and gave them the slingshot out into an early lead that they held easily to the finish. But then it was the start of the next race where an impressive weekend unravelled for the home team. The Americans were the sole boat from that three boat pile-up from the Race 3 start to be DSQ'ed. Just DNFs for Brazil and Italy. Even Canfield was holding his hands up to his culpability in the crash. From now on, will the Americans - and other teams - make sure there is at least one person in the leeward cockpit in those conditions, to keep a watchful eye out for any boat that makes a sudden and unexpected hand-brake turn to the right? So, lessons to be learned, but the Americans continue to make an impact for good reasons, as well as that bad one.",
      },
      {
        type: "heading",
        text: "6. France",
      },
      {
        type: "paragraph",
        text: "Finished: 4th It was surely a blessing for France – and Enzo Belanger in particular – that they didn't have to go into battle on Saturday with the wind gusting up to 36 knots. Quentin Delapierre's new wing trimmer, following those severe injuries to Leigh McMillan and Glenn Ashby this season, at least had a softer start to his first day of competition in SailGP. Not only that, but to come out of the weekend with a fourth place was a really good result of which Delapierre was rightly proud.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/tSboQlsQPDImtg0Ou7utdyRo1tl6Q4O837ZfcGoDgs0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jj055729.jpg",
        alt: "Jed Jacobsohn/SailGP",
        caption: "Jed Jacobsohn/SailGP",
      },
      {
        type: "heading",
        text: "7. Brazil",
      },
      {
        type: "paragraph",
        text: "Finished: 10th Placings of 5th and 8th in the first two races point towards some kind of progress for Brazil. Then again, New York a year earlier was where Martine Grael steered the Brazilian boat to its first race victory and only narrowly missed the podium when the team finished 4th in 2025. A really good start in Sunday's second fleet race saw Brazil fighting for the lead at Mark One, closely following USA around the bear away. That was a good sign for a team that has really struggled in the pre-starts. It has been slim pickings for Brazil this season, so were we seeing glimmers of improvement on Sunday? Alas, just as the Brazilians were building up a head of steam - that three-way collision at the start of Race 3. The only one of the three teams in the pile-up not to be given penalty points, so an innocent party. But small consolation for such a rude ending to an otherwise good day.",
      },
      {
        type: "heading",
        text: "8. Sweden",
      },
      {
        type: "paragraph",
        text: "Finished: 5th There's a feeling that the season is beginning to slip away from Artemis SailGP. Nathan Outteridge was clearly frustrated at not being able to race on Saturday; and on Sunday the Swedish team was engaged in some co-ordinated practice starts and reaching to Mark One with some of the other teams from northern Europe - Denmark, Germany and Switzerland. Outteridge seemed quite taken aback that The Foil had noticed the formation practice starts, but he explained it was Sweden who had initiated the idea. It seems like Sweden is pulling out all the stops to close the gap to the front pack. A 3rd place in Sunday's opening race was the one bright spot for Sweden in New York, although they still finished in fifth overall. This puts Sweden in sixth in the season standings, bottom of the first division. No need for panic yet, but Artemis needs to step up a level if it's to challenge for the top three in Abu Dhabi by the end of the year.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/5gl269Oi1UNop-cgyp_-7KeiSOececaLC7sTzGwf75g/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/sb1-8366.jpg",
        alt: "Simon Bruty/SailGP",
        caption: "Simon Bruty/SailGP",
      },
      {
        type: "heading",
        text: "9. Switzerland",
      },
      {
        type: "paragraph",
        text: "Finished: 10th A middle-of-the-road performance for Switzerland in New York but Sebastien Schneiter can take encouragement from some good rounding positions at Mark One. The Swiss launched the boat nicely off the top end of the start line in Sunday's first race. Fourth down to the bottom gate but with Italy close to leeward on the outside of the rounding, Schneiter was unfortunate to cop a penalty from the umpires as Phil Robertson slowly luffed the Swiss. Coming off worse in these kinds of marginal situations is preventing the Swiss from capitalising on their good moments. After a fifth place in Bermuda, Schneiter will have been hoping for better than eighth in New York.",
      },
      {
        type: "heading",
        text: "10. Denmark",
      },
      {
        type: "paragraph",
        text: "Finished: 7th What has the ocean given you? \"Lots of money,\" was Nicolai Sehested's cheeky, quick-as-a-flash reply to SailGP's upbeat influencer Alex Hobern in the mixed zone after Sunday's racing. The Danish driver was in equally, funny, feisty mood when he spoke to me next. He's sounding increasingly cross about the lack of practice time available in the F50s. So to miss Saturday's racing after no practice racing on Friday was too frustrating for him to take without some kind of comment. After two poor opening races, Denmark finally made amends in Race 3 with a second place behind Canada. So, good to finish on a better note, but the sense of dissatisfaction still prevails. If I could give the Danes extra points for their naughty memes on Instagram, then they'd be the winners of the weekend. When you're frustrated that crane stops play on a stormy Saturday, do you sit around and mope about it? No! You turn to Photoshop and your favourite AI weapon of choice. And you tell the league what you think through the medium of spiky, sardonic humour.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/OO_nUK9kDu8o2NRUF58qpk8zpfqwbuY0WuGabb-Qrm0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/jj055841.jpg",
        alt: "Jed Jacobsohn/SailGP",
        caption: "Jed Jacobsohn/SailGP",
      },
      {
        type: "heading",
        text: "11. Italy",
      },
      {
        type: "paragraph",
        text: "Finished: 9th Red Bull Italy were well in contention for making the three-boat final after solid performances in the first two fleet races with scores of 6th and 3rd. But then that poorly judged approach to the start line of Race 3, with Italy underestimating the strength of that Hudson River conveyor belt dragging the Red Bull boat too quickly towards the line. With Phil Robertson's priority being to keep the boat from starting early and copping a penalty, he paid a much higher price as he turned the boat 90 degrees away from Mark One and parallel to the start line. With so many blind spots created by the wingsails and jibs in such a hectic, high-traffic zone, it's not that surprising that the US team failed to spot the Italian boat in its path. The subsequent collision from the US team, compounded by a smack in the stern from Brazil, brought Italian hopes to a carbon-splintering end. The collision also raises questions about what the league needs to do to prevent this kind of carnage. Under the current rules, Italy would have been within its rights to steer all the way up to head to wind.",
      },
      {
        type: "heading",
        text: "12. Germany",
      },
      {
        type: "paragraph",
        text: "Finished: 11th Poor starting has been Erik Heil's self-confessed biggest problem on board the German boat. The Germans were marginally over the start line in Sunday's first race, immediately putting them to the back. However, with all the attention on that three-way collision at the start of Race 3, it was easy to overlook the excellent launch out of the line by the Germans who led around Mark One and down to the bottom gate. They were unable to hold the lead, although a fourth place was not too shabby. A lot less shabby than finishing back of the fleet in the two previous races, which relegated Germany to last place in New York (with the exception of Spain of course).",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/a8gmBwhvw6WrCy_Uer1hGfXIMrvD4D8NHfvhFJlkQ6I/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/rp2-6524.jpg",
        alt: "Simon Bruty/SailGP",
        caption: "Simon Bruty/SailGP",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york/",
    },
  },
  "the-questions-that-remain-following-new-york-sailgp": {
    slug: "the-questions-that-remain-following-new-york-sailgp",
    kind: "news",
    title: "The questions that remain following New York SailGP",
    standfirst:
      "The New York SailGP left us with more questions than answers. From a dramatic three-boat collision to a grand final that divided opinion, the sixth round of the season gave the league plenty to reflect on ahead of Halifax.",
    author: "Lewis Smith, Multimedia Editor",
    publishedAt: "6th June 2026 1:03pm",
    heroImage: {
      src: "https://thefoil.com/media/Wqft6xmJNvpT7eImpbnmmODclDsHiK06M7P4ane4DRE/resize:fill-down:1500:500/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/06/new-york-sailgp-statue-of-liberty-2026.jpg",
      alt: "The questions that remain following New York SailGP",
    },
    body: [
      {
        type: "heading",
        text: "1. Is it time for new starting rules?",
      },
      {
        type: "paragraph",
        text: "The three-boat collision in race three on Sunday was the defining moment of the weekend, and not for the right reasons. The USA received seven penalty points and Italy four, the correct decisions in accordance with the rules, in my opinion. USA failed to keep clear as a windward boat, and Italy did not do enough to avoid contact.",
      },
      {
        type: "paragraph",
        text: "What I do question, however, is whether the current rules are fit for purpose in the modern context of SailGP. Italy's manoeuvre was not unsportsmanlike under the current rule set, but it was dangerous.",
      },
      {
        type: "paragraph",
        text: "Italy turned almost 90 degrees to the start line, presenting their boat side-on to the oncoming fleet. As Mozzy highlighted to me, the configuration of the start line allowed Italy to sail along it to a degree we rarely see during other SailGP starts. The rules and course configuration permitted it, but should those rules allow it in the first place?",
      },
      {
        type: "paragraph",
        text: "My proposal would be a change to rule 17, aligned with the approach used in Appendix B for windsurfing fleet racing, where at 30 seconds to the gun, all competitors are required to sail their shortest course towards the start line.",
      },
      {
        type: "paragraph",
        text: "Appendix B Windsurfing Fleet Racing Rules",
      },
      {
        type: "paragraph",
        text: "17: On the same tack before a reaching start",
      },
      {
        type: "paragraph",
        text: "Rule 17 is changed to:",
      },
      {
        type: "paragraph",
        text: "When, at the warning signal, the course to the first mark is approximately 90 degrees from the true wind, a board overlapped to leeward of another board on the same tack during the last 30 seconds before her starting signal shall not sail above her shortest course through the starting line to the first mark while they remain overlapped if as a result the other board would need to take action to avoid contact, unless in doing so she promptly sails astern of the other board.",
      },
      {
        type: "paragraph",
        text: "In practice, you would essentially have two phases: the jostle for position before 30 seconds, and then a clean, directional run to the line. Once a team has a lane, they sail it. Any changes in course in the last 30 seconds, and it's the duty of the boat changing course to keep clear.",
      },
      {
        type: "paragraph",
        text: "Whether 30 seconds is the right threshold or whether 10 or 20 seconds might be more appropriate, I'm not certain, but the principle feels right. I think it would go a long way to prevent incidents like the one we saw in New York.",
      },
      {
        type: "heading",
        text: "2. Will we see the USA boat sacrificed for repairs to the Italian's?",
      },
      {
        type: "paragraph",
        text: "This is not without precedent. Cast your mind back to Sassnitz in 2025, when the British and USA boats collided. The USA were deemed to be at fault, and the British boat was too damaged to race on Sunday.",
      },
      {
        type: "paragraph",
        text: "The response? A section of hull from the USA F50 was cut out and donated to Great Britain so they could take to the water. The question now is whether something similar could happen ahead of Halifax.",
      },
      {
        type: "paragraph",
        text: "Italy's boat appears to need the most significant repairs from the New York collision. If there is a genuine risk that the Italian team cannot get their boat ready in time, would SailGP look to the USA to provide a solution? Could we see a sacrifice of the American platform to get Italy back on the start line?",
      },
      {
        type: "paragraph",
        text: "Sources told me that the spare hull sections remaining after the repairs to the French and Kiwi platforms after the Auckland crash have already been air freighted to Halifax to help with the salvage efforts.",
      },
      {
        type: "paragraph",
        text: "A slightly more left-field theory concerns brand new boat 14, which was announced in New York as being the hull that the Black Foils are set to make their return to racing on in Halifax.",
      },
      {
        type: "paragraph",
        text: "As the only team left in SailGP still to source private backing, the Black Foils remain centrally controlled by SailGP. With the Italian boat having commercial interests that may outweigh the Kiwis, could we see boat 14 temporarily handed over to the Italians? Likely not, but I thought I would throw it in there.",
      },
      {
        type: "paragraph",
        text: "As far as I understand, SailGP Technologies plan to have all three boats on the start line in Halifax, but repairs to the Italian boat will be the tightest to complete in time. There's still every chance that we could see one of these solutions deployed by SailGP if the deadlines are too tight.",
      },
      {
        type: "paragraph",
        text: "It is worth watching this one closely.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/bUdsNnkI6Dz3emjslxat7Y-KzJrYBxzgdkSu1AE5T8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/gbr-sailgp-repair-to-hull-after-crash-with-usa-sassnitz-2025.jpg",
        alt: "USA hull section used to repair GBR in Sassnitz 2025",
        caption: "A section of USA's hull used to repair the damage caused to GBR in Sassnitz 2025",
      },
      {
        type: "heading",
        text: "3. Have Spain been hard done by?",
      },
      {
        type: "paragraph",
        text: "Buried within the boat logistics story is a subplot that deserves its own spotlight: the fate of boat 14 and whether Spain, and the rest of the fleet, have been left short-changed.",
      },
      {
        type: "paragraph",
        text: "Los Gallos have the oldest F50 in the fleet, and it has shown. Diego Botin has always been clear that the boat is not slow, and the team's results show that. When Spain race, they race fast.",
      },
      {
        type: "paragraph",
        text: "The problem is getting to the start line in the first place. Reliability gremlins have plagued the team throughout the season, forcing them out of races through no fault of their own. New York is the most recent example with the team missing out on the point-scoring races on Sunday.",
      },
      {
        type: "paragraph",
        text: "The arrival of boat 14 felt like the natural remedy. The widely held expectation was that the new platform would go to Spain, with the Spanish hull then passing to the Black Foils to get Burling's team back on the water following their devastating crash in Auckland with the French.",
      },
      {
        type: "paragraph",
        text: "That felt fair. The Kiwis crashed out, destroying their boat, whereas Spain have suffered technical issues through no fault of their own. The logic of rewarding the victims of reliability over the Kiwis, who were deemed at fault for their crash, seemed sound.",
      },
      {
        type: "paragraph",
        text: "Then it all changed. It was announced at the New York SailGP press conference that boat 14 would go directly to the Black Foils, with Spain continuing with their ageing hull.",
      },
      {
        type: "paragraph",
        text: "Sources told me that the driving factor behind the decision was time. Repainting the Spanish hull to the Kiwi livery may have pushed the Black Foils' return beyond Halifax, and that is a delay the league is clearly not willing to accept. It seems a few tins of paint may have ultimately decided who receives the new boat.",
      },
      {
        type: "paragraph",
        text: "A deeper point relates to the Pensacola training base, still without its resident F50. Along with the original expectation that Spain would receive boat 14, it was thought that the unreliable Spanish hull would find its new home in Pensacola. Crucially, allowing teams to train - something that is becoming an impossible task in the league. It is easy to underestimate just how deep the knock-on effect of the Auckland crash has had on SailGP.",
      },
      {
        type: "paragraph",
        text: "Giving the Black Foils boat 14 may well be the right call commercially, given the pressure the league faces to get one of its most high-profile teams back on the water. Whether it is the right call for Spain or athletes in need of training time is a harder question to answer.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/0GyhabQKPll11xdzTpYslISNnIIgpTTIuVQNjY0qP4E/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jl204375.jpg",
        alt: "New Zealand boat 14 platform completed at SailGP Technologies, Southampton",
        caption: "New Zealand's boat 14 platform completed at SailGP Technologies, Southampton",
      },
      {
        type: "heading",
        text: "4. How many boats need to be craned in for scores to count?",
      },
      {
        type: "paragraph",
        text: "Saturday in New York threw up a question that the rulebook has not yet answered cleanly.",
      },
      {
        type: "paragraph",
        text: "Strong wind conditions meant only four boats were successfully craned in. The following morning, SailGP publicly made the call not to count Saturday's results in order to uphold the integrity of the competition.",
      },
      {
        type: "paragraph",
        text: '"In the interest of maintaining the integrity and fairness of competition, the Race Committee has determined that racing sailed on Day 1 will not be scored. Scoring for the Mubadala New York Sail Grand Prix will commence from Day 2, with all results counting towards the 2026 Season Rolex SailGP Championship standings."',
      },
      {
        type: "paragraph",
        text: "That decision was understandable, and one I agree with, but it sits awkwardly alongside what happened in Halifax last year, when two boats were unable to be craned in, and scores counted.",
      },
      {
        type: "paragraph",
        text: "So we now have a spectrum: two boats absent and results stand; eight boats absent and they do not. Somewhere between those two points is presumably a threshold, but it has never been defined.",
      },
      {
        type: "paragraph",
        text: "If a similar situation arises again, the league should not have to make an on-the-spot judgment call. A clear written threshold, determining at what point reduced fleet numbers compromise the validity of racing, would bring consistency and clarity.",
      },
      {
        type: "heading",
        text: "5. Will we ever see VAR in sailing?",
      },
      {
        type: "paragraph",
        text: "I had a great conversation with Freddie on the podcast about the two incidents in the closing 30 seconds of the grand final between Great Britain and Australia. It got me thinking about the broader question of officiating in SailGP.",
      },
      {
        type: "paragraph",
        text: "There was a close rule 10 and rule 11 call in quick succession, and in my view, Great Britain were hard done by on the latter. Based on my review of the footage, I believe Australia should have received a penalty for not keeping clear as a windward boat, which likely would have flipped the result.",
      },
      {
        type: "paragraph",
        text: "Now, I do not envy the umpires. Making those calls at the speed they do, with the pressure they have on them, is genuinely one of the hardest jobs in the sport. I have enormous respect for what they do, and I probably would have made the same decision given the same time frame.",
      },
      {
        type: "paragraph",
        text: "But it does raise the question: would they feel more empowered to make their decisions if they had more time to do so? In a grand final situation, would there ever be a case for placing the winning moment on hold while a brief review takes place? Just like a VAR check in football?",
      },
      {
        type: "paragraph",
        text: "I am not suggesting umpires are getting decisions wrong routinely, far from it. But if the tools exist to get more decisions right, the sport should at least be having the conversation.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/sI50DcfKkcmy_qjDCtxeA6LWTPsNz-nBL1uIGrnk2U/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/rp2-4561.jpg",
        alt: "AUS and GBR before the final mark rounding in New York",
        caption: "AUS and GBR before rounding the final mark to the finish of the event final in New York",
      },
      {
        type: "heading",
        text: "The questions are part of the story",
      },
      {
        type: "paragraph",
        text: "Not all of these questions will be answered publicly. Some may well be resolved behind closed doors, and we may never learn the full picture.",
      },
      {
        type: "paragraph",
        text: "SailGP is one of the best things to happen to sailing in a generation, so these questions are worth asking for athlete safety, the integrity of the competition, and the long-term commercial health of the league.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-questions-that-remain-following-new-york-sailgp/",
    },
  },
  "the-real-story-behind-the-black-foils-new-sailgp-recruits": {
    slug: "the-real-story-behind-the-black-foils-new-sailgp-recruits",
    kind: "news",
    title: "The real story behind the Black Foils' new SailGP recruits",
    standfirst:
      "New Zealand's Black Foils have added two sailors to their crew roster, but only one has officially been announced.",
    author: "Lewis Smith, Multimedia Editor",
    publishedAt: "17th August 2026 3:14pm",
    heroImage: {
      src: "https://thefoil.com/media/6JZMMpbTZfxO1hOuGduvl-mWfum0s0V6Cfxb4zPP-TY/resize:fill-down:1500:500/gravity:fp:0.6278381625:0.3250833809/quality:60/dpr:1/2026/08/black-foils-auckland-2026-brett-phibbs.jpg",
      alt: "The real story behind the Black Foils' new SailGP recruits",
    },
    body: [
      {
        type: "paragraph",
        text: "Announced is Olympic multihull hopeful Kate Stewart, who joins the team as reserve strategist, working alongside Liv Mackay. Not yet announced is the addition of Paris 2024 49er silver medallist William McKenzie to the very same crew roster. The details of the role that McKenzie may or may not play remain unknown.",
      },
      {
        type: "paragraph",
        text: "What is apparent, however, is that the Black Foils may well be using the rest of their season to train up fresh talent. Their absence for the majority of the season has been a devastating blow to their overall result, yet it proves an ideal opportunity to bed in new sailors with little to no risk.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/iCqF7hupxe5PXHFU28HZXdKO2GI-LrxJkwb_LoBBHWo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/kate-stewart-black-foils.jpg",
        alt: "Black Foils / SailGP - Stewart donning her new Black Foils uniform",
        caption:
          "Black Foils / SailGP - Stewart donning her new Black Foils uniform for a photoshoot ahead of the annoucnement at SailGP Technologies",
      },
      {
        type: "heading",
        text: "Stewart named as reserve strategist",
      },
      {
        type: "paragraph",
        text: "Stewart, 27, joins the team in Sassnitz fresh from the San Pedro Olympic Class Regatta, the first event held on the waters that will host the Los Angeles 2028 Olympic Games. She and crew Micah Wilkinson finished 11th in the Nacra 17 class, one place shy of the finals, but the result does little to mask the intent behind Stewart's Olympic campaign.",
      },
      {
        type: "paragraph",
        text: "The pair had earlier finished fifth at the Nacra 17 European Championship together, and will continue their LA 2028 campaign alongside Stewart's new role with the Black Foils.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/Sn7wLASg2k5-Ppc0caaC36K8zD0rspPVOlmRmprnzfY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/wilkinson-and-stewart-san-pedro-la28-build-up-regatta-lexi-pline.jpg",
        alt: "Lexi Pline",
        caption: "Lexi Pline",
      },
      {
        type: "paragraph",
        text: "A two-time Youth World Championship medallist, Stewart learned her trade at Wakatere Boating Club in Devonport. She won the Tauranga Cup in 2014 and was only the second girl to have her name engraved on the iconic New Zealand P-Class trophy, the first since Leslie Egnot in 1979.",
      },
      {
        type: "paragraph",
        text: "Her journey to the Black Foils has not been a straightforward one. Stewart stepped away from the Olympic pathway to complete a university degree before returning to the water in 2025, and already appears to be making up for lost time.",
      },
      {
        type: "paragraph",
        text: '"When I left the Olympic pathway, there wasn\'t a long-term pathway for women like the one we have now," Stewart said. "Finishing my degree and seeing the fantastic roles and opportunities available to women today drew me back in. "It\'s an incredible honour to be part of the Black Foils and involved with people who\'ve done amazing things in sailing. They\'re a strong, tight-knit group with real values and mana, and I want to learn as much as I can from Liv."',
      },
      {
        type: "paragraph",
        text: "Her first event with the team will be the Germany Sail Grand Prix on 22-23 August. When she is not on the water, she will support the team from the coaches' booth - a small detail that may point us to McKenzie's role change.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/uBmHO3Jf8gs9CgYysVlFZb2kh-u2UetE1wg_jvlvzak/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/black-foils-portsmouth-ricardo-pintp.jpg",
        alt: "Ricardo Pinto / SailGP - The Black Foils heading for the fans in Portsmouth",
        caption: "Ricardo Pinto / SailGP - The Black Foils heading for the fans in Portsmouth",
      },
      {
        type: "heading",
        text: "McKenzie making moves",
      },
      {
        type: "paragraph",
        text: "McKenzie's path onto the Black Foils' crew roster has been a swift one. The Auckland-born sailor, 29, first appeared on the official team sheet as a coach at the Auckland event earlier this season. He was then named in a similar role as 'coach booth operator' when the team returned to competition in Halifax, and again for Portsmouth. McKenzie's addition to the athlete roster on the tenth of July suggests his role within the setup is evolving into something more than just a coach.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/8oyf6XfxQNdW78JkrDBmQNThpduIdzuKToGvAxzhqiU/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/matt-steven-and-will-mckenzie-black-foils-coaches.jpg",
        alt: "Black Foils / SailGP - Coach booth operator Will McKenzie alongside head coach Matt Steven",
        caption:
          "Black Foils / SailGP - Coach booth operator Will McKenzie (right) alongside head coach Matt Steven (left)",
      },
      {
        type: "paragraph",
        text: "It seems apparent that Stewart will step into the coaching role that McKenzie may well be vacating. McKenzie is a significant coup for the Black Foils. A Paris 2024 Olympic silver medallist who finished second in the men's skiff event alongside helm Isaac McHardie. The New Zealand pair pushed hard all the way to the final and finished behind Spain's Diego Botín and Florian Trittel - who took gold in the same month they won the SailGP Season Four Championship - with Ian Barrows and Hans Henken claiming bronze for the United States.",
      },
      {
        type: "paragraph",
        text: "That podium has since produced some notable SailGP talent. Botín is now co-helmsman of the French America's Cup team, and Henken serves as flight controller for the US SailGP Team. Whether McKenzie follows a similar path on to the Black Foils' F50 in a racing capacity remains to be seen, but his presence on the athlete roster opens the door.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/abjlufYmF79uovOxtpUzXNA9iY0j2GMRIV_2Z_J36Ek/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/isaac-mchardie-will-mckenzie-paris-024-silver-medal-49er-mens-skiff-jean-louis-carli.jpg",
        alt: "Jean-Louis Carli / World Sailing - McHardie and McKenzie pick up their silver medals in Marseille",
        caption: "Jean-Louis Carli / World Sailing - McHardie and McKenzie pick up their silver medals in Marseille",
      },
      {
        type: "heading",
        text: "A change in attitude for the Black Foils",
      },
      {
        type: "paragraph",
        text: "The pair represent a significant strengthening of the team's depth. With Stewart joining as a reserve strategist, the team will be developing a safe pair of hands in that seat. McKenzie's addition to the roster marks a rapid ascension from his role as a coach and could likely see him named as a reserve sailor.",
      },
      {
        type: "paragraph",
        text: "It will be interesting to see whether either of these hires get any race time onboard before the close of the season. If I were among the higher-ups of Black Foils' leadership, with the unsalvageable season result the team finds itself with, I would be seriously considering ensuring both Stewart and McKenzie get race time on board the team's new F50 Manawatītī ahead of 2027. Bedding these sailors in could jeopardise event-winning potential, but that is worth it in my eyes considering the need for SailGP to bring through younger talent. A worthy investment for a Kiwi team needing an impactful resurgence come next season.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-real-story-behind-the-black-foils-new-sailgp-recruits/",
    },
  },
  "the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control": {
    slug: "the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control",
    kind: "news",
    title: "'The safest is when you're pushing hard' - Billy Gooderham explains flight control",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "26th February 2026 8:07am",
    heroImage: {
      src: "https://thefoil.com/media/0EFxZVDTHUXcC_UfkIMZmj5u_u_mK-qnHR_RB1aVSVA/resize:fill-down:1500:500/gravity:fp:0.4804597701:0.5023331499/quality:60/dpr:1/2026/02/northstar1.jpeg",
      alt: "Billy Gooderham explains flight control",
    },
    body: [
      {
        type: "paragraph",
        text: "Last season, NorthStar SailGP Team's flight controller Billy Gooderham spent most of his race time focused on a piece of PVC tape on the bow of the F50. \"It is now painted on the boat for us with a new paint job this year, so that is a huge upgrade,\" laughs Gooderham, who admits he has little clue what's going on in the race around him. He can't afford to look away from the magic mark on the bow. \"As a flight controller, I have no idea what is going on in the racing. I don't know how we are doing; I don't know if we are doing well or poorly. I know if we are going upwind or downwind, and I know if we are about to manoeuvre. That's about it.",
      },
      {
        type: "paragraph",
        text: '"To be a flight controller and do your job well, you have to be so intensely focused on what you are doing that you don\'t really have knowledge of the external surroundings. You just tune out the external noise."',
      },
      {
        type: "heading",
        text: "A harsh call?",
      },
      {
        type: "paragraph",
        text: 'The tricky job of flight control has been in the news lately since that Auckland crunch between New Zealand and France. As The Foil reported yesterday, a jury hearing found that the Black Foils could have sailed differently. The statement said: "Since all the teams, including NZL, were aware of the consequences of reaching the board protection limit, it was possible for NZL to have avoided passing that threshold by choosing a lower ride height and with less foil cant angle. The choice of ride height and foil cant angle is under the control of a boat and so it was reasonably possible for NZL to avoid the loss of control."',
      },
      {
        type: "paragraph",
        text: 'Asked what he thought about that finding, Gooderham commented: "It sounds a bit harsh. When we are sailing along a reach like that, you have so much going on and you are doing damn close to a hundred kilometres an hour. At the end of the day, you are trying to push as hard as you can, but you are also trying to make sure the five other people on the boat are safe.',
      },
      {
        type: "paragraph",
        text: '"There are so many variables. If the boat accelerates five kilometres an hour all of a sudden, the amount of lift you get out of a daggerboard is significantly more. That acceleration and deceleration can happen so quickly. To me, it sounds a bit harsh, but at the end of the day, it is on us to perform.',
      },
      {
        type: "paragraph",
        text: '"Every once in a while, somebody gets it wrong. They have to try and point a finger somewhere, and I guess that is where they have come to with that conclusion. You hate to see it, but unfortunately, it is part of the sport."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/uvmGDbpE8mfuYo1m0yqOS5qtIXNdTaXq_gFPwieJtjg/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/rp33387.jpg",
        alt: "Flight controller at work",
        caption:
          "Ricardo Pinto / SailGP. The most isolated job on board: flight controllers operate in a narrow window where every input directly shapes lift, speed, and safety. Leo Takahashi, Japan SailGP Team, Season 2",
      },
      {
        type: "heading",
        text: "An ever-changing machine",
      },
      {
        type: "paragraph",
        text: "Gooderham says that while the fundamental controls remain the same, he and his fellow flight controllers are always having to adapt to changes with the software, and occasionally when there are big hardware upgrades. \"From a control perspective, we have the major controls: daggerboard rake, rudder rake, and daggerboard cant. At any given time, you are adjusting all of those. But then there is also software in the boat, which is called the daggerboard protection software, but it is really more platform load protection to make it so that we don't have issues with platform structure.",
      },
      {
        type: "paragraph",
        text: "\"With the old HSB [High Speed Board] J-foil setup, there was a daggerboard load protection system. There was basically only so much negative rake you could get on the daggerboard to protect it from negative loading and snapping. That software basically carried over into the new HSB2 T-foil setup, but it is more of a platform load protection software to make sure we don't break components in the platform.",
      },
      {
        type: "paragraph",
        text: '"With the boards changing, that software is almost a live piece of software. Every time we go out on the water, the data team takes a look at it to see where the pitfalls are and where it is actually working properly. We adjust that from day to day or event to event. When we have an issue like we had in Auckland, we step back and take a huge look at it. We make adjustments to make sure it is doing what it needs to do to protect the structure of the boat, but also allowing the athletes to have control of the boat."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/-MtcDe_8uYi7mLI0bRP6Dh8jUDygN2zMi0AAv4Hvqo8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/northstar2.jpeg",
        alt: "NorthStar SailGP Team",
        caption: "NorthStar",
      },
      {
        type: "heading",
        text: "F1 parallels",
      },
      {
        type: "paragraph",
        text: 'While the sailors are having to adapt to an ever-changing platform, Gooderham accepts this as being part of a fast-developing technical sport. "If you look at any top-end racing sport, that is usually the key. You look at Formula One and they are putting different setups in the car every day. It is nothing new for high-end racing, but you do have a little bit of a different piece of machinery every day you go out.',
      },
      {
        type: "paragraph",
        text: '"The boats are quite identical, but we do have quite a lot of settings that we can change for personal preferences. We can change the gain rates with respect to how quickly the rake will move back and forth given the human input. We can change a whole host of settings. When you go through the data and look at the settings that each flight controller and each driver puts into their boat, they are different. The boats are one-design, but we have a ton of things we can change the same way that car one and car two in F1 might not be set up the same."',
      },
      {
        type: "paragraph",
        text: "Last season in Saint-Tropez, some teams including the Canadians experienced a loss of control that caused some concern at the time. \"After the events in Saint-Tropez, they [SailGP] had gotten quite concerned with the structural loads in the boat, so they dialled up this structural load limiter. On two occasions, we ran into the rake limiters. When the system calculates that the load in the platform is too much, it basically adds positive rake onto the daggerboard and takes control out of the flight controller's hands.",
      },
      {
        type: "paragraph",
        text: '"We ran into it twice on the Saturday in Saint-Tropez. Every day when we have an incident, we go back and study it, and then the software gets changed. We have had a number of iterations of the load protection software since that happened, but obviously, we found a new case in Auckland where it was going to kick in."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/dD7wB8WPHacR6BkwoXN-mZp8Le2mDkDDfraeUA3TtVk/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/rp2-3532.jpg",
        alt: "F50 at full speed",
        caption:
          "Ricardo Pinto / SailGP. Flat-out flight: at these speeds, the flight controller constantly balances maximum performance with the structural limits of the platform. Perth, Season 6",
      },
      {
        type: "heading",
        text: "Foot on the pedal",
      },
      {
        type: "paragraph",
        text: 'So does that mean there inevitably has to be a compromise between protecting the boat versus providing the sailor with enough range of control? "It is a delicate balance because the boat being in one piece is pretty critical to the safety of the sailors," says Gooderham. "I understand a lot about how these boats work, but I don\'t have the knowledge that the designers and engineers have. It is really hard for me to say where that fine line is on the edge. As an athlete, I want to have as much control as humanly possible; the word \'control\' is in the job description. But you have to weigh the engineering of the boat as well."',
      },
      {
        type: "paragraph",
        text: "Meanwhile, Gooderham knows he has to keep his head down and stay focused on that painted 'piece of tape'. But surely that big crash must have some effect on mindset? \"For me personally, I don't think it changed at all. You don't bear away and hit 102 kmh around the top mark [as Canada did during Auckland] if you are throttling back. The way these boats are, the safest you are is when you are pushing the boat hard. When you try and dial it back, that is when you really see yourself getting into trouble a lot of the time. My mentality is always foot on the gas pedal.\"",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control/",
    },
  },
  "the-week-in-racing-10-august-26": {
    slug: "the-week-in-racing-10-august-26",
    kind: "news",
    title: "The week in racing - 10 August '26",
    standfirst:
      "This week saw the Olympic fleets sign off a globe-trotting season on LA's 2028 waters, both New Zealand and France back in their AC75s, plus the start of a 1,805-mile epic around Britain and Ireland. Let's get into it!",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "10th August 2026 8:07pm",
    heroImage: {
      src: "https://thefoil.com/media/nHs32--yoraiaCEkMa8gq2a3P3YgNqcDcpzM3AZvODI/resize:fill-down:1500:500/gravity:fp:0.501010101:0.7302059011/quality:60/dpr:1/2026/08/ac75s-pierre-bouras-sam-thom-america-s-cup-png.png",
      alt: "The week in racing - 10 August '26",
    },
    body: [
      {
        type: "heading",
        text: "49er, FX & Nacra 17 fleets close out San Pedro OCR",
      },
      {
        type: "paragraph",
        text: "The San Pedro OCR concluded on Saturday, the skiffs and Nacras scrapping on the same patch of LA water they'll be back on come 2028. Six medal races in flat water and a puffy 16–20 knots, and everyone with a yellow bib on the final day held their nerve to convert it.",
      },
      {
        type: "paragraph",
        text: "In the 49er, Germany's Richard Schultheis and Fabian Rieger sealed gold, ahead of Britain's James Grummett and Rhos Hawes, with Uruguay's Hernán Umpierre and Fernando Diz third. Sweden's Vilma Bobeck and Ebba Berntsson had the 49erFX sewn up by a comfortable 17 points, well ahead of Paula Barcelo and Maria Cantero taking silver for Spain and Britain's Freya Black and Saskia Tidey. Meanwhile the Nacra 17 went right down to the wire: Swedes Emil Järudd and Hanna Jonsson clung on by a single point from the relentless British pair of John Gimson and Anna Burnet, with Dutch duo Willemijn Offerman and Scipio Houtman in third.",
      },
      {
        type: "paragraph",
        text: "That's it for the 2026 Sailing Grand Slam – keep an eye out for our full season wrap coming soon. Full results here.",
      },
      {
        type: "heading",
        text: "Cowes Week wraps up its bicentenary",
      },
      {
        type: "paragraph",
        text: "Cowes Week celebrated its 200th birthday last week, and the Solent laid on a bit of everything across seven days – a 20-knot opener, a rained-on Wednesday, near-30-knot gusts that sent the smaller boats home early, and a glassy, tactical finale. All told, the week featured 641 boats, more than 5,000 sailors, across 43 classes.",
      },
      {
        type: "paragraph",
        text: 'In X One Design, overall honours went to Lone Star, sailed by Phil Lawrence, David King and Nick Froud, who found the near-impossible consistency to win the biggest and most cut-throat class in the fleet – no mean feat against 59 rivals. "We were just blisteringly fast all week," Lawrence said of how they did it. Hong Kong\'s Karl Kwok took the big-boat silverware, his TP52 Beau Geste reeling off six straight bullets to sweep IRC Class Zero and pocket both the Britannia Cup and the New York Yacht Club Challenge Cup.',
      },
      {
        type: "paragraph",
        text: "The bicentenary threw up a brand-new prize, the Bicentenary Gold Cup, claimed by Andy Maskell's Contessa 33 High Spirit. The Black Group went to the last race, Ben Rogers' Contessa 32 Solan Goose just pipping Sam Laidlaw's Quarter Tonner BLT. And after a 50-year absence, the Folkboats were back as a class, Gybe N' taking the win for Cy Grisley and Simon Evans. Check results across all classes here.",
      },
      {
        type: "heading",
        text: "AC recon: ETNZ and La Roche-Posay back in the AC75",
      },
      {
        type: "paragraph",
        text: "Last week Emirates Team New Zealand rolled out their AC75 in Auckland for the first time in two months, kicking off a fortnight of mid-winter testing. With Nathan Outteridge, Andy Maloney, Iain Jensen and Jo Aleh in their usual slots – and Chris Draper back on second helm while Seb Menzies was off racing the 49er in LA – the opening day appeared to be all about straight-line speed rather than manoeuvres. The boat looked quick and settled, up on the foils without much fuss, the sense being of a team fine-tuning what they've got rather than chasing anything flashy.",
      },
      {
        type: "paragraph",
        text: "The French, meanwhile, will be breathing a lot easier than they were a month ago. That low-speed capsize, which flooded key electrical systems and sent up a worrying cloud of smoke, had threatened to stall the whole campaign, so getting back on the water and stringing together a proper, clean day on the foils is exactly what was needed. It seems they've made the most of being back: a cautious re-commissioning sail was followed by their longest session spent foiling of the campaign yet, including an opening run of around 35 minutes up and flying. On this evidence, the wobble of a month ago looks well behind them.",
      },
      {
        type: "paragraph",
        text: "Newcomer Maelenn Lemaitre – a multiple women's match-racing world champion drafted in barely a month ago – was still buzzing (and, by her own admission, slightly fried) after a day soaking up data, while 2025 Moth world champion Enzo Balanger added more firepower to a strong mixed crew. The team reckon the enforced downtime has let them settle into a slower, more deliberate rhythm, and while they trail the Kiwis and Italians on water time, they're comfortably ahead of the other three challengers, who have yet to launch their AC75s.",
      },
      {
        type: "heading",
        text: "Triantou and Gosling crowned at the ILCA 4 Youth Worlds",
      },
      {
        type: "paragraph",
        text: "In Aarhus, Denmark 448 young sailors from more than 50 nations took part in the ILCA 4 Youth World Championship for a windy, sun-soaked week on the bay. Greece's Eleni Triantou took the girls' title on her Worlds debut, holding it together on a nervy last day to seal the win. In the boys' fleet, Switzerland's Leo Gosling was a clear winner – the biggest result of his young career. \"I'm lost for words. It's not my first title, but this is definitely the biggest moment in my sailing career so far,\" the 15-year-old said after. And he's not done yet, sticking around to line up in next week's ILCA 6 Youth Worlds at the same venue. Full results here.",
      },
      {
        type: "heading",
        text: "TO WATCH THIS WEEK:",
      },
      {
        type: "heading",
        text: "74 boats line up for 470 Worlds in Japan",
      },
      {
        type: "paragraph",
        text: "Starting today, the 470s convene in Enoshima, Japan – the Tokyo 2020 venue, all thermal breeze and tricky tides – for a record 74-boat fleet drawn from 28 nations. Spain's Jordi Xammar arrives chasing a hat-trick of world titles alongside Marta Cardona, but he'll have his work cut out. Britain's Martin Wrigley and Bettine Harris are the form crew of the year, having swept the Europeans, World Cup wins in Palma and Hyères and, just a couple of weeks ago, the San Pedro OCR on the LA 2028 waters. Germany's Simon Diesch and Anna Markfort, last year's runners-up, and Sweden's returning Paris 2024 bronze medallists Anton Dahlberg and Lovisa Lindner round out a fearsome shortlist. \"It's really nice to be back in Japan,\" said Wrigley. \"We're really excited to try and put everything together for the biggest event of the year.\"",
      },
      {
        type: "paragraph",
        text: "Qualifying runs from 12–13 August, the fleet splits into Gold and Silver from the 14th, and the top ten settle it in the medal race on the 17th.",
      },
      {
        type: "heading",
        text: "Open Team Racing World Championships make their European debut",
      },
      {
        type: "paragraph",
        text: "Stockholm hosts the Team Racing World Championship from 12–16 August, the first time the competition has come to Europe. It'll take place right in the heart of the city on Riddarfjärden, in the shadow of City Hall, on a course barely 380 metres across. Twelve nations and 96 sailors will go at it in matched J/80s, two boats a side, in a mixed-crew format built on close-quarters manoeuvring, clever use of dirty air and the right-of-way rules, with umpires policing it all in real time. There'll be well over a hundred short, sharp races across the week, all free to watch from the quaysides.",
      },
      {
        type: "paragraph",
        text: 'Defending champions Tim Wadlow and Will Bailey, sailing for the USA, are the crew everyone will have their eyes on. "Racing in J/80s is new for us, so there\'s been a steep learning curve," says Bailey. "The races are short, intense and incredibly close. Anyone can win any race, which makes it exciting for sailors and spectators alike."',
      },
      {
        type: "heading",
        text: "Pace leads early as Round Britain and Ireland Race turns 50",
      },
      {
        type: "paragraph",
        text: "The RORC's Round Britain and Ireland Race set off from Cowes on Sunday for its 50th running, 32 boats and 182 sailors heading east into a light Solent breeze. Two hours in, Johnny Vincent's Volvo 70 Pace had nosed to the front, the German Ker 56 Varuna VI a mile back, while in the Class40s there was nothing between Pierre LeBoucher's Penfret and Greg Leonard's Swift. Early days, though – 1,800-odd miles is a very long time to stay in front.",
      },
      {
        type: "paragraph",
        text: 'Keep an eye on the IRC Zero heavyweights – Pace, Varuna VI and Antoine Magre\'s radical scow-bowed Palanad 4 – as they trade blows for line honours and the overall corrected-time prize. "This is probably one of the hardest races out there," says Magre. The Class40s settle it on elapsed time alone, and the newest scow-bowed designs from Britain, America and France might just threaten the record should the weather oblige. Track the fleet and check live rankings.',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/00zStfAC_EckhpiN1NuYbf9GrC4LNNwI-X_JkBfAS44/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rbi-james-tomlinson-rorc-1.jpeg",
        alt: "Start of 2026 RORC Round Britain and Ireland, Cowes",
        caption: "Start of 2026 RORC Round Britain and Ireland, Cowes",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-week-in-racing-10-august-26/",
    },
  },
  "podcast-america-s-cup-is-back-the-full-cagliari-debrief": {
    slug: "podcast-america-s-cup-is-back-the-full-cagliari-debrief",
    kind: "podcast",
    title: "Podcast: America's Cup is back! The full Cagliari debrief",
    standfirst:
      "The America's Cup is finally back, and after eighteen months of SailGP we'd almost forgotten how different it feels. So Neil Cole sits down with Freddie Carr and Lewis Smith – The Foil's new reporter and multimedia editor, just back from Cagliari – to dive into our very first taste of AC38 fleet racing.",
    publishedAt: "28th May 2026 3:00pm",
    heroImage: {
      src: "https://thefoil.com/media/QC63HrRW6EbWcsJUKFTuRGnQi13s8A0ewfrCmh2Y5vc/resize:fill-down:1500:500/gravity:fp:0.3041738136:0.4733671339/quality:60/dpr:1/2026/05/e8tkvl1yBE4.jpg",
      alt: "Podcast: America's Cup is back! The full Cagliari debrief",
    },
    body: [
      {
        type: "paragraph",
        text: 'Lewis was on the ground for (nearly) the whole weekend, and shares his hot take: he prefers the AC40s to the AC75s, seeing the smaller boats as more playful and fun to chuck about. He and Freddie dig into how all the racing unfolded, from the chop of day one to the great leveller of flat water on day three, and the autopilot "superpower" that had the Luna Rossa Women & Youth crew outclassing everyone – right up until it all unravelled.',
      },
      {
        type: "paragraph",
        text: "The guys discuss what it's like to come back to the Cup after living in SailGP – the longer races, the space on the course, the upwind starts, the joy of actually being able to hear the calls on board – and then run a quickfire vibe check on all eight teams.",
      },
      {
        type: "paragraph",
        text: "We've also got the news of a second prelim in Naples at the end of September, Freddie on the legal cloud hanging over Athena Racing, then it's a switch to SailGP and what's brewing in New York this weekend, where the question remains: who, if anyone, can stop the Aussies?",
      },
      {
        type: "paragraph",
        text: "00:00:00 Start 00:02:23 Comparing the America's Cup to SailGP 00:11:01 Luna Rossa Women & Youth dominate 00:17:03 Day two tactics and upwind starts 00:24:20 Day three and the dramatic OCS penalty 00:33:10 Match race final: Burling vs Outteridge 00:45:06 AC38 prelim team-by-team vibe check 00:51:42 SailGP calendar and New York preview",
      },
      {
        type: "paragraph",
        text: "This episode is brought to you by Saily, the eSIM built by the team behind NordVPN. Available across more than 200 destinations, with plans flexible enough for a weekend away or a full season chasing the SailGP circuit – no SIM swap, no roaming bill shock, no wandering foreign airports hunting for Wi-Fi. We use Saily ourselves when travelling to events, like we'll be doing in NYC this weekend. Download Saily from the app store and use code FOIL15 at checkout for 15% off your first purchase.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-america-s-cup-is-back-the-full-cagliari-debrief/",
    },
  },
  "podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup": {
    slug: "podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup",
    kind: "podcast",
    title: "Podcast: Can anyone beat New Zealand to win the 38th America's Cup?",
    publishedAt: "8th July 2026 6:11pm",
    heroImage: {
      src: "https://thefoil.com/media/yPhTQLNPYDhh1larcpaxD9E8my3E2TAWDKOF6MS44zU/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/07/foil-podcast-ep27.jpg",
      alt: "Can anyone beat New Zealand to win the 38th America's Cup?",
    },
    body: [
      {
        type: "paragraph",
        text: "A year out, The Foil's podcast team ask the key question: can any of the six teams lining up against the Defender really take on and beat Emirates Team New Zealand in Naples at the 38th America's Cup next July? We run through the teams to assess what we know so far.",
      },
      {
        type: "paragraph",
        text: 'ETNZ has Defender privilege – but under the rules of the new partnership arrangement, AC veteran Freddie Carr and Lewis Smith ask whether they have "depowered their advantage" by accepting Naples as the venue rather than racing on their own home waters.',
      },
      {
        type: "paragraph",
        text: 'On the point of home advantage, Freddie refers back to his own experience sailing with Luna Rossa in the AC World Series in Naples in 2012 and \'13, when he experienced his "rock star moment" in sailing firsthand. Racing at home really can make a difference.',
      },
      {
        type: "paragraph",
        text: 'As Lewis says, Luna Rossa was "a league ahead" in the recent Cagliari Prelim, and asks whether there might also be an operational advantage working from home.',
      },
      {
        type: "paragraph",
        text: "Meanwhile, The French La Roche-Posay team have hit the water in the past week and can make the most of 10 extra sailing days – even if they have capsized this week. Working out of same design stable as ETNZ, Lewis and Freddie weigh up their challenge.",
      },
      {
        type: "paragraph",
        text: "As for the Swiss Alinghi squad, question marks remain over their hardware following the huge capsize last time out in Barcelona, and they are pinned as a late starter too.",
      },
      {
        type: "paragraph",
        text: 'As for the official Challenger of Record, unashamed patriot Freddie labels GB1 as the "dark horse for this Cup", acknowledging the distracting context of the legal battle between Athena Racing and Ineos over the ownership of the British AC75.',
      },
      {
        type: "paragraph",
        text: 'The return of Australia is an exciting moment for the Cup, but the team has been up front and honest about their biggest challenge: a lack of time. Freddie describes them as "underdogs".',
      },
      {
        type: "paragraph",
        text: 'Finally, the USA. As Freddie puts it, they are "super under the radar" given the little amount of information that has been confirmed about the American effort. Lewis and Freddie then summarise the fleet and come up with the answers to that big leading question…',
      },
      {
        type: "paragraph",
        text: "Lewis also brings us news of The Foil Live, our first public event taking place on the morning of Sunday 26 July. We're taking over Musto's flagship Lighthouse store in Portsmouth ahead of the final day of racing at Emirates Great Britain SailGP for a live podcast – and it's free to attend. Get your free tickets here.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup/",
    },
  },
  "podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety": {
    slug: "podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety",
    kind: "podcast",
    title: "Podcast Ep. 8 - Sydney SailGP preview + Quentin Delapierre on safety",
    standfirst: "Sydney SailGP is almost here, but the Auckland collision casts a long shadow.",
    publishedAt: "25th February 2026 2:45pm",
    heroImage: {
      src: "https://thefoil.com/media/pf7Dl2EgbwypjxsUHwypXk4D79FhfHC2socID5hBH3A/resize:fill-down:1500:500/gravity:fp:0.4045977011:0.1304243587/quality:60/dpr:1/2026/02/S6ComfUT55I.jpg",
      alt: "Sydney SailGP preview + Quentin Delapierre on safety",
    },
    body: [
      {
        type: "paragraph",
        text: "In this week's episode, the team digs into one of the most consequential weekends in SailGP's seven-year history. France skipper Quentin Delapierre joins to fill us in about what happened in Auckland and what comes next. Manon Audinet spent over a week in hospital, and the French team has brought in a psychologist to support their athletes.",
      },
      {
        type: "paragraph",
        text: "Quentin's message is clear: injuries will happen in extreme sport. The question is how the league responds. Split fleets? Halos? Stronger pods? He believes the answers will come through collaboration – and he won't be walking away. \"I will not quit the league,\" he says. \"I'm fully into it, and I'm focused to win this championship one day. But some of the athletes have concerns, and that's normal.\"",
      },
      {
        type: "paragraph",
        text: "The podcast also previews Sydney's twilight racing, where shifty harbour breeze and the tactical puzzle of Shark Island await. With France and New Zealand sidelined, the championship door is open for teams who can seize the moment. Australia and Great Britain are the boats to beat on equal points at the top of the season leaderboard. But lighter winds could create opportunities nobody saw coming.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety/",
    },
  },
  "podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim": {
    slug: "podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim",
    kind: "podcast",
    title: "Podcast Extra: Mozzy and Freddie preview the AC38 Cagliari prelim",
    author: "Benedict Donovan",
    publishedAt: "21st May 2026 11:20am",
    heroImage: {
      src: "https://thefoil.com/media/UeWPuJPQDhw_-gljypBbZ6nw9GehhvubDGSE222Hq9A/resize:fill-down:1500:500/gravity:fp:0.1914893617:0.4600980829/quality:60/dpr:1/2026/05/A8I5xxHXMuY.jpg",
      alt: "Mozzy and Freddie preview the AC38 Cagliari prelim",
    },
    body: [
      {
        type: "paragraph",
        text: "Mozzy and Freddie are back with a bonus podcast, previewing the AC38 Cagliari preliminary regatta, the curtain-raiser on the road to Naples.",
      },
      {
        type: "paragraph",
        text: "With only 11 of last Cup's AC75 sailors returning to the racecourse, and a fresh wave of names making their debuts, this opening regatta in Sardinia feels less like a tune-up and more like the moment the next America's Cup cycle properly begins.",
      },
      {
        type: "paragraph",
        text: "Mozzy and Freddie work through every announced crew list – from Emirates Team New Zealand's Outteridge–Menzies pairing and the lingering Blair Tuke question, to GB1's surprising helm call, Athena Racing's two-female-helm setup, Luna Rossa's almost-too-stacked talent pool, Alinghi's freshly assembled lineup, and the French team's combination that could yet emerge as the dark horse of the weekend.",
      },
      {
        type: "paragraph",
        text: "The Cagliari prelim also marks the first time we'll see B-boat sailors racing for seats on the AC75 itself – a significant format change that could reshape squad dynamics across every syndicate as the fleet builds towards Naples 2027.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim/",
    },
  },
  "podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20": {
    slug: "podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20",
    kind: "podcast",
    title: 'Podcast: "It starts with a dream": Glenn Ashby on Australia\'s AC38 challenge - The Foil Podcast - Ep 20',
    standfirst:
      "\"The time is now,\" decorated sailor Glenn Ashby tells The Foil's Freddie Carr in an exclusive interview on Team Australia's newly-minted challenge for the 38th America's Cup.",
    publishedAt: "21st May 2026 8:10am",
    heroImage: {
      src: "https://thefoil.com/media/A38UovWqdi6h-hsoVQI85zueeFhIOqCmeU0LsevVTMY/resize:fill-down:1500:500/gravity:fp:0.4638297872:0.294248774/quality:60/dpr:1/2026/05/SUASYivtly8.jpg",
      alt: "Glenn Ashby on Australia's AC38 challenge",
    },
    body: [
      {
        type: "paragraph",
        text: 'In a long-promised one-on-one with The Foil, Ashby tells his old friend about how Australia\'s return to the Cup for the first time since 2000 came together, and how by the end of this year an expansion to "80-100 people" must be complete.',
      },
      {
        type: "paragraph",
        text: "The feeling and process of building up a team from scratch carries echoes for Ashby of his part in Emirates Team New Zealand's victory in the 2017 Cup in Bermuda. He also reflects on the technical support from the Kiwi effort this time via the shared design philosophy. \"We wouldn't be in Naples next year without the support of ETNZ,\" he admits.",
      },
      {
        type: "paragraph",
        text: "Ashby predicts much tighter performance between the teams than we saw in the 2024 AC37 in Barcelona, and explains what success will look like for the Australians following their relatively late entry for Naples.",
      },
      {
        type: "paragraph",
        text: "Before the Ashby interview, The Foil's team discuss other matters of the moment, including the 49er, 49FX and Nacra 17 World Championships in France. Andy Rice, who was part of the live stream commentary team in Quiberon Bay, gives us the lowdown and presents a pair of interviews: one with new 49er World Champions Seb Menzies and George Lee Rush, the other with Gianluigi Ugolini and Maria Giubilei who clinched the Nacra 17 crown.",
      },
      {
        type: "paragraph",
        text: "NEXT UP: PODCAST EXTRA Keep an eye on the channel this week for an extra show, as Tom 'Mozzy' Morris and Freddie Carr preview the AC38 Preliminary Regatta which takes place in Cagliari this weekend. The duo dissect the teams and crew line-ups as the build-up to Naples in 2027 properly begins.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20/",
    },
  },
  "podcast-sailgp-vs-america-s-cup-can-they-coexist": {
    slug: "podcast-sailgp-vs-america-s-cup-can-they-coexist",
    kind: "podcast",
    title: "Podcast: SailGP vs America's Cup: Can they coexist?",
    standfirst: "Sailing has never been healthier – and on this week's pod, that's exactly the problem.",
    publishedAt: "2nd July 2026 11:18am",
    heroImage: {
      src: "https://thefoil.com/media/tOANz4G66QsEXxzLuN5fNrcEQq6r6_9UNtcYMdlq1dI/resize:fill-down:1500:500/gravity:fp:0.4962835906:0.6871458395/quality:60/dpr:1/2026/07/pod26thumb.jpg",
      alt: "SailGP vs America's Cup: Can they coexist?",
    },
    body: [
      {
        type: "paragraph",
        text: "Episode 26 sees Neil Cole, Andy Rice, Lewis Smith and Freddie Carr wrestle with a question that's been sitting uncomfortably in the background: with SailGP, AmericasCup and the Olympics all booming at once, can they share a calendar – or will they start eating each other alive?",
      },
      {
        type: "paragraph",
        text: "The team trace the rivalry back to Bermuda 2017 and the framework agreement Grant Dalton never signed, then lay out just how tight the 2027 calendar really is – nine SailGP weekends, new AC75s splashing and a Cup to be won, plus an Olympic qualification cycle all fighting for the same patch of summer.",
      },
      {
        type: "paragraph",
        text: "Freddie, who knows the Cup's demands better than most, weighs life-changing SailGP prize money against the historical pull of helming a Cup boat, while Lewis – a former World Sailing insider – explains why the governing body faces an almost impossible juggling act. There's a hard look at the cautionary tale of golf's PGA–LIV war, a debate over who actually has the clout to knock heads together, and a real worry that the Olympics, and the women and youth coming through, could be the ones squeezed out.",
      },
      {
        type: "paragraph",
        text: "There's also offshore news, a look at Foiling Week, and a closing poll that has the panel split. Which one would you go for: SailGP riches, an Olympic gold, or the Auld Mug?",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-sailgp-vs-america-s-cup-can-they-coexist/",
    },
  },
  "podcast-the-six-american-sailors-chosen-to-take-back-the-cup": {
    slug: "podcast-the-six-american-sailors-chosen-to-take-back-the-cup",
    kind: "podcast",
    title: "Podcast: The six American sailors chosen to take back the Cup",
    publishedAt: "12th August 2026 9:45am",
    heroImage: {
      src: "https://thefoil.com/media/sQjWE4fE-gq9mwrgjJduvJZsZt0ybiUE0r7bgP0IvYk/resize:fill-down:1500:500/gravity:fp:0.52:0.4050162564/quality:60/dpr:1/2026/08/foil-podcast-ep33-thumb.png",
      alt: "The six American sailors chosen to take back the Cup",
    },
    body: [
      {
        type: "paragraph",
        text: "The America's Cup teams are taking shape, and this week there are some fascinating new names entering the picture.",
      },
      {
        type: "paragraph",
        text: "Lewis Smith, Andy Rice and Neil Cole look at the newly announced United States America's Cup crew, the strong crossover with the US SailGP Team and one particularly notable omission: Taylor Canfield. Could he still join the campaign, and how much catching up does the new American challenger have to do before Naples?",
      },
      {
        type: "paragraph",
        text: "There's also a major development for GB1 with Jemima Lines confirmed as the fifth sailor aboard the AC75, before attention turns to LA 2028. With Olympic sailors getting their first proper taste of the waters off Los Angeles, we look at what they're already learning about the venue, some impressive early performances and the sailors attempting to balance Olympic campaigns with SailGP and America's Cup commitments.",
      },
      {
        type: "paragraph",
        text: "Plus, Andy pays tribute to legendary sailing photographer Carlo Borlenghi, and we catch up on the latest from the 470 Worlds and the Round Britain and Ireland Race.",
      },
      {
        type: "paragraph",
        text: "This episode is brought to you by Saily, the eSIM built by the team behind NordVPN. Available across more than 200 destinations, with plans flexible enough for a weekend away or a full season chasing the SailGP circuit – no SIM swap, no roaming bill shock, no wandering foreign airports hunting for Wi-Fi. We use Saily ourselves when travelling to events, like we'll be doing in Sassnitz next week. Download Saily from the app store and use code FOIL15 at checkout for 15% off your first purchase.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-the-six-american-sailors-chosen-to-take-back-the-cup/",
    },
  },
  "emirates-dubai-sail-grand-prix-presented-by-dp-world": {
    slug: "emirates-dubai-sail-grand-prix-presented-by-dp-world",
    kind: "event",
    title: "Emirates Dubai Sail Grand Prix, presented by DP World",
    standfirst:
      "Dubai has been a calendar fixture since Season 3, maintaining its presence through commercial considerations alongside varying wind conditions.",
    heroImage: {
      src: "https://thefoil.com/media/0-4ZPRNgFckWAz7FKyqDYFOfQx7JUCwAVYrpYm2CtgM/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2025/12/felix-diemer-sailgp-1.png",
      alt: "Emirates Dubai Sail Grand Prix, presented by DP World",
    },
    body: [
      {
        type: "paragraph",
        text: "Dubai has been a calendar fixture since Season 3, maintaining its presence through commercial considerations alongside varying wind conditions.",
      },
      {
        type: "paragraph",
        text: "The venue is characterized by slow, tactical racing requiring a distinct skill set. New Zealand dominated the past two seasons with consecutive event wins, utilizing patient sailing strategies. Combined with Abu Dhabi, this represents a late-season stretch where light-air proficiency significantly influences championship outcomes. November weather provides warm conditions and evening cultural activities for spectators, though on-water action may lack dramatic moments.",
      },
      {
        type: "paragraph",
        text: "Past Winners: Australia (Season 3), New Zealand (Seasons 4 + 5).",
      },
    ],
    eventDate: "21 - 22 Nov 2026",
    location: "Dubai, United Arab Emirates",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/emirates-dubai-sail-grand-prix-presented-by-dp-world/",
    },
  },
  "france-sail-grand-prix-saint-tropez": {
    slug: "france-sail-grand-prix-saint-tropez",
    kind: "event",
    title: "France Sail Grand Prix | Saint-Tropez",
    standfirst: "SailGP returns to the French Riviera as the fleet lines up off Saint-Tropez.",
    heroImage: {
      src: "https://thefoil.com/media/AkEim6m0U1cJz2068elEZnJEdGZzKG6_RMvmMZ0HojI/resize:fill-down:690:388/gravity:fp:0.5127659574:0.5173727167/quality:60/dpr:2/2026/06/sv3-3959-samo-vidic-for-sailgp.jpg",
      alt: "France Sail Grand Prix, Saint-Tropez",
    },
    eventDate: "26 - 27 Sept 2026",
    location: "Saint-Tropez, France",
    body: [
      {
        type: "paragraph",
        text: "The SailGP circuit heads to the Cote d'Azur for the France Sail Grand Prix, with the F50 fleet racing in the bay off Saint-Tropez across a two-day weekend of fleet racing and a podium final.",
      },
      {
        type: "paragraph",
        text: "Expect close, high-speed action in the Mediterranean breeze as the season's title contenders trade places on the leaderboard ahead of the Grand Final.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/",
    },
  },
  "mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council": {
    slug: "mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council",
    kind: "event",
    title: "Mubadala Abu Dhabi Sail Grand Prix 2026 Season Grand Final, presented by Abu Dhabi Sports Council",
    standfirst:
      "A season's worth of drama, a year of grinding through conditions from Perth's howling Doctor to Halifax's frosty chaos, and it all comes down to... a light-wind lottery in the Gulf. Make of that what you will.",
    heroImage: {
      src: "https://thefoil.com/media/u_3RZoIvGq64-515eZqIMQqFZqGzchgeK_K1ltOQmRo/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-5-1.png",
      alt: "Mubadala Abu Dhabi Sail Grand Prix 2026 Season Grand Final, presented by Abu Dhabi Sports Council",
    },
    body: [
      {
        type: "paragraph",
        text: "Abu Dhabi inherited Grand Final duties from San Francisco in Season 5, and the 2026 calendar keeps it there. The conditions are predictable: flat water, fickle breeze, boats spending uncomfortable amounts of time off the foils.",
      },
      {
        type: "paragraph",
        text: "Speed demons will grumble that a championship shouldn't hinge on whoever catches the right shift at the right moment. That said, Season 5 made a surprisingly strong case for itself. Denmark shook off their usual mid-fleet results to snatch their first event win, and the winner-takes-all final saw all three boats trading the lead before Great Britain ultimately prevailed over Australia and New Zealand. Edge-of-your-seat stuff, even at walking pace.",
      },
      {
        type: "paragraph",
        text: "Light air compresses the fleet, amplifies errors, and keeps overtakes possible deep into the race. It's not the spectacle San Francisco used to provide, but it's volatile in its own way. Whether that's a worthy stage for a title decider depends on what you think sailing should look like.",
      },
      {
        type: "paragraph",
        text: "Past winners: New Zealand (Season 4), Denmark (Season 5)",
      },
    ],
    eventDate: "28 - 29 Nov 2026",
    location: "Abu Dhabi, United Arab Emirates",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council/",
    },
  },
  "rockwool-germany-sail-grand-prix-sassnitz": {
    slug: "rockwool-germany-sail-grand-prix-sassnitz",
    kind: "event",
    title: "Rockwool Germany Sail Grand Prix | Sassnitz",
    standfirst:
      "Nobody had heard of Sassnitz. A small town on Rügen Island, miles from anywhere, about as far from Manhattan's skyline or the Riviera's superyachts as the circuit gets.",
    heroImage: {
      src: "https://thefoil.com/media/XX6QIScWVaKxTXPixNeZYYS4qKY5vjp5_F7nc5CEq2E/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
      alt: "Rockwool Germany Sail Grand Prix | Sassnitz",
    },
    body: [
      {
        type: "paragraph",
        text: "And yet the Season 5 debut venue turned out to be one of the best events on the calendar. Flat water, reliable breeze, and a tight stadium course that had sailors raving by the end of the weekend. Denmark used the conditions to reach a whopping 103.93 km/h, a new SailGP speed record. Spectators watched from the clifftops with sightlines most venues would kill for.",
      },
      {
        type: "paragraph",
        text: "Then there was the drama. In two unrelated incidents, training day saw Brazil suffer structural damage and France's rudder fail within twenty seconds of each other. France's Quentin Delapierre ended up in hospital. His crew rebuilt the boat overnight, he was discharged, and days later the French stood on top of the podium having beaten Australia and Great Britain in the Final. Fairytale stuff, and exactly why Sassnitz won't be forgotten in a hurry.",
      },
      {
        type: "paragraph",
        text: "Past winners: France (Season 5)",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/DM82DNXZ1lF7feoOTnLuM5oggQFj5FXqry1KL0hnlUQ/resize:fill-down:460:240/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/08/jl108682-1.jpg",
        alt: "Rockwool Germany Sail Grand Prix | Sassnitz",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/gUlndc801kA1Z-tweul-3LxIh_CtJC3te21BM-8cTjg/resize:fill-down:460:240/gravity:fp:0.3326984127:0.3358586792/quality:60/dpr:1/2026/08/formulawingworlds-iwsa-media-robert-hajduk.jpg",
        alt: "Rockwool Germany Sail Grand Prix | Sassnitz",
      },
    ],
    eventDate: "22 - 23 Aug 2026",
    location: "Sassnitz, Rügen Island, Germany",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/rockwool-germany-sail-grand-prix-sassnitz/",
    },
  },
  "rolex-switzerland-sail-grand-prix-geneva": {
    slug: "rolex-switzerland-sail-grand-prix-geneva",
    kind: "event",
    title: "Rolex Switzerland Sail Grand Prix | Geneva",
    standfirst:
      "SailGP has raced at some stunning locations, but Geneva might just top the lot. A vast freshwater lake ringed by snow-capped Alps, with the city's elegant waterfront providing a postcard-perfect backdrop, it's the kind of venue that makes you wonder why it took until Season 5 for it to appear on the calendar.",
    heroImage: {
      src: "https://thefoil.com/media/JGHXPT1Mc8OEpoT9eNAlSIbi-94ud0Ff6dIegvAcxxM/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/01/sailgp-geneva-event.png",
      alt: "Rolex Switzerland Sail Grand Prix | Geneva",
    },
    body: [
      {
        type: "paragraph",
        text: "The debut event in September 2025 delivered exactly what Lake Geneva's reputation promised: light, unstable breeze that tested the fleet's limits. The first day of racing brought 6-8 knots, enough to keep the F50s flying in the tiniest puffs, but on Day 2 that dropped to 5 knots or even less, forcing crews down to just three sailors per boat to keep them foiling. It was fluky, patchy, and wildly unpredictable – leaders lapping the fleet one minute, the entire order flipping the next.",
      },
      {
        type: "paragraph",
        text: "As the final European stop before the season heads to the UAE for its double-header finale, Geneva's light-air lottery could be ideal preparation for what typically awaits in the Middle East. The conditions may not be quite so marginal in 2026, but teams would be wise to expect another proper test of nerve and flight control in minimal breeze.",
      },
      {
        type: "paragraph",
        text: "Germany claimed the maiden Geneva event – their first-ever SailGP victory – holding off the formidable Flying Roos in tricky conditions. For home favourites Switzerland, finishing third was solid but tinged with disappointment given the weight of expectation from the thousands of fans lining the shores. Winning in front of that crowd will be high on the agenda when the championship returns.",
      },
      {
        type: "paragraph",
        text: "Past winners: Germany (Season 5)",
      },
    ],
    eventDate: "19 - 20 Sep 2026",
    location: "Geneva, Switzerland",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/rolex-switzerland-sail-grand-prix-geneva/",
    },
  },
  "spain-sail-grand-prix-valencia": {
    slug: "spain-sail-grand-prix-valencia",
    kind: "event",
    title: "Spain Sail Grand Prix | Valencia",
    standfirst:
      "Valencia is back on sailing's grand stage. Nearly two decades after hosting the America's Cup, the Spanish city returns to top-flight racing with a three-year SailGP commitment running through 2028. For a venue with this much heritage, it feels overdue.",
    heroImage: {
      src: "https://thefoil.com/media/E3m7XLG2Vu4VyAUBq-bE-Vypm0w4zciUOvas0JSOtwc/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/01/nochesanjuan-valencia-4-1.jpg",
      alt: "Spain Sail Grand Prix | Valencia",
    },
    body: [
      {
        type: "paragraph",
        text: "The America's Cup came here in 2007 and 2010 – the first time the Auld Mug had ventured to European waters – and the infrastructure built for those campaigns still stands. The Veles e Vents building and Marina Real transformed the port into a purpose-built sailing hub, and while those events carried their share of financial headaches and controversy (the 2010 multihull match was... divisive), Valencia proved it could deliver world-class racing.",
      },
      {
        type: "paragraph",
        text: "The switch from Cádiz, which hosted four successful seasons, trades Atlantic swell for Mediterranean reliability. September should serve up Valencia's characteristic thermal breezes – the south-westerly Garbí and south-easterly Llebeig – along with low swell and temperatures around 30°C. Flat water and consistent sea breeze is a combination that suits the F50s nicely, though anyone expecting a guaranteed full-power venue should temper expectations. Similar Mediterranean stops have occasionally required light-wind configurations when the thermals don't cooperate.",
      },
      {
        type: "paragraph",
        text: "Slotting in as event 10 of 13, Valencia arrives at a pivotal point in the season. Championship positions will be crystallising, pressure mounting, and the Spanish Season 4 champions will face the familiar weight of home expectation. Whether they can finally deliver a home victory remains the question – Spain's record on their own water has been curiously underwhelming given their global form.",
      },
      {
        type: "paragraph",
        text: "Past winners: N/A (new venue)",
      },
    ],
    eventDate: "5 - 6 Sep 2026",
    location: "Valencia, Spain",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/spain-sail-grand-prix-valencia/",
    },
  },
};

/**
 * Look up an article by its slug.
 *
 * This is the single seam between the article pages and their content source.
 * It currently reads the static snapshot in `article-content.ts`; swap the body
 * for a DB/API call (the snapshot was captured from that same source) and every
 * consumer keeps working unchanged.
 */
export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLE_CONTENT[slug];
}

/**
 * Resolve an on-domain article link (relative or absolute) to local article data.
 * Returns `undefined` for external/unrecognised paths so callers can preserve the
 * link's normal navigation instead of opening an empty inline reader.
 */
export function getArticleByHref(href: string, expectedOrigin?: string): Article | undefined {
  try {
    const base = expectedOrigin ?? "https://genuin.invalid";
    const url = new URL(href, base);
    if (expectedOrigin && url.origin !== new URL(expectedOrigin).origin) return undefined;
    const { pathname } = url;
    const match = pathname.match(/^\/article\/([^/]+)\/?$/);
    if (!match?.[1]) return undefined;
    return getArticleBySlug(decodeURIComponent(match[1]));
  } catch {
    return undefined;
  }
}

/** Every known article slug — used by the route's `generateStaticParams`. */
export function getAllArticleSlugs(): string[] {
  return Object.keys(ARTICLE_CONTENT);
}

/**
 * The on-domain route for an article slug. Home-page cards link here instead of
 * the external thefoil.com URL, so clicks stay on the current domain.
 */
export function articleHref(slug: string): string {
  return `/article/${slug}`;
}
