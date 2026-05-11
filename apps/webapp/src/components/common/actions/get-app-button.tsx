import React from "react";

import { getPlatform, handleAppDownloadModal } from "@/lib/utils";
import Analytics from "@/services/analytics";

import { Button, type ButtonProps } from "../../ui/button";

const GetAppButton = ({ buttonText, onClick, ...buttonProps }: ButtonProps & { buttonText: string }) => {
  return (
    <Button
      {...buttonProps}
      onClick={(e) => {
        onClick?.(e);

        void handleAppDownloadModal();

        void Analytics.track({
          eventName: "Get App Button Clicked",
          properties: {
            device_type: getPlatform(),
          },
        });
      }}>
      {buttonText}
    </Button>
  );
};

export default GetAppButton;
