import { ComponentProps, useEffect, useState } from "react";
import { Button } from "@genuin/ui/components/button";

type TimerMessageProps = ComponentProps<"div"> & {
  time: number;
  verificationType: "email" | "phone" | "login";
  isOtpSending?: boolean;
};

// TODO: go through the resend flow and add the logic to resend the OTP
export function TimerMessage({
  time,
  verificationType,
  isOtpSending = false,
  ...props
}: TimerMessageProps) {
  const [timer, setTimer] = useState(time);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  return timer <= 0 ? (
    <Button theme="text" type="button">
      Resend Code
    </Button>
  ) : (
    <p {...props}>
      <span className="gencl:text-body-0-medium gencl:text-secondary-300">
        Resend code in{" "}
      </span>
      <span>{`00:${timer.toString().padStart(2, "0")}`}</span>
    </p>
  );
}
