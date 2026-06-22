/**
 * @fileoverview AI Response Stories
 *
 * Storybook stories for the placeholder AI response block. The
 * component fills its host container; the harness wraps it in a
 * resizable frame so reviewers can verify the layout adapts
 * (vertical scroll kicks in when the frame is shorter than the
 * content; text wraps when narrower).
 *
 * Per Figma [node 8316:41382](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=8316-41382&m=dev).
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";

import { AiResponse } from "@genuin/components/molecules/ai-response";

// ── Presets ─────────────────────────────────────────────────────

const PRESETS: ReadonlyArray<{ w: number; h: number; label: string }> = [
  { w: 600, h: 900, label: "Tall (carousel fits)" },
  { w: 480, h: 720, label: "Default" },
  { w: 360, h: 480, label: "Mobile-ish (no carousel)" },
  { w: 800, h: 360, label: "Wide & short (no carousel)" },
  { w: 240, h: 320, label: "Narrow & short" },
];

interface HarnessProps {
  width: number;
  height: number;
  background?: string;
}

function ResizableHarness({ width, height, background = "#ffffff" }: HarnessProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  const applyPreset = (w: number, h: number) => {
    if (!frameRef.current) return;
    frameRef.current.style.width = `${w}px`;
    frameRef.current.style.height = `${h}px`;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}>
        {PRESETS.map((p) => (
          <button
            key={`${p.w}x${p.h}`}
            type="button"
            onClick={() => applyPreset(p.w, p.h)}
            style={{
              padding: "6px 10px",
              border: "1px solid #d0d7de",
              borderRadius: 6,
              background: "#ffffff",
              color: "#1d1f20",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              cursor: "pointer",
            }}>
            {p.label} ({p.w}×{p.h})
          </button>
        ))}
      </div>

      <div
        ref={frameRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          minWidth: 160,
          minHeight: 120,
          resize: "both",
          overflow: "hidden",
          border: "1px solid #dfe1e3",
          borderRadius: 8,
          background,
          padding: 16,
          boxSizing: "border-box",
        }}>
        <AiResponse />
      </div>

      <p
        style={{
          marginTop: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          color: "#585c61",
        }}>
        Drag the bottom-right of the frame to resize. The component fills the frame and scrolls vertically when content
        overflows. The video carousel below the text appears only when the frame has room for both (≈ text height + 336
        px).
      </p>
    </div>
  );
}

// ── Storybook meta ──────────────────────────────────────────────

const meta: Meta<typeof ResizableHarness> = {
  title: "Molecules/AI Response",
  component: ResizableHarness,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
**Placeholder AI response block.** Fills its host container; scrolls vertically when the host is shorter than the content. Use it as a stand-in for AI-generated answer text in any cell sized between roughly 240×200 and full-page.

Per Figma [node 8316:41382](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=8316-41382&m=dev).
        `,
      },
    },
  },
  argTypes: {
    width: { control: { type: "number", min: 160, max: 1200, step: 10 } },
    height: { control: { type: "number", min: 120, max: 1200, step: 10 } },
    background: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof ResizableHarness>;

// ── Stories ─────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default",
  args: {
    width: 480,
    height: 720,
    background: "#ffffff",
  },
};

export const WithCarousel: Story = {
  name: "Tall — text + carousel",
  args: {
    width: 600,
    height: 900,
    background: "#ffffff",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Frame tall enough to fit the text + the 320 px video carousel below it. " +
          "The carousel scrolls horizontally when wider than the frame.",
      },
    },
  },
};

export const Narrow: Story = {
  name: "Narrow column",
  args: {
    width: 320,
    height: 600,
    background: "#ffffff",
  },
};

export const Short: Story = {
  name: "Short (scrolls)",
  args: {
    width: 600,
    height: 280,
    background: "#ffffff",
  },
};
