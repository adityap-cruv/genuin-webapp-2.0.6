import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { DynamicSheet } from "./dynamic-sheet";
import type { DynamicSheetConfig, DynamicSheetState } from "./types";

const meta: Meta<typeof DynamicSheet> = {
  title: "Components/DynamicSheet",
  component: DynamicSheet,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A draggable bottom-sheet component with multiple snap states, drag interactions, and auto-advance support. Supports fixed (portal), container, and inline render modes.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story: any) => (
      <div className="gencl:relative gencl:h-screen gencl:w-full gencl:bg-secondary-100 gencl:overflow-hidden">
        <div className="gencl:p-8">
          <h1 className="gencl:text-heading-2 gencl:mb-4">Dynamic Sheet Demo</h1>
          <p className="gencl:text-body-1 gencl:mb-4">Drag the indicator to adjust height. Drag down to close.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DynamicSheet>;

const defaultConfig: DynamicSheetConfig = {
  heights: {
    default: 15,
    "default-active": 18,
    "expand-view": 40,
    "panel-view": 70,
    "full-view": 100,
  },
  showOverlay: false,
  showIndicator: true,
  showClose: true,
  theme: "light",
  stepByStepSwipeDown: true,
};

/**
 * Basic usage with header, content, and footer.
 */
function BasicStory() {
  const [state, setState] = useState<DynamicSheetState>("default");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DynamicSheet
      isOpen={isOpen}
      onDismissed={() => setIsOpen(false)}
      renderMode="container"
      config={{
        ...defaultConfig,
        onStateChange: setState,
        onClose: () => setIsOpen(false),
      }}
      header={
        <div>
          <h2 className="gencl:text-body-0-semi-bold">Sheet Title</h2>
          <p className="gencl:text-body-2-normal gencl:text-secondary-600">Current state: {state}</p>
        </div>
      }
      footer={
        <button className="gencl:w-full gencl:py-2 gencl:px-4 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90">
          Action Button
        </button>
      }>
      <div className="gencl:px-4 gencl:py-3 gencl:space-y-4">
        <p>This is a draggable sheet component with integrated header, content, and footer sections.</p>
        <div className="gencl:space-y-2">
          <h3 className="gencl:text-body-1-semi-bold">Features</h3>
          <ul className="gencl:list-disc gencl:pl-5 gencl:space-y-1">
            <li>Configurable snap states</li>
            <li>Built-in close button</li>
            <li>Auto-advance between states</li>
            <li>Fixed, container, and inline render modes</li>
          </ul>
        </div>
      </div>
    </DynamicSheet>
  );
}

export const Basic: Story = {
  render: () => <BasicStory />,
};

/**
 * Dark theme variant with backdrop blur effect.
 */
function DarkThemeStory() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DynamicSheet
      isOpen={isOpen}
      onDismissed={() => setIsOpen(false)}
      renderMode="container"
      config={{
        ...defaultConfig,
        theme: "dark",
        onClose: () => setIsOpen(false),
      }}
      header={
        <div>
          <h2 className="gencl:text-body-0-semi-bold gencl:text-white">Dark Theme Sheet</h2>
          <p className="gencl:text-body-2-normal gencl:text-white/70">Backdrop blur with dark overlay</p>
        </div>
      }>
      <div className="gencl:px-4 gencl:py-3 gencl:space-y-4 gencl:text-white">
        <p>This sheet uses the dark theme configuration.</p>
        <p className="gencl:text-white/70">Perfect for dark mode interfaces.</p>
      </div>
    </DynamicSheet>
  );
}

export const DarkTheme: Story = {
  render: () => <DarkThemeStory />,
};

/**
 * Custom heights configuration.
 */
function CustomHeightsStory() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DynamicSheet
      isOpen={isOpen}
      onDismissed={() => setIsOpen(false)}
      renderMode="container"
      config={{
        ...defaultConfig,
        navTitle: "Custom Heights",
        heights: {
          default: 20,
          "default-active": 25,
          "expand-view": 50,
          "panel-view": 80,
          "full-view": 95,
        },
        onClose: () => setIsOpen(false),
      }}>
      <div className="gencl:px-4 gencl:py-3 gencl:space-y-2">
        <p className="gencl:font-semibold">Custom height values:</p>
        <ul className="gencl:list-disc gencl:pl-5 gencl:space-y-1 gencl:text-body-2-normal">
          <li>default: 20%</li>
          <li>default-active: 25%</li>
          <li>expand-view: 50%</li>
          <li>panel-view: 80%</li>
          <li>full-view: 95%</li>
        </ul>
      </div>
    </DynamicSheet>
  );
}

export const CustomHeights: Story = {
  render: () => <CustomHeightsStory />,
};

/**
 * Content only — no header or footer.
 */
function ContentOnlyStory() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DynamicSheet
      isOpen={isOpen}
      onDismissed={() => setIsOpen(false)}
      renderMode="container"
      config={{
        ...defaultConfig,
        showClose: false,
        onClose: () => setIsOpen(false),
      }}>
      <div className="gencl:px-4 gencl:py-3 gencl:flex gencl:flex-col gencl:justify-center gencl:h-full">
        <div className="gencl:text-center gencl:space-y-4">
          <h2 className="gencl:text-heading-1">Hello!</h2>
          <p className="gencl:text-body-1">This sheet has content only — no header or footer.</p>
        </div>
      </div>
    </DynamicSheet>
  );
}

export const ContentOnly: Story = {
  render: () => <ContentOnlyStory />,
};

/**
 * Auto-advance — sheet automatically progresses through states.
 */
function AutoAdvanceStory() {
  const [state, setState] = useState<DynamicSheetState>("default");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DynamicSheet
      isOpen={isOpen}
      onDismissed={() => setIsOpen(false)}
      renderMode="container"
      config={{
        ...defaultConfig,
        navTitle: "Auto-Advance",
        onStateChange: setState,
        onClose: () => setIsOpen(false),
        autoAdvance: [
          { from: "default", to: "default-active", delayMs: 1500 },
          { from: "default-active", to: "expand-view", delayMs: 3000 },
        ],
      }}>
      <div className="gencl:px-4 gencl:py-3 gencl:space-y-2">
        <p className="gencl:text-body-2-normal gencl:text-secondary-600">
          Current state: <strong>{state}</strong>
        </p>
        <p className="gencl:text-body-2-normal">
          Sheet auto-advances: default → default-active (1.5 s) → expand-view (3 s).
        </p>
      </div>
    </DynamicSheet>
  );
}

export const AutoAdvance: Story = {
  render: () => <AutoAdvanceStory />,
};

/**
 * Interactive Mobile Demo — control visibility with state.
 */
function MobileDemoStory() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [state, setState] = useState<DynamicSheetState>("default");

  const open = () => {
    setIsMounted(true);
    setIsOpen(true);
  };

  return (
    <>
      <div className="gencl:p-8 gencl:space-y-4">
        <button
          onClick={isOpen ? () => setIsOpen(false) : open}
          className="gencl:px-4 gencl:py-2 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90">
          {isOpen ? "Close Sheet" : "Open Sheet"}
        </button>
        <p className="gencl:text-body-2-normal gencl:text-secondary-600">
          Current state: {state} | Open: {isOpen ? "Yes" : "No"}
        </p>
      </div>

      {isMounted && (
        <DynamicSheet
          isOpen={isOpen}
          onDismissed={() => setIsMounted(false)}
          renderMode="container"
          config={{
            ...defaultConfig,
            navTitle: "Mobile Sheet Demo",
            onStateChange: setState,
            onClose: () => setIsOpen(false),
          }}
          footer={
            <button
              onClick={() => setIsOpen(false)}
              className="gencl:w-full gencl:py-2 gencl:px-4 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90">
              Close Sheet
            </button>
          }>
          <div className="gencl:px-4 gencl:py-3 gencl:space-y-4">
            <p>
              Toggle the sheet open/closed with the button above. The sheet animates in and out and fires{" "}
              <code className="gencl:text-body-2-normal">onDismissed</code> after the close animation ends.
            </p>
            <div className="gencl:space-y-2">
              <h3 className="gencl:text-body-1-semi-bold">How it works:</h3>
              <ul className="gencl:list-disc gencl:pl-5 gencl:space-y-1">
                <li>Toggle visibility with the button above</li>
                <li>Close button triggers onClose callback</li>
                <li>onDismissed fires after close animation</li>
                <li>Sheet resets to initial state on re-open</li>
              </ul>
            </div>
          </div>
        </DynamicSheet>
      )}
    </>
  );
}

export const MobileDemo: Story = {
  render: () => <MobileDemoStory />,
};

/**
 * Interactive Desktop Demo — persistent side panel.
 */
function DesktopDemoStory() {
  const [state, setState] = useState<DynamicSheetState>("full-view");
  const [itemCount, setItemCount] = useState(5);
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  const open = () => {
    setIsMounted(true);
    setIsOpen(true);
  };

  return (
    <div className="gencl:h-full gencl:flex">
      {/* Left half — controls */}
      <div className="gencl:w-1/2 gencl:p-8 gencl:space-y-6 gencl:overflow-y-auto">
        <div>
          <h1 className="gencl:text-heading-2 gencl:mb-4">Desktop Mode Demo</h1>
          <p className="gencl:text-body-1 gencl:text-secondary-600 gencl:mb-6">
            A desktop-style side panel locked to full-view.
          </p>
        </div>

        <div className="gencl:space-y-4">
          <div>
            <h3 className="gencl:text-body-0-semi-bold gencl:mb-3">Visibility Control</h3>
            <button
              onClick={isOpen ? () => setIsOpen(false) : open}
              className="gencl:px-4 gencl:py-2 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90">
              {isOpen ? "Hide Panel" : "Show Panel"}
            </button>
          </div>

          <div>
            <h3 className="gencl:text-body-0-semi-bold gencl:mb-3">Item Management</h3>
            <div className="gencl:flex gencl:gap-2">
              <button
                onClick={() => setItemCount((c) => c + 1)}
                className="gencl:px-4 gencl:py-2 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90">
                Add Item
              </button>
              <button
                onClick={() => setItemCount((c) => Math.max(0, c - 1))}
                className="gencl:px-4 gencl:py-2 gencl:border gencl:border-secondary-200 gencl:rounded-md hover:gencl:bg-secondary-25">
                Remove Item
              </button>
            </div>
          </div>

          <div className="gencl:p-4 gencl:bg-white gencl:rounded-md gencl:border gencl:border-secondary-200">
            <h3 className="gencl:text-body-1-semi-bold gencl:mb-2">Status</h3>
            <div className="gencl:space-y-1 gencl:text-body-2-normal">
              <p>
                <span className="gencl:text-secondary-600">State:</span>{" "}
                <span className="gencl:font-medium">{state}</span>
              </p>
              <p>
                <span className="gencl:text-secondary-600">Visible:</span>{" "}
                <span className="gencl:font-medium">{isOpen ? "Yes" : "No"}</span>
              </p>
              <p>
                <span className="gencl:text-secondary-600">Items:</span>{" "}
                <span className="gencl:font-medium">{itemCount}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right half — sheet */}
      <div className="gencl:w-1/2 gencl:relative gencl:h-full">
        {isMounted && (
          <DynamicSheet
            isOpen={isOpen}
            onDismissed={() => setIsMounted(false)}
            renderMode="container"
            config={{
              enabledStates: ["full-view"],
              initialState: "full-view",
              heights: {
                "full-view": 100,
              },
              showOverlay: false,
              showIndicator: false,
              showClose: true,
              theme: "light",
              navTitle: "Desktop Side Panel",
              onStateChange: setState,
              onClose: () => setIsOpen(false),
            }}
            footer={
              <div className="gencl:flex gencl:gap-2">
                <button className="gencl:flex-1 gencl:py-2 gencl:px-4 gencl:border gencl:border-secondary-200 gencl:rounded-md hover:gencl:bg-secondary-25">
                  Clear All
                </button>
                <button className="gencl:flex-1 gencl:py-2 gencl:px-4 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90">
                  Process {itemCount} Items
                </button>
              </div>
            }>
            <div className="gencl:px-4 gencl:py-3 gencl:space-y-4">
              <p>
                Desktop mode with a full-height side panel. Perfect for persistent UI elements like task lists or info
                cards.
              </p>
              <div className="gencl:space-y-2">
                <h3 className="gencl:text-body-1-semi-bold">Current Items:</h3>
                {itemCount === 0 ? (
                  <p className="gencl:text-body-2-normal gencl:text-secondary-600">
                    No items yet. Click &quot;Add Item&quot; in the left panel.
                  </p>
                ) : (
                  <ul className="gencl:space-y-1">
                    {Array.from({ length: itemCount }, (_, i) => (
                      <li key={i} className="gencl:p-2 gencl:bg-secondary-50 gencl:rounded-md">
                        Item {i + 1}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </DynamicSheet>
        )}
        {!isMounted && (
          <div className="gencl:h-full gencl:flex gencl:items-center gencl:justify-center gencl:text-secondary-400">
            <div className="gencl:text-center">
              <p className="gencl:text-body-0-semi-bold gencl:mb-2">Panel Hidden</p>
              <p className="gencl:text-body-2-normal">Click &quot;Show Panel&quot; to display</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const DesktopDemo: Story = {
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <div className="gencl:h-screen gencl:w-full gencl:bg-secondary-100 gencl:overflow-hidden">
        <Story />
      </div>
    ),
  ],
  render: () => <DesktopDemoStory />,
};
