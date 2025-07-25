import { Link } from "@genuin/components/molecules/link";
import { GenuinLogo } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const poweredByGenuinVariants = cva(
  "gencl:border-r gencl:border-t gencl:p-4 gencl:border-secondary-150 gencl:bg-white gencl:fixed gencl:bottom-0 gencl:z-10",
  {
    variants: {
      variant: {
        default: "gencl:xl:!w-60 gencl:w-16 gencl:mr-2",
        mobile: "gencl:flex gencl:w-fit",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type PoweredByGenuinProps = React.ComponentProps<"div"> &
  VariantProps<typeof poweredByGenuinVariants>;

export function PoweredByGenuin({
  variant,
  className,
  ...restProps
}: PoweredByGenuinProps) {
  return (
    <div
      className={cn(
        poweredByGenuinVariants({ variant }),
        className,
        "gencl:hidden gencl:xl:flex! gencl:items-center gencl:justify-center"
      )}
      {...restProps}
    >
      <p className="gencl:text-body-2-semi-bold gencl:whitespace-nowrap gencl:text-secondary-600">
        Powered by
      </p>
      <Link
        href="https://begenuin.com?utm_source=web&utm_medium=sidebar"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GenuinLogo />
      </Link>
    </div>
  );
}
