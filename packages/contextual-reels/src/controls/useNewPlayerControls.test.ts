/**
 * Tests for the Design System V2 controls gate.
 *
 * The hook is force-on today (see its TODO about gating on
 * `TagResponse.config.design_system`). This locks the current contract so the
 * eventual switch to per-tag gating is a deliberate, visible change rather than
 * something that quietly alters which control set every tag renders.
 */
import { describe, it, expect } from "vitest";

import { useNewPlayerControls } from "@cxr/controls/useNewPlayerControls";

describe("useNewPlayerControls", () => {
  it("returns true — V2 controls are force-enabled for every CXR tag", () => {
    expect(useNewPlayerControls()).toBe(true);
  });

  it("returns a plain boolean, matching the webapp/web-sdk contract", () => {
    expect(typeof useNewPlayerControls()).toBe("boolean");
  });

  it("is stable across calls (no per-call state)", () => {
    expect(useNewPlayerControls()).toBe(useNewPlayerControls());
  });
});
