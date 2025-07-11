import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";
import { useMemo } from "react";

import { GroupPosts } from "@genuin/components/organisms/group-posts";
import { MemberList } from "@genuin/components/organisms/member-list";
import { useGetGroupMembers } from "@genuin/components/react-query/api/group/members";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

type GroupDetailsTabsProps = Omit<
  {
    slug: string;
  } & React.ComponentProps<typeof Tabs>,
  "defaultValue" | "defaultChecked" | "children"
>;

export function GroupDetailsTabs({
  slug,
  className,
  ...restProps
}: GroupDetailsTabsProps) {
  return (
    <Tabs
      defaultValue="posts"
      className={cn("gencl:w-full gencl:h-full", className)}
      {...restProps}
    >
      <TabsList className="gencl:bg-white">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">
        <GroupPosts slug={slug} lazyLoad="auto" enableFeedView />
      </TabsContent>
      <TabsContent value="members">
        <GroupMembers slug={slug} />
      </TabsContent>
    </Tabs>
  );
}

function GroupMembers({ slug }: { slug: string }) {
  const {
    isError,
    isLoading,
    data: membersData,
    fetchNextPage,
    hasNextPage,
  } = useGetGroupMembers(slug);

  const members = useMemo(
    () => membersData?.pages.flatMap((page) => page.members) ?? [],
    [membersData]
  );

  return (
    <MemberList
      className="gencl:max-w-md"
      isLoading={isLoading}
      isError={isError}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      members={members.map((member) => ({
        bio: member.bio ?? "",
        name: member.name ?? "",
        profileImage: {
          isAvatar: member.is_avatar,
          url: member.profile_image_m ?? member.profile_image ?? "",
        },
        userName: member.nickname ?? member.phone ?? member.member_id,
        isOwner: false,
        memberId: member.member_id,
        brand: {
          brand_id: member.brand?.brand_id ?? 0,
          brand_slug: member.brand?.brand_slug ?? "",
          brand_user_logo: member.brand?.brand_user_logo ?? -1,
        },
        url: buildPageUrl({
          type: !!member.brand ? "brand" : "profile",
          slug: !!member.brand
            ? (member.brand.brand_slug ?? undefined)
            : (member.nickname ?? undefined),
        }),
      }))}
    />
  );
}
