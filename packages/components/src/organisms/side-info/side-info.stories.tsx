import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";

import { SideInfo } from "./side-info";

const meta: Meta<typeof SideInfo> = {
  title: "Organisms/SideInfo",
  component: SideInfo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    sideInfoData: { control: "object" },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SideInfo>;

const mockEntityBase = {
  profileImage: {
    isAvatar: false,
    url: "https://via.placeholder.com/40",
  },
  url: "/mock-url",
};

const mockCreatedByData = {
  ...mockEntityBase,
  userName: "creatorUser",
  name: "Creator User",
};

const mockCreatedByDataNoName = {
  ...mockEntityBase,
  userName: "creatorUserNoName",
};

const mockCreatedInData = {
  ...mockEntityBase,
  userName: "communitySpace",
  name: "Community Space",
  profileImage: {
    isAvatar: false,
    url: "https://via.placeholder.com/40/0000FF/FFFFFF?Text=CS",
  },
};

const minimalEntityData = {
  userName: "minimalUser",
  profileImage: {
    isAvatar: false,
    url: "https://via.placeholder.com/40/cccccc/000000?Text=M",
  },
  url: "/minimal-url",
  name: "Minimal User",
};

const defaultSideInfoData: ComponentProps<typeof SideInfo>["sideInfoData"] = {
  stats: { Views: 1234, Comments: 56, Sparks: 789 },
  createdAt: "Jan 15, 2024",
  createdBy: mockCreatedByData,
  createdIn: mockCreatedInData,
  guidelines: ["Be awesome.", "Follow the rules.", "Have fun!"],
};

export const Default: Story = {
  args: {
    sideInfoData: defaultSideInfoData,
    className: "w-[300px] p-4",
  },
};

export const WithGuidelines: Story = {
  args: {
    sideInfoData: {
      ...defaultSideInfoData,
      guidelines: [
        "Always be kind and respectful.",
        "No offensive content.",
        "Report any issues to the admins.",
      ],
    },
    className: "w-[300px] p-4",
  },
};

export const WithoutGuidelines: Story = {
  args: {
    sideInfoData: {
      ...defaultSideInfoData,
      guidelines: [], // Or undefined, as guidelines is optional
    },
    className: "w-[300px] p-4",
  },
};

export const MinimalData: Story = {
  args: {
    sideInfoData: {
      stats: { Views: 10, Comments: 1, Sparks: 2 },
      createdAt: "Feb 01, 2024",
      createdBy: mockCreatedByData,
      createdIn: mockCreatedInData,
      // guidelines is omitted (optional)
    },
    className: "w-[300px] p-4",
  },
};

export const WithoutStats: Story = {
  args: {
    sideInfoData: {
      ...defaultSideInfoData,
      // stats is mandatory, so providing zero values.
      // The SideInfo component's `stats && <Stats ... />` check means
      // this object will be passed to the Stats component.
      stats: { Views: 0, Comments: 0, Sparks: 0 },
    },
    className: "w-[300px] p-4",
  },
};

export const EntityWithoutName: Story = {
  args: {
    sideInfoData: {
      ...defaultSideInfoData,
      createdBy: mockCreatedByDataNoName,
    },
    className: "w-[300px] p-4",
  },
};

export const OnlyCreatedAt: Story = {
  args: {
    sideInfoData: {
      createdAt: "Mar 10, 2024",
      // Other fields are mandatory as per SideInfoDataType
      stats: { Views: 0, Comments: 0, Sparks: 0 }, // Minimal stats
      createdBy: minimalEntityData, // Minimal valid entity
      createdIn: minimalEntityData, // Minimal valid entity
      guidelines: [], // Explicitly no guidelines for this test
    },
    className: "w-[300px] p-4",
  },
};

export const OnlyCreatedBy: Story = {
  args: {
    sideInfoData: {
      createdBy: mockCreatedByData, // Focus of this story
      // Other fields are mandatory
      stats: { Views: 0, Comments: 0, Sparks: 0 },
      createdAt: "Mar 11, 2024", // Provide a valid date
      createdIn: minimalEntityData,
      guidelines: [],
    },
    className: "w-[300px] p-4",
  },
};

export const OnlyCreatedIn: Story = {
  args: {
    sideInfoData: {
      createdIn: mockCreatedInData, // Focus of this story
      // Other fields are mandatory
      stats: { Views: 0, Comments: 0, Sparks: 0 },
      createdAt: "Mar 12, 2024", // Provide a valid date
      createdBy: minimalEntityData,
      guidelines: [],
    },
    className: "w-[300px] p-4",
  },
};
