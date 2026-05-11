import { cn } from "@lib/utils";

function Shimmer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-tertiary-200 animate-pulse rounded-md", className)} {...props} />;
}

export { Shimmer };
