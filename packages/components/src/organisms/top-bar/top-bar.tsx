import { CtaButtons } from "./cta-buttons";
import { BrandLogo } from "@molecules/brand";
import { BrandSlogan } from "@molecules/brand";
import { cn } from "@genuin/ui/utils";

type TopBarProps = React.ComponentProps<"div">;

export function TopBar({ className, ...restProps }: TopBarProps) {
  return (
    <div
      className={cn(
        "gencl:h-16 gencl:w-full gencl:flex gencl:px-6 gencl:items-center gencl:justify-between",
        className
      )}
      {...restProps}
    >
      <BrandLogo className="gencl:h-full gencl:py-2 gencl:object-cover" />
      <BrandSlogan />
      <div className="gencl:flex gencl:justify-between gencl:gap-2.5">
        <div className="gencl:w-72 gencl:self-center">Search</div>
        <CtaButtons />
      </div>
    </div>
  );
}
