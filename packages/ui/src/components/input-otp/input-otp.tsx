"use client";

import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "gencl:flex gencl:items-center gencl:gap-2 gencl:has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("gencl:disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("gencl:flex gencl:items-center", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "gencl:relative gencl:flex gencl:h-9 gencl:w-9 gencl:items-center gencl:justify-center gencl:border-y gencl:border-r gencl:shadow-xs gencl:transition-all gencl:outline-none gencl:first:rounded-l-md gencl:first:border-l gencl:last:rounded-r-md gencl:data-[active=true]:z-10",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="gencl:pointer-events-none gencl:absolute gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center">
          <div className="gencl:animate-caret-blink gencl:h-4 gencl:bg-black gencl:w-px gencl:duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
