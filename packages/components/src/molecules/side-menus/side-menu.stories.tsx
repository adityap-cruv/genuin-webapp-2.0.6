import type { Meta, StoryObj } from "@storybook/react";

import { useState } from "react";
import {
  CreatedProfileIcon,
  EditIcon,
  NotificationIcon,
  PreferencesIcon,
} from "@genuin/ui/icons";
import SideMenu from "./side-menu";
import { MenuItem } from "./side-menu.types";

const meta: Meta<typeof SideMenu> = {
  title: "Molecules/SideMenu",
  component: SideMenu,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SideMenu>;

const menu: MenuItem[] = [
  {
    id: "account",
    label: "Account",
    icon: <CreatedProfileIcon />,
    variant: "default",
  },
  {
    id: "edit-profile",
    label: "Edit Profile",
    icon: <EditIcon />,
    variant: "default",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: <PreferencesIcon />,
    variant: "default",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <NotificationIcon />,
    variant: "default",
  },
  {
    id: "signOut",
    label: "Sign Out",
    icon: undefined,
    variant: "signOut",
  },
];

export const Default: Story = {
  render: () => {
    const [activeId, setActiveId] = useState("account");

    return (
      <div className="w-64 h-[400px] border">
        <SideMenu items={menu} activeId={activeId} onSelect={setActiveId} />
      </div>
    );
  },
};
