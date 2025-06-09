import type { Meta, StoryObj } from "@storybook/react-vite";

import type { MemberDataType } from "@molecules/member-item";

import { MemberList } from "./member-list";

const meta: Meta<typeof MemberList> = {
  title: "Organisms/MemberList",
  component: MemberList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    members: { control: "object" },
    isLoading: { control: "boolean" },
    isError: { control: "boolean" },
    isFetchingNextPage: { control: "boolean" },
    hasNextPage: { control: "boolean" },
    fetchNextPage: { action: "fetchedNextPage" },
  },
};

export default meta;
type Story = StoryObj<typeof MemberList>;

const mockMembers: MemberDataType[] = [
  {
    memberId: "1",
    name: "John Doe",
    userName: "johndoe",
    url: "/profile/johndoe",
    profileImage: { isAvatar: true, url: "https://via.placeholder.com/40" },
    bio: "Software Engineer",
    isOwner: false,
  },
  {
    memberId: "2",
    name: "Jane Smith",
    userName: "janesmith",
    url: "/profile/janesmith",
    profileImage: { isAvatar: true, url: "https://via.placeholder.com/40" },
    bio: "Product Manager",
    isOwner: true,
  },
  {
    memberId: "3",
    name: "Alice Johnson",
    userName: "alicejohnson",
    url: "/profile/alicejohnson",
    profileImage: { isAvatar: true, url: "https://via.placeholder.com/40" },
    bio: "UX Designer",
    isOwner: false,
  },
  {
    memberId: "4",
    name: "Bob Brown",
    userName: "bobbrown",
    url: "/profile/bobbrown",
    profileImage: { isAvatar: false, url: "https://via.placeholder.com/40" }, // Example of non-avatar image
    bio: "Data Scientist",
    isOwner: false,
  },
];

export const Default: Story = {
  args: {
    title: "Team Members",
    members: mockMembers,
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    hasNextPage: true,
  },
};

export const Loading: Story = {
  args: {
    title: "Team Members",
    members: [],
    isLoading: true,
    isError: false,
    isFetchingNextPage: false,
    hasNextPage: false,
  },
};

export const Error: Story = {
  args: {
    title: "Team Members",
    members: [],
    isLoading: false,
    isError: true,
    isFetchingNextPage: false,
    hasNextPage: false,
  },
};

export const WithPagination: Story = {
  args: {
    title: "Team Members (Paginated)",
    members: mockMembers.slice(0, 2),
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    hasNextPage: true,
  },
};

export const FetchingNextPage: Story = {
  args: {
    title: "Team Members (Fetching More)",
    members: mockMembers,
    isLoading: false,
    isError: false,
    isFetchingNextPage: true,
    hasNextPage: true,
  },
};

export const NoMorePages: Story = {
  args: {
    title: "Team Members (All Loaded)",
    members: mockMembers,
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    hasNextPage: false,
  },
};

export const Empty: Story = {
  args: {
    title: "Team Members",
    members: [],
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    hasNextPage: false,
  },
};

export const WithoutTitle: Story = {
  args: {
    members: mockMembers,
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    hasNextPage: true,
  },
};
