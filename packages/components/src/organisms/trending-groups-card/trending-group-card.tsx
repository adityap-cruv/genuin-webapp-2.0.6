import { Avatar } from "@genuin/ui/components/avatar";
import { Image } from "@genuin/ui/components/image";
import { ReadMore } from "@genuin/ui/components/read-more";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import React from "react";
import { getOpacity } from "./utils";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

type TrendingGroupCardProps = {
  slug: string;
  groupName: string;
  memberCount: number;
  postCount: number;
  userAvatars: {
    imageUrl: string;
    alt: string;
    isAvatar: boolean;
    userName: string;
    name: string;
  }[];
  description: string;
  postData: {
    imageUrl: string;
    alt: string;
    slug: string;
  }[];
};

export const TrendingGroupCard = ({
  slug,
  groupName,
  memberCount,
  postCount,
  userAvatars,
  description,
  postData,
}: TrendingGroupCardProps) => {
  const visiblePostThumbnails = postData?.slice(0, 3) || [];

  return (
    <Link
      href={buildPageUrl({ type: "group", slug: slug })}
      className="gencl:h-full"
    >
      <div className="gencl:border gencl:rounded-lg gencl:border-secondary-150 gencl:relative gencl:overflow-hidden gencl:w-full">
        <div className="gencl:px-4 gencl:py-3">
          <div className="gencl:space-y-1">
            {groupName && (
              <ReadMore
                maxChars={40}
                textClassName="gencl:!text-body-1-semi-bold gencl:p-0"
                text={groupName}
              />
            )}
            <span className="gencl:text-gray-500 gencl:text-body-2-bold">
              {memberCount && (
                <>
                  <span className="gencl:text-secondary-900">
                    {abbreviateNumber(memberCount)}
                  </span>{" "}
                  <span className="gencl:text-secondary-600 gencl:font-medium">
                    members
                  </span>
                </>
              )}
              {memberCount && postCount && (
                <span className="gencl:mx-2 gencl:text-secondary-600">•</span>
              )}
              {postCount && (
                <>
                  <span className="gencl:text-secondary-900">
                    {abbreviateNumber(postCount)}
                  </span>{" "}
                  <span className="gencl:text-secondary-600 gencl:font-medium">
                    posts
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
        <div className="gencl:flex gencl:justify-between gencl:p-4 gencl:bg-secondary-50 gencl:items-start">
          <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:w-[70%]">
            <div className="gencl:flex gencl:items-center">
              <div
                className={`gencl:mr-1 gencl:relative gencl:flex ${userAvatars.length > 1 ? "gencl:space-x-[-10px]" : ""}`}
              >
                {userAvatars.map((item, index) => (
                  <Avatar
                    key={index}
                    isAvatar={item?.isAvatar}
                    imageUrl={item?.imageUrl}
                    alt={item?.alt}
                    size="xs"
                    className={`z-[${index * 5}] h-6 w-6 gencl:border-2 gencl:border-white`}
                  />
                ))}
              </div>
              {userAvatars.length > 0 && (
                <p className="gencl:!text-body-2-semi-bold">
                  <b>@{userAvatars[0]!.userName}</b>
                  <span className="gencl:text-secondary-700 gencl:font-medium">
                    {userAvatars.length - 1 !== 0
                      ? userAvatars.length - 1 === 1
                        ? " +1 Other"
                        : ` +${abbreviateNumber(userAvatars.length - 1)} Others`
                      : ""}
                  </span>
                </p>
              )}
            </div>
            <ReadMore
              text={description}
              maxLines={3}
              showExpandText={false}
              textClassName="gencl:!text-body-2-medium gencl:text-secondary-600"
            />
          </div>

          <div className="gencl:relative gencl:h-36 gencl:max-h-36 gencl:-mt-16">
            {visiblePostThumbnails.slice(0, 3)?.map((item, index) => {
              const offset = index * 5;
              const zIndex = index;
              const opacity = getOpacity(index, visiblePostThumbnails.length);

              return (
                <Link
                  href={buildPageUrl({ type: "video", slug: item.slug })}
                  key={index}
                  style={{
                    position: "absolute",
                    top: `${offset}px`,
                    right: `${offset}px`,
                    zIndex,
                    opacity,
                  }}
                  className="gencl:transition-transform gencl:h-[95%] gencl:duration-300 gencl:aspect-[9/16] gencl:w-auto"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.alt}
                    radius="lg"
                    aspectRatio="reel"
                    className="gencl:h-full gencl:w-auto gencl:aspect-[9/16] gencl:shadow-md gencl:object-cover"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
};

export function TrendingGroupCardSkeleton() {
  return (
    <div className="gencl:border gencl:rounded-lg gencl:border-secondary-150 gencl:relative gencl:overflow-hidden">
      <div className="gencl:p-4">
        <div className="gencl:flex gencl:flex-col gencl:gap-2">
          <Skeleton className="gencl:w-50 gencl:h-5 gencl:rounded-md gencl:mt-1.5" />
          <div className="gencl:flex gencl:items-center gencl:gap-2">
            {Array.from({ length: 2 }).map((_, idx, arr) => (
              <React.Fragment key={idx}>
                <Skeleton className="gencl:w-20 gencl:h-4 gencl:rounded-md" />
                {idx < arr.length - 1 && (
                  <Skeleton className="gencl:w-1 gencl:h-1 gencl:rounded-md" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="gencl:flex gencl:justify-between gencl:p-5 gencl:bg-secondary-50 gencl:items-start">
        <div
          className="gencl:flex gencl:flex-col"
          style={{
            width: "calc(100% - 150px)",
          }}
        >
          <div className="gencl:flex gencl:mb-2 gencl:items-center">
            <div
              className={`gencl:mr-1 gencl:relative gencl:flex gencl:space-x-[-10px]`}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="gencl:size-6 gencl:rounded-full gencl:shrink-0"
                />
              ))}
            </div>
            <Skeleton className="gencl:w-30 gencl:h-3 gencl:rounded-md gencl:mt-1.5 gencl:mb-2" />
          </div>
          <div className="gencl:flex gencl:flex-col gencl:gap-1">
            <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
            <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
            <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
          </div>
        </div>

        <div className="gencl:relative gencl:max-h-44 gencl:-mt-24">
          {Array.from({ length: 3 }).map((_, index) => {
            const offset = index * 5;
            const zIndex = index;
            const opacity = getOpacity(index, 3);

            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  top: `${offset}px`,
                  right: `${offset}px`,
                  zIndex,
                  opacity,
                }}
                className="gencl:h-44 gencl:w-24 gencl:transition-transform gencl:duration-300"
              >
                <Skeleton className="gencl:h-full gencl:w-full" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
