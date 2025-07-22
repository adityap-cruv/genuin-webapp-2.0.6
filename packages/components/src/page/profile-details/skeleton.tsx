import { GenericDetailsSkeleton } from "@genuin/components/organisms";
import { CommunityListSkeleton } from "@genuin/components/templates/profile-details-tabs";
import { TabsSkeleton } from "@genuin/ui/components/tabs";

export function ProfileDetailsSkeleton() {
  return (
    <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:sm:p-6! gencl:p-4">
      <GenericDetailsSkeleton
        className="gencl:hidden gencl:md:flex!"
        hasImage={true}
        hasLinks={true}
      />
      <GenericDetailsSkeleton
        className="gencl:flex gencl:md:hidden!"
        hasImage={false}
        hasLinks={false}
      />
      <TabsSkeleton noOfTabs={1} className="gencl:pt-6" />
      <div className="gencl:pt-6">
        <CommunityListSkeleton />
      </div>
    </div>
  );
}
