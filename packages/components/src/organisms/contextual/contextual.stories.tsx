import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { setDeviceMode } from "../../../.storybook/preview";

import {
  Contextual,
  type ContextualLinkMetaData,
  type ContextualProps,
  type ContextualVideoMetaData,
} from "./contextual";

const THUMBNAIL = "https://media.qa.begenuin.com/uploads/thumbnails/l/6836cee27905e673ee76fdbc_1786616163523.png";

const VIDEO_RESPONSE: ContextualVideoMetaData[] = [
  {
    video_id: "video-1",
    source: "https://vz-eee5e913-a30.b-cdn.net/0141acec-43c4-4247-9ff9-3938325aeae7/playlist.m3u8",
    title: "SailGP and America's Cup: can they coexist?",
    poster:
      "https://thefoil.com/media/yFRhsJzpxkDunQ0T2uGeSr1J4pYf2zSVzmfOkawpU3o/resize:fill-down:460:240/gravity:fp:0.4962835906:0.6871458395/quality:60/dpr:1/2026/07/pod26thumb.jpg",
    community_id: "comm-1",
    group_id: "group-1",
    metaText: "Jan 5 • 1m 30s • Short clip description for article 1",
  },
  {
    video_id: "video-2",
    source: "https://vz-eee5e913-a30.b-cdn.net/66005c38-4691-4b7c-be15-dc24544c145d/playlist.m3u8",
    title: "America's Cup is back",
    poster:
      "https://thefoil.com/media/inir3oJzpxkDunQ0T2uGeSr1J4pYf2zSVzmfOkawpU3o/resize:fill-down:360:200/gravity:fp:0.3041738136:0.4733671339/quality:60/dpr:2/2026/05/e8tkvl1yBE4.jpg",
    community_id: "comm-2",
    group_id: "group-2",
    metaText: "Jan 6 • 1m 10s • Short clip description for article 2",
  },
  {
    video_id: "video-3",
    source: "https://vz-eee5e913-a30.b-cdn.net/63d1c2e2-40ac-4f79-9b07-0391a10b74f6/playlist.m3u8",
    title: "Jet fighters dancing on water",
    poster:
      "https://thefoil.com/media/-UVLF5J_0v84UcmfLGv0eZxRdWjENlFHDGbr_OqpLww/resize:fill-down:360:200/gravity:fp:0.5:0.5/quality:60/dpr:2/2026/05/2zBK_WJOXyM.jpg",
    community_id: "comm-3",
    group_id: "group-3",
    metaText: "Jan 7 • 2m 05s • Short clip description for article 3",
  },
  {
    video_id: "video-4",
    source: "https://vz-eee5e913-a30.b-cdn.net/14c53e73-6f4e-4c63-b2f3-1f6eb1d0e4ff/playlist.m3u8",
    title: "The technology behind modern foiling",
    poster:
      "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
    community_id: "comm-4",
    group_id: "group-4",
    metaText: "Jan 8 • 0m 58s • Short clip description for article 4",
  },
];

const ARTICLE_RESPONSE: ContextualLinkMetaData[] = [
  {
    video_id: "video-1",
    title: "SailGP and America's Cup: can they coexist?",
    link: "/articles/video-1",
    image: VIDEO_RESPONSE[0].poster,
    description: "The teams and tactics shaping the future of international sailing.",
  },
  {
    video_id: "video-2",
    title: "America's Cup is back",
    link: "/articles/video-2",
    image: VIDEO_RESPONSE[1].poster,
    description: "A complete debrief from the opening race weekend in Cagliari.",
  },
  {
    video_id: "video-3",
    title: "Jet fighters dancing on water",
    link: "/articles/video-3",
    image: VIDEO_RESPONSE[2].poster,
    description: "How Luna Rossa lit up the first event of the new cycle.",
  },
  {
    video_id: "video-4",
    title: "The technology behind modern foiling",
    link: "/articles/video-4",
    image: VIDEO_RESPONSE[3].poster,
    description: "Inside the control systems powering high-speed race boats.",
  },
];

function ContextualDemo(args: ContextualProps) {
  setDeviceMode("desktop");
  const [activeVideoId, setActiveVideoId] = useState<string>(VIDEO_RESPONSE[0].video_id);

  return (
    <Contextual
      {...args}
      activeVideoId={activeVideoId}
      onActiveVideoChange={(video) => {
        setActiveVideoId(video.video_id);
        args.onActiveVideoChange?.(video);
      }}
      onArticleClick={(article, index, linkedVideo) => {
        if (linkedVideo?.video_id) {
          setActiveVideoId(linkedVideo.video_id);
        }
        args.onArticleClick?.(article, index, linkedVideo);
      }}
      videos={VIDEO_RESPONSE}
      articles={ARTICLE_RESPONSE}
      header={args.header}
    />
  );
}

const meta = {
  title: "Organisms/Contextual",
  component: Contextual,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    header: {
      iconUrl: THUMBNAIL,
      iconAlt: "Sailing",
      heading: "Latest Videos",
      subHeading: "Fresh Insights",
    },
    animationDurationMs: 450,
    onArticleClick: fn(),
    onActiveVideoChange: fn(),
  },
  render: (args) => <ContextualDemo {...(args as ContextualProps)} />,
} satisfies Meta<typeof Contextual>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoWayVideoMapping: Story = {
  play: async ({ args, canvasElement }) => {
    const getCards = () => canvasElement.querySelectorAll<HTMLElement>('[data-slot="hover-link-card-item"]');
    const getCardByVideoId = (videoId: string) =>
      Array.from(getCards()).find((item) => item.dataset.videoId === videoId) ?? null;

    await expect(getCards()).toHaveLength(4);
    await expect(getCards()[0]).toHaveAttribute("data-video-id", "video-1");
    await expect(getCards()[0]).toHaveAttribute("data-expanded", "true");

    const card3 = getCardByVideoId("video-3");
    expect(card3).not.toBeNull();
    await userEvent.click(card3!);
    await waitFor(() => {
      const selectedCard = getCardByVideoId("video-3");
      expect(selectedCard).toBeDefined();
      expect(selectedCard).toHaveAttribute("data-expanded", "true");
    });
    await expect(args.onActiveVideoChange).toHaveBeenCalledWith(expect.objectContaining({ video_id: "video-3" }));

    const card2 = getCardByVideoId("video-2");
    expect(card2).not.toBeNull();
    await userEvent.click(card2!);
    await waitFor(() => {
      const selectedCard = getCardByVideoId("video-2");
      expect(selectedCard).toBeDefined();
      expect(selectedCard).toHaveAttribute("data-expanded", "true");
    });
    await expect(args.onArticleClick).toHaveBeenCalledWith(
      expect.objectContaining({ video_id: "video-2" }),
      expect.any(Number),
      expect.objectContaining({ video_id: "video-2" })
    );
  },
};

export const Mobile: Story = {
  play: async () => {
    setDeviceMode("mobile");
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
