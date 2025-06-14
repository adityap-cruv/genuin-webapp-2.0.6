import { cn } from "@genuin/ui/lib/utils";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "gencl:bg-secondary-100 gencl:animate-pulse gencl:rounded-md",
        className
      )}
      {...props}
    />
  );
}
