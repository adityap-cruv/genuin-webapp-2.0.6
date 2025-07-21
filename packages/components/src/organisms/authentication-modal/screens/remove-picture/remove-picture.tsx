import { ComponentProps } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { useAuthenticationModalContext } from "../../context";
import { Button } from "@genuin/ui/components";

export function RemovePicture({
  className,
  ...restProps
}: ComponentProps<"div">) {
  const { closeModal } = useAuthenticationModalContext();

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-left gencl:text-headline-4-semi-bold gencl:mb-6">
          Remove profile picture?
        </h3>
        <p className="gencl:text-left gencl:text-body-1-medium">
          Are you sure you want to remove this profile picture? This step cannot
          be undone.
        </p>
      </div>
      <div className="gencl:align-middle gencl:flex gencl:gap-5 gencl:justify-end">
        <p
          className="gencl:text-title-3-med gencl:cursor-pointer gencl:py-2 gencl:text-center"
          onClick={() => {
            closeModal();
          }}
        >
          Cancel
        </p>
        <Button variant="default">Remove</Button>
      </div>
    </div>
  );
}
