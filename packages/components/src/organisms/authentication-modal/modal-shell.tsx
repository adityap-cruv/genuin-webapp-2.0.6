import { ComponentProps } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { useAuthenticationModalContext } from "./context";
import { usePrevious } from "@genuin/components/hooks/use-previous";
import { Button } from "@genuin/ui/components/button";
import { ChevronLeft } from "lucide-react";

const VARIANT_PADDING: Record<"default" | "compact" | "expanded", string> = {
  default: "gencl:p-12",
  compact: "gencl:p-8",
  expanded: "gencl:p-8",
};

type ModalShellProps = ComponentProps<"div"> & {
  showBack?: boolean;
  variant?: "default" | "compact" | "expanded";
};

export function ModalShell({
  children,
  className,
  showBack,
  variant = "default",
  ...restProps
}: ModalShellProps) {
  const { step, setStep } = useAuthenticationModalContext();
  const prevStep = usePrevious(step);

  return (
    <div
      className={cn(
        "gencl:relative gencl:space-y-6",
        VARIANT_PADDING[variant],
        className
      )}
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
