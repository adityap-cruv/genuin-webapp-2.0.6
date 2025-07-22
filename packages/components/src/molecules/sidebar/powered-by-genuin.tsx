import { Link } from "@genuin/components/molecules/link";
import { GenuinLogo } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const poweredByGenuinVariants = cva(
  "gencl:border-t gencl:p-4 gencl:border-secondary-100 gencl:justify-self-end gencl:mt-auto",
  {
    variants: {
      variant: {
        default: "",
        mobile: "gencl:flex",
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
        "gencl:xl:flex! gencl:absolute gencl:z-10 gencl:bg-white gencl:hidden gencl:bottom-0 gencl:w-full gencl:items-center gencl:justify-center"
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
