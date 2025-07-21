import type { Meta, StoryObj } from "@storybook/react-vite";
import { EditProfileSettings } from "./edit-profile-settings";
import {
  InstagramIcon,
  LinkIcon,
  TiktokIcon,
  TwitterIcon,
} from "@genuin/ui/icons";

const meta: Meta<typeof EditProfileSettings> = {
  title: "Organisms/Settings/Edit Profile Settings",
  component: EditProfileSettings,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    fullName: { control: "text" },
    bio: { control: "text" },
    socialLinks: { table: { disable: true } }, // since it's complex JSX
  },
};

export default meta;
type Story = StoryObj<typeof EditProfileSettings>;

export const EditProfile: Story = {
  render: (args) => <EditProfileSettings {...args} />,
  args: {
    fullName: "kimpaquette",
    bio: "I’m a proud owner of art&crafts daily and currently working for myself!",
    socialLinks: [
      { icon: <LinkIcon />, url: "#" },
      { icon: <TwitterIcon />, url: "#" },
      { icon: <InstagramIcon />, url: "#" },
      { icon: <TiktokIcon />, url: "#" },
    ],
    onClickFullName: () => console.log("Full Name clicked"),
    onClickBio: () => console.log("Bio clicked"),
    onClickSocialMedia: () => console.log("Social Media clicked"),
  },
};
