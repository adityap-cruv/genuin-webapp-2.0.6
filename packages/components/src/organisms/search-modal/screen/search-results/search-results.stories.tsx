import type { Meta, StoryObj } from "@storybook/react";
import { SearchResults } from "./search-results";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

/**
 * The SearchResults component displays comprehensive search results across different tabs
 * including Top, Posts, Communities, Groups, and Profiles.
 */
const meta: Meta<typeof SearchResults> = {
  title: "Organisms/Search/Screens/SearchResults",
  component: SearchResults,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Comprehensive search results view with tabbed interface showing different types of content. Includes Top results (mixed), Posts, Communities, Groups, and Profiles tabs.",
      },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="gencl:w-[600px] gencl:max-w-[600px] gencl:h-[500px] gencl:border gencl:border-gray-200 gencl:rounded-lg gencl:p-4 gencl:bg-white gencl:overflow-hidden">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    query: {
      description: "The search query string",
      control: { type: "text" },
    },
    onSelect: {
      description: "Called when a search result is selected",
      control: false,
    },
    onClose: {
      description: "Called when the search results should be closed",
      control: false,
    },
    className: {
      description: "Additional CSS classes to apply",
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default search results with a typical query
 */
export const Default: Story = {
  args: {
    query: "react",
    onSelect: (result) => console.log("Selected result:", result),
    onClose: () => console.log("Close search results"),
  },
};

/**
 * Search results with a longer query
 */
export const LongQuery: Story = {
  args: {
    query: "javascript typescript react development",
    onSelect: (result) => console.log("Selected result:", result),
    onClose: () => console.log("Close search results"),
  },
  parameters: {
    docs: {
      description: {
        story: "Search results for a longer, more specific query.",
      },
    },
  },
};

/**
 * Search results for a community-specific query
 */
export const CommunityQuery: Story = {
  args: {
    query: "tech community",
    onSelect: (result) => console.log("Selected result:", result),
    onClose: () => console.log("Close search results"),
  },
  parameters: {
    docs: {
      description: {
        story: "Search results focused on community-related content.",
      },
    },
  },
};

/**
 * Search results for a user/profile query
 */
export const UserQuery: Story = {
  args: {
    query: "john developer",
    onSelect: (result) => console.log("Selected result:", result),
    onClose: () => console.log("Close search results"),
  },
  parameters: {
    docs: {
      description: {
        story: "Search results focused on user profiles and people.",
      },
    },
  },
};

/**
 * Loading state while fetching search results
 */
export const Loading: Story = {
  args: {
    query: "loading query",
    onSelect: (result) => console.log("Selected result:", result),
    onClose: () => console.log("Close search results"),
  },
  parameters: {
    docs: {
      description: {
        story: "Loading state shown while search results are being fetched.",
      },
    },
  },
};

/**
 * Error state when search fails
 */
export const Error: Story = {
  args: {
    query: "error query",
    onSelect: (result) => console.log("Selected result:", result),
    onClose: () => console.log("Close search results"),
  },
  parameters: {
    docs: {
      description: {
        story: "Error state shown when search request fails.",
      },
    },
  },
};

/**
 * Empty results state
 */
export const NoResults: Story = {
  args: {
    query: "xyz123nonexistent",
    onSelect: (result) => console.log("Selected result:", result),
    onClose: () => console.log("Close search results"),
  },
  parameters: {
    docs: {
      description: {
        story: "Empty state shown when no search results are found.",
      },
    },
  },
};
