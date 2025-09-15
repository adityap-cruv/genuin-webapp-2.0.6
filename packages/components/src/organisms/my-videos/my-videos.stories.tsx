import type { Meta, StoryObj } from "@storybook/react";
import { MyVideos } from "./my-videos";

const meta: Meta<typeof MyVideos> = {
  title: "Organisms/MyVideos",
  component: MyVideos,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof MyVideos>;

export const Default: Story = {
  render: () => <MyVideos />,
};
