import type { Meta, StoryObj } from "@storybook/react";
import {
  NotificationList,
  NotificationListSkeleton,
  NotificationsEmptyState,
} from "./notification-list";

const meta: Meta<typeof NotificationList> = {
  title: "Organisms/Notification List",
  component: NotificationList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof NotificationList>;

export const Default: Story = {
  name: "Default",
  render: (args) => (
    <div style={{ width: 400 }}>
      <NotificationList {...args} />
    </div>
  ),
};

export const Empty: Story = {
  name: "Empty State",
  render: (args) => (
    <div style={{ width: 400 }}>
      <NotificationsEmptyState {...args} />
    </div>
  ),
};

export const Loading: Story = {
  name: "Loading",
  render: () => (
    <div style={{ width: 400 }}>
      <NotificationListSkeleton />
    </div>
  ),
};
