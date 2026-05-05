import { Checkbox } from "@genuin/ui/components/checkbox";
import { PlayIcon, SparkIcon, ShareIcon, CommentIcon, RepostIcon } from "@genuin/ui/icons";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { formatRelativeTime } from "@genuin/components/lib/utils";
import { CommunityPill } from "@genuin/components/molecules/feed-player/pills/community-pill";
import { GroupPill } from "@genuin/components/molecules/feed-player/pills/group-pill";
import { Link } from "@genuin/components/molecules/link";
import { PostTile } from "@genuin/components/molecules/post-tile";
import { ReadMore } from "@genuin/components/molecules/read-more";
import { DataTableColumnHeader } from "@genuin/components/organisms/data-table/data-table-column-header";
import type { Post } from "@genuin/components/react-query/api/posts/types";

import { ActionsCell } from "./actions-cell";
import { StatsCell } from "./components";
import { LinkoutsListModal } from "./linkouts-list-modal";

export interface ColumnFactoryOptions {
  onRefresh?: () => void;
  variant: "posted" | "draft";
}

// Shared column definitions
export const createSelectColumn = (): ColumnDef<Post> => ({
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      variant={"default"}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      variant={"default"}
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
  size: 50,
  minSize: 50,
  maxSize: 50,
});

export const createDescriptionColumn = (): ColumnDef<Post> => ({
  accessorKey: "video.descriptionText",
  header: "Description",
  size: 300,
  minSize: 300,
  maxSize: 300,
  cell: ({ row }) => {
    const { video } = row.original;
    return (
      <div className="gencl:w-full">
        <div className="gencl:flex gencl:flex-row gencl:gap-2 gencl:items-start">
          <PostTile
            postData={{
              postId: video.id,
              imageUrl: video.thumbnail || "",
              isPinned: false,
              linkouts: undefined,
              url: video.shareUrl,
            }}
            showHover={false}
            imageCompProps={{
              alt: video.descriptionText || "Post thumbnail",
              useWebp: false,
            }}
            className="gencl:h-21 gencl:w-12 gencl:flex-shrink-0"
          />
          <div className="gencl:flex-1 gencl:min-w-0 gencl:py-1">
            <ReadMore
              maxLines={3}
              maxChars={300}
              showExpandText={false}
              text={video.descriptionText || ""}
              textClassName="gencl:!text-body-1-medium gencl:text-secondary-800 gencl:leading-5 gencl:whitespace-normal gencl:line-clamp-3"
              position="outside"
            />
          </div>
        </div>
      </div>
    );
  },
  meta: {
    cellClassName: "gencl:align-top gencl:whitespace-normal",
  },
});

export const createCommunityGroupColumn = (): ColumnDef<Post> => ({
  accessorKey: "community",
  header: "Community/ Group",
  size: 200,
  minSize: 150,
  maxSize: 350,
  cell: ({ row }) => {
    const { community, group } = row.original;

    // Map Post["community"] to PostDetailsType["community"]
    const mappedCommunity = {
      id: community.id,
      slug: community.slug,
      shareUrl: "", // Not available in new response
      isPrivate: false, // Assuming public
      handle: community.handle,
      userRole: "UNJOINED" as const, // Default role
      membersCount: null, // Not available
      groupsCount: community.groupsCount,
      postsCount: community.postsCount,
      name: community.name,
      description: community.description,
      colorCode: community.colorCode,
      textColorCode: community.textColorCode,
      profileImage: community.profileImage,
      type: community.type,
      loopsCount: community.groupsCount, // Assuming loops are groups
    };
    return (
      <div className="gencl:flex gencl:items-start gencl:gap-2 gencl:flex-col gencl:p-0">
        <CommunityPill
          communityDetails={mappedCommunity}
          variant="compact"
          isHoverable={false}
          onCommunityJoinStatusChange={() => {}}
        />
        <GroupPill
          groupDetails={{
            id: group.id,
            slug: group.slug,
            role: "UNJOINED",
            description: group.description,
            isPrivate: false,
            name: group.name,
            shareUrl: group.shareUrl,
            isSubscribed: true,
          }}
          communityDetails={mappedCommunity}
          variant="compact"
          onGroupJoinStatusChange={() => {}}
          onGroupSubscriptionChange={() => {}}
        />
      </div>
    );
  },
});

interface LinkoutsCellProps {
  linkouts: Post["video"]["linkouts"];
  postId: string;
  variant: "posted" | "draft";
}

function LinkoutsCell({ linkouts, postId, variant }: LinkoutsCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allUrls = linkouts?.flatMap((linkout) => linkout.links.map((link) => link.link)) || [];

  return (
    <>
      {allUrls.length > 0 ? (
        <div className="gencl:flex gencl:flex-col gencl:gap-1">
          <Link
            href={allUrls[0] ?? "/home"}
            target="_blank"
            rel="noopener noreferrer"
            className="gencl:text-body-2-medium! gencl:text-blue gencl:cursor-pointer gencl:underline gencl:m-0 gencl:line-clamp-2! gencl:break-all gencl:overflow-hidden gencl:block">
            {allUrls[0]}
          </Link>

          {allUrls.length > 1 && (
            <div className="gencl:text-body-2-medium gencl:cursor-pointer" onClick={() => setIsModalOpen(true)}>
              + {allUrls.length - 1} more
            </div>
          )}
        </div>
      ) : (
        <span className="gencl:text-body-1-medium">None</span>
      )}

      <LinkoutsListModal
        links={allUrls}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        postId={postId}
        type={variant}
      />
    </>
  );
}

export const createLinkoutsColumn = (variant: "posted" | "draft"): ColumnDef<Post> => ({
  accessorKey: "video.linkouts",
  header: "Linkouts",
  size: 100,
  minSize: 100,
  maxSize: 150,
  cell: ({ row }) => (
    <LinkoutsCell linkouts={row.original.video.linkouts} postId={row.original.video.id} variant={variant} />
  ),
  meta: {
    cellClassName: "gencl:whitespace-normal!",
  },
});

export const createDateColumn = (variant: "posted" | "draft"): ColumnDef<Post> => ({
  accessorKey: "video.createdAt",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={variant === "posted" ? "Date" : "Last Edited"} />
  ),
  size: 100,
  minSize: 100,
  maxSize: 100,
  enableSorting: true,
  cell: ({ row }) => {
    const date = row.original.video.createdAt;
    const formatted = formatRelativeTime(date);
    return <div className="gencl:text-body-1-medium">{formatted}</div>;
  },
});

export const createActionsColumn = (variant: "posted" | "draft", onRefresh?: () => void): ColumnDef<Post> => ({
  id: "actions-right",
  size: 150,
  minSize: 120,
  maxSize: 180,
  cell: ({ row }) => (
    <ActionsCell variant={variant} postId={row.original.video.id} onPublished={onRefresh} onDelete={onRefresh} />
  ),
});

// Stats columns for posted videos only
export const createStatsColumns = (): ColumnDef<Post>[] => [
  {
    id: "noOfPlays",
    header: () => (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <PlayIcon theme="light" size={"lg"} />
      </div>
    ),
    size: 50,
    enableSorting: false,
    cell: ({ row, table }) => <StatsCell statKey="noOfPlays" row={row} table={table} />,
  },
  {
    id: "noOfLikes",
    header: () => (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <SparkIcon theme="light" size={"lg"} />
      </div>
    ),
    size: 50,
    enableSorting: false,
    cell: ({ row, table }) => <StatsCell statKey="noOfLikes" row={row} table={table} />,
  },
  {
    id: "noOfShares",
    header: () => (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <ShareIcon theme="light" size={"lg"} />
      </div>
    ),
    size: 50,
    enableSorting: false,
    cell: ({ row, table }) => <StatsCell statKey="noOfShares" row={row} table={table} />,
  },
  {
    id: "noOfComments",
    header: () => (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <CommentIcon theme="light" size={"lg"} />
      </div>
    ),
    size: 50,
    enableSorting: false,
    cell: ({ row, table }) => <StatsCell statKey="noOfComments" row={row} table={table} />,
  },
  {
    id: "noOfReposts",
    header: () => (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <RepostIcon theme="light" size={"lg"} />
      </div>
    ),
    size: 50,
    enableSorting: false,
    cell: ({ row }) => {
      const reposts = row.original.video.noOfReposts;
      return (
        <div className="gencl:flex gencl:items-center gencl:justify-center">
          <span className="gencl:text-body-1-medium">{reposts || 0}</span>
        </div>
      );
    },
  },
];

// Main factory function to create columns based on variant
export const createColumns = (options: ColumnFactoryOptions): ColumnDef<Post>[] => {
  const { variant, onRefresh } = options;

  const baseColumns = [
    createSelectColumn(),
    createDescriptionColumn(),
    createCommunityGroupColumn(),
    createLinkoutsColumn(variant),
    createDateColumn(variant),
  ];

  if (variant === "posted") {
    return [...baseColumns, ...createStatsColumns(), createActionsColumn(variant, onRefresh)];
  }

  return [...baseColumns, createActionsColumn(variant, onRefresh)];
};
