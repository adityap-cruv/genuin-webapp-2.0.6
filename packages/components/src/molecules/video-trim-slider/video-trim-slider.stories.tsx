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
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
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
