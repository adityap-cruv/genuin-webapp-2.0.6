import { Avatar } from "@genuin/ui";
import { Skeleton } from "@genuin/ui/components/skeleton";

export type BrandListItemProps = {
  label: string;
  avatar?: {
    url: string;
    isAvatar: boolean;
  };
};

export const BrandListItem = ({ label, avatar }: BrandListItemProps) => {
  return (
    <div className="gencl:w-full gencl:flex gencl:items-center gencl:gap-2 gencl:p-3 gencl:border gencl:border-secondary-150 gencl:rounded-lg">
      {avatar && <Avatar alt={label} imageUrl={avatar.url} isAvatar={avatar.isAvatar} size="sm" />}
      <p className="gencl:text-body-1-semi-bold">{label}</p>
    </div>
  );
};

export const BrandListItemSkeleton = () => {
  return (
    <div className="gencl:w-full gencl:flex gencl:items-center gencl:gap-2 gencl:p-3 gencl:border gencl:border-secondary-150 gencl:rounded-lg">
      <Skeleton className="gencl:size-8 gencl:rounded-full gencl:shrink-0" />
      <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-full" />
    </div>
  );
};
