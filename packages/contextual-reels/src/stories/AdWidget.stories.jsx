import React from "react";
import App from "@cxr/app/App";

export default {
  title: "CXR/AdWidget",
  component: App,
  decorators: [
    // Wraps every story in a fixed-size div so each ad format renders at its exact dimensions.
    (Story, context) => {
      const { width, height } = context.parameters.adSize;
      return (
        <div style={{ width, height, overflow: "visible", position: "relative" }}>
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
**CXR Ad Widget: Visual Size Testing**

This Storybook exists so you can visually test the ad widget at every supported ad format without manually editing \`index.html\` each time.

Each story renders the real \`App\` component (same code that runs in production) inside a container locked to a specific width × height. The widget fetches live data using the tag ID \`69c66cfe2d3aa5231a687a3d\`.

**Supported formats:**

| Story | Size | Layout ID |
|---|---|---|
| Size300x600 | 300 × 600 | \`desktop-300x600\` |
| Size320x50 | 320 × 50 | \`mobile-320x50\` |
| Size320x100 | 320 × 100 | \`mobile-320x100\` |
| Size300x250 | 300 × 250 | \`desktop-300x250\` |

The \`adLayout\` prop controls which UI variant the widget renders (e.g. close button appears on \`mobile-320x50\` and \`mobile-320x100\`).
        `,
      },
    },
  },
};

// Real tag ID used across all stories — fetches live data from the API.
const TAG_ID = "69c66cfe2d3aa5231a687a3d";

// Builds the props for App given an adLayout string.
const makeArgs = (adLayout) => ({
  tagId: TAG_ID,
  rootTagId: "__gen__ext__id__1",
  customizationDetails: null,
  adLayout,
  instanceId: "storybook-ad-widget",
});

export const Size300x600 = {
  args: makeArgs("desktop-300x600"),
  parameters: { adSize: { width: 300, height: 600 } },
};

export const Size320x50 = {
  args: makeArgs("mobile-320x50"),
  parameters: { adSize: { width: 320, height: 50 } },
};

export const Size320x100 = {
  args: makeArgs("mobile-320x100"),
  parameters: { adSize: { width: 320, height: 100 } },
};

export const Size300x250 = {
  args: makeArgs("desktop-300x250"),
  parameters: { adSize: { width: 300, height: 250 } },
};
