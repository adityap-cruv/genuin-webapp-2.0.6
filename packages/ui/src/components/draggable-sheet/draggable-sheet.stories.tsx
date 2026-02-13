import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  DraggableSheet,
  type DraggableSheetConfig,
  type DraggableSheetState,
} from "./index";

const meta: Meta<typeof DraggableSheet> = {
  title: "Components/DraggableSheet",
  component: DraggableSheet,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A draggable sheet component with integrated header, content, and footer sections. Supports multiple height states, drag interactions, and auto-expand functionality.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story: any) => (
      <div className="gencl:relative gencl:h-screen gencl:w-full gencl:bg-secondary-100 gencl:overflow-hidden">
        <div className="gencl:p-8">
          <h1 className="gencl:text-heading-2 gencl:mb-4">
            Draggable Sheet Demo
          </h1>
          <p className="gencl:text-body-1 gencl:mb-4">
            Hover or touch the sheet to activate. Drag the indicator to adjust
            height.
          </p>
        </div>
        <div className="gencl:fixed gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:z-50">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DraggableSheet>;

const defaultConfig: DraggableSheetConfig = {
  heights: {
    default: 15,
    "default-active": 18,
    "expand-view": 40,
    "panel-view": 70,
    "full-view": 100,
  },
  showOverlay: false,
  showIndicator: true,
  showHeader: true,
  showFooter: true,
  showClose: true,
  theme: "light",
  transitionDuration: 350,
  stepByStepSwipeDown: true,
  expandDelay: 3000,
};

/**
 * Basic usage with custom header, content, and footer.
 */
export const Basic: Story = {
  render: () => {
    const [state, setState] = useState<DraggableSheetState>("default");

    return (
      <DraggableSheet
        config={{ ...defaultConfig, onStateChange: setState }}
        header={
          <div>
            <h2 className="gencl:text-body-0-semi-bold">Sheet Title</h2>
            <p className="gencl:text-body-2-normal gencl:text-secondary-600">
              Current state: {state}
            </p>
          </div>
        }
        footer={
          <button className="gencl:w-full gencl:py-2 gencl:px-4 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90">
            Action Button
          </button>
        }
      >
        <div className="gencl:px-4 gencl:py-3 gencl:space-y-4">
          <p>
            This is a draggable sheet component with integrated header, content,
            and footer sections.
          </p>
          <div className="gencl:space-y-2">
            <h3 className="gencl:text-body-1-semi-bold">Features</h3>
            <ul className="gencl:list-disc gencl:pl-5 gencl:space-y-1">
              <li>Integrated Header, Content, and Footer</li>
              <li>Built-in Close button</li>
              <li>Configuration object for customization</li>
              <li>Auto-expand functionality</li>
              <li>Loading state support</li>
            </ul>
          </div>
        </div>
      </DraggableSheet>
    );
  },
};

/**
 * Dark theme variant with backdrop blur effect
 */
export const DarkTheme: Story = {
  render: () => {
    const darkConfig: DraggableSheetConfig = {
      ...defaultConfig,
      theme: "dark",
    };

    return (
      <DraggableSheet
        config={darkConfig}
        header={
          <div>
            <h2 className="gencl:text-body-0-semi-bold gencl:text-white">
              Dark Theme Sheet
            </h2>
            <p className="gencl:text-body-2-normal gencl:text-white/70">
              Backdrop blur with dark overlay
            </p>
          </div>
        }
      >
        <div className="gencl:px-4 gencl:py-3 gencl:space-y-4 gencl:text-white">
          <p>This sheet uses the dark theme configuration.</p>
          <p className="gencl:text-white/70">
            Perfect for dark mode interfaces.
          </p>
        </div>
      </DraggableSheet>
    );
  },
};

/**
 * Custom heights configuration
 */
export const CustomHeights: Story = {
  render: () => {
    const customConfig: DraggableSheetConfig = {
      ...defaultConfig,
      navTitle: "Custom Heights",
      heights: {
        default: 20,
        "default-active": 25,
        "expand-view": 50,
        "panel-view": 80,
        "full-view": 95,
      },
    };

    return (
      <DraggableSheet config={customConfig}>
        <div className="gencl:px-4 gencl:py-3 gencl:space-y-2">
          <p className="gencl:font-semibold">Custom height values:</p>
          <ul className="gencl:list-disc gencl:pl-5 gencl:space-y-1 gencl:text-body-2-normal">
            <li>default: 20vh</li>
            <li>default-active: 25vh</li>
            <li>expand-view: 50vh</li>
            <li>panel-view: 80vh</li>
            <li>full-view: 95vh</li>
          </ul>
        </div>
      </DraggableSheet>
    );
  },
};

/**
 * Content only - no header or footer
 */
export const ContentOnly: Story = {
  render: () => {
    const contentOnlyConfig: DraggableSheetConfig = {
      ...defaultConfig,
      showHeader: false,
      showFooter: false,
    };

    return (
      <DraggableSheet config={contentOnlyConfig}>
        <div className="gencl:px-4 gencl:py-3 gencl:flex gencl:flex-col gencl:justify-center gencl:h-full">
          <div className="gencl:text-center gencl:space-y-4">
            <h2 className="gencl:text-heading-1">Hello!</h2>
            <p className="gencl:text-body-1">
              This sheet only has content, no header or footer.
            </p>
          </div>
        </div>
      </DraggableSheet>
    );
  },
};

/**
 * Loading state with shimmer effects
 */
export const LoadingState: Story = {
  render: () => {
    return (
      <DraggableSheet
        config={{
          ...defaultConfig,
          navTitle: "Loading...",
          loading: true,
        }}
        footer={
          <button className="gencl:w-full gencl:py-2 gencl:px-4 gencl:bg-primary gencl:text-white gencl:rounded-md">
            Submit
          </button>
        }
      >
        <div className="gencl:px-4 gencl:py-3">
          <p>This content won't show while loading</p>
        </div>
      </DraggableSheet>
    );
  },
};

/**
 * Dark theme with loading state
 */
export const DarkThemeLoading: Story = {
  render: () => {
    return (
      <DraggableSheet
        config={{
          ...defaultConfig,
          theme: "dark",
          navTitle: "Loading Dark Theme",
          loading: true,
        }}
      >
        <div className="gencl:px-4 gencl:py-3">
          <p>Content hidden during loading</p>
        </div>
      </DraggableSheet>
    );
  },
};

/**
 * Interactive Mobile Demo - Control visibility with state
 */
export const MobileDemo: Story = {
  render: () => {
    const [isVisible, setIsVisible] = useState(true);
    const [state, setState] = useState<DraggableSheetState>("default");

    return (
      <>
        <div className="gencl:p-8 gencl:space-y-4">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="gencl:px-4 gencl:py-2 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90"
          >
            {isVisible ? "Hide Sheet" : "Show Sheet"}
          </button>
          <p className="gencl:text-body-2-normal gencl:text-secondary-600">
            Current state: {state} | Visible: {isVisible ? "Yes" : "No"}
          </p>
        </div>

        <DraggableSheet
          config={{
            ...defaultConfig,
            navTitle: "Mobile Sheet Demo",
            visible: isVisible,
            onStateChange: setState,
            onClose: () => setIsVisible(false),
          }}
          footer={
            <button
              onClick={() => setIsVisible(false)}
              className="gencl:w-full gencl:py-2 gencl:px-4 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90"
            >
              Close Sheet
            </button>
          }
        >
          <div className="gencl:px-4 gencl:py-3 gencl:space-y-4">
            <p>
              This demonstrates mobile behavior where the sheet can be
              shown/hidden based on state.
            </p>
            <div className="gencl:space-y-2">
              <h3 className="gencl:text-body-1-semi-bold">How it works:</h3>
              <ul className="gencl:list-disc gencl:pl-5 gencl:space-y-1">
                <li>Toggle visibility with the button above</li>
                <li>Sheet returns to default state when closed</li>
                <li>Close button triggers onClose callback</li>
                <li>Perfect for mobile overlays and modals</li>
              </ul>
            </div>
          </div>
        </DraggableSheet>
      </>
    );
  },
};

/**
 * Interactive Desktop Demo - Persistent sheet with state control
 */
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
  render: () => {
    const [state, setState] = useState<DraggableSheetState>("full-view");
    const [itemCount, setItemCount] = useState(5);
    const [isVisible, setIsVisible] = useState(true);

    return (
      <div className="gencl:h-full gencl:flex">
        {/* Left half - Controls */}
        <div className="gencl:w-1/2 gencl:p-8 gencl:space-y-6 gencl:overflow-y-auto">
          <div>
            <h1 className="gencl:text-heading-2 gencl:mb-4">
              Desktop Mode Demo
            </h1>
            <p className="gencl:text-body-1 gencl:text-secondary-600 gencl:mb-6">
              This demonstrates a desktop-style side panel with full-view only
              mode.
            </p>
          </div>

          <div className="gencl:space-y-4">
            <div>
              <h3 className="gencl:text-body-0-semi-bold gencl:mb-3">
                Visibility Control
              </h3>
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="gencl:px-4 gencl:py-2 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90"
              >
                {isVisible ? "Hide Panel" : "Show Panel"}
              </button>
            </div>

            <div>
              <h3 className="gencl:text-body-0-semi-bold gencl:mb-3">
                Item Management
              </h3>
              <div className="gencl:flex gencl:gap-2">
                <button
                  onClick={() => setItemCount((c) => c + 1)}
                  className="gencl:px-4 gencl:py-2 gencl:bg-primary gencl:text-white gencl:rounded-md hover:gencl:opacity-90"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setItemCount((c) => Math.max(0, c - 1))}
                  className="gencl:px-4 gencl:py-2 gencl:border gencl:border-secondary-200 gencl:rounded-md hover:gencl:bg-secondary-25"
                >
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
                  <span className="gencl:font-medium">
                    {isVisible ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <span className="gencl:text-secondary-600">Items:</span>{" "}
                  <span className="gencl:font-medium">{itemCount}</span>
                </p>
              </div>
            </div>

            <div className="gencl:space-y-2">
              <h3 className="gencl:text-body-0-semi-bold">Features:</h3>
              <ul className="gencl:list-disc gencl:pl-5 gencl:space-y-1 gencl:text-body-2-normal">
                <li>Side-by-side layout for desktop</li>
                <li>Full-view only (no dragging between states)</li>
                <li>Toggle visibility on/off</li>
                <li>Perfect for persistent side panels</li>
                <li>No overlay, no drag indicator needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right half - Sheet */}
        <div className="gencl:w-1/2 gencl:relative gencl:h-full">
          {isVisible && (
            <div className="gencl:h-full gencl:overflow-hidden">
              <DraggableSheet
                config={{
                  enabledStates: ["full-view"],
                  initialState: "full-view",
                  showOverlay: false,
                  showIndicator: false,
                  showHeader: true,
                  showFooter: true,
                  showClose: true,
                  theme: "light",
                  transitionDuration: 350,
                  navTitle: "Desktop Side Panel",
                  onStateChange: setState,
                  onClose: () => setIsVisible(false),
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
                }
              >
                <div className="gencl:px-4 gencl:py-3 gencl:space-y-4">
                  <p>
                    Desktop mode with full-height side panel. Perfect for
                    persistent UI elements like task lists or info cards.
                  </p>
                  <div className="gencl:space-y-2">
                    <h3 className="gencl:text-body-1-semi-bold">
                      Current Items:
                    </h3>
                    {itemCount === 0 ? (
                      <p className="gencl:text-body-2-normal gencl:text-secondary-600">
                        No items yet. Click "Add Item" in the left panel.
                      </p>
                    ) : (
                      <ul className="gencl:space-y-1">
                        {Array.from({ length: itemCount }, (_, i) => (
                          <li
                            key={i}
                            className="gencl:p-2 gencl:bg-secondary-50 gencl:rounded-md"
                          >
                            Item {i + 1}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </DraggableSheet>
            </div>
          )}
          {!isVisible && (
            <div className="gencl:h-full gencl:flex gencl:items-center gencl:justify-center gencl:text-secondary-400">
              <div className="gencl:text-center">
                <p className="gencl:text-body-0-semi-bold gencl:mb-2">
                  Panel Hidden
                </p>
                <p className="gencl:text-body-2-normal">
                  Click "Show Panel" to display
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
};
