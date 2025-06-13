import { Button, ButtonPropsType } from "@genuin/ui/button";
import { ShareIcon } from "@genuin/ui/icons";

type ShareButtonProps = ButtonPropsType & {
  showText? : boolean
}

// TODO: ADD FUNCITIONALITY
export function ShareButton({ showText = false , size="md" }: ShareButtonProps) {
  return (
    <Button size={size} theme="secondary" variant="icon">
      <ShareIcon className="gencl:size-6" />
      {showText && "Share"}
    </Button>
  );
}
