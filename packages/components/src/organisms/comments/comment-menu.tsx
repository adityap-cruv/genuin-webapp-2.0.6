import { Report } from "@genuin/components/molecules/report";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@genuin/ui/components/popover";
import { ThreeDotsIcon } from "@genuin/ui/icons";
import { Button } from "@genuin/ui/button";
import { ComponentProps } from "react";
import { cn } from "@genuin/ui/lib/utils";

type CommentMenuPropsType = ComponentProps<typeof PopoverTrigger> & {
  contentId: string;
};

export function CommentMenu({
  contentId,
  className,
  ...restProps
}: CommentMenuPropsType) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "gencl:p-1 gencl:rounded-lg gencl:hover:bg-secondary-100",
          className
        )}
        {...restProps}
      >
        <ThreeDotsIcon className="gencl:h-4 gencl:w-4" />
      </PopoverTrigger>
      <PopoverContent className="gencl:p-0 gencl:border-none gencl:w-fit" align="end">
        <Report reportFor="COMMENT" contentId={contentId}>
          <div className="gencl:p-3 gencl:rounded-xl gencl:border-secondary-100 gencl:bg-white gencl:cursor-pointer gencl:text-primary">
            <Button
              theme="text"
              className="gencl:text-error-status gencl:text-body-1-medium gencl:hover:gencl:border-secondary-100 gencl:h-fit gencl:px-0"
            >
              Report Comment
            </Button>
          </div>
        </Report>
      </PopoverContent>
    </Popover>
  );
}
