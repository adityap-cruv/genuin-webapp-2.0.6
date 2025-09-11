import { MEDIA_BASE_URL } from "@genuin/components/lib/utils/env";
import { Image } from "@genuin/ui/image";
import { cn } from "@genuin/ui/lib/utils";
import { Link } from "@genuin/components/molecules/link";
import { ComponentProps } from "react";
import { Button, DialogClose } from "@genuin/ui/components";

type SuccessProps = ComponentProps<"div"> & {
  text: string;
  description: string;
  button?: {
    label: string;
    href: string;
  };
  onClose?: () => void;
};

export function Success({
  className,
  text,
  description,
  button,
  onClose,
}: SuccessProps) {
  return (
    <div
      className={cn(
        "gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:text-center gencl:gap-5",
        className
      )}
    >
      <Image
        alt="Success"
        src={`${MEDIA_BASE_URL}/web-sdk/v1/icons/success.gif`}
        className="gencl:h-36"
      />
      <div className="gencl:flex gencl:flex-col gencl:gap-2">
        <p className="gencl:text-headline-4-semi-bold">{text}</p>
        <p className="gencl:text-body-1-semi-bold gencl:text-secondary-500">
          {description}
        </p>
      </div>
      {button && (
        <DialogClose asChild>
          <Link
            onClick={() => {
              onClose?.();
            }}
            href={button.href}
            className="gencl:w-full"
          >
            <Button theme="primary" className="gencl:w-full">{button.label}</Button>
          </Link>
        </DialogClose>
      )}
    </div>
  );
}
