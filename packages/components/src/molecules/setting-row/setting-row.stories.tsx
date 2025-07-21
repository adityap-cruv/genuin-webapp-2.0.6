import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingRow } from "./setting-row";

const meta: Meta<typeof SettingRow> = {
  title: "Molecules/SettingRow",
  component: SettingRow,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof SettingRow>;

export const Default: Story = {
 args: {  
    label: "Username",
    subLabel: "Your display handle",
    value: "kimpaquette",
    toggle: true,
    toggleValue: true,
    onToggle: (val: boolean) => {
      console.log("Toggle changed:", val);
    },
    onClick: () => {
      console.log("Row clicked");
    },
  },
};
