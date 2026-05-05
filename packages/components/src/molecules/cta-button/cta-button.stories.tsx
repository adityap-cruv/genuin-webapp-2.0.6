import type { Meta, StoryObj } from "@storybook/react";

import { CTAButton } from "./cta-button";

const meta: Meta<typeof CTAButton> = {
  title: "Molecules/CTAButton",
  component: CTAButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    link: {
      control: "text",
      description: "The URL to navigate to when clicked",
    },
    text: {
      control: "text",
      description: "The text to display on the button",
    },
    showIcon: {
      control: "boolean",
      description: "Whether to show the chevron icon",
    },
    onClick: {
      action: "clicked",
      description: "Callback when the button is clicked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CTAButton>;

export const Default: Story = {
  args: {
    text: "Youtube.com/@TED",
    link: "https://youtube.com/@TED",
    showIcon: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    text: "Visit Website",
    link: "https://example.com",
    showIcon: false,
  },
};

export const LongText: Story = {
  args: {
    text: "This is a very long CTA text that should still fit properly",
    link: "https://example.com",
    showIcon: true,
  },
};

export const InContainer: Story = {
  render: () => (
    <div className="gencl:w-[400px] gencl:p-4 gencl:bg-white gencl:rounded-lg gencl:border gencl:border-secondary-150">
      <CTAButton text="Youtube.com/@TED" link="https://youtube.com/@TED" showIcon={true} />
    </div>
  ),
};
