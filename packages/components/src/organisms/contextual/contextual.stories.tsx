import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Contextual, type ContextualLinkMetaData, type ContextualProps } from "./contextual";

const THUMBNAIL = "https://media.qa.begenuin.com/uploads/thumbnails/l/6836cee27905e673ee76fdbc_1786616163523.png";

const VIDEO_RESPONSE = [
  {
    video_id: "video-1",
    title: "SailGP and America's Cup: can they coexist?",
    poster:
      "https://thefoil.com/media/yFRhsJzpxkDunQ0T2uGeSr1J4pYf2zSVzmfOkawpU3o/resize:fill-down:460:240/gravity:fp:0.4962835906:0.6871458395/quality:60/dpr:1/2026/07/pod26thumb.jpg",
  },
  {
    video_id: "video-2",
    title: "America's Cup is back",
    poster:
      "https://thefoil.com/media/inir3oJGel7F88eGAYVyC7kUMlRwI1cbqKC4tnyGvWE/resize:fill-down:360:200/gravity:fp:0.3041738136:0.4733671339/quality:60/dpr:2/2026/05/e8tkvl1yBE4.jpg",
  },
  {
    video_id: "video-3",
    title: "Jet fighters dancing on water",
    poster:
      "https://thefoil.com/media/-UVLF5J_0v84UcmfLGv0eZxRdWjENlFHDGbr_OqpLww/resize:fill-down:360:200/gravity:fp:0.5:0.5/quality:60/dpr:2/2026/05/2zBK_WJOXyM.jpg",
  },
  {
    video_id: "video-4",
    title: "The technology behind modern foiling",
    poster:
      "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
  },
] as const;

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
  const [activeVideoId, setActiveVideoId] = useState(args.activeVideoId ?? "video-1");
  const activeVideo = useMemo(
    () => VIDEO_RESPONSE.find((video) => video.video_id === activeVideoId) ?? VIDEO_RESPONSE[0],
    [activeVideoId]
  );

  return (
    <Contextual
      {...args}
      activeVideoId={activeVideoId}
      video={
        <div style={{ position: "relative", width: "100%", height: "100%", background: "#1d1f20" }}>
          <img src={activeVideo.poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              left: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              color: "white",
              textShadow: "0 1px 4px rgb(0 0 0 / 70%)",
            }}>
            <span>
              Playing {activeVideoId}: {activeVideo.title}
            </span>
            <button
              type="button"
              style={{
                flex: "0 0 auto",
                borderRadius: 8,
                background: "white",
                padding: "8px 12px",
                color: "#1d1f20",
                fontWeight: 600,
              }}
              onClick={() => setActiveVideoId("video-3")}>
              Play video 3
            </button>
          </div>
        </div>
      }
      onArticleClick={(article, index) => {
        if (article.video_id) setActiveVideoId(article.video_id);
        args.onArticleClick?.(article, index);
      }}
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
    video: null,
    articles: ARTICLE_RESPONSE,
    activeVideoId: "video-1",
    animationDurationMs: 450,
    onArticleClick: fn(),
  },
  render: (args) => <ContextualDemo {...args} />,
} satisfies Meta<typeof Contextual>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoWayVideoMapping: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const getCards = () => canvasElement.querySelectorAll<HTMLElement>('[data-slot="hover-link-card-item"]');

    await expect(getCards()).toHaveLength(4);
    await expect(getCards()[0]).toHaveAttribute("data-video-id", "video-1");
    await expect(getCards()[0]).toHaveAttribute("data-expanded", "true");

    // Simulate the SDK changing the video: its matching article becomes first and expanded.
    await userEvent.click(canvas.getByRole("button", { name: "Play video 3" }));
    await waitFor(() => {
      const selectedCard = Array.from(getCards()).find((card) => card.dataset.videoId === "video-3");
      expect(selectedCard).toBeDefined();
      expect(selectedCard).toHaveAttribute("data-expanded", "true");
    });

    // Select a compact article: its matching video starts and the article moves to the top.
    const videoTwoCard = Array.from(getCards()).find((card) => card.dataset.videoId === "video-2");
    await expect(videoTwoCard).toBeDefined();
    await userEvent.click(videoTwoCard!);
    await waitFor(() => {
      expect(canvas.getByText(/Playing\s+video-2/)).toBeInTheDocument();
      const selectedCard = Array.from(getCards()).find((card) => card.dataset.videoId === "video-2");
      expect(selectedCard).toBeDefined();
      expect(selectedCard).toHaveAttribute("data-expanded", "true");
    });
    await expect(args.onArticleClick).toHaveBeenCalledWith(
      expect.objectContaining({ video_id: "video-2" }),
      expect.any(Number)
    );
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
