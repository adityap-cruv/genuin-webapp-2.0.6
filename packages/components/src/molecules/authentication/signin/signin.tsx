"use client";

import { Button } from "@genuin/ui/button";
import { Input } from "@genuin/ui/input";
import { PhoneInput } from "@genuin/ui/phone-input";
import { useState } from "react";
import type * as RPNInput from "react-phone-number-input";

import { Footer } from "./footer";

export type SignInProps = React.ComponentProps<"div"> & {
  onSubmit?: (value: string, type: "email" | "phone") => void;
  defaultCountry?: RPNInput.Country;
  className?: string;
  email?: boolean;
};

export function SignIn({
  onSubmit,
  defaultCountry = "US",
  email = false,
  ...props
}: SignInProps) {
  const [isEmail, setIsEmail] = useState(email);
  const [authValue, setAuthValue] = useState("");

  const handleOnChange = (value: string) => {
    setAuthValue(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit?.(authValue, isEmail ? "email" : "phone");
  };

  return (
    <div
      className="gencl:text-center gencl:p-12 gencl:rounded-2xl gencl:min-w-xl"
      {...props}
    >
      <div className="gencl:flex gencl:flex-col gencl:gap-3">
        <h2 className="gencl:text-headline-2-semi-bold">Sign in</h2>
        <p className="gencl:text-body-1-medium gencl:text-secondary-600">
          We'll send you a code to sign in or create an account.
        </p>
      </div>
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:mt-6">
        {isEmail ? (
          <Input
            type="email"
            className="gencl:rounded-lg gencl:border gencl:border-secondary-300 gencl:p-2 gencl:pl-3"
            value={authValue}
            onChange={handleInputChange}
            placeholder="Enter Email..."
            required
          />
        ) : (
          <PhoneInput
            onChange={handleOnChange}
            placeholder="Enter Phone Number"
            value={authValue as any}
            defaultCountry={defaultCountry}
          />
        )}
        <Button
          type="button"
          disabled={authValue === ""}
          className="gencl:w-ful"
          theme="primary"
        >
          Continue
        </Button>
      </div>
      <Footer isEmail={isEmail} setIsEmail={setIsEmail} />
    </div>
  );
}
