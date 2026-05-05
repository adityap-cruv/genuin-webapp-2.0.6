import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthProvider } from "@genuin/components/context/auth";

import { SideBar } from "./side-bar";

/**
 * Wraps the story in a left-aligned full-height container and overrides the
 * global test user so that the "Become a Creator" success dialog (triggered
 * when ksCbRequestStatus === "Accepted") does not auto-open.
 */
function SideBarDecorator(Story: () => React.ReactNode) {
  return (
    <AuthProvider onSignIn={() => {}} onSignOut={() => {}} onUpdateUser={() => {}} user={null}>
      <div style={{ display: "flex", alignItems: "flex-start", height: "600px" }}>
        <Story />
      </div>
    </AuthProvider>
  );
}

const meta: Meta<typeof SideBar> = {
  title: "Organisms/SideBar",
  component: SideBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [SideBarDecorator],
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["default", "mobile"],
      description:
        "'default' renders a narrow collapsed sidebar (w-16) that expands to 240px on xl screens. " +
        "'mobile' renders a full-width sidebar used inside the mobile drawer.",
    },
    onItemClick: {
      control: false,
      description: "Optional callback fired when a sidebar navigation item is clicked.",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the sidebar container.",
    },
  },
  args: {
    variant: "default",
  },
};

export default meta;

type Story = StoryObj<typeof SideBar>;

/**
 * Default desktop sidebar. Collapsed to 64px on smaller screens, expands to 240px
 * on xl breakpoints. Shows icon-only labels until expanded.
 */
export const Default: Story = {
  name: "Default (Desktop Narrow)",
  args: {
    variant: "default",
    className: "gencl:h-[600px]",
  },
};

/**
 * Mobile variant used inside the MobileSidebar drawer. Renders at full width
 * with labels always visible alongside icons.
 */
export const MobileVariant: Story = {
  name: "Mobile Variant (Full-width)",
  args: {
    variant: "mobile",
    className: "gencl:h-[600px] gencl:w-72",
  },
};
