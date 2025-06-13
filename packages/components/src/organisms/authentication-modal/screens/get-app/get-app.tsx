import { Image } from "@genuin/ui/image";
import { ComponentProps } from "react";
import { QRCode } from "react-qrcode-logo";
import { useBaseContext } from "src/context/base";
import { AppDownloadForm, AppDownloadFormData } from "./app-download-form";

export type GetAppProps = ComponentProps<"div"> & {
  onSubmit?: (data: AppDownloadFormData) => void;
  className?: string;
};

// TODO: get app deep link logic is pending.
export function GetApp({ onSubmit, ...props }: GetAppProps) {
  const { brandDetails } = useBaseContext();

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
          Get the {brandDetails.name} app
        </p>
        <p className="gencl:text-body-1-medium gencl:text-secondary-600">
          Download app to browse more communities
        </p>
      </div>
      <div className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-2">
        <QRCode
          value={"link"}
          size={160}
          qrStyle="squares"
          logoPaddingStyle="square"
        />
        <p className="gencl:text-body-1-medium">Scan to download app</p>
      </div>
      <AppDownloadForm />
      {/* TODO : put the src link of the play store and app store  */}
      {/* <div className="gencl:flex gencl:gap-x-2">
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
            src={"put app store src link"}
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
            src={"put play store src link"}
            alt="play store"
          />
        </Link>
      </div> */}
    </div>
  );
}
