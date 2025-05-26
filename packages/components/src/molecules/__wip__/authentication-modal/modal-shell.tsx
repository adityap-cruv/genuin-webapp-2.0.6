import { cn } from "@genuin/ui/utils";
import { ChevronLeft } from "lucide-react";

type ModalShellProps = { onBack?: () => void } & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export function ModalShell({
  onBack,
  children,
  className,
  ...props
}: ModalShellProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-y-4 px-2 sm:min-w-[384px] sm:max-w-md sm:px-4",
        className
      )}
      {...props}
    >
      {onBack && (
        <ChevronLeft
          className="absolute inset-5 h-6 w-6 stroke-secondary"
          onClick={onBack}
        />
      )}
      {children}
    </div>
  );
}
