import { Button } from "@genuin/ui/button";
import { Image } from "@genuin/ui/image";
import { Input } from "@genuin/ui/input";
import { PhoneInput } from "@genuin/ui/phone-input";
import { Braces } from "lucide-react";
import { ComponentProps, useState } from "react";
import * as RPNInput from "react-phone-number-input";
import { QRCode } from "react-qrcode-logo";
import { useBaseContext } from "src/context/base";
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from "src/lib/constants";
import { Link } from "src/molecules/link";

export type GetAppProps = ComponentProps<"div"> & {
  onSubmit: () => void;
  defaultCountry?: RPNInput.Country;
  className?: string;
  deeplink: string;
};

export function GetApp({
  onSubmit,
  defaultCountry = "US",
  deeplink,
  ...props
}: GetAppProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const { brandDetails } = useBaseContext();
  return (
    <div
      className="gencl:flex gencl:text-center gencl:flex-col gencl:items-center gencl:gap-6 gencl:p-12 gencl:rounded-2xl"
      style={{ width: "486px" }}
      {...props}
    >
      {
        brandDetails.logo && (
          <Image src={brandDetails.logo} className="gencl:h-12 gencl:w-12 gencl:rounded-full" />
        )
      }
      <div className="gencl:flex gencl:flex-col gencl:gap-3">
        <p className="gencl:text-headline-2-semi-bold">
          Get the {brandDetails.name} app
        </p>
        <p className="gencl:text-body-1-medium gencl:text-secondary-600">
          Download app to browse more communities
        </p>
      </div>
      <div className="gencl:flex gencl:flex-col gencl:justify-center gencl:items-center gencl:gap-4">
        <QRCode
          value={deeplink}
          size={160}
          qrStyle="squares"
          logoPaddingStyle="square"
        />
        <p className="gencl:text-body-1-medium">Scan to download app</p>
      </div>
      <div className="gencl:flex gencl:flex-col gencl:gap-4">
        <PhoneInput
          value={phoneNumber as any}
          onChange={setPhoneNumber}
          placeholder="Enter your phone number"
          defaultCountry={defaultCountry}
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          className="gencl:rounded-lg gencl:border gencl:border-secondary-300 gencl:p-2 gencl:pl-3"
          placeholder="Enter Email..."
        />
        <Button
          disabled={email === "" && phoneNumber === ""}
          theme="primary"
          className="gencl:w-full gencl:mt-2"
        >
          Send Link
        </Button>
      </div>
      <p className="gencl:text-center gencl:text-secondary-300 gencl:text-body-2-medium">
        By clicking Send Link, I acknowledge that I have read the{" "}
        <Link
          href={brandDetails?.privacy_policy ?? ""}
          className="gencl:underline"
        >
          Privacy Policy
        </Link>{" "}
        and agree to the{" "}
        <Link
          href={brandDetails?.terms_and_condition ?? ""}
          className="gencl:underline"
        >
          Terms of Service
        </Link>
      </p>
      {/* TODO : put the src link of the play store and app store  */}
      <div className="gencl:flex gencl:gap-x-2">
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
      </div>
    </div>
  );
}
