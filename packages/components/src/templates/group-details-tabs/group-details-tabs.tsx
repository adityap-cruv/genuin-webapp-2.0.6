import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GroupPosts } from "@genuin/components/organisms/group-posts";
import { MemberList } from "@genuin/components/organisms/member-list";
import { useGetGroupMembers } from "@genuin/components/react-query/api/group/members";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

type GroupDetailsTabsProps = Omit<
  {
    slug: string;
    aboutComponent?: React.ReactNode;
    ownerId?: string;
  } & React.ComponentProps<typeof Tabs>,
  "defaultValue" | "defaultChecked" | "children"
>;

export function GroupDetailsTabs({
  slug,
  className,
  aboutComponent,
  ownerId,
  ...restProps
}: GroupDetailsTabsProps) {
  const { isDesktop } = useDeviceDetectMediaQuery();
  const [value, setValue] = useState("posts");
  const contentClassName = "gencl:p-4 gencl:sm:p-0! gencl:sm:pt-6!";

  useEffect(() => {
    if (isDesktop && value === "about") {
      setValue("posts");
    }
  }, [isDesktop]);

  const handleValueChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  return (
    <Tabs
      value={value}
      className={cn("gencl:w-full gencl:h-full", className)}
      onValueChange={handleValueChange}
      {...restProps}
    >
      <TabsList className="gencl:bg-white">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        {!isDesktop && <TabsTrigger value="about">About</TabsTrigger>}
      </TabsList>
      <TabsContent value="posts" className={contentClassName}>
        <GroupPosts
          slug={slug}
          lazyLoad="auto"
          enableFeedView
          postTileVariant="default"
          gridClassName={cn(!isDesktop && "gencl:grid-cols-2!")}
        />
      </TabsContent>
      <TabsContent value="members" className={contentClassName}>
        <GroupMembers slug={slug} ownerId={ownerId} />
      </TabsContent>
      {!isDesktop && (
        <TabsContent value="about" className={contentClassName}>
          {aboutComponent}
        </TabsContent>
      )}
    </Tabs>
  );
}

function GroupMembers({ slug, ownerId }: { slug: string; ownerId?: string }) {
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
        isOwner: member.member_id === ownerId,
        memberId: member.member_id,
        brand: {
          brandId: member.brand?.brand_id ?? 0,
          brandSlug: member.brand?.brand_slug ?? "",
          brandUserLogo: member.brand?.brand_user_logo ?? -1,
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
