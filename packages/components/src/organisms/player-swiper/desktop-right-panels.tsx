"use client";

import { DynamicSheet } from "@genuin/ui";
import { cn } from "@genuin/ui/lib/utils";
import { lazy } from "react";

import type { VideoTypes } from "@genuin/components/context";
import { CommentInputBox } from "@genuin/components/molecules/comments/comment-input";
import { CommentsList } from "@genuin/components/molecules/comments/comments-list";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { setQueryDataForNewComment } from "@genuin/components/react-query/api/comments";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
);

type DesktopRightPanelsProps = {
  filteredPost: PostDetailsType[];
  activeIndex: number;
  totalVideos?: number;
  brandLayoutType: string;
  isLinkoutsPanelVisible?: boolean;
  isCommentsPanelVisible?: boolean;
  onCommentCountChange?: (videoId: string) => void;
  onCommentClose?: () => void;
  handleSwiperToggle: (disable: boolean) => void;
};

export function DesktopRightPanels({
  filteredPost,
  activeIndex,
  totalVideos,
  brandLayoutType,
  isLinkoutsPanelVisible,
  isCommentsPanelVisible,
  onCommentCountChange,
  onCommentClose,
  handleSwiperToggle,
}: DesktopRightPanelsProps) {
  const showBothPanels = isLinkoutsPanelVisible && isCommentsPanelVisible;
  const linkoutsPanelHeight = showBothPanels ? "gencl:h-[35%]" : "gencl:h-[100%]";
  const commentsPanelHeight = showBothPanels ? "gencl:h-[65%]" : "gencl:h-[100%]";
  const activePost = filteredPost[activeIndex];
  if (!activePost) return null;

  return (
    <div
      className={cn(
        "gencl:flex gencl:flex-col gencl:h-full gencl:w-full gencl:py-6 gencl:overflow-hidden gencl:transition-all gencl:duration-300 gencl:ease-in-out",
        isCommentsPanelVisible || isLinkoutsPanelVisible
          ? "gencl:max-w-118 gencl:opacity-100"
          : "gencl:max-w-0 gencl:opacity-0 gencl:pointer-events-none gencl:py-0! gencl:gap-0!",
        showBothPanels ? "gencl:gap-6" : "gencl:gap-0!"
      )}>
      <div
        className={cn(
          "gencl:w-full gencl:min-w-0 gencl:hidden gencl:sm:block! gencl:overflow-hidden gencl:transition-all gencl:duration-300 gencl:ease-in-out",
          isLinkoutsPanelVisible
            ? `${linkoutsPanelHeight} gencl:opacity-100`
            : "gencl:flex-none gencl:h-0 gencl:opacity-0 gencl:pointer-events-none"
        )}>
        <SafeSuspense fallback={null} errorFallback={null}>
          <Linkouts
            linkouts={activePost.video?.linkouts ?? []}
            linkoutId={activePost.video?.linkoutId ?? null}
            isActive
            showImmediately
            variant="dynamic"
            view="expand"
            videoDetails={activePost.video}
            totalVideos={totalVideos}
          />
        </SafeSuspense>
      </div>

      <div
        className={cn(
          "gencl:w-full gencl:min-w-0 gencl:hidden gencl:sm:block! gencl:overflow-hidden gencl:transition-all gencl:duration-300 gencl:ease-in-out",
          isCommentsPanelVisible
            ? `${commentsPanelHeight} gencl:opacity-100`
            : "gencl:flex-none gencl:h-0 gencl:opacity-0 gencl:pointer-events-none"
        )}>
        {isCommentsPanelVisible && brandLayoutType !== "iheart" && (
          <SafeSuspense fallback={null} errorFallback={null}>
            <DynamicSheet
              isOpen
              renderMode="inline"
              config={{
                initialState: "full-view",
                enabledStates: ["full-view"],
                heights: {
                  "full-view": "100%",
                },
                showClose: true,
                showIndicator: false,
                showFooter: true,
                navTitle: "Comments",
                disableDragAndSwipe: true,
                disableAnimation: true,
                onClose: onCommentClose,
                theme: "light",
              }}
              onDragging={handleSwiperToggle}
              footer={
                <CommentInputBox
                  communityId={activePost.community?.id ?? ""}
                  shareUrl={activePost.video?.shareUrl ?? ""}
                  loopId={activePost.group?.id ?? ""}
                  videoId={activePost.video?.id ?? ""}
                  videoSlug={activePost.video?.slug ?? ""}
                  onCommentPosted={(comments) => {
                    setQueryDataForNewComment(activePost.video?.id ?? "", comments);
                    onCommentCountChange?.(activePost.video?.id ?? "");
                  }}
                  videoType={activePost.video?.type as VideoTypes}
                />
              }
              headerClassName="gencl:text-body-0-semi-bold!"
              footerClassName="gencl:px-0! gencl:py-0!">
              <CommentsList
                videoId={activePost.video?.id ?? ""}
                showCloseButton={false}
                shareUrl={activePost.video?.shareUrl ?? ""}
                className="gencl:pt-4"
                videoSlug={activePost.video?.slug ?? ""}
                onCommentCountChange={onCommentCountChange}
                videoType={activePost.video?.type as VideoTypes}
              />
            </DynamicSheet>
          </SafeSuspense>
        )}
      </div>
    </div>
  );
}
