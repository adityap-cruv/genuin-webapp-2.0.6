import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorState } from "./error-state";

const meta: Meta<typeof ErrorState> = {
  title: "Molecules/ErrorState",
  component: ErrorState,
  argTypes: {
    className: {
      control: "text",
      description: "Additional class names for styling",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {
    type: "ERROR",
  },
};
