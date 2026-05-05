import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";

import { SearchInput } from "./search-input";

const meta: Meta<typeof SearchInput> = {
  title: "Molecules/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

function DefaultStory(args: ComponentProps<typeof SearchInput>) {
  const [value, setValue] = useState("");
  return (
    <SearchInput
      {...args}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={() => setValue("")}
      iconProps={{}}
      placeholder="Search…"
    />
  );
}

export const Default: Story = {
  render: (args) => <DefaultStory {...args} />,
  args: {},
};

function WithCustomIconPropsStory(args: ComponentProps<typeof SearchInput>) {
  const [value, setValue] = useState("Genuin");
  return (
    <SearchInput
      {...args}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={() => setValue("")}
      iconProps={{
        className: "gencl:text-primary",
      }}
      placeholder="Search for something…"
    />
  );
}

export const WithCustomIconProps: Story = {
  render: (args) => <WithCustomIconPropsStory {...args} />,
  args: {},
};

export const Disabled: Story = {
  render: (args) => <SearchInput {...args} value="Disabled" disabled iconProps={{}} placeholder="Disabled input" />,
  args: {},
};
