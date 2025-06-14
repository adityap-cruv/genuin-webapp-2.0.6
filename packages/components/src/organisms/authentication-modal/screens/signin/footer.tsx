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
import { toastError } from "@genuin/ui/components/toaster";
import { Loader } from "@genuin/ui/components/loader";

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
        <div className="gencl:w-full gencl:h-px gencl:bg-secondary-200">
          &nbsp;
        </div>
        <p className="gencl:whitespace-nowrap gencl:text-body-1-med gencl:text-secondary-500">
          OR
        </p>
        <div className="gencl:w-full gencl:h-px gencl:bg-secondary-200">
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
          <MultipleDotsIcon className="gencl:fill-primary" />
        ) : (
          <EmailIcon className="gencl:stroke-primary" />
        )}
        <p className="gencl:text-primary gencl:text-body-0-semi-bold">
          Use {flowType === "EMAIL" ? "phone number" : "email"} instead
        </p>
      </div>
      <p className="gencl:mt-4 gencl:text-secondary-300 gencl:text-body-1-semi-bold gencl:text-center">
        By continuing, you agree to
        <span className="gencl:text-primary"> Terms of Service </span>
        and
        <span className="gencl:text-primary"> Privacy Policy</span>
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
        responseUrl.searchParams.set("state", getUrlToRedirect("apple"));
        // window.navigator.push(responseUrl.href);
      },
      onError: (error) => {
        toastError("Something went wrong, please try again later");
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
          <p>Continue with Google</p>
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
        responseUrl.searchParams.set("state", getUrlToRedirect("google"));
        // window.navigator.push(responseUrl.href);
      },
      onError: () => {
        toastError("Something went wrong, please try again later");
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
          <p className="gencl:text-white">Continue with Apple</p>
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
      },
      onError: () => {
        toastError("Something went wrong, please try again later");
      },
    });

  const handleClick = useCallback(() => {
    if (!brandDetails.social_login.brand) {
      toastError("Brand does not support SSO login");
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
