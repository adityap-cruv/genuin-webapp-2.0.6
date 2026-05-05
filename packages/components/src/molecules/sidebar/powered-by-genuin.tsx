import { GenuinLogo } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { Link } from "@genuin/components/molecules/link";

const poweredByGenuinVariants = cva("gencl:border-t gencl:p-4 gencl:border-secondary-150 gencl:bg-white gencl:z-10", {
  variants: {
    variant: {
      default: "gencl:xl:!w-full",
      mobile: "gencl:flex gencl:w-fit",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type PoweredByGenuinProps = React.ComponentProps<"div"> & VariantProps<typeof poweredByGenuinVariants>;

export function PoweredByGenuin({ variant, className, ...restProps }: PoweredByGenuinProps) {
  return (
    <div
      className={cn(
        poweredByGenuinVariants({ variant }),
        className,
        "gencl:hidden gencl:xl:flex! gencl:items-center gencl:justify-center"
      )}
      {...restProps}>
      <p className="gencl:text-body-2-semi-bold gencl:whitespace-nowrap gencl:text-secondary-600">Powered by</p>
      <Link href="https://begenuin.com?utm_source=web&utm_medium=sidebar" target="_blank" rel="noopener noreferrer">
        <GenuinLogo />
      </Link>
    </div>
  );
}
