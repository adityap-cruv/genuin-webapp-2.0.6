import type { Meta, StoryObj } from "@storybook/react-vite";
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
    videoUrl:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    currentDuration: 0,
    onTrimRangeChange: (start: number, end: number) => {
      console.log("onTrimRangeChange::", start, end);
    },
  },
  render: ({ videoUrl, currentDuration, onTrimRangeChange }) => (
    <VideoTrimSlider
      currentDuration={currentDuration}
      videoUrl={videoUrl}
      onTrimRangeChange={onTrimRangeChange}
    />
  ),
};
