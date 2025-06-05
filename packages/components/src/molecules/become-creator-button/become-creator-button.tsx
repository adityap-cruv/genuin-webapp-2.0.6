import { Button } from "@genuin/ui/button";
import type { ComponentPropsWithoutRef } from "react";

type BecomeCreatorButtonPropsType = Omit<
  ComponentPropsWithoutRef<typeof Button> & {
    buttonText?: string;
  },
  "children"
>;

export function BecomeCreatorButton({
  buttonText,
  size,
  ...restProps
}: BecomeCreatorButtonPropsType) {
  return (
    <Button size={size ?? "md"} {...restProps}>
      {buttonText ?? "Become a Creator"}
    </Button>
  );
}
