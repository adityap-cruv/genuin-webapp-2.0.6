import { ComponentProps, useEffect, useState } from "react";
import { Button } from "../button";

type TimerMessageProps = ComponentProps<"div"> & {
  time: number;
  verificationType: "email" | "phone" | "login";
  isOtpSending?: boolean;
};

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
    <Button theme="text" type="button" className="gencl:text-primary">Resend Code</Button>
  ) : (
    <p {...props}>
      Resend code in{" "}
      <span className="text-monochrome-black">{`00:${timer.toString().padStart(2, "0")}`}</span>
    </p>
  );
}
