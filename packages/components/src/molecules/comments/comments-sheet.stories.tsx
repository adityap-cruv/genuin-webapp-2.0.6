"use client";
import { DynamicSheet, type DynamicSheetState } from "@genuin/ui";
import { Avatar } from "@genuin/ui/avatar";
import { VideoPlayer } from "@genuin/ui/components/video-player";
import { cn } from "@genuin/ui/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Actions } from "@genuin/components/molecules/actions";
import { Pills } from "@genuin/components/molecules/feed-player/pills/pills";
import { ReadMore } from "@genuin/components/molecules/read-more";

// ─── Dummy Data ───────────────────────────────────────────────────────────────

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

const DUMMY_COMMENTS = [
  {
    commentId: "c1",
    commentText: "This is such an amazing video! Really loved the content 🔥",
    createdAt: Date.now() - 1000 * 60 * 2, // 2 min ago
    noOfSparks: 12,
    isSparked: true,
    owner: {
      memberId: "u1",
      nickname: "alex_creator",
      profileImage: "https://i.pravatar.cc/150?img=1",
      isAvatar: false,
    },
  },
  {
    commentId: "c2",
    commentText: "Great explanation! Could you do a follow-up on this topic?",
    createdAt: Date.now() - 1000 * 60 * 15, // 15 min ago
    noOfSparks: 5,
    isSparked: false,
    owner: {
      memberId: "u2",
      nickname: "sarah_dev",
      profileImage: "https://i.pravatar.cc/150?img=5",
      isAvatar: false,
    },
  },
  {
    commentId: "c3",
    commentText: "Just discovered this channel and already hooked!",
    createdAt: Date.now() - 1000 * 60 * 30, // 30 min ago
    noOfSparks: 23,
    isSparked: false,
    owner: {
      memberId: "u3",
      nickname: "mike_watches",
      profileImage: "https://i.pravatar.cc/150?img=8",
      isAvatar: true,
    },
  },
  {
    commentId: "c4",
    commentText: "The production quality here is top notch. Keep it up! The lighting and audio are on point.",
    createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
    noOfSparks: 8,
    isSparked: true,
    owner: {
      memberId: "u4",
      nickname: "cinephile_99",
      profileImage: "https://i.pravatar.cc/150?img=12",
      isAvatar: false,
    },
  },
  {
    commentId: "c5",
    commentText: "This changed my perspective completely. Thank you!",
    createdAt: Date.now() - 1000 * 60 * 120, // 2 hours ago
    noOfSparks: 41,
    isSparked: false,
    owner: {
      memberId: "u5",
      nickname: "thoughtful_viewer",
      profileImage: "https://i.pravatar.cc/150?img=15",
      isAvatar: false,
    },
  },
  {
    commentId: "c6",
    commentText: "Sharing this with everyone I know 🙌",
    createdAt: Date.now() - 1000 * 60 * 180, // 3 hours ago
    noOfSparks: 3,
    isSparked: false,
    owner: {
      memberId: "u6",
      nickname: "jenny_shares",
      profileImage: "https://i.pravatar.cc/150?img=20",
      isAvatar: false,
    },
  },
];

// ─── Helper: format relative time ────────────────────────────────────────────

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Mock Comment Item ────────────────────────────────────────────────────────

function MockCommentItem({ comment }: { comment: (typeof DUMMY_COMMENTS)[number] }) {
  return (
    <div className="gencl:flex gencl:gap-2 gencl:group gencl:last:pb-4">
      <Avatar alt={comment.owner.nickname} imageUrl={comment.owner.profileImage} isAvatar={comment.owner.isAvatar} />
      <div className="gencl:space-y-1 gencl:w-full">
        <div className="gencl:flex gencl:items-center gencl:justify-between">
          <div className="gencl:flex gencl:items-center gencl:gap-1">
            <span className="gencl:text-body-1-semi-bold">@{comment.owner.nickname}</span>
            <span className="gencl:text-body-2-normal gencl:text-secondary-500">{getTimeAgo(comment.createdAt)}</span>
          </div>
        </div>
        <p className="gencl:text-body-1-normal gencl:leading-snug">{comment.commentText}</p>
      </div>
    </div>
  );
}

// ─── Mock Comment Input ────────────────────────────────────────────────────────

function MockCommentInput({ onPost }: { onPost?: (text: string) => void }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onPost?.(value.trim());
    setValue("");
  };

  return (
    <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:px-4 gencl:py-3 gencl:border-t gencl:border-secondary-200 gencl:bg-white">
      <input
        className="gencl:flex-1 gencl:bg-secondary-100 gencl:rounded-full gencl:px-4 gencl:py-2 gencl:text-body-1-normal gencl:outline-none gencl:placeholder:text-secondary-400"
        placeholder="Add a comment…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        aria-label="Comment input"
      />
      <button
        disabled={!value.trim()}
        onClick={handleSubmit}
        className={cn(
          "gencl:text-body-1-semi-bold gencl:transition-opacity",
          value.trim()
            ? "gencl:text-primary gencl:opacity-100"
            : "gencl:text-secondary-400 gencl:opacity-50 gencl:cursor-not-allowed"
        )}
        aria-label="Post comment">
        Post
      </button>
    </div>
  );
}

// ─── Comments Sheet Wrapper ───────────────────────────────────────────────────

function CommentsSheetDemo({
  initialOpen = false,
  viewportHeight = 812,
}: {
  initialOpen?: boolean;
  viewportHeight?: number;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [sheetState, setSheetState] = useState<DynamicSheetState>("panel-view");
  const [comments, setComments] = useState(DUMMY_COMMENTS);

  const handlePost = (text: string) => {
    const newComment = {
      commentId: `c${Date.now()}`,
      commentText: text,
      createdAt: Date.now(),
      noOfSparks: 0,
      isSparked: false,
      owner: {
        memberId: "me",
        nickname: "you",
        profileImage: "https://i.pravatar.cc/150?img=33",
        isAvatar: false,
      },
    };
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full gencl:overflow-hidden gencl:bg-neutral-900">
      {/* Video Player Background */}
      <div className="gencl:absolute gencl:inset-0 gencl:pointer-events-none">
        <VideoPlayer
          poster={STORY_VIDEO_POSTER}
          play={false}
          controls={false}
          muted
          preload="none"
          isInExpandView
          className="gencl:h-full gencl:w-full gencl:object-cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Bottom Content — Avatar, Description, Pills, Actions, and Comment Button */}
      <div className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:z-10 gencl:bg-gradient-to-t gencl:from-black/90 gencl:via-black/55 gencl:to-transparent gencl:px-4 gencl:pb-6 gencl:pt-16 gencl:text-white gencl:flex gencl:flex-col gencl:gap-4">
        {/* Avatar + Name + Username */}
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

        {/* Description */}
        <ReadMore
          text={STORY_POST_DETAILS.video.description[0]}
          maxLines={2}
          showExpandText={false}
          textClassName="gencl:text-body-1-medium gencl:text-white"
        />

        {/* Pills (Community & Group Tags) */}
        <Pills
          communityDetails={STORY_POST_DETAILS.community}
          groupDetails={STORY_POST_DETAILS.group}
          videoId={STORY_POST_DETAILS.video.id}
          hideCommunityJoinButton
          hideGroupSubscriptionButton
          className="gencl:flex-wrap gencl:[&_*]:!bg-transparent"
        />

        {/* Action Buttons (Spark, Comment, Share, etc.) */}
        <div className="gencl:absolute gencl:right-4 gencl:bottom-8">
          <Actions
            variant="mobile"
            theme="dark"
            isReacted={STORY_POST_DETAILS.video.isSparked}
            reactionCount={STORY_POST_DETAILS.video.sparkCount}
            contentId={STORY_POST_DETAILS.video.id}
            shareUrl={STORY_POST_DETAILS.video.shareUrl}
            slug={STORY_POST_DETAILS.video.slug}
            groupSlug={STORY_POST_DETAILS.group.slug}
            isLinkoutsOpen={false}
            className="gencl:pb-2"
            actionWrapper={{
              COMMENT: (node) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                  }}>
                  {node}
                </button>
              ),
              REPOST: (node) => <div>{node}</div>,
              REACTION: (node) => <div>{node}</div>,
              SHARE: (node) => <div>{node}</div>,
              MORE: (node) => <div>{node}</div>,
            }}
          />
        </div>
      </div>

      {/* DynamicSheet — same config as ExpandViewDetails */}
      <DynamicSheet
        isOpen={isOpen}
        renderMode="container"
        config={{
          initialState: "panel-view",
          enabledStates: ["panel-view", "full-view"],
          heights: {
            default: "100px",
            "default-active": "160px",
            "expand-view": "300px",
            "panel-view": "70vh",
            "full-view": `100%`,
          },
          showClose: true,
          showOverlay: true,
          showIndicator: true,
          navTitle: "Comments",
          onStateChange: setSheetState,
          onClose: () => setIsOpen(false),
          theme: sheetState === "full-view" || sheetState === "panel-view" ? "light" : "dark",
        }}
        footer={<MockCommentInput onPost={handlePost} />}
        footerClassName="gencl:px-0 gencl:py-0 gencl:border-t-0"
        className={cn(
          (sheetState === "panel-view" || sheetState === "full-view") && "gencl:rounded-t-2xl! gencl:rounded-b-none!"
        )}>
        <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:px-4 gencl:pt-4">
          {comments.map((comment) => (
            <MockCommentItem key={comment.commentId} comment={comment} />
          ))}
        </div>
      </DynamicSheet>
    </div>
  );
}

// ─── Storybook Meta ───────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Molecules/CommentsSheet",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Comments section rendered inside a DynamicSheet — matches the expand-view player implementation. The sheet supports `panel-view` and `full-view` snap states, a draggable indicator, an overlay, and an inline comment input in the footer.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: "100vh", width: "375px", margin: "0 auto" }}
        className="gencl:relative gencl:overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj;

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Sheet opens in `panel-view` (70 vh). Drag the indicator up to go `full-view`.
 * Click the "Comments" button in the video area to open the sheet.
 */
export const Default: Story = {
  render: () => <CommentsSheetDemo viewportHeight={812} />,
};

/**
 * Sheet is already open on mount — useful for design reviews.
 */
export const OpenOnMount: Story = {
  render: () => <CommentsSheetDemo initialOpen viewportHeight={812} />,
};
