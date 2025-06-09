import { Button } from "@genuin/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@genuin/ui/input-otp";
import { TimerMessage } from "@genuin/ui/timer-message";
import type { ComponentProps } from "react";
import { useState } from "react";

type OtpVerificationProps = ComponentProps<"div"> & {
  isEmail: boolean;
  authValue: string;
};

export function OtpVerification({
  isEmail,
  authValue,
  ...props
}: OtpVerificationProps) {
  const [value, setValue] = useState("");
  return (
    <div
      className="gencl:flex gencl:flex-col gencl:justify-center gencl:items-center gencl:text-center gencl:p-12 gencl:rounded-2xl gencl:min-w-xl"
      {...props}
    >
      <p className="gencl:text-headline-2-semi-bold">Enter code</p>
      <p className="gencl:max-w-4/5 gencl:text-body-1-medium gencl:text-secondary-600 gencl:mt-3">
        Please Enter the 6-digit code sent to
        {isEmail ? " your email:" : " your phone:"}
        <p>{authValue}</p>
      </p>
      <InputOTP
        containerClassName="gencl:mt-4 gencl:w-full"
        maxLength={6}
        value={value}
        onChange={setValue}
      >
        <InputOTPGroup className="gencl:w-full gencl:flex gencl:gap-4">
          <InputOTPSlot
            index={0}
            className="gencl:w-full gencl:h-16 gencl:!border-0 gencl:rounded-lg gencl:bg-secondary-50"
          />
          <InputOTPSlot
            index={1}
            className="gencl:w-full gencl:h-16 gencl:border-0 gencl:rounded-lg gencl:bg-secondary-50"
          />
          <InputOTPSlot
            index={2}
            className="gencl:w-full gencl:h-16 gencl:border-0 gencl:rounded-lg gencl:bg-secondary-50"
          />
          <InputOTPSlot
            index={3}
            className="gencl:w-full gencl:h-16 gencl:border-0 gencl:rounded-lg gencl:bg-secondary-50"
          />
          <InputOTPSlot
            index={4}
            className="gencl:w-full gencl:h-16 gencl:border-0 gencl:rounded-lg gencl:bg-secondary-50"
          />
          <InputOTPSlot
            index={5}
            className="gencl:w-full gencl:h-16 gencl:border-0 gencl:rounded-lg gencl:bg-secondary-50"
          />
        </InputOTPGroup>
      </InputOTP>
      <TimerMessage className="gencl:mt-4" time={30} verificationType="login" />
      <Button
        disabled={value.length != 6}
        className="gencl:w-full gencl:mt-4"
        theme="primary"
      >
        Verify
      </Button>
    </div>
  );
}
