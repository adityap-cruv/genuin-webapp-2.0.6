import { useAuthContext } from "@genuin/components/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { Button } from "@genuin/ui/button";
import type { ComponentPropsWithoutRef } from "react";
import { Link } from "../link";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";

type BecomeCreatorButtonPropsType = Omit<
  ComponentPropsWithoutRef<typeof Button> & {
    buttonText?: string;
  },
  "children"
> & { shareUrl: string };

export function BecomeCreatorButton({
  buttonText,
  size,
  shareUrl,
  ...restProps
}: BecomeCreatorButtonPropsType) {
  const { handleAuthCallback, user } = useAuthContext();
  const { modalConfig } = useEmbedConfigs();

  const button = (
    <Button size={size ?? "md"} {...restProps}>
      {buttonText ?? "Become a Creator"}
    </Button>
  );

  if (modalConfig.hideModal && !user) {
    const clickHandler = handleAuthCallback({
      authCallbackData: {
        action: "become-a-creator",
        path: shareUrl,
        returnQueryParams: createReturnQueryParams({
          url: shareUrl,
          action: "become-a-creator",
        }),
      },
      pendingActionData: {
        action: "become-a-creator",
      },
    });

    if (clickHandler) return <span onClick={clickHandler}>{button}</span>;

    return (
      <Link href={shareUrl} target="_blank">
        {button}
      </Link>
    );
  }

  return (
    <AuthenticationModal asChild customStep="BECOME_CREATOR">
      {button}
    </AuthenticationModal>
  );
}
