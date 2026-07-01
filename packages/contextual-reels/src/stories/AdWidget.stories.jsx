import React, { useState } from "react";

import App from "@cxr/app/App";

import { CONTENT, CONTENT_TAG_ID, ROOT_TAG_ID, SIZES } from "./mocks/init";

const SIZE_KEYS = Object.keys(SIZES);

const CONTENT_OPTIONS = [
  { value: CONTENT.VideoAd, label: "Video + Ad" },
  { value: CONTENT.AdOnly, label: "Ad only" },
];

// Tailwind classes for the story chrome. The `gencl:` prefix is required (CXR's
// Tailwind is built with prefix(gencl)), and each token must appear literally for
// the JIT to emit it, so the lists are grouped by concern rather than computed.

// Fixed bar pinned to the top so the buttons never shift when the widget resizes.
const TOOLBAR_CLASS = [
  "gencl:fixed gencl:inset-x-0 gencl:top-0 gencl:z-10",
  "gencl:flex gencl:flex-wrap gencl:items-center gencl:gap-4",
  "gencl:px-4 gencl:py-3",
  "gencl:bg-white gencl:border-b gencl:border-[#eee]",
  "gencl:font-[system-ui] gencl:text-xs",
].join(" ");

const GROUP_CLASS = "gencl:flex gencl:items-center gencl:gap-1.5";
const LABEL_CLASS = "gencl:mr-1 gencl:text-[#888]";

const TOGGLE_BASE = [
  "gencl:px-2.5 gencl:py-1 gencl:rounded-md gencl:border gencl:bg-transparent",
  "gencl:cursor-pointer gencl:text-xs gencl:leading-[1.4]",
].join(" ");
const TOGGLE_ACTIVE = "gencl:border-[#333] gencl:text-[#111] gencl:font-semibold";
const TOGGLE_INACTIVE = "gencl:border-[#ccc] gencl:text-[#999] gencl:font-normal";

function toggleClass(active) {
  return `${TOGGLE_BASE} ${active ? TOGGLE_ACTIVE : TOGGLE_INACTIVE}`;
}

function Toggle({ label, active, onClick, testid }) {
  return (
    <button type="button" className={toggleClass(active)} onClick={onClick} data-testid={testid}>
      {label}
    </button>
  );
}

/** Button toolbar + the live widget, sized to the selected format. */
function StoryHarness() {
  const [size, setSize] = useState("300x600");
  const [content, setContent] = useState(CONTENT.VideoAd);

  const { adLayout, width, height } = SIZES[size];

  return (
    <>
      <div className={TOOLBAR_CLASS}>
        <div className={GROUP_CLASS}>
          <span className={LABEL_CLASS}>Size</span>
          {SIZE_KEYS.map((key) => (
            <Toggle
              key={key}
              label={key}
              active={size === key}
              onClick={() => setSize(key)}
              testid={`size-${key}`}
            />
          ))}
        </div>
        <div className={GROUP_CLASS}>
          <span className={LABEL_CLASS}>Content</span>
          {CONTENT_OPTIONS.map((opt) => (
            <Toggle
              key={opt.value}
              label={opt.label}
              active={content === opt.value}
              onClick={() => setContent(opt.value)}
              testid={`content-${opt.value}`}
            />
          ))}
        </div>
      </div>

      {/* Widget lives below the fixed bar; pt reserves space for it. */}
      <div className="gencl:flex gencl:justify-center gencl:pt-[72px]">
        {/* width/height stay inline; they are computed per selected size. */}
        <div className="gencl:relative gencl:overflow-visible" style={{ width, height }}>
          {/*
            Keyed by size + content so switching either remounts the widget cleanly.
            tagId switches per content; the MSW feed handler returns a different
            fixture (video+ad vs ad-only) for each id.
          */}
          <App
            key={`${size}-${content}`}
            tagId={CONTENT_TAG_ID[content]}
            rootTagId={ROOT_TAG_ID}
            customizationDetails={null}
            adLayout={adLayout}
            instanceId="storybook-cxr"
          />
        </div>
      </div>
    </>
  );
}

export default {
  title: "CXR/AdWidget",
  component: App,
  parameters: {
    layout: "fullscreen",
    // Controls panel intentionally unused; size + content are picked via the
    // buttons rendered above the widget in the story canvas.
    controls: { disable: true },
    docs: {
      description: {
        component: `
# Contextual Reels: Ad Widget

A live preview of the Contextual Reels (CXR) ad widget in every supported ad
format. Use it to see exactly how a placement looks and behaves (layout, player
controls, branding, captions, and ad playback) without embedding the widget in
a host page.

This is the real production widget, not a mock-up. Only the data is stubbed, so
it renders consistently and offline.

## How to use

Use the toolbar above the preview:

- **Size**: switch the ad format. Each size renders its dedicated layout.

  | Format | Layout |
  | --- | --- |
  | **300 × 600** | Desktop tall: full vertical player |
  | **300 × 250** | Desktop rectangle: player with overlay |
  | **320 × 100** | Mobile banner: thumbnail player + CTA |
  | **320 × 50** | Mobile compact bar |

- **Content**: choose what the feed serves.
  - **Video + Ad**: organic video reels (content plays, with an ad break).
  - **Ad only**: standalone ad creatives, no organic video.

## About the data

Feed and tag configuration are served from local sample data, so **no production
API or analytics is ever called**. Video and ad creatives stream from the QA
environment, so playback, branding, and ad behaviour are real.
        `,
      },
    },
  },
};

export const Configurable = {
  render: () => <StoryHarness />,
};
