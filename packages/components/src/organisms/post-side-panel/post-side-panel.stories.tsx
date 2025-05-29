import { PostSidePanel } from "./post-side-panel";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof PostSidePanel> = {
  title: "Components/PostSidePanel",
  component: PostSidePanel,
};

export default meta;

type Story = StoryObj<typeof PostSidePanel>;

export const Default: Story = {
  render: () => <PostSidePanel />,
};
