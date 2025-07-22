import { ComponentProps, useEffect, useState } from "react";
import { Button } from "@genuin/ui/components/button";
import { cn } from "@genuin/ui/lib/utils";

type TimerMessageProps = ComponentProps<"div"> & {
  time: number;
  verificationType: "email" | "phone" | "login";
  isOtpSending?: boolean;
  resentOtp: () => void;
};

export function TimerMessage({
  time,
  verificationType,
  isOtpSending = false,
  resentOtp,
  className,
  ...props
}: TimerMessageProps) {
  const [timer, setTimer] = useState(time);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  useEffect(() => {
    if (!isOtpSending) {
      setTimer(time);
    }
    // Only run when isOtpSending changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOtpSending]);

  return timer <= 0 ? (
    <Button
      onClick={resentOtp}
      disabled={isOtpSending}
      theme="text"
      type="button"
    >
      Resend Code
    </Button>
  ) : (
    <p {...props}>
      <span className="gencl:text-body-0-medium gencl:text-secondary-600">
        Resend code in{" "}
      </span>
      <span className="gencl:text-body-0-medium">{`00:${timer.toString().padStart(2, "0")}`}</span>
    </p>
  );
}
