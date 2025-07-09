import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "./search";

const meta: Meta<typeof Search> = {
  title: "Molecules/Search",
  component: Search,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text for the search input",
    },
    onSearch: {
      action: "searched",
      description: "Callback function when search is performed",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Search...",
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: "Search for anything...",
  },
};

export const WithCustomStyling: Story = {
  args: {
    placeholder: "Search communities, topics, or keywords...",
    className: "gencl:max-w-lg",
  },
};
