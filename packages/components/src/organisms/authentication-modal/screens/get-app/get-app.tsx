import { ComponentProps, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import appStoreImage from "@genuin/components/assets/images/appStore.svg";
import playStoreImage from "@genuin/components/assets/images/playStore.svg";
import { Image } from "@genuin/ui/image";
import { useBaseContext } from "@genuin/components/context/base";
import { AppDownloadForm, AppDownloadFormData } from "./app-download-form";
import { Link } from "@genuin/components/molecules/link";
import {
  URL_TO_APP_STORE,
  URL_TO_PLAY_STORE,
} from "@genuin/components/lib/constants";
import { useAuthenticationModalContext } from "@genuin/components/organisms/authentication-modal/context";
import { deepLinkActions } from "@genuin/components/react-query/api/deeplink/get-deeplink";
import { Loader } from "@genuin/ui/components/loader";
import { getActionText } from "@genuin/components/lib/utils";

export type GetAppProps = ComponentProps<"div"> & {
  onSubmit?: (data: AppDownloadFormData) => void;
  className?: string;
};

export function GetApp({ onSubmit, ...props }: GetAppProps) {
  const { brandDetails } = useBaseContext();
  const { getAppData } = useAuthenticationModalContext();
  const [deeplinkUrl, setDeeplinkUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const clickAction = getAppData?.data?.type;

  useEffect(() => {
    const generateDeeplink = async () => {
      try {
        let url: string;

        if (getAppData?.data) {
          // Handle different deeplink types based on the payload
          switch (getAppData.data.type) {
            case "subscribe":
              url = await deepLinkActions.subscribe(getAppData.data.payload);
              break;
            case "join_as_collaborator":
              url = await deepLinkActions.joinAsCollaborator(
                getAppData.data.payload
              );
              break;
            case "join_community":
              url = await deepLinkActions.joinCommunity(
                getAppData.data.payload
              );
              break;
            case "comment":
              url = await deepLinkActions.comment(getAppData.data.payload);
              break;
            case "repost":
              url = await deepLinkActions.repost(getAppData.data.payload);
              break;
            case "spark":
              url = await deepLinkActions.spark(getAppData.data.payload);
              break;
            case "report":
              url = await deepLinkActions.report(getAppData.data.payload);
              break;
            case "get_app":
              url = await deepLinkActions.getApp();
              break;
            default:
              url = await deepLinkActions.getApp();
          }
        } else {
          // If no specific deeplink data is provided, use the default get_app
          url = await deepLinkActions.getApp();
        }

        setDeeplinkUrl(url);
      } catch (error) {
        console.error("Failed to generate deeplink:", error);
        setDeeplinkUrl("");
      } finally {
        setIsLoading(false);
      }
    };

    generateDeeplink();
  }, [getAppData?.data]);

  return (
    <div className="gencl:text-center gencl:space-y-4 gencl:w-full" {...props}>
      {brandDetails.logo && (
        <Image
          src={brandDetails.logo}
          className="gencl:h-12 gencl:w-12 gencl:mx-auto gencl:rounded-full"
        />
      )}
      <div className="gencl:space-y-3">
        <p className="gencl:text-headline-2-semi-bold">
          {getAppData?.title ?? `Get the ${brandDetails.name} app`}
        </p>
        <p className="gencl:text-body-1-medium gencl:text-secondary-600">
          {getAppData?.description ??
            getActionText(
              "Download app to browse more communities",
              clickAction,
              "Download app"
            )}
        </p>
      </div>
      <div className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-2">
        <QRCode
          value={isLoading ? "placeholder" : deeplinkUrl}
          size={160}
          qrStyle="squares"
          logoPaddingStyle="square"
          style={isLoading ? { filter: "blur(6px)" } : undefined}
        />
        <p className="gencl:text-body-1-medium">Scan to download app</p>
      </div>
      <AppDownloadForm />
      {/* TODO : put the src link of the play store and app store  */}
      <div className="gencl:flex gencl:gap-x-2 gencl:justify-center">
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={
            typeof brandDetails?.integrations.sdk.ios === "string"
              ? brandDetails.integrations.sdk.ios
              : (brandDetails?.integrations.sdk.ios?.appstore_link ??
                URL_TO_APP_STORE)
          }
        >
          <Image
            className="gencl:mx-2 gencl:h-10 gencl:w-auto"
            alt="app store"
            src={appStoreImage}
          />
        </Link>
        <Link
          href={
            typeof brandDetails?.integrations.sdk.android === "string"
              ? brandDetails.integrations.sdk.android
              : (brandDetails?.integrations.sdk.android?.playstore_link ??
                URL_TO_PLAY_STORE)
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className="gencl:mx-2 gencl:h-10 gencl:w-auto"
            src={playStoreImage}
            alt="play store"
          />
        </Link>
      </div>
    </div>
  );
}
