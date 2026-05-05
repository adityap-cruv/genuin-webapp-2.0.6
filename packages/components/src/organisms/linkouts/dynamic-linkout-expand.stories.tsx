/**
 * @fileoverview Expand View Linkout Stories
 *
 * Comprehensive Storybook stories for Dynamic Linkouts component in expand view mode.
 * These stories demonstrate the full-featured expand view behavior with portal rendering,
 * multi-layout support, and complete interaction patterns on both mobile and desktop.
 *
 * Key Features:
 * - Portal-rendered expand views to document.body
 * - Mobile expand view (stories 02-05): Stack layout with video, linkouts, and comments
 * - Desktop expand view (story 01): Side-by-side layout with video left and linkouts/comments right
 * - Proper sheet state management with hasContentType and sheetContentPlacements tracking
 * - Conditional linkout positioning (inside/outside) based on view state
 * - Full interaction patterns: expand, collapse, state transitions
 *
 * Architecture:
 * - DesktopLinkoutsExpandHarness: Portal-rendered desktop expand view
 * - DynamicLinkoutsExpandHarness: Portal-rendered mobile expand view
 * - Both use useSheetState() for state management and proper cleanup
 * - Device mode is controlled via setDeviceMode() from preview.ts (single matchMedia mock)
 *
 * @see dynamic-linkout-embed.stories.tsx for embed-only view
 * @see dynamic-linkout-mobile.stories.tsx for mobile patterns
 */

import { Avatar } from "@genuin/ui/avatar";
import { VideoPlayer } from "@genuin/ui/components/video-player";
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { cn } from "@genuin/ui/lib/utils";
import type { Meta, StoryObj } from "@storybook/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { Actions } from "@genuin/components/molecules/actions";
import { Comments } from "@genuin/components/molecules/comments/comments";
import { Pills } from "@genuin/components/molecules/feed-player/pills/pills";
import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { ReadMore } from "@genuin/components/molecules/read-more";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";

import { setDeviceMode } from "../../../.storybook/preview";

// Mock Data

const STORY_VIDEO_POSTER = "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217";

const STORY_POST_DETAILS = {
  video: {
    id: "75baab35-91ee-4def-a92d-9959b16d95c3",
    isSparked: false,
    sparkCount: 42,
    slug: "1f27928d0580141c",
    shareUrl:
      "https://vkleowon.qa.begenuin.com/video/1f27928d0580141c?community=1d8385bff5800d85&loop=1f24814ba68014ae",
    description: ["Exploring the intersection of eco-friendly design and automotive aesthetics."],
  },
  group: {
    id: "f3088d1f-9603-4018-bf1a-0bf5d239a451",
    slug: "eco-aesthetics",
    name: "Eco Aesthetics",
    description: "Focusing on sustainable design principles in modern vehicles.",
    role: "UNJOINED",
    isPrivate: false,
  },
  community: {
    id: "98c089c1-f59f-48cc-bba9-21687723d691",
    shareUrl: "https://vkleowon.qa.begenuin.com/community/koda-lovers",
    slug: "koda-lovers",
    handle: "skodalovers",
    name: "Skoda Lovers",
    isPrivate: false,
    userRole: "UNJOINED",
    membersCount: 0,
    groupsCount: 0,
    postsCount: 0,
  },
  owner: {
    profileImage: "https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1751452436279.png",
    isAvatar: false,
    userName: "skoda",
    name: "Skoda",
  },
} as const;

const SAMPLE_LINKS = [
  {
    link: "https://www.walmart.com/",
    title: "Badminton racket",
    image: "https://placehold.co/240x240/png?text=Racket",
    position: 0,
  },
  {
    link: "https://www.amazon.com/",
    title: "Tennis shoes",
    image: "https://placehold.co/240x240/png?text=Shoes",
    position: 1,
  },
  {
    link: "https://www.target.com/",
    title: "Yoga mat",
    image: "https://placehold.co/240x240/png?text=Yoga+Mat",
    position: 2,
  },
];

const LINKOUTS_ANALYTICS = buildLinkoutsAnalyticsData({});

// Link variants for different stories

const LINKS_THUMBNAIL_ONLY = SAMPLE_LINKS.map((sample) => ({
  link: sample.link,
  position: sample.position,
  image: sample.image,
}));

const LINKS_THUMBNAIL_AND_TITLE = SAMPLE_LINKS.map((sample) => ({
  link: sample.link,
  position: sample.position,
  image: sample.image,
  title: sample.title,
}));

const LINKS_THUMBNAIL_AND_BUTTON = SAMPLE_LINKS.map((sample) => ({
  link: sample.link,
  position: sample.position,
  image: sample.image,
}));

const LINKS_FULL = SAMPLE_LINKS.map((sample) => ({
  link: sample.link,
  position: sample.position,
  image: sample.image,
  title: sample.title,
}));

// CTA values for button scenarios

const CTA_WITH_BUTTON = {
  ctaText: SAMPLE_LINKS[0]?.title ?? "",
  ctaLink: SAMPLE_LINKS[0]?.link ?? "",
};

// Shared UI primitives

function ExpandPortalBackdrop({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="gencl:fixed gencl:inset-0 gencl:z-[9999] gencl:bg-neutral-900 gencl:flex gencl:items-center gencl:justify-center gencl:p-4">
      {children}
    </div>,
    document.body
  );
}

function StoryVideoBackdrop({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="gencl:absolute gencl:inset-0 gencl:pointer-events-none">
      <VideoPlayer
        poster={STORY_VIDEO_POSTER}
        play={false}
        controls={false}
        muted
        preload="none"
        isInExpandView={isExpanded}
        className="gencl:h-full gencl:w-full gencl:object-cover"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

// Desktop harness

function DesktopLinkoutsExpandHarness() {
  // Set synchronously before any hooks or children evaluate matchMedia
  setDeviceMode("desktop");

  const { hasContentType, openContentType, closeContentType, sheetContentPlacements } = useSheetState();
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);

  const links = LINKS_FULL;
  const { ctaText, ctaLink } = CTA_WITH_BUTTON;

  const isOutsidePlacement = sheetContentPlacements["linkouts"] === "outside";
  const isOutsideLinkoutOpen = hasContentType("linkouts") && isOutsidePlacement;

  useEffect(() => {
    openContentType("linkouts", "outside", "expand-view");
    return () => closeContentType("linkouts");
  }, [openContentType, closeContentType]);

  const sharedLinkoutsProps = {
    links,
    ctaText,
    ctaLink,
    isActive: true,
    view: "expand" as const,
    layout: "overlay" as const,
    analyticsEventData: LINKOUTS_ANALYTICS,
  };

  return (
    <ExpandPortalBackdrop>
      <div className="gencl:w-full gencl:max-w-[1200px] gencl:h-[90vh] gencl:max-h-[800px] gencl:relative gencl:flex">
        <div
          style={{
            flex: "0 0 52%",
            position: "relative",
          }}>
          <StoryVideoBackdrop isExpanded />

          {!isOutsidePlacement && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
              }}
              onClick={(e) => e.stopPropagation()}>
              <DynamicLinkouts {...sharedLinkoutsProps} />
            </div>
          )}
        </div>

        {/* Actions — Middle (72px) */}
        <div
          style={{
            flex: "0 0 72px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 24,
            background: "#1a1a1a",
          }}>
          <Actions
            variant="mobile"
            theme="dark"
            isReacted={STORY_POST_DETAILS.video.isSparked}
            reactionCount={STORY_POST_DETAILS.video.sparkCount}
            contentId={STORY_POST_DETAILS.video.id}
            shareUrl={STORY_POST_DETAILS.video.shareUrl}
            slug={STORY_POST_DETAILS.video.slug}
            groupSlug={STORY_POST_DETAILS.group.slug}
            isLinkoutsOpen={isOutsideLinkoutOpen}
            actionWrapper={{
              LINKOUT: (defaultNode) => (
                <span
                  key="linkout-btn"
                  onClick={() => {
                    if (isOutsideLinkoutOpen) {
                      closeContentType("linkouts");
                      return;
                    }
                    openContentType("linkouts", "outside", "default-active");
                  }}>
                  {defaultNode}
                </span>
              ),
              REPOST: (node) => <div>{node}</div>,
              REACTION: (node) => <div>{node}</div>,
              COMMENT: (node) => (
                <button type="button" onClick={() => setIsCommentsOpen((prev) => !prev)}>
                  {node}
                </button>
              ),
              SHARE: (node) => <div>{node}</div>,
              MORE: (node) => <div>{node}</div>,
            }}
          />
        </div>

        {/* Linkout + Comments — Right (flex) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            overflow: "hidden",
          }}>
          {isOutsidePlacement && (
            <div
              style={{
                height: isCommentsOpen ? "40%" : "100%",
                overflow: "hidden",
                borderBottom: isCommentsOpen ? "1px solid #e5e5e5" : "none",
              }}>
              <DynamicLinkouts {...sharedLinkoutsProps} />
            </div>
          )}

          {isCommentsOpen && (
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                padding: "0",
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  flexShrink: 0,
                }}>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>Comments</div>
                <button
                  type="button"
                  onClick={() => setIsCommentsOpen(false)}
                  style={{
                    fontSize: "24px",
                    cursor: "pointer",
                    width: "24px",
                    height: "24px",
                  }}>
                  ×
                </button>
              </div>
              <div style={{ flex: 1, overflow: "auto" }}>
                <Comments
                  videoId={STORY_POST_DETAILS.video.id}
                  loopId={STORY_POST_DETAILS.group.id}
                  communityId={STORY_POST_DETAILS.community.id}
                  shareUrl={STORY_POST_DETAILS.video.shareUrl}
                  videoSlug={STORY_POST_DETAILS.video.slug}
                  showCloseButton={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ExpandPortalBackdrop>
  );
}

// Mobile harness — sub-components

function MobileSdkDetails({
  isLinkoutsOpen,
  onLinkoutToggle,
  linkoutsSlot,
  linkoutsState,
}: {
  isLinkoutsOpen: boolean;
  onLinkoutToggle: () => void;
  linkoutsSlot?: ReactNode;
  linkoutsState: DynamicSheetState;
}) {
  const isPanelOrFullView = linkoutsState === "panel-view" || linkoutsState === "full-view";

  return (
    <div className="gencl:z-[2] gencl:bg-gradient-to-t gencl:from-black/90 gencl:via-black/55 gencl:to-transparent gencl:px-4 gencl:pb-6 gencl:pt-16 gencl:text-white gencl:flex gencl:flex-col gencl:gap-4 gencl:transition-all gencl:duration-300 gencl:w-full">
      <div
        className={cn(
          "gencl:min-w-0 gencl:w-[calc(100%-64px)] gencl:flex gencl:flex-col gencl:gap-3 gencl:transition-all gencl:duration-300 gencl:overflow-y-auto",
          isPanelOrFullView && "gencl:max-h-[100px]"
        )}>
        <div className="gencl:flex gencl:items-center gencl:gap-2">
          <Avatar
            alt={STORY_POST_DETAILS.owner.name}
            imageUrl={STORY_POST_DETAILS.owner.profileImage}
            isAvatar={STORY_POST_DETAILS.owner.isAvatar}
            size="md"
          />
          <div className="gencl:min-w-0">
            <div className="gencl:text-body-0-semi-bold gencl:text-white">{STORY_POST_DETAILS.owner.name}</div>
            <div className="gencl:text-body-2-medium gencl:text-white/70">@{STORY_POST_DETAILS.owner.userName}</div>
          </div>
        </div>

        {!isPanelOrFullView && linkoutsSlot}

        <ReadMore
          text={STORY_POST_DETAILS.video.description[0]}
          maxLines={2}
          showExpandText={false}
          textClassName="gencl:text-body-1-medium gencl:text-white"
        />

        <Pills
          communityDetails={STORY_POST_DETAILS.community}
          groupDetails={STORY_POST_DETAILS.group}
          videoId={STORY_POST_DETAILS.video.id}
          hideCommunityJoinButton
          hideGroupSubscriptionButton
          className="gencl:flex-wrap gencl:[&_*]:!bg-transparent"
        />
      </div>

      {isPanelOrFullView && linkoutsSlot}

      <div className="gencl:absolute gencl:right-4 gencl:bottom-8 gencl:z-[3]">
        <Actions
          variant="mobile"
          theme="dark"
          isReacted={STORY_POST_DETAILS.video.isSparked}
          reactionCount={STORY_POST_DETAILS.video.sparkCount}
          contentId={STORY_POST_DETAILS.video.id}
          shareUrl={STORY_POST_DETAILS.video.shareUrl}
          slug={STORY_POST_DETAILS.video.slug}
          groupSlug={STORY_POST_DETAILS.group.slug}
          isLinkoutsOpen={isLinkoutsOpen}
          className="gencl:pb-2"
          actionWrapper={{
            LINKOUT: (node) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLinkoutToggle();
                }}>
                {node}
              </button>
            ),
            REPOST: (node) => <div>{node}</div>,
            REACTION: (node) => <div>{node}</div>,
            COMMENT: (node) => <div>{node}</div>,
            SHARE: (node) => <div>{node}</div>,
            MORE: (node) => <div>{node}</div>,
          }}
        />
      </div>
    </div>
  );
}

// Mobile harness

type DynamicLinkoutsExpandHarnessProps = {
  links: typeof LINKS_THUMBNAIL_ONLY;
  ctaText: string;
  ctaLink: string;
};

function DynamicLinkoutsExpandHarness({ links, ctaText, ctaLink }: DynamicLinkoutsExpandHarnessProps) {
  // Set synchronously before any hooks or children evaluate matchMedia
  setDeviceMode("mobile");

  const { openContentType, closeContentType, sheetContentStates } = useSheetState();
  const [isLinkoutsOpen, setIsLinkoutsOpen] = useState(true);
  const linkoutsState = sheetContentStates["linkouts"] ?? "default";

  useEffect(() => {
    if (!isLinkoutsOpen) {
      closeContentType("linkouts");
      return;
    }
    openContentType("linkouts", "inside", "default");
    return () => closeContentType("linkouts");
  }, [closeContentType, isLinkoutsOpen, openContentType]);

  const videoTranslateY =
    linkoutsState === "full-view" ? "calc(-40vh)" : linkoutsState === "panel-view" ? "calc(-70vh)" : "0";

  return (
    <ExpandPortalBackdrop>
      <style>{`[data-slot="dynamic-sheet"] { width: 100% !important; max-width: 100% !important; }`}</style>
      <div className="gencl:w-full gencl:max-w-[500px] gencl:h-[90vh] gencl:max-h-[800px] gencl:relative gencl:flex gencl:flex-col">
        <div
          className="gencl:absolute gencl:inset-0 gencl:transition-transform gencl:duration-300 gencl:ease-out gencl:overflow-hidden"
          style={{ transform: `translateY(${videoTranslateY})` }}>
          <StoryVideoBackdrop isExpanded />
        </div>

        <div className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:z-10 gencl:overflow-visible gencl:flex gencl:flex-col">
          <MobileSdkDetails
            isLinkoutsOpen={isLinkoutsOpen}
            onLinkoutToggle={() => setIsLinkoutsOpen((current) => !current)}
            linkoutsState={linkoutsState}
            linkoutsSlot={
              isLinkoutsOpen ? (
                <DynamicLinkouts
                  links={links}
                  ctaText={ctaText}
                  ctaLink={ctaLink}
                  isActive
                  view="expand"
                  layout="overlay"
                  analyticsEventData={LINKOUTS_ANALYTICS}
                />
              ) : null
            }
          />
        </div>
      </div>
    </ExpandPortalBackdrop>
  );
}

// Storybook meta

const meta: Meta<typeof DynamicLinkoutsExpandHarness> = {
  title: "Organisms/Linkouts/Dynamic Linkouts Expand View",
  component: DynamicLinkoutsExpandHarness,
  tags: ["autodocs"],
  decorators: [(Story) => <Story />],
  parameters: {
    layout: "fullscreen",
    docs: {
      disable: true,
      description: {
        component: `
These stories represent the \`DynamicLinkouts\` component as it appears inside the **expand/post-detail overlay** the full-screen view a user sees after tapping a video in the feed.

### Two layouts covered

| Story | Layout | Key behaviour |
|---|---|---|
| 01 Desktop | 3-column: video / actions / linkouts+comments | Linkouts start overlaid on the video. Clicking the linkout action button moves them into the right panel. Comments panel is independently togglable. |
| 02–05 Mobile | Full-screen portal with video background | Linkouts sit at the bottom in default state. Drag the handle upward to enter panel-view or full-view. The video translates up as the sheet expands. |

### Sheet states
The linkout strip supports three states driven by a drag handle:

| State | Description |
|---|---|
| \`default\` | Strip collapsed at the bottom of the video |
| \`default-active\` | Strip collapsed at the bottom of the video and then expand a bit automatically|
| \`panel-view\` | User drags up partway strip grows to panel height |
| \`full-view\` | User drags to top strip takes full card height |

Drag the handle in any individual story to move between states.

### Controls

- **linkThumbnail**: toggles the product image on each card
- **linkTitle**: toggles the text label on each card
- **button**: toggles the CTA button on each card
- **deviceMode**: switches the internal \`matchMedia\` mock so \`DynamicLinkouts\` renders mobile (pagination dots) or desktop (nav arrows) navigation

### Architecture notes

- Both harnesses render into \`document.body\` via \`createPortal\` so the overlay sits above all Storybook chrome.
- Sheet state (\`default\` → \`panel-view\` → \`full-view\`) is managed by \`useSheetState\`.
- The global \`matchMedia\` mock lives in \`.storybook/preview.ts\`. Do **not** add a local \`window.matchMedia\` override in this file.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DynamicLinkoutsExpandHarness>;

// Stories

export const DesktopExpand: Story = {
  name: "Desktop Expand View",
  render: () => <DesktopLinkoutsExpandHarness />,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: `
**Desktop expand view** — the post-detail overlay as seen on a wide viewport.

Layout is three columns:
- **Left (52%)** — video player. When linkouts are in "inside" placement they overlay the bottom of the video.
- **Middle (72px)** — vertical action bar (react, comment, share, linkout toggle, more).
- **Right (flex)** — linkouts carousel and/or comments panel.

**Interactions to test:**
1. Click the linkout icon in the action bar → linkouts move from the video overlay into the right panel ("outside" placement).
2. Click the comment icon → comments panel toggles open/closed.
3. When linkouts are in the right panel and comments are also open, linkouts take 40% height and comments take the rest.
4. Use the \`linkThumbnail\`, \`linkTitle\`, and \`button\` controls to verify each card variant renders correctly at desktop width.
        `,
      },
    },
  },
};

export const EXPANDTHUMBNAIL: Story = {
  name: "Mobile Expand View Thumbnail Only",
  parameters: {
    docs: {
      description: {
        story: `
**Mobile expand — thumbnail only.**

Each linkout card shows only the product image and the destination URL. No title text, no CTA button.

Use this to verify:
- Card aspect ratio and image fit at mobile width.
- Carousel pagination dots appear correctly (mobile nav mode).
- The drag handle is visible and the sheet can be pulled into panel-view and full-view.
        `,
      },
    },
  },
  args: {
    links: LINKS_THUMBNAIL_ONLY,
    ctaText: "",
    ctaLink: "",
  },
};

export const EXPANDThumbnailAndTitle: Story = {
  name: "Mobile Expand View Thumbnail + Title",
  parameters: {
    docs: {
      description: {
        story: `
**Mobile expand — thumbnail with title.**

Adds the product title below the image. Use this to verify:
- Title text wraps correctly within the card width.
- Card height grows to accommodate the title without breaking the carousel layout.
- Long titles truncate or wrap gracefully.
        `,
      },
    },
  },
  args: {
    links: LINKS_THUMBNAIL_AND_TITLE,
    ctaText: "",
    ctaLink: "",
  },
};

export const EXPANDThumbnailAndButton: Story = {
  name: "Mobile Expand View Thumbnail + Button",
  parameters: {
    docs: {
      description: {
        story: `
**Mobile expand — thumbnail with CTA button, no title.**

Shows the button-primary variant where the card has an image and a call-to-action but no descriptive title. Use this to verify:
- Button text fits within the card and does not overflow.
- Button tap target is large enough at mobile size.
- The carousel still paginates correctly with button-only cards.
        `,
      },
    },
  },
  args: {
    links: LINKS_THUMBNAIL_AND_BUTTON,
    ...CTA_WITH_BUTTON,
  },
};

export const EXPANDThumbnailTitleAndButton: Story = {
  name: "Mobile Expand View Thumbnail + Title + Button",
  parameters: {
    docs: {
      description: {
        story: `
**Mobile expand — full card (thumbnail + title + CTA button).**

This is the fully-loaded card variant and the primary reference story for the mobile expand view. All three content elements are visible simultaneously.

Use this as the baseline when:
- Verifying the complete card layout at any breakpoint.
- Checking that the sheet drag interaction works end-to-end (default → panel-view → full-view).
- Confirming the video translates upward correctly as the sheet expands.
- Testing the linkout toggle button in the action bar (opens/closes the strip).
        `,
      },
    },
  },
  args: {
    links: LINKS_FULL,
    ...CTA_WITH_BUTTON,
  },
};
