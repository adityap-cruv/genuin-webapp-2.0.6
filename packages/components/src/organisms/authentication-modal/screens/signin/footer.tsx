import { Button } from "@genuin/ui/button";
import { useBaseContext } from "@genuin/components/context/base";
import { GoogleIcon, AppleIcon, MultipleDotsIcon } from "@genuin/ui/icons";
import { useAuthenticationModalContext } from "../../context";

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
        {brandDetails.social_login.google && (
          <Button
            className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2.5 gencl:border gencl:border-secondary-600"
            theme="text"
          >
            <GoogleIcon className="gencl:h-6 gencl:w-6" />
            <p>Continue with Google</p>
          </Button>
        )}
        {brandDetails.social_login.apple && (
          <Button
            className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2.5 gencl:bg-black"
            theme="text"
          >
            <AppleIcon className="gencl:h-6 gencl:w-6" />
            <p className="gencl:text-white">Continue with Apple</p>
          </Button>
        )}
        <Button>Continue with {brandDetails.name}</Button>
      </div>
      <div
        onClick={() => {
          setFormData({ flowType: flowType === "EMAIL" ? "PHONE" : "EMAIL" });
        }}
        className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2.5 gencl:mt-4 gencl:cursor-pointer"
      >
        <MultipleDotsIcon className="gencl:fill-primary" />
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
