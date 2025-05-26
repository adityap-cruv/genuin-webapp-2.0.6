import { Button } from "@genuin/ui/button";
import { cn } from "@genuin/ui/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

type FullScreenCommentBoxProps = {
  enablePreviousButton: boolean;
  enableNextButton: boolean;
  onClickOnPreviousButton: () => void;
  onClickOnNextButton: () => void;
};

const NavigationButtons = ({
  enableNextButton,
  enablePreviousButton,
  onClickOnNextButton,
  onClickOnPreviousButton,
}: FullScreenCommentBoxProps) => {
  return (
    <>
      <Button
        disabled={!enablePreviousButton}
        className={cn(
          "gencl:flex-shrink-0 gencl:rounded-full gencl:bg-white/10 gencl:p-3 gencl:hover:bg-white/20",
          !enablePreviousButton ? "gencl:opacity-40" : undefined
        )}
        onClick={onClickOnPreviousButton}
      >
        <ChevronUp className="gencl:h-8 gencl:w-8" />
      </Button>

      <Button
        disabled={!enableNextButton}
        className={cn(
          "gencl:flex-shrink-0 gencl:rounded-full gencl:bg-white/10 gencl:p-3 gencl:hover:bg-white/20",
          !enableNextButton ? "gencl:opacity-40" : undefined
        )}
        onClick={onClickOnNextButton}
      >
        <ChevronDown className="gencl:h-8 gencl:w-8" />
      </Button>
    </>
  );
};

export default NavigationButtons;
