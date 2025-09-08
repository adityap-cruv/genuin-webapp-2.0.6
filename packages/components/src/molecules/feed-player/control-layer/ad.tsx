import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "./control-layer.types";
import { usePlayerContext } from "../context";

export type AdProps = ControlLayerPropsType;

// Mock Analytics object for demonstration purposes
// const Analytics = {
//   track: (eventName: string, data: any) => {
//     console.log(`Analytics Event: ${eventName}`, data);
//   },
//   EventNames: {
//     AdCtaClicked: "ad_cta_clicked",
//   },
// };

export function Ad({
  className,
  postDetails,
  isActive,
  ...restProps
}: AdProps) {
  const { adInfo } = usePlayerContext();

  return (
    <div
      className={cn(
        className,
        "gencl:absolute gencl:bottom-4 gencl:left-0 gencl:px-4 gencl:w-full gencl:space-y-4"
      )}
      {...restProps}
    >
      {adInfo && adInfo.url && (
        <div
          className={cn(
            "gencl:w-full gencl:left-4 gencl:flex gencl:flex-col gencl:gap-2 gencl:bg-red/40 gencl:p-2 gencl:rounded-lg"
          )}
        >
          {adInfo.title && (
            <a
              className="gencl:text-body-1-bold gencl:text-white gencl:line-clamp-1"
              href={adInfo.url ?? "#"}
              target="_blank"
              onClick={() => {
                // Analytics.track(Analytics.EventNames.AdCtaClicked, {
                //   video_id: getId(id),
                //   cta_url: ctaInfo.url,
                //   ad_id: ctaInfo.adId,
                //   click_position: "cta_button",
                //   cta_name: ctaInfo.title,
                // });
              }}
            >
              {adInfo.title}
            </a>
          )}
          <a
            className="gencl:bg-white gencl:p-2 gencl:text-body-1-bold gencl:rounded-lg gencl:z-50"
            href={adInfo.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // Analytics.track(Analytics.EventNames.AdCtaClicked, {
              //   video_id: getId(id),
              //   ad_id: ctaInfo.adId,
              //   cta_url: ctaInfo.url,
              //   click_position: "cta_button",
              //   cta_name: "Learn More",
              // });
            }}
          >
            Learn More
          </a>
        </div>
      )}

      <div className="gencl:text-body-2-medium gencl:py-1 gencl:px-2 gencl:whitespace-nowrap gencl:rounded-full gencl:z-50 gencl:bg-white gencl:w-min gencl:text-black">
        Ad • {adInfo?.currentAdIndex} of {adInfo?.totalAds}
      </div>
    </div>
  );
}
