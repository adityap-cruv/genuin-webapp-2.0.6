import type { Meta, StoryObj } from "@storybook/react-vite";

import { testFeedData } from "@genuin/components/organisms/embed/test-data-feed";

import { Feed } from "./feed";
import type { FeedData } from "./feed.type";

/** Flatten `testFeedData`'s page-paginated shape (what `useFeed` returns) into
 *  the `FeedData` view-model shape that `FeedWithData` renders against. */
const fixtureFeedData: FeedData = {
  queryKey: ["fixture", "HOME"],
  videos: testFeedData.pages.flatMap((page) => page.feed),
  isLoading: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: () => undefined,
  totalVideos: testFeedData.pages[0]?.totalVideos,
  pageSession: testFeedData.pages[0]?.pageSession,
};

const meta: Meta<typeof Feed> = {
  title: "Templates/Feed",
  component: Feed,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Feed>;

/**
 * Renders the Feed template against the fixture `externalFeedData` instead of
 * the live `useFeed("HOME", …)` call. Without the fixture the story blanks —
 * the Storybook preview has no valid JWT so the API errors / empties and the
 * `<FeedWithData>` component falls into its empty/skeleton state.
 */
export const Default: Story = {
  args: {
    feedType: "HOME",
    externalFeedData: fixtureFeedData,
  },
};
