import { parseKsCbRequestStatus } from "@genuin/components/types/roles";
import type { ksCbRequestStatusType } from "@genuin/components/types/roles";

/**
 * @deprecated Use {@link parseKsCbRequestStatus} from `@genuin/components/types/roles`.
 * Kept as a thin re-export for existing call sites.
 */
export const getKsCbRequestStatus = (status: number): ksCbRequestStatusType => parseKsCbRequestStatus(status);
