import type { Meta, StoryObj } from "@storybook/react";

import { StandardWall } from "./standard-wall";

const meta: Meta<typeof StandardWall> = {
  title: "Organisms/Web-SDK/StandardWall",
  component: StandardWall,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The StandardWall component serves as the main entry point for the application. It sets up routing for various pages including home, latest, popular feeds, profile details, group details, community details, video page, and settings page.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default StandardWall story showing the home feed
 */
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "The default StandardWall component starts at the home feed route.",
      },
    },
  },
};

/**
 * StandardWall starting at the home feed
 */
export const HomeFeed: Story = {
  args: {
    startingPath: "/",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying the home feed with personalized content.",
      },
    },
  },
};

/**
 * StandardWall starting at the latest feed
 */
export const LatestFeed: Story = {
  args: {
    startingPath: "/latest",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying the latest feed with most recent content.",
      },
    },
  },
};

/**
 * StandardWall starting at the popular feed
 */
export const PopularFeed: Story = {
  args: {
    startingPath: "/popular",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying the popular feed with trending content.",
      },
    },
  },
};

/**
 * StandardWall starting at a user profile
 */
export const UserProfile: Story = {
  args: {
    startingPath: "/profile/johndoe",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying a user profile page for 'johndoe'.",
      },
    },
  },
};

/**
 * StandardWall starting at a brand profile
 */
export const BrandProfile: Story = {
  args: {
    startingPath: "/brand/acme-corp",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying a brand profile page for 'acme-corp'.",
      },
    },
  },
};

/**
 * StandardWall starting at a group details page
 */
export const GroupDetails: Story = {
  args: {
    startingPath: "/group/design-enthusiasts",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying group details for 'design-enthusiasts'.",
      },
    },
  },
};

/**
 * StandardWall starting at a community details page
 */
export const CommunityDetails: Story = {
  args: {
    startingPath: "/community/tech-innovators",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying community details for 'tech-innovators'.",
      },
    },
  },
};

/**
 * StandardWall starting at a video page
 */
export const VideoPage: Story = {
  args: {
    startingPath: "/video/sample-video-123",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying a video page for video ID 'sample-video-123'.",
      },
    },
  },
};

/**
 * StandardWall starting at the settings page
 */
export const SettingsPage: Story = {
  args: {
    startingPath: "/settings",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying the user settings page.",
      },
    },
  },
};

/**
 * StandardWall starting at the explore page
 */
export const ExplorePage: Story = {
  args: {
    startingPath: "/explore",
  },
  parameters: {
    docs: {
      description: {
        story: "StandardWall displaying the explore page for content discovery.",
      },
    },
  },
};

/**
 * StandardWall with mobile viewport simulation
 */
export const MobileView: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "StandardWall optimized for mobile viewing experience.",
      },
    },
  },
};

/**
 * StandardWall with tablet viewport simulation
 */
export const TabletView: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "StandardWall optimized for tablet viewing experience.",
      },
    },
  },
};

/**
 * StandardWall with desktop viewport simulation
 */
export const DesktopView: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story: "StandardWall optimized for desktop viewing experience.",
      },
    },
  },
};

// /**
//  * StandardWall in embed mode with different brand configuration
//  */
// export const EmbedMode: Story = {
//   args: {},
//   decorators: [
//     (Story) => (
//       <div style={{ width: "100vw", height: "100vh" }}>
//         <ReactQueryClientProvider>
//           <BaseContextProvider brandDetails={mockBrandDetails} isEmbed={true}>
//             <AuthProvider
//               onSignIn={async () => {}}
//               onSignOut={async () => {}}
//               onUpdateUser={async () => {}}
//             >
//               <Story />
//             </AuthProvider>
//           </BaseContextProvider>
//         </ReactQueryClientProvider>
//       </div>
//     ),
//   ],
//   parameters: {
//     docs: {
//       description: {
//         story:
//           "StandardWall configured for embed mode with isEmbed set to true.",
//       },
//     },
//   },
// };
