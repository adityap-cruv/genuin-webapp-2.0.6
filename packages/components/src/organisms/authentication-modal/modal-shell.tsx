import { ComponentProps } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { useAuthenticationModalContext } from "./context";
import { usePrevious } from "@hooks/use-previous";
import { Button } from "@genuin/ui/components/button";
import { ChevronLeft } from "lucide-react";

export function ModalShell({
  children,
  className,
  showBack,
  ...restProps
}: ComponentProps<"div"> & { showBack?: boolean }) {
  const { step, setStep } = useAuthenticationModalContext();
  const prevStep = usePrevious(step);

  return (
    <div
      className={cn("gencl:relative gencl:p-12 gencl:space-y-6", className)}
      {...restProps}
    >
      {showBack && prevStep && (
        <Button
          variant="icon"
          theme="text"
          className="gencl:absolute gencl:top-4 gencl:left-4"
          onClick={() => setStep(prevStep)}
        >
          <ChevronLeft />
        </Button>
      )}
      {children}
    </div>
  );
}
