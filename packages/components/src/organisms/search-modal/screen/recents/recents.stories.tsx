import type { Meta, StoryObj } from "@storybook/react";
import { Recents } from "./recents";
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
 * The Recents component displays a user's recent search history
 * including communities, groups, and users that were previously searched.
 */
const meta: Meta<typeof Recents> = {
  title: "Organisms/Search/Screens/Recents",
  component: Recents,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays recent search history including communities, groups, and users that were previously searched. Allows users to quickly revisit previous searches and provides delete functionality.",
      },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="gencl:w-[400px] gencl:max-w-[400px] gencl:max-h-[400px] gencl:border gencl:border-gray-200 gencl:rounded-lg gencl:p-4 gencl:bg-white gencl:overflow-auto">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    onSearch: {
      description: "Called when a recent search item is clicked",
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
 * Default state showing recent search results with mixed content types
 */
export const Default: Story = {
  args: {
    onSearch: (query: string) => console.log("Search triggered:", query),
  },
};

/**
 * Loading state while fetching recent searches
 */
export const Loading: Story = {
  args: {
    onSearch: (query: string) => console.log("Search triggered:", query),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Loading state displayed while recent searches are being fetched from the server.",
      },
    },
  },
};

/**
 * Empty state when user has no recent searches
 */
export const Empty: Story = {
  args: {
    onSearch: (query: string) => console.log("Search triggered:", query),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty state shown when the user has no recent search history to display.",
      },
    },
  },
};

/**
 * Scrollable state with many recent search items
 */
export const WithManyItems: Story = {
  args: {
    onSearch: (query: string) => console.log("Search triggered:", query),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the scrollable behavior when there are many recent search items.",
      },
    },
  },
};
