import { Button } from "@genuin/ui/button";
import { ShareIcon } from "@genuin/ui/icons";

// TODO: ADD FUNCITIONALITY
export function ShareButton() {
  return (
    <Button size="sm" theme="secondary">
      <ShareIcon className="gencl:size-6" />
    </Button>
  );
}
