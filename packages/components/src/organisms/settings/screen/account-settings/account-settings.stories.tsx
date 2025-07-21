import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountSettings } from "./account-settings";

const meta: Meta<typeof AccountSettings> = {
  title: "Organisms/Settings/Account Settings",
  component: AccountSettings,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    username: { control: "text" },
    email: { control: "text" },
    phone: { control: "text" },
    birthdate: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AccountSettings>;

export const Account: Story = {
  args: {
    username: "kimpaquette",
    email: "kim@gmail.com",
    phone: "+1 (123) 456",
    birthdate: "02/14/2000",
    onClickUsername: () => console.log("Username clicked"),
    onClickEmail: () => console.log("Email clicked"),
    onClickPhone: () => console.log("Phone clicked"),
    onClickBirthdate: () => console.log("Birthdate clicked"),
    onClickDeleteAccount: () => console.log("Delete Account clicked"),
  },
};
