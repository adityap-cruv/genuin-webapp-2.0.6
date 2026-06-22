import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";

import { createFloaterElement, showFloaterContent } from "@/styles/floaterStyles";

/**
 * The genai floater is built imperatively in the DOM by the loader (see
 * `src/index.tsx::createFloater`). This story wraps that imperative API
 * inside a React component so the button is rendered in Storybook.
 */
function FloatingButton({ draggable = false }: { draggable?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const floater = createFloaterElement(draggable);
    showFloaterContent();
    host.appendChild(floater);

    return () => {
      floater.remove();
    };
  }, [draggable]);

  return (
    <div
      ref={hostRef}
      style={{
        position: "relative",
        width: 320,
        height: 240,
        border: "1px dashed #cbd5e1",
        borderRadius: 8,
      }}
    />
  );
}

const meta: Meta<typeof FloatingButton> = {
  title: "GenAI/FloatingButton",
  component: FloatingButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Floating launcher button that opens the genai dialog. Wraps the " +
          "imperative `createFloaterElement` from `src/styles/floaterStyles.ts`.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    draggable: false,
  },
};
