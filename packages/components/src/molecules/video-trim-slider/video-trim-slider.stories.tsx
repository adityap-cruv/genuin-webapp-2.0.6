import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";

import { VideoTrimSlider } from "./index";

const meta: Meta<typeof VideoTrimSlider> = {
  title: "Molecules/VideoTrimSlider",
  component: VideoTrimSlider,
  tags: ["autodocs"],
  argTypes: {
    videoUrl: {
      control: "text",
      description: "Video URL",
    },
  },
};

export default meta;
type Story = StoryObj<typeof VideoTrimSlider>;

export const Default: Story = {
  args: {
    // VideoTrimSlider reads frames into a <canvas> for the thumbnail strip,
    // so the source must serve `Access-Control-Allow-Origin: *`. The
    // test-videos.co.uk host doesn't — MDN's CC0 sample does.
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    currentDuration: 0,
    onTrimmerReady: (isReady: boolean) => {
      console.log("onTrimmerReady::", isReady);
    },
  },
  render: ({ videoUrl, currentDuration, onTrimmerReady }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const trimRef = useRef<{ start: number; end: number }>(null);
    return (
      <VideoTrimSlider
        ref={trimRef}
        currentDuration={currentDuration}
        videoUrl={videoUrl}
        onTrimmerReady={onTrimmerReady ?? (() => {})}
      />
    );
  },
};
