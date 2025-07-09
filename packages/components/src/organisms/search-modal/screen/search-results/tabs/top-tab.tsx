import { ComponentProps } from "react";
import { cn } from "@genuin/ui/lib/utils";
import type { TopResultsResponseType } from "@genuin/components/react-query/api/search";
import { CommunityCard } from "@genuin/components/organisms/community-card";
import { GroupCard } from "@genuin/components/organisms/group-card";
import { PostTile } from "@genuin/components/molecules/post-tile";
import { Button } from "@genuin/ui/components/button";
import { MemberItem } from "@genuin/components/molecules/member-item";
import { HorizontalScrollContainer } from "@genuin/components/molecules/horizontal-scroll-container";
import { DialogClose } from "@genuin/ui/components/dialog";
import { urlGenerators } from "../../../shared";

type SectionHeaderProps = {
  title: string;
  onSeeAll?: () => void;
};

function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <div className="gencl:flex gencl:items-center gencl:justify-between gencl:mb-0">
      <h3 className="gencl:text-body-0-semi-bold: gencl:text-black">{title}</h3>
      <Button theme="text" size="sm" className="gencl:px-0!" onClick={onSeeAll}>
        <span className="gencl:text-body-1-semi-bold gencl:text-secondary-600">
          See all{" "}
        </span>
      </Button>
    </div>
  );
}

type TopTabProps = {
  topResults: TopResultsResponseType;
  onSelect?: (result: any) => void;
  query: string;
  onSeeAll?: (tab: "posts" | "groups" | "communities" | "profiles") => void;
} & ComponentProps<"div">;

export function TopTab({
  topResults,
  onSelect,
  query,
  className,
  onSeeAll,
  ...restProps
}: TopTabProps) {
  // Create sections map for easy access
  const sectionsMap = {
    videos: topResults.videos.length > 0 && (
      <section key="posts" className="gencl:mb-0">
        <SectionHeader title="Posts" onSeeAll={() => onSeeAll?.("posts")} />

        <HorizontalScrollContainer gap="sm">
          {topResults.videos.slice(0, 9).map((video) => (
            <div key={video.message_id} className="gencl:flex-shrink-0">
              <PostTile
                postData={{
                  postId: video.message_id,
                  imageUrl: video.thumbnail_url || "",
                  isPinned: false,
                  linkouts: undefined,
                  url: urlGenerators.video(video.slug),
                  stats: {
                    views: video.no_of_views,
                    comments: video.no_of_comments,
                    reactions: video.no_of_reactions,
                  },
                }}
                imageCompProps={{
                  // alt: video.message_summary || "Post thumbnail",
                  useWebp: false,
                }}
                size="sm"
                className="gencl:flex-none gencl:w-40 sm:gencl:w-44 md:gencl:w-48"
                shouldCloseModal={true}
              />
            </div>
          ))}
        </HorizontalScrollContainer>
      </section>
    ),
    loops: topResults.loops.length > 0 && (
      <section key="groups" className="gencl:mb-0">
        <SectionHeader title="Groups" onSeeAll={() => onSeeAll?.("groups")} />

        <HorizontalScrollContainer gap="lg">
          {topResults.loops.map((loop) => (
            <div
              key={loop.chat_id}
              className="gencl:flex-shrink-0 gencl:max-w-80 gencl:min-w-xs" //added min height to make all cards same height
            >
              <GroupCard
                owner={{
                  userName: "owner",
                  url: "",
                }}
                group={{
                  chat_id: loop.chat_id || "",
                  name: loop.group.group_name || "",
                  isPrivate: !loop.is_view_allowed,
                  url: urlGenerators.group(loop.slug || ""),
                  slug: loop.group.slug || "",
                  description: loop.group.group_description || "",
                  stats: {
                    members: loop.group.no_of_members,
                    posts: loop.group.no_of_videos,
                    views: loop.group.no_of_views,
                  },
                }}
                variant="search"
                onClick={() => onSelect?.(loop)}
                url={urlGenerators.group(loop.slug || "")}
                shouldCloseModal={true}
                className="gencl:min-h-34"
              />
            </div>
          ))}
        </HorizontalScrollContainer>
      </section>
    ),
    communities: topResults.communities.length > 0 && (
      <section key="communities" className="gencl:mb-0">
        <SectionHeader
          title="Communities"
          onSeeAll={() => onSeeAll?.("communities")}
        />

        <HorizontalScrollContainer gap="lg">
          {topResults.communities.map((community) => (
            <div
              key={community.community_id}
              className="gencl:flex-shrink-0 gencl:max-w-96"
            >
              <CommunityCard
                community={{
                  id: community.community_id,
                  name: community.name || "",
                  handle: community.handle,
                  slug: community.slug,
                  description: community.description || "",
                  dp: community.dp || "",
                  banner: "",
                  stats: {
                    members: community.no_of_members || 0,
                    groups: community.no_of_loops || 0,
                    posts: community.no_of_loops || 0,
                  },
                  type: community.type === 1 ? "PRIVATE" : "PUBLIC",
                }}
                variant="search"
                url={urlGenerators.community(community.slug)}
                shouldCloseModal={true}
                onSelect={() => {
                  console.log("Community selected:", community);
                }}
              />
            </div>
          ))}
        </HorizontalScrollContainer>
      </section>
    ),
    people: topResults.people.length > 0 && (
      <section key="profiles" className="gencl:mb-0">
        <SectionHeader
          title="Profiles"
          onSeeAll={() => onSeeAll?.("profiles")}
        />

        <HorizontalScrollContainer gap="lg">
          {topResults.people.slice(0, 5).map((person) => {
            const memberData = {
              memberId: person.user_id,
              // isOwner: !!person.brand,
              brand: person.brand ?? undefined,
              name: person.name || person.nickname,
              url: urlGenerators.profile(person.nickname, person.brand),
              profileImage: {
                isAvatar: person.is_avatar,
                url: person.profile_image || "",
              },
              bio: person.bio || "",
              userName: person.nickname,
            };

            return (
              <div
                key={person.user_id}
                className="gencl:flex-shrink-0 gencl:cursor-pointer gencl:hover:bg-secondary-50 gencl:rounded-md gencl:p-2"
              >
                <DialogClose asChild>
                  <MemberItem memberData={memberData} variant="profile" />
                </DialogClose>
              </div>
            );
          })}
        </HorizontalScrollContainer>
      </section>
    ),
  };

  // Get the ranking order from topResults, fallback to default order if not provided
  const rankingOrder = topResults.ranking || [
    "videos",
    "loops",
    "communities",
    "people",
  ];

  // Filter out sections that are falsy (empty arrays) and sort by ranking
  const orderedSections = rankingOrder
    .map((key) => sectionsMap[key as keyof typeof sectionsMap])
    .filter(Boolean);

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      {orderedSections}
    </div>
  );
}
