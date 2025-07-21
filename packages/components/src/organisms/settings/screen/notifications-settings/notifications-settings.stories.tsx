import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationSettings } from "./notifications-settings";

const meta: Meta<typeof NotificationSettings> = {
  title: "Organisms/Settings/Notification Settings",
  component: NotificationSettings,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof NotificationSettings>;

export const Account: Story = {
  args: {
    group: true,
    mentions: true,
    comments: true,
    replies: true,
    reactionsPosts: true,
    reactionsComments: true,
    activity: true,
    newMembers: true,
    newRequests: true,
    acceptedRequests: true,
    onToggleGroup: (val) => console.log("Group toggle:", val),
    onToggleMentions: (val) => console.log("Mentions toggle:", val),
    onToggleComments: (val) => console.log("Comments toggle:", val),
    onToggleReplies: (val) => console.log("Replies toggle:", val),
    onToggleReactionsPosts: (val) =>
      console.log("Reactions Posts toggle:", val),
    onToggleReactionsComments: (val) =>
      console.log("Reactions Comments toggle:", val),
    onToggleActivity: (val) => console.log("Activity toggle:", val),
    onToggleNewMembers: (val) => console.log("New Members toggle:", val),
    onToggleNewRequests: (val) => console.log("New Requests toggle:", val),
    onToggleAcceptedRequests: (val) =>
      console.log("Accepted Requests toggle:", val),
  },
};
