import type { Meta, StoryObj } from "@storybook/react";
import { PostLayout } from "./post-layout";
import type { StepPost } from "../create-post";

const meta: Meta<typeof PostLayout> = {
  title: "Organisms/PostLayout",
  component: PostLayout,
  tags: ["autodocs"],
  args: {
    postCountText: "5/5 Posts",
    bottomMessage: "Your progress is automatically saved as a draft.",
    isPostDisabled: false,
    stepNextButton: "UPLOAD",
  },
};

export default meta;

type Story = StoryObj<typeof PostLayout>;

export const Default: Story = {
  render: (args) => (
    <PostLayout {...args}>
      <div className="gencl:flex gencl:h-full gencl:gap-6 gencl:p-6">
        {/* Left Side (video) */}
        <div className="gencl:flex gencl:items-center gencl:justify-center gencl:bg-secondary-50 gencl:w-1/2 gencl:h-64 gencl:rounded">
          Left Container
        </div>

        {/* Right Side (video details) */}
        <div className="gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:bg-secondary-50 gencl:w-1/2 gencl:h-64 gencl:rounded">
          Right Container
        </div>
      </div>
    </PostLayout>
  ),
  args: {
    onCancel: (step: StepPost) => alert(`Cancel clicked on step: ${step}`),
    onNext: (step: StepPost) => alert(`Next clicked on step: ${step}`),
  },
};
