import { initialize, mswLoader } from "msw-storybook-addon";

import { InstanceProvider } from "../src/instance/InstanceContext";
import { feedHandlers } from "../src/stories/mocks/handlers/feed";
import { tagHandlers } from "../src/stories/mocks/handlers/tag";
import "../src/styles/tailwind.css";

// Start the MSW service worker for every story (the storybook analog of
// web-sdk's browser.ts). feedHandlers are listed first so the specific
// `/ad_creative/feed` path resolves before the broader `/ad_creative` tag path.
// Unmatched requests (CDN video, VAST ad server, analytics) bypass to the real
// QA network.
initialize({ onUnhandledRequest: "bypass" }, [...feedHandlers, ...tagHandlers]);

/** @type { import('@storybook/react').Preview } */
const preview = {
  tags: ["autodocs"],
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <InstanceProvider instanceId="storybook-instance">
        <Story />
      </InstanceProvider>
    ),
  ],
};

export default preview;
