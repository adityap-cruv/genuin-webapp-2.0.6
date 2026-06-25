import { useAuthContext } from "@genuin/components/context/auth";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import type { ActionType } from "@genuin/components/lib/utils/return-query";

type UseAuthRedirectHandlerProps = {
  action: ActionType;
  path?: string;
};

export function useAuthRedirectHandler({ action, path = "/" }: UseAuthRedirectHandlerProps) {
  const { handleAuthCallback } = useAuthContext();

  return handleAuthCallback({
    authCallbackData: {
      action,
      path,
      returnQueryParams: createReturnQueryParams({ url: path, action }),
    },
  });
}
