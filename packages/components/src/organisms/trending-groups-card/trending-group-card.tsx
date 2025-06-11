import { Avatar } from "@genuin/ui/components/avatar";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { abbreviateNumber } from "@genuin/ui/lib/utils";

type TrendingGroupCardProps = {
  groupName: string;
  memberCount: string;
  postCount: string;
  userAvatars: {
    imageUrl: string;
    alt: string;
    isAvatar: boolean;
    userName: string;
    name: string;
  }[];
  content: string;
  thumbnailAvatars: {
    imageUrl: string;
    alt: string;
    isAvatar: boolean;
  }[];
};

export const TrendingGroupCard = ({
  groupName,
  memberCount,
  postCount,
  userAvatars,
  content,
  thumbnailAvatars,
}: TrendingGroupCardProps) => {
  return (
    <div className="gencl:border gencl:rounded-2xl gencl:border-secondary-200 gencl:relative gencl:overflow-hidden gencl:w-full">
      <div className="gencl:px-5 gencl:py-6">
        <div>
          {groupName && (
            <h2 className="gencl:line-clamp-2 gencl:mb-2 gencl:text-headline-4-semi-bold gencl:w-[350px] gencl:pe-2">
              {groupName}
            </h2>
          )}
          <span className="text-sm text-gray-500">
            {memberCount && (
              <>
                <strong className="gencl:text-secondary-900">
                  {memberCount}
                </strong>{" "}
                <span className="gencl:text-secondary-600">members</span>
              </>
            )}
            {memberCount && postCount && (
              <span className="gencl:mx-2 gencl:text-secondary-600">•</span>
            )}
            {postCount && (
              <>
                <strong className="gencl:text-secondary-900">
                  {postCount}
                </strong>{" "}
                <span className="gencl:text-secondary-600">posts</span>
              </>
            )}
          </span>
        </div>
      </div>
      <div className="gencl:flex gencl:justify-between gencl:p-5 gencl:bg-secondary-50 gencl:items-start gencl:h-full">
        <div
          className="gencl:flex gencl:flex-col"
          style={{
            width: "calc(100% - 150px)",
          }}
        >
          <div className="gencl:flex gencl:mb-2 gencl:items-center">
            <div
              className={`gencl:mr-1 gencl:relative gencl:flex ${userAvatars.length > 1 ? "gencl:space-x-[-10px]" : ""}`}
            >
              {userAvatars.map((item, index) => (
                <Avatar
                  isAvatar={item?.isAvatar}
                  imageUrl={item?.imageUrl}
                  alt={item?.alt}
                  size="md"
                  className={`z-[${index * 5}] h-6 w-6 gencl:border-2 gencl:border-white`}
                />
              ))}
            </div>
            {userAvatars.length > 0 && (
              <p>
                <b>@{userAvatars[0]!.userName}</b>
                <span className="gencl:text-secondary-700 gencl:font-medium">
                  {userAvatars.length - 1 !== 0
                    ? userAvatars.length - 1 === 1
                      ? "+1 Other"
                      : `+${abbreviateNumber(userAvatars.length - 1)} Others`
                    : ""}
                </span>
              </p>
            )}
          </div>
          <p className="gencl:text-body-1-semi-bold gencl:text-secondary-600 gencl:line-clamp-3">
            {content}
          </p>
        </div>

        <div
          className="gencl:relative gencl:h-[200px]"
          style={{
            marginTop: "-100px",
          }}
        >
          {thumbnailAvatars?.map((item, index) => {
            const offset = index * 10;
            const zIndex = index;
            const opacity = 0.4 + (index / thumbnailAvatars.length) * 0.6;
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
                className="gencl:h-[180px] gencl:w-[100px] transition-transform duration-300"
              >
                <img
                  src={item.imageUrl}
                  alt={item.alt}
                  className="gencl:aspect-reel gencl:rounded-lg gencl:object-cover gencl:h-full gencl:w-full shadow-md"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function TrendingGroupCardSkeleton() {
  return (
    <div className="gencl:border gencl:rounded-2xl gencl:border-secondary-200 gencl:relative gencl:overflow-hidden">
      <div className="gencl:px-5 gencl:py-6">
        <div>
          <Skeleton className="gencl:w-50 gencl:h-5 gencl:rounded-md gencl:mt-1.5 gencl:mb-4" />
          <div className="gencl:flex gencl:items-center gencl:gap-2">
            {Array.from({ length: 2 }).map((_, idx, arr) => (
              <>
                <Skeleton className="gencl:w-25 gencl:h-4 gencl:rounded-md" />
                {idx < arr.length - 1 && (
                  <Skeleton className="gencl:w-1 gencl:h-1 gencl:rounded-md" />
                )}
              </>
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
              {Array.from({ length: 4 }).map(() => (
                <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
              ))}
            </div>
            <Skeleton className="gencl:w-30 gencl:h-3 gencl:rounded-md gencl:mt-1.5 gencl:mb-2" />
          </div>
          <p className="gencl:text-body-1-semi-bold gencl:text-secondary-600 gencl:line-clamp-3">
            <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5 gencl:mb-2" />
            <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mb-2" />
            <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mb-2" />
          </p>
        </div>

        <div
          className="gencl:relative gencl:h-[200px]"
          style={{
            marginTop: "-100px",
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => {
            const offset = index * 10;
            const zIndex = index;
            const opacity = 0.4 + (index / 4) * 0.7;

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
                className="gencl:h-[180px] gencl:w-[100px] transition-transform duration-300"
              >
                <Skeleton className="gencl:h-[180px] gencl:w-[100px]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
