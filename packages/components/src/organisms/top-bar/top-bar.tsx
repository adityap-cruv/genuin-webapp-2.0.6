import { CtaButtons } from "./cta-buttons";
import { BrandLogo } from "@genuin/components/molecules/brand";
import { BrandSlogan } from "@genuin/components/molecules/brand";
import { Search } from "@genuin/components/molecules/search";
import { cn } from "@genuin/ui/utils";

type TopBarProps = React.ComponentProps<"div">;

export function TopBar({ className, ...restProps }: TopBarProps) {
  return (
    <div
      className={cn(
        "gencl:h-16 gencl:w-full gencl:bg-white gencl:flex gencl:px-6 gencl:items-center gencl:justify-between",
        className
      )}
      {...restProps}
    >
      <BrandLogo className="gencl:py-2 gencl:object-contain gencl:h-full" />
      <BrandSlogan />
      <div className="gencl:flex gencl:justify-between gencl:gap-2.5">
        <Search className="gencl:w-xs" />
        <CtaButtons />
      </div>
    </div>
  );
}
