import type { Meta, StoryObj } from "@storybook/react";

import { AuthenticationModal } from "./authentication-modal";
import { Button } from "@genuin/ui/components/button"; // Assuming Button is a common trigger

const meta: Meta<typeof AuthenticationModal> = {
  title: "Organisms/Authentication/AuthenticationModal", // Changed title
  component: AuthenticationModal,
  parameters: {
    // Optional: More layout options can be found here: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    asChild: {
      control: "boolean",
      description:
        "Whether the trigger should be a child of the DialogTrigger component. Set to true if providing a custom component (like a Button) as children.",
      defaultValue: false,
    },
    // children will be the trigger, so it's good to document its purpose if not using asChild
    children: {
      control: "text", // Or 'object' if you expect ReactNode often
      description: "The trigger element for the modal.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story using a Button as a trigger
export const Default: Story = {
  args: {
    children: <Button>Open Authentication</Button>, // Use default variant
    asChild: true, // Important when passing a component like Button as children
  },
};

// Story with a simple text trigger
export const WithTextTrigger: Story = {
  args: {
    children: "Open Authentication Modal (Text Trigger)",
    asChild: false, // asChild is false by default, or when children is a simple string
  },
};
