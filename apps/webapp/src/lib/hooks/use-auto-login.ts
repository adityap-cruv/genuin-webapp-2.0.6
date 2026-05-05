import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";
import { useEffect, useRef } from "react";

import { ssoAutoLogin } from "@/components/common/modals/authentication/api/auth";
import { useLocalStorage } from "@/lib/stores/local-storage";

import { tryJsonParse } from "../utils";

/**
 * Helper function to get a cookie value by name
 */
function getCookie(cname: string): string {
  if (typeof document === "undefined") return "";

  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");

  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length);
    }
  }
  return "";
}
//===========================================================
// this hook is only for indian express don't touch it.
//+==========================================================

/**
 * Hook to automatically log in the user when deviceId is initialized
 * Retrieves token from cookies and performs auto-login
 */
export function useAutoLogin() {
  const deviceId = useLocalStorage((state) => state.deviceId);
  const { signIn, user, authenticationStatus } = useAuthContext();
  const { brandDetails } = useBaseContext();
  const hasAttemptedLogin = useRef(false);

  useEffect(() => {
    // Only attempt auto-login if:
    // 1. We have a deviceId
    // 2. User is not already logged in
    // 3. We haven't already attempted login
    // 4. We have brand details with brand_id
    // 5. Authentication status is 'unauthenticated'
    if (
      brandDetails.brand_id !== 2793 ||
      !deviceId ||
      user ||
      hasAttemptedLogin.current ||
      !brandDetails?.brand_id ||
      authenticationStatus !== "unauthenticated"
    ) {
      return;
    }

    hasAttemptedLogin.current = true;

    const attemptAutoLogin = async () => {
      try {
        // Get token from cookies
        const oauthSSOId = getCookie("oauth_ssoid");
        const token = getCookie("access_token");
        let userInfo: any = getCookie("oauth_user");

        // If no token found, don't call the API
        if (!token) {
          return;
        }

        // let tokenToPass = token + '@expressindia.com'
        let tokenToPass = oauthSSOId + "@expressindia.com";
        // let userName: undefined | string
        // let mobileNumber: undefined | string
        let userProfile: undefined | string;

        try {
          userInfo = tryJsonParse(userInfo);
          if (typeof userInfo === "object") {
            if (userInfo.user_email) {
              tokenToPass = (userInfo as any).user_email;
            }

            if (userInfo.user_pic) {
              userProfile = userInfo.user_pic;
            }

            // if (userInfo.user_first_name || userInfo.user_middle_name || userInfo.user_last_name) {
            //   userName = [userInfo.user_first_name, userInfo.user_middle_name, userInfo.user_last_name].join(' ').trim()
            // }

            // if (userInfo.user_phone) {
            //   mobileNumber = userInfo.user_phone
            // }
          }
        } catch (e) {
          if (oauthSSOId) {
            tokenToPass = oauthSSOId + "@expressindia.com";
          }
        }

        const brandId = brandDetails.brand_id;

        const authUser = await ssoAutoLogin(tokenToPass, brandId.toString(), 3, { name: userInfo.user_first_name });

        if (authUser) {
          signIn(authUser);
        }
      } catch (error) {
        console.error("Auto-login error:", error);
      }
    };

    attemptAutoLogin();
  }, [deviceId, user, brandDetails, signIn, authenticationStatus]);
}
