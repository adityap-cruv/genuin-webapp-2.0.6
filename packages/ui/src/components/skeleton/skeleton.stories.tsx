import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      control: "text",
      description: "Additional Tailwind classes for customization",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Skeleton>;
type TextStoryArgs = React.ComponentProps<typeof Skeleton> & { lines?: number };

export const Default: Story = {
  args: {
    className: "gencl:w-32 gencl:h-6 gencl:bg-secondary-100",
  },
};

export const Text: StoryObj<TextStoryArgs> = {
  render: (args) => {
    const { lines = 1, className, ...rest } = args;
    return (
      <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:w-lg gencl:max-w-md">
        {Array.from({ length: lines }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={
              className ??
              "gencl:w-full gencl:h-3 gencl:bg-secondary-100 gencl:rounded-md"
            }
            {...rest}
          />
        ))}
      </div>
    );
  },
  args: {
    lines: 3,
    className: "gencl:w-full gencl:h-3 gencl:bg-secondary-100 gencl:rounded-md",
  },
  argTypes: {
    lines: {
      control: { type: "number", min: 1, max: 10, step: 1 },
      description: "Number of shimmer lines to render",
    },
  },
};

export const RoundedFull: Story = {
  args: {
    className:
      "gencl:w-16 gencl:h-16 gencl:rounded-full gencl:bg-secondary-100",
  },
};
