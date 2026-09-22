import type { Meta, StoryObj } from "@storybook/react-vite";

import { IHeartAudioCarousel } from "./iheart-audio-carousel";
import type { IHeartAudioCarouselItem } from "./iheart-audio-carousel.types";

const STATIONS: IHeartAudioCarouselItem[] = [
  {
    id: "z100-1469",
    brand: "iHeart",
    heading: "Z100",
    subheading: "New York's Hit Music Station",
    image: {
      src: "https://i.iheart.com/v3/re/assets/images/1469.png?ops=fit(240%2C240)",
      alt: "Z100",
    },
    audioAttributes: { type: "station", station_id: "z100-1469" },
  },
  {
    id: "939-fm-wnyc-5068",
    brand: "iHeart",
    heading: "93.9 FM WNYC",
    subheading: "New York Public Radio",
    image: {
      src: "https://i.iheart.com/v3/re/assets/images/5068.png?ops=fit(240%2C240)",
      alt: "93.9 FM WNYC",
    },
    audioAttributes: { type: "station", station_id: "939-fm-wnyc-5068" },
  },
  {
    id: "elvis-duran-26935920",
    brand: "iHeart",
    heading: "Elvis Duran Show",
    subheading: "The Elvis Duran and the Morning Show",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/26935920?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "Elvis Duran Show",
    },
    audioAttributes: { type: "podcast", podcast_id: "1014-elvis-duran-and-the-morni-26935920" },
  },
  {
    id: "breakfast-club-24992238",
    brand: "iHeart",
    heading: "The Breakfast Club",
    subheading: "The world's most dangerous morning show",
    image: {
      src: "https://i.iheart.com/v3/catalog/podcast/24992238?cacheable=true&ops=ratio%281%2C1%29%2Cscale%28164%2C0%29%2Cgravity%28%22center%22%29%2Cformat%28%22webp%22%29%2Cquality%2875%29",
      alt: "The Breakfast Club",
    },
    audioAttributes: { type: "podcast", podcast_id: "51-the-breakfast-club-24992238" },
  },
  {
    id: "power-1051-1481",
    brand: "iHeart",
    heading: "Power 105.1",
    subheading: "New York's Hip Hop and R&B",
    image: {
      src: "https://i.iheart.com/v3/re/assets/images/1481.png?ops=fit(240%2C240)",
      alt: "Power 105.1",
    },
    audioAttributes: { type: "station", station_id: "power-1051-1481" },
  },
  {
    id: "kfi-177",
    brand: "iHeart",
    heading: "KFI AM 640",
    subheading: "More Stimulating Talk",
    image: {
      src: "https://i.iheart.com/v3/re/assets/images/177.png?ops=fit(240%2C240)",
      alt: "KFI AM 640",
    },
    audioAttributes: { type: "station", station_id: "177" },
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
