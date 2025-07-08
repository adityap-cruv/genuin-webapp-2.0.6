"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@genuin/ui/accordion";
import { Avatar } from "@genuin/ui/avatar";
import { RECENT_COMMUNITIES_KEY } from "@genuin/components/lib/constants";
import { useLocalStorage } from "usehooks-ts";
import { RecentCommunity } from "@genuin/components/types/community";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Link } from "@genuin/components/molecules/link";
import { compressText } from "@genuin/components/lib/utils";

export function Recent() {
  const [communities] = useLocalStorage<RecentCommunity[]>(
    RECENT_COMMUNITIES_KEY,
    []
  );

  const recentCommunities = Array.isArray(communities)
    ? communities.filter(Boolean).slice(0, 3)
    : [];

  if (recentCommunities.length === 0) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible={true}
      defaultValue="recent-communities"
      className="gencl:w-full gencl:py-4 gencl:px-3 gencl:border-secondary-100"
    >
      <AccordionItem value="recent-communities">
        <AccordionTrigger className="gencl:px-3 gencl:py-2 gencl:hidden gencl:xl:!flex">
          <p className="gencl:text-body-1-bold">Recent</p>
        </AccordionTrigger>
        <AccordionContent className="gencl:pb-0">
          {recentCommunities.map((community, commIndex) => (
            <Link
              key={commIndex}
              href={buildPageUrl({
                type: "community",
                slug: community.slug,
                searchParams: { feed: "1" },
              })}
              className="gencl:flex gencl:items-center gencl:gap-2 gencl:py-2 gencl:px-2 gencl:xl:px-3 gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:rounded-lg"
            >
              <Avatar
                isAvatar={false}
                imageUrl={community.dp}
                alt={community.community_name}
                size="xs"
              />
              <p className="gencl:text-body-1-medium gencl:hidden gencl:xl:!block gencl:!line-clamp-1">
                 {compressText(community.community_name,20) }
              </p>
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
