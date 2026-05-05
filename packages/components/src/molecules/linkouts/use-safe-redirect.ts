import { checkAndAppendHttps } from "@genuin/ui/lib/utils";
import { useState } from "react";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

import { getRedirectUrl } from "./utils";

/**
 * The hook opens a blank window immediately on user click (preserving the user gesture context),
 * then updates the window location once the async redirect URL is resolved.
 * @returns Object containing isLoading state and handleRedirect function
 */
export const useSafeRedirect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isIOS } = useDeviceDetection();
  const axiosInstance = useAxiosInstance();

  const handleRedirect = async (url: string): Promise<void> => {
    setIsLoading(true);

    let newWindow: Window | null = null;
    if (isIOS) {
      newWindow = window.open("about:blank", "_blank");
    }

    try {
      const urlWithProtocol = checkAndAppendHttps(url);
      const finalUrl = await getRedirectUrl(urlWithProtocol, axiosInstance);

      // Update the location of the already-opened window
      if (newWindow) {
        newWindow.location.href = finalUrl;
      } else {
        window.open(finalUrl, "_blank");
      }
    } catch (error) {
      // Close the blank window if there's an error
      if (newWindow) {
        newWindow.close();
      }
      console.error("Error handling redirect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleRedirect };
};
