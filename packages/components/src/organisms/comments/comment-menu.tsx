import { Report } from "@genuin/components/molecules/report";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@genuin/ui/components/popover";
import { ThreeDotsIcon } from "@genuin/ui/icons";
import { Button } from "@genuin/ui/button";
export function CommentMenu({ contentId }: { contentId: string }) {
  return (
    <Popover>
      <PopoverTrigger className="gencl:p-1 gencl:rounded-lg gencl:hover:bg-secondary-100">
        <ThreeDotsIcon className="gencl:h-4 gencl:w-4" />
      </PopoverTrigger>
      <PopoverContent className="gencl:p-0 gencl:border-none" align="end">
        <Report reportFor="COMMENT" contentId={contentId}>
          <div className="gencl:p-3 gencl:rounded-xl gencl:border-secondary-100 gencl:bg-white gencl:cursor-pointer gencl:text-primary">
            <Button
              theme="text"
              className="gencl:text-primary gencl:text-body-1-medium gencl:hover:gencl:border-secondary-100 gencl:p-2"
            >
              Report Comment
            </Button>
          </div>
        </Report>
      </PopoverContent>
    </Popover>
  );
}
