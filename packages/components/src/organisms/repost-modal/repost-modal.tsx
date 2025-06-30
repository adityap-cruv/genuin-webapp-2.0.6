import { Dialog, DialogTrigger, DialogContent } from "@genuin/ui/dialog";
import { useGetRepostDestinations } from "@genuin/components/react-query/api/repost";
import type { RepostCommunityType } from "@genuin/components/react-query/api/repost/schema";
import { ComponentProps } from "react";
import { CommunityCard } from "./community-card";
import { Loader } from "@genuin/ui/components/loader";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";

type RepostModalProps = ComponentProps<typeof DialogTrigger> & {
  videoId: string;
};

export function RepostModal({
  videoId,
  children,
  ...restProps
}: RepostModalProps) {
  return (
    <Dialog type="repost-dialog">
      <DialogTrigger {...restProps}>{children}</DialogTrigger>
      <DialogContent className="gencl:max-w-2xl gencl:w-full">
        <Content videoId={videoId} />
      </DialogContent>
    </Dialog>
  );
}

function Content({ videoId }: { videoId: string }) {
  const {
    data: destinations,
    isLoading,
    isError,
  } = useGetRepostDestinations(videoId);

  const renderContent = () => {
    if (isLoading) {
      return (
      <div className="gencl:flex gencl:items-center gencl:justify-center gencl:h-full">
        <Loader />
      </div>
      );
    }

    if (isError) {
      return (
        <div className="gencl:text-red gencl:text-body-0-semi-bold">
          Failed to load communities
        </div>
      );
    }

    if (!destinations || destinations.length === 0) {
      return (
        <div className="gencl:text-body-0-semi-bold gencl:text-secondary-600">
          <ComponentErrorState type="NO_COMMUNITIES" className="gencl:h-full"/>
        </div>
      );
    }

    return destinations.map((communityInfo, index) => (
      <CommunityCard
        key={communityInfo.community_id || index}
        communityInfo={communityInfo as RepostCommunityType}
        videoId={videoId}
      />
    ));
  };

  return (
    <div className="gencl:space-y-6 gencl:h-[45vh] gencl:flex gencl:flex-col">
      <h2 className="gencl:text-headline-2-semi-bold gencl:text-center">
        Repost
      </h2>
      <div className="gencl:space-y-4 gencl:h-full gencl:overflow-auto gencl:flex-grow gencl:w-full">
        {renderContent()}
      </div>
    </div>
  );
}
