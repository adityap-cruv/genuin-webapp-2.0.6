import type { Meta, StoryObj } from "@storybook/react-vite";

import { IHeartAudioCarousel } from "./iheart-audio-carousel";
import type { IHeartAudioCarouselItem } from "./iheart-audio-carousel.types";

const IHEART_AUDIO_BASE_URL = "https://iheart-audio-files.s3.ap-south-1.amazonaws.com/audio/iheart";

const STATIONS: IHeartAudioCarouselItem[] = [
  {
    id: "the-herd-mnf-reaction",
    brand: "iHeart",
    heading: "The Herd with Colin Cowherd",
    subheading: "3 & Out - MNF Reaction, NFL Week 2 Mailbag",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/27332740?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "The Herd with Colin Cowherd",
    },
    audioSrc: `${IHEART_AUDIO_BASE_URL}/the-herd-mnf-reaction.mp3`,
  },
  {
    id: "the-herd-michael-irvin",
    brand: "iHeart",
    heading: "The Herd with Colin Cowherd",
    subheading: "Hour 3 - Michael Irvin stops by The Herd",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/27332740?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "The Herd with Colin Cowherd",
    },
    audioSrc: `${IHEART_AUDIO_BASE_URL}/the-herd-michael-irvin.mp3`,
  },
  {
    id: "pat-mcafee-week-2-recap",
    brand: "iHeart",
    heading: "The Pat McAfee Show",
    subheading: "NFL Week 2 Recap, MNF Preview and Picks",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/29837505?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "The Pat McAfee Show",
    },
    audioSrc: `${IHEART_AUDIO_BASE_URL}/pat-mcafee-week-2-recap.mp3`,
  },
  {
    id: "pat-mcafee-tnf-recap",
    brand: "iHeart",
    heading: "The Pat McAfee Show",
    subheading: "Thursday Night Football Recap and NFL Week 2 Preview",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/29837505?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "The Pat McAfee Show",
    },
    audioSrc: `${IHEART_AUDIO_BASE_URL}/pat-mcafee-tnf-recap.mp3`,
  },
  {
    id: "pardon-my-take-week-2",
    brand: "iHeart",
    heading: "Pardon My Take",
    subheading: "NFL Week 2, Jayden and Caleb Go Down",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/28312029?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "Pardon My Take",
    },
    audioSrc: `${IHEART_AUDIO_BASE_URL}/pardon-my-take-week-2.mp3`,
  },
  {
    id: "pardon-my-take-bills-week-2",
    brand: "iHeart",
    heading: "Pardon My Take",
    subheading: "The Bills Offense, NFL Week 2 Picks and Preview",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/28312029?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "Pardon My Take",
    },
    audioSrc: `${IHEART_AUDIO_BASE_URL}/pardon-my-take-bills-week-2.mp3`,
  },
  {
    id: "new-heights-ep-201",
    brand: "iHeart",
    heading: "New Heights with Jason & Travis Kelce",
    subheading: "Walker Runs Wild, Why NFL Offenses Are Back",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/101744292?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "New Heights with Jason and Travis Kelce",
    },
    audioSrc: `${IHEART_AUDIO_BASE_URL}/new-heights-ep-201.mp3`,
  },
  {
    id: "dan-patrick-football",
    brand: "iHeart",
    heading: "The Dan Patrick Show",
    subheading: "Hour 1 - Football, Football, Football!",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/60330018?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "The Dan Patrick Show",
    },
    audioSrc: `${IHEART_AUDIO_BASE_URL}/dan-patrick-football.mp3`,
  },
];

const meta = {
  title: "Organisms/IHeartAudioCarousel",
  component: IHeartAudioCarousel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", padding: "20px", background: "white" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    stations: STATIONS,
    cardWidth: 332,
    cardHeight: 120,
    imageSize: 48,
    playButtonSize: 40,
    gap: 8,
    ariaLabel: "iHeart audio stations",
  },
} satisfies Meta<typeof IHeartAudioCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
