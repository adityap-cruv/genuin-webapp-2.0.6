import { Button } from "@genuin/ui/button";
import { useBaseContext } from "@genuin/components/context/base";
import {
  GoogleIcon,
  AppleIcon,
  MultipleDotsIcon,
  EmailIcon,
} from "@genuin/ui/icons";
import { useAuthenticationModalContext } from "../../context";
import { useCallback } from "react";
import { useGetRedirectionUrlForSSOMutation } from "@genuin/components/react-query/api/authentication/auto-login";
import { Toast } from "@genuin/ui/components/toaster";
import { Loader } from "@genuin/ui/components/loader";
import { Link } from "@genuin/components/molecules/link";
import { NEXT_PUBLIC_HOST_URL } from "@genuin/components/lib/utils/env";

// TODO: handle signin with Goggle and Apple
export function Footer() {
  const { brandDetails } = useBaseContext();
  const {
    setFormData,
    formData: { flowType },
  } = useAuthenticationModalContext();

  return (
    <>
      <div className="gencl:flex gencl:w-full gencl:items-center gencl:gap-4 gencl:mt-4">
        <div className="gencl:w-full gencl:h-px gencl:bg-secondary-50">
          &nbsp;
        </div>
        <p className="gencl:whitespace-nowrap gencl:text-body-2-medium gencl:sm:!text-body-1-med gencl:text-secondary-500">
          OR
        </p>
        <div className="gencl:w-full gencl:h-px gencl:bg-secondary-50">
          &nbsp;
        </div>
      </div>
      <div className="gencl:mt-4 gencl:flex gencl:w-full gencl:flex-col gencl:gap-4 gencl:text-body-1-medium">
        {brandDetails.social_login.google && <SignInWithGoogle />}
        {brandDetails.social_login.apple && <SignInWithApple />}
        {brandDetails.social_login.brand && (
          <SignInWithBrand brandName={brandDetails.name} />
        )}
      </div>
      <div
        onClick={() => {
          setFormData({ flowType: flowType === "EMAIL" ? "PHONE" : "EMAIL" });
        }}
        className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2.5 gencl:mt-4 gencl:cursor-pointer"
      >
        {flowType === "EMAIL" ? (
          <MultipleDotsIcon theme="primary" size="sm" />
        ) : (
          <EmailIcon theme="primary" size="sm" />
        )}
        <p className="gencl:text-primary gencl:text-body-1-semi-bold gencl:sm:!text-body-0-semi-bold">
          Use {flowType === "EMAIL" ? "phone number" : "email"} instead
        </p>
      </div>
      <p className="gencl:mt-4 gencl:text-secondary-300 gencl:text-body-2-medium gencl:text-center">
        By continuing, you agree to
        <Link
          href={
            brandDetails.terms_and_condition?.trim()
              ? brandDetails.terms_and_condition
              : NEXT_PUBLIC_HOST_URL + "/terms"
          }
        >
          <span className="gencl:text-primary"> Terms of Service </span>
        </Link>
        and
        <Link
          href={
            brandDetails.privacy_policy?.trim()
              ? brandDetails.privacy_policy
              : NEXT_PUBLIC_HOST_URL + "/privacy"
          }
        >
          <span className="gencl:text-primary"> Privacy Policy</span>
        </Link>
      </p>
    </>
  );
}

function getUrlToRedirect(provider: string) {
  const windowLocation = new URL(window.location.href);
  windowLocation.searchParams.set("provider", provider);
  return windowLocation.href;
}

function SignInWithGoogle() {
  const { mutate: getUrlToRedirectForSSO, isPending } =
    useGetRedirectionUrlForSSOMutation({
      onSuccess: (url) => {
        const responseUrl = new URL(url);
        responseUrl.searchParams.set("prompt", "consent");
        responseUrl.searchParams.set("state", getUrlToRedirect("google"));
        window.open(responseUrl.href, "_self");
      },
      onError: (error) => {
        Toast.Error({
          message: "Something went wrong, please try again later",
        });
      },
    });

  const handleSignInWithGoogle = useCallback(() => {
    getUrlToRedirectForSSO({
      thirdPartyId: "google",
    });
  }, []);

  return (
    <Button
      className="gencl:border gencl:border-secondary-600"
      theme="text"
      onClick={handleSignInWithGoogle}
    >
      {isPending ? (
        <Loader />
      ) : (
        <>
          <GoogleIcon className="gencl:h-6 gencl:w-6" />
          <p className="gencl:text-secondary-900 gencl:text-body-1-medium">
            Continue with Google
          </p>
        </>
      )}
    </Button>
  );
}

function SignInWithApple() {
  const { mutate: getUrlToRedirectForSSO, isPending } =
    useGetRedirectionUrlForSSOMutation({
      onSuccess: (url) => {
        const responseUrl = new URL(url);
        responseUrl.searchParams.set("prompt", "consent");
        responseUrl.searchParams.set("state", getUrlToRedirect("apple"));
        window.open(responseUrl.href, "_self");
      },
      onError: () => {
        Toast.Error({
          message: "Something went wrong, please try again later",
        });
      },
    });

  const handleSignInWithApple = useCallback(() => {
    getUrlToRedirectForSSO({
      thirdPartyId: "apple",
    });
  }, []);

  return (
    <Button
      className="gencl:bg-black"
      theme="text"
      onClick={handleSignInWithApple}
    >
      {isPending ? (
        <Loader />
      ) : (
        <>
          <AppleIcon className="gencl:h-6 gencl:w-6" />
          <p className="gencl:text-white gencl:text-body-1-medium">
            Continue with Apple
          </p>
        </>
      )}
    </Button>
  );
}

function SignInWithBrand({ brandName }: { brandName: string }) {
  const { brandDetails } = useBaseContext();
  const { mutate: getUrlToRedirectForSSO, isPending } =
    useGetRedirectionUrlForSSOMutation({
      onSuccess: (url) => {
        const responseUrl = new URL(url);
        responseUrl.searchParams.set("prompt", "consent");
        responseUrl.searchParams.set(
          "state",
          getUrlToRedirect(brandDetails.social_login.brand_sso_id)
        );
        window.open(responseUrl.href, "_self");
      },
      onError: () => {
        Toast.Error({
          message: "Something went wrong, please try again later",
        });
      },
    });

  const handleClick = useCallback(() => {
    if (!brandDetails.social_login.brand) {
      Toast.Error({ message: "Brand does not support SSO login" });
      return;
    }
    getUrlToRedirectForSSO({
      thirdPartyId: brandDetails.social_login.brand_sso_id,
    });
  }, [brandDetails.social_login.brand, getUrlToRedirectForSSO]);

  return (
    <Button onClick={handleClick}>
      {isPending ? <Loader /> : <> Continue with {brandName}</>}
    </Button>
  );
}
