import { Button } from "@genuin/ui/button";
import { useBaseContext } from "src/context/base";
import { GoogleIcon, AppleIcon, MultipleDotsIcon } from "@genuin/ui/icons";
import React from "react";

export function Footer({
  setIsEmail,
  isEmail,
}: {
  setIsEmail: React.Dispatch<React.SetStateAction<boolean>>;
  isEmail: boolean;
}) {
  const { brandDetails } = useBaseContext();
  return (
    <>
      <div className="gencl:flex gencl:w-full gencl:items-center gencl:gap-4 gencl:mt-4">
        <div
          style={{ height: 1 }}
          className="gencl:w-full gencl:bg-secondary-200"
        >
          &nbsp;
        </div>
        <p className="gencl:whitespace-nowrap gencl:text-body-1-med gencl:text-secondary-500">
          OR
        </p>
        <div
          style={{ height: 1 }}
          className="gencl:w-full gencl:bg-secondary-200"
        >
          &nbsp;
        </div>
      </div>
      <div className="gencl:mt-4 gencl:flex gencl:w-full gencl:flex-col gencl:gap-4 gencl:text-body-0-semi-bold">
        <Button className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2.5">
          <GoogleIcon className="gencl:h-6 gencl:w-6" />
          <p>Continue with Google</p>
        </Button>
        <Button className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2.5">
          <AppleIcon className="gencl:h-6 gencl:w-6" />
          <p>Continue with Apple</p>
        </Button>
        <Button>Continue with {brandDetails.name}</Button>
      </div>
      <div
        onClick={() => {
          setIsEmail(!isEmail);
        }}
        className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2.5 gencl:mt-4 gencl:cursor-pointer"
      >
        <MultipleDotsIcon className="gencl:fill-primary" />
        <p className="gencl:text-primary gencl:text-body-0-semi-bold">
          Use {isEmail ? "phone number" : "email"} instead
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
