import { CreatedProfileIcon, EditIcon, NotificationIcon, PreferencesIcon } from "@genuin/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import SideMenu from "./side-menu";
import type { MenuItem } from "./side-menu.types";

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
  render: () => <DefaultStory />,
};

function DefaultStory() {
  const [activeId, setActiveId] = useState("account");

  return (
    <div className="h-[400px] w-64 border">
      <SideMenu items={menu} activeId={activeId} onSelect={setActiveId} />
    </div>
  );
}
