import { Button } from "@genuin/ui/button";
import { ShareIcon } from "@genuin/ui/icons";

// TODO: ADD FUNCITIONALITY
export function ShareButton({ showText = false }: { showText?: boolean }) {
  return (
    <Button size="sm" theme="secondary" variant="icon" className="">
      <ShareIcon className="" />
      {showText && "Share"}
    </Button>
  );
}
