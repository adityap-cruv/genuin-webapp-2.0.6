import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NotificationItem,
  NotificationItemSkeleton,
} from "./notification-item";
import { NotificationDataType } from "./notification-item.types";

const meta: Meta<typeof NotificationItem> = {
  title: "Molecules/Notification Item",
  component: NotificationItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    notification: {
      control: "object",
      description: "Notification data object containing all relevant info.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationItem>;

const baseNotificationData: Partial<NotificationDataType> = {
  notification_id: "6818526d24796e79bc149616",
  is_read: true,
  type: "bcc_to_cb_added",
  created_at: 1746424429000,
  user: {
    user_id: "1234567890",
    nickname: "uniqlo",
    name: "Uniqlo",
    is_avatar: false,
    brand: { brand_id: 4839, brand_slug: "uniqlo" },
    profile_image:
      "https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1745996370159.png",
    profile_image_m:
      "https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1745996370159.png",
  },
  brand: {
    brand_id: 4839,
    created_at: 34287948334,
    brand_web_logo:
      "https://media.qa.begenuin.com/uploads/brands/logo/brandProfileLogo_1745996370159.png",
    favicon:
      "https://media.qa.begenuin.com/uploads/brands/favicon/brandProfileFavicon_1745996370159.png",
    brand_system_user_id: "1234567890",
    name: "Uniqlo",
    subdomain: "csxmcrkr",
    logo: "https://media.qa.begenuin.com/uploads/brands/logo/brandProfileLogo_1745996370159.png",
    brand_slug: "uniqlo",
  },
  conversation_video: {
    slug: "uniqlo-video",
    thumbnail_url: "https://picsum.photos/200",
  },
  community: {
    dp: "https://google.com",
    name: "Community Name",
    slug: "community-name",
  },
  conversation: {
    group: {
      name: "Group One",
      slug: "group-one",
    },
  },
};

export const Default: Story = {
  name: "Default",
  args: {
    notification: { ...baseNotificationData, is_read: true },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Standard notification card with default styling. Shows a typical notification with all fields populated.",
      },
    },
  },
};

export const NewNotification: Story = {
  name: "New Notification",
  args: {
    ...Default.args,
    notification: { ...baseNotificationData, is_read: false },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Highlights the notification as newly added, using the `isNew` prop.",
      },
    },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="gencl:w-lg">
      <NotificationItemSkeleton />
    </div>
  ),
};
