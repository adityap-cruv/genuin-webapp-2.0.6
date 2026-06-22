/**
 * Tests for ConfigProvider — written FIRST per TDD mandate.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { ConfigProvider, useConfig } from "@cxr/providers/ConfigProvider";
import type { TagResponse } from "@cxr/types";

interface Captured {
  tagDetails: TagResponse;
  rootTagId: string;
  tagId: string;
  isGenAiEnabled: boolean;
}

let captured: Captured = {
  tagDetails: {},
  rootTagId: "",
  tagId: "",
  isGenAiEnabled: false,
};

function Consumer(): null {
  const ctx = useConfig();
  captured = ctx;
  return null;
}

const baseTags: TagResponse = { tag_id: "tag-1" };

describe("ConfigProvider", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(tagDetails: TagResponse, tagId = "tag-1", rootTagId = "root-1") {
    act(() => {
      root.render(
        // eslint-disable-next-line react/no-children-prop
        React.createElement(ConfigProvider, {
          tagDetails,
          rootTagId,
          tagId,
          children: React.createElement(Consumer),
        })
      );
    });
  }

  it("exposes tagDetails, rootTagId, tagId", () => {
    render(baseTags, "tag-1", "root-1");
    expect(captured.tagDetails).toBe(baseTags);
    expect(captured.rootTagId).toBe("root-1");
    expect(captured.tagId).toBe("tag-1");
  });

  it("sets isGenAiEnabled=false for non-allowlisted tagId", () => {
    render(baseTags, "non-genai-tag");
    expect(captured.isGenAiEnabled).toBe(false);
  });

  it("sets isGenAiEnabled=false when allowlist is empty", () => {
    render(baseTags, "69846c0e6852c97693efad40");
    expect(captured.isGenAiEnabled).toBe(false);
  });

  it("useConfig throws outside ConfigProvider", () => {
    let errorCaught = false;
    function BadConsumer(): null {
      try {
        useConfig();
      } catch {
        errorCaught = true;
      }
      return null;
    }
    act(() => {
      root.render(React.createElement(BadConsumer));
    });
    expect(errorCaught).toBe(true);
  });
});
