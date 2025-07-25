import { ComponentProps, useEffect, useState } from "react";
import QRCode from "react-qr-code";
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
import { BrandLogo } from "@genuin/components/molecules/brand";
import { Button } from "@genuin/ui/components";

export type GetAppProps = ComponentProps<"div"> & {
  onSubmit?: (data: AppDownloadFormData) => void;
  className?: string;
};

export function GetApp({ onSubmit, ...props }: GetAppProps) {
  const { brandDetails } = useBaseContext();
  const { getAppData, step } = useAuthenticationModalContext();
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
    <div
      className="gencl:text-center gencl:space-y-4 gencl:w-full gencl:pt-8 gencl:sm:pt-0!"
      {...props}
    >
      {brandDetails.logo && (
        <BrandLogo className="gencl:mx-auto gencl:h-10 gencl:sm:h-12! gencl:w-10 gencl:sm:w-full! gencl:rounded-full gencl:sm:rounded-none! gencl:mb-3" />
      )}
      <div className="gencl:space-y-3">
        <p className="gencl:sm:text-headline-2-semi-bold! gencl:text-headline-3-semi-bold">
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
      <div className="gencl:sm:flex! gencl:hidden gencl:flex-col gencl:items-center gencl:gap-2">
        <QRCode
          value={isLoading ? "placeholder" : deeplinkUrl}
          size={160}
          style={isLoading ? { filter: "blur(6px)" } : undefined}
        />
        <p className="gencl:text-body-1-medium">Scan to download app</p>
      </div>
      {step !== "GET_APP_WITH_BLURRED_BG" && (
        <AppDownloadForm className="gencl:sm:block! gencl:hidden" />
      )}

      <div>
        <Link target="_blank" rel="noopener noreferrer" href={deeplinkUrl}>
          <Button
            theme="primary"
            className="gencl:w-full gencl:flex gencl:items-center gencl:justify-center gencl:sm:hidden!"
          >
            {isLoading ? (
              <Loader size="sm" strokeColor="white" />
            ) : (
              <span>Get App</span>
            )}
          </Button>
        </Link>
      </div>

      <p className="gencl:text-center gencl:text-secondary-300 gencl:text-body-2-medium gencl:block gencl:sm:hidden!">
        By continuing, you agree to our{" "}
        <Link
          href={brandDetails?.terms_and_condition ?? ""}
          className="gencl:underline gencl:text-primary!"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href={brandDetails?.privacy_policy ?? ""}
          className="gencl:underline gencl:text-primary!"
        >
          Privacy Policy
        </Link>
      </p>

      {/* TODO : put the src link of the play store and app store  */}
      <div className="gencl:sm:flex! gencl:hidden gencl:gap-x-2 gencl:justify-center">
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
