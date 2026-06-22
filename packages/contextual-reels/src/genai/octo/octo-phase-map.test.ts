import { describe, it, expect } from "vitest";

import * as phaseMap from "@cxr/genai/octo/octo-phase-map";
import { MOBILE_PHASE_MAP } from "@cxr/genai/octo/octo-phase-map";

describe("octo-phase-map", () => {
  it("exposes MOBILE_PHASE_MAP with the ladder transitions", () => {
    expect(MOBILE_PHASE_MAP.countdown.sheetState).toBe("default-active");
    expect(MOBILE_PHASE_MAP.thinking.sheetState).toBe("expand-view");
    expect(MOBILE_PHASE_MAP.response.sheetState).toBe("panel-view");
    expect(MOBILE_PHASE_MAP.idle.sheetState).toBeNull();
  });

  it("no longer exports DESKTOP_PHASE_MAP", () => {
    expect((phaseMap as Record<string, unknown>).DESKTOP_PHASE_MAP).toBeUndefined();
  });
});
