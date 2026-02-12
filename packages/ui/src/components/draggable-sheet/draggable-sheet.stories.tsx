import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DraggableSheet } from "./index";
import type { DraggableSheetState } from "./index";

const meta: Meta<typeof DraggableSheet> = {
  title: "Components/DraggableSheet",
  component: DraggableSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A draggable sheet component with multiple states and smooth transitions. Supports various height units (vh, px, %, rem) and provides intelligent auto-expand behavior.",
      },
    },
  },
  argTypes: {
    enabledStates: {
      control: "object",
      description: "Which states are enabled (ordered low → high)",
    },
    initialState: {
      control: "select",
      options: [
        "default",
        "default-active",
        "expand-view",
        "panel-view",
        "full-view",
      ],
      description: "Initial state when the sheet mounts",
    },
    expandDelay: {
      control: "number",
      description:
        "Delay (ms) for auto-transition from default-active → expand-view",
    },
    showOverlay: {
      control: "boolean",
      description: "Show overlay backdrop in panel-view / full-view",
    },
    showIndicator: {
      control: "boolean",
      description: "Show the drag indicator pill",
    },
    showNav: {
      control: "boolean",
      description: "Show the navigation bar",
    },
    navTitle: {
      control: "text",
      description: "Title text in the navigation bar",
    },
    showClose: {
      control: "boolean",
      description: "Show close button in navigation bar",
    },
    theme: {
      control: "select",
      options: ["light", "dark"],
      description: "Visual theme",
    },
    transitionDuration: {
      control: "number",
      description: "CSS transition duration in milliseconds",
    },
  },
  decorators: [
    (Story: any) => (
      <div className="gencl:relative gencl:h-screen gencl:w-full gencl:bg-secondary-100 gencl:overflow-hidden">
        <div className="gencl:p-8">
          <h1 className="gencl:text-heading-2 gencl:mb-4">
            Draggable Sheet Demo
          </h1>
          <p className="gencl:text-body-1 gencl:mb-4">
            Hover or touch the sheet to activate. Drag the indicator or nav bar
            to adjust height.
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

// ============================================================================
// BASIC EXAMPLES
// ============================================================================

export const Default: Story = {
  args: {
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Default Sheet</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          This is a basic draggable sheet with default settings. Hover to
          activate, drag to adjust height.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Content item {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
    navTitle: "Dark Theme Sheet",
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4 gencl:text-white">
          Dark Theme
        </h2>
        <p className="gencl:text-body-1 gencl:mb-4 gencl:text-white">
          The sheet supports both light and dark themes with appropriate
          backdrop blur and styling.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-white/10 gencl:rounded-sm gencl:text-white"
            >
              Dark content item {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const WithOverlay: Story = {
  args: {
    showOverlay: false,
    navTitle: "Sheet with Overlay",
    initialState: "panel-view",
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Overlay Demo</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          When in panel-view or full-view, an overlay appears behind the sheet.
          Click the overlay to close.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-primary-50 gencl:rounded-sm"
            >
              Panel content {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

// ============================================================================
// CUSTOM HEIGHT & STATE EXAMPLES
// ============================================================================

export const CustomHeights: Story = {
  args: {
    navTitle: "Custom Heights",
    heights: {
      default: "120px",
      "default-active": 25,
      "expand-view": "50%",
      "panel-view": 80,
      "full-view": "100vh",
    },
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Mixed Height Units</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Demonstrates mixing different height units: px, vh, and % in the same
          configuration.
        </p>
        <ul className="gencl:list-disc gencl:pl-6 gencl:space-y-2">
          <li>default: 120px</li>
          <li>default-active: 25vh</li>
          <li>expand-view: 50%</li>
          <li>panel-view: 80vh</li>
          <li>full-view: 100vh</li>
        </ul>
        <div className="gencl:space-y-2 gencl:mt-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Content line {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const LimitedStates: Story = {
  args: {
    enabledStates: [
      "default",
      "expand-view",
      "full-view",
    ] as DraggableSheetState[],
    navTitle: "Limited States",
    showOverlay: false,
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Limited States</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Only three states enabled: default, expand-view, and full-view.
          Dragging will snap between these positions only.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-primary-50 gencl:rounded-sm"
            >
              Limited state content {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const AutoExpand: Story = {
  args: {
    expandDelay: 2000,
    navTitle: "Auto-Expand Demo",
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Auto-Expand</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Auto-expands from default-active to expand-view after 2 seconds. Hover
          to trigger, then wait. User interaction cancels the timer.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Auto-expanding content {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

// ============================================================================
// PLATFORM-SPECIFIC EXAMPLES
// ============================================================================

const MobileExampleComponent = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <div className="gencl:p-8 gencl:pb-40">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="gencl:size-8! gencl:rounded-full gencl:bg-primary-600 gencl:text-white gencl:font-medium hover:gencl:bg-primary-700"
        ></button>
        <p className="gencl:text-body-2 gencl:text-secondary-600 gencl:mt-2">
          Octo button to toggle sheet visibility. This example simulates a
          mobile use case(Example)
        </p>
      </div>

      <DraggableSheet
        visible={isVisible}
        enabledStates={[
          "default",
          "default-active",
          "expand-view",
          "panel-view",
          "full-view",
        ]}
        initialState="default"
        expandDelay={3000}
        showOverlay={false}
        showIndicator={true}
        showNav={true}
        showClose={true}
        navTitle="Mobile Sheet"
        theme="light"
        transitionDuration={350}
        heights={{
          default: 15,
          "default-active": 20,
          "expand-view": 40,
          "panel-view": 70,
          "full-view": 95,
        }}
        onClose={() => setIsVisible(false)}
      >
        <div className="gencl:p-6">
          <h2 className="gencl:text-heading-2 gencl:mb-4">Mobile Use Case</h2>
          <p className="gencl:text-body-1 gencl:mb-4">
            This demonstrates all states enabled for a mobile experience:
          </p>
          <ul className="gencl:list-disc gencl:pl-6 gencl:space-y-2 gencl:mb-6">
            <li>
              <strong>default (15vh):</strong> Initial collapsed state
            </li>
            <li>
              <strong>default-active (20vh):</strong> Activated on hover/touch
            </li>
            <li>
              <strong>expand-view (40vh):</strong> Auto-expands after 3s
            </li>
            <li>
              <strong>panel-view (70vh):</strong> Medium expansion with overlay
            </li>
            <li>
              <strong>full-view (95vh):</strong> Maximum expansion
            </li>
          </ul>

          <div className="gencl:space-y-3">
            <h3 className="gencl:text-heading-3 gencl:mb-2">Features</h3>
            <div className="gencl:p-4 gencl:bg-primary-50 gencl:rounded-sm">
              <h4 className="gencl:text-body-1-medium gencl:mb-1">
                Auto-Expand
              </h4>
              <p className="gencl:text-body-2">
                Automatically expands after 3 seconds
              </p>
            </div>
            <div className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm">
              <h4 className="gencl:text-body-1-medium gencl:mb-1">Overlay</h4>
              <p className="gencl:text-body-2">
                Shows backdrop in panel-view and full-view
              </p>
            </div>
            <div className="gencl:p-4 gencl:bg-success-50 gencl:rounded-sm">
              <h4 className="gencl:text-body-1-medium gencl:mb-1">
                Drag Indicator
              </h4>
              <p className="gencl:text-body-2">
                Visual pill for dragging control
              </p>
            </div>
            <div className="gencl:p-4 gencl:bg-warning-50 gencl:rounded-sm">
              <h4 className="gencl:text-body-1-medium gencl:mb-1">
                Navigation
              </h4>
              <p className="gencl:text-body-2">
                Header with title and close button
              </p>
            </div>
          </div>

          <div className="gencl:space-y-2 gencl:mt-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
              >
                Scrollable content item {i + 1}
              </div>
            ))}
          </div>
        </div>
      </DraggableSheet>
    </>
  );
};

export const MobileExample: Story = {
  render: () => <MobileExampleComponent />,
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-optimized example with all states enabled. Click the button to toggle visibility. Demonstrates hover activation, auto-expand, drag controls, and overlay behavior.",
      },
    },
  },
};

const DesktopExampleComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [showClose, setShowClose] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className="gencl:flex gencl:h-screen gencl:w-full">
      {/* Left Half - Controls */}
      <div className="gencl:w-1/2 gencl:bg-secondary-50 gencl:p-8 gencl:overflow-y-auto">
        <h2 className="gencl:text-heading-2 gencl:mb-6">
          Desktop Modal Controls
        </h2>

        <div className="gencl:space-y-6">
          {/* Visibility Control */}
          <div className="gencl:bg-white gencl:p-6 gencl:rounded-sm gencl:shadow-sm">
            <h3 className="gencl:text-heading-3 gencl:mb-4">Visibility</h3>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="gencl:w-full gencl:px-6 gencl:py-3 gencl:bg-primary-600 gencl:text-white gencl:rounded-sm gencl:font-medium hover:gencl:bg-primary-700 gencl:transition-colors"
            >
              {isVisible ? "Hide Sheet" : "Show Sheet"}
            </button>
            <p className="gencl:text-body-2 gencl:text-secondary-600 gencl:mt-2">
              Toggle the sheet visibility
            </p>
          </div>

          {/* Theme Control */}
          <div className="gencl:bg-white gencl:p-6 gencl:rounded-sm gencl:shadow-sm">
            <h3 className="gencl:text-heading-3 gencl:mb-4">Theme</h3>
            <div className="gencl:flex gencl:gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`gencl:flex-1 gencl:px-4 gencl:py-2 gencl:rounded-sm gencl:font-medium gencl:transition-colors ${
                  theme === "light"
                    ? "gencl:bg-primary-600 gencl:text-white"
                    : "gencl:bg-secondary-100 gencl:text-secondary-700 hover:gencl:bg-secondary-200"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`gencl:flex-1 gencl:px-4 gencl:py-2 gencl:rounded-sm gencl:font-medium gencl:transition-colors ${
                  theme === "dark"
                    ? "gencl:bg-primary-600 gencl:text-white"
                    : "gencl:bg-secondary-100 gencl:text-secondary-700 hover:gencl:bg-secondary-200"
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Sheet Options */}
          <div className="gencl:bg-white gencl:p-6 gencl:rounded-sm gencl:shadow-sm">
            <h3 className="gencl:text-heading-3 gencl:mb-4">Sheet Options</h3>
            <div className="gencl:space-y-3">
              <label className="gencl:flex gencl:items-center gencl:justify-between gencl:cursor-pointer">
                <span className="gencl:text-body-1">Show Overlay</span>
                <input
                  type="checkbox"
                  checked={showOverlay}
                  onChange={(e) => setShowOverlay(e.target.checked)}
                  className="gencl:w-5 gencl:h-5 gencl:rounded gencl:border-secondary-300 gencl:text-primary-600 focus:gencl:ring-2 focus:gencl:ring-primary-500 focus:gencl:ring-offset-2"
                />
              </label>
              <label className="gencl:flex gencl:items-center gencl:justify-between gencl:cursor-pointer">
                <span className="gencl:text-body-1">Show Navigation</span>
                <input
                  type="checkbox"
                  checked={showNav}
                  onChange={(e) => setShowNav(e.target.checked)}
                  className="gencl:w-5 gencl:h-5 gencl:rounded gencl:border-secondary-300 gencl:text-primary-600 focus:gencl:ring-2 focus:gencl:ring-primary-500 focus:gencl:ring-offset-2"
                />
              </label>
              <label className="gencl:flex gencl:items-center gencl:justify-between gencl:cursor-pointer">
                <span className="gencl:text-body-1">Show Close Button</span>
                <input
                  type="checkbox"
                  checked={showClose}
                  onChange={(e) => setShowClose(e.target.checked)}
                  className="gencl:w-5 gencl:h-5 gencl:rounded gencl:border-secondary-300 gencl:text-primary-600 focus:gencl:ring-2 focus:gencl:ring-primary-500 focus:gencl:ring-offset-2"
                />
              </label>
            </div>
          </div>

          {/* Configuration Info */}
          <div className="gencl:bg-primary-50 gencl:p-6 gencl:rounded-sm">
            <h3 className="gencl:text-heading-3 gencl:mb-3">Configuration</h3>
            <p className="gencl:text-body-1 gencl:mb-3">
              This example demonstrates a desktop-specific configuration where
              only the
              <strong> full-view</strong> state is enabled, effectively creating
              a modal dialog.
            </p>
            <ul className="gencl:list-disc gencl:pl-6 gencl:space-y-2 gencl:text-body-2">
              <li>
                <strong>enabledStates:</strong> ["full-view"] only
              </li>
              <li>
                <strong>initialState:</strong> "full-view"
              </li>
              <li>
                <strong>showOverlay:</strong> {showOverlay ? "true" : "false"}
              </li>
              <li>
                <strong>showIndicator:</strong> false
              </li>
              <li>
                <strong>showNav:</strong> {showNav ? "true" : "false"}
              </li>
              <li>
                <strong>theme:</strong> "{theme}"
              </li>
            </ul>
          </div>

          {/* Use Cases */}
          <div className="gencl:bg-secondary-50 gencl:p-6 gencl:rounded-sm">
            <h4 className="gencl:text-heading-4 gencl:mb-3">Use Cases</h4>
            <ul className="gencl:list-disc gencl:pl-6 gencl:space-y-1 gencl:text-body-2">
              <li>Modal dialogs</li>
              <li>Full-screen forms</li>
              <li>Detail views</li>
              <li>Settings panels</li>
            </ul>
          </div>

          {/* Important Notes */}
          <div className="gencl:bg-warning-50 gencl:p-6 gencl:rounded-sm">
            <h4 className="gencl:text-heading-4 gencl:mb-3">Important Notes</h4>
            <p className="gencl:text-body-2 gencl:mb-2">
              When only one state is enabled, the sheet behaves as a simple
              show/hide component:
            </p>
            <ul className="gencl:list-disc gencl:pl-6 gencl:space-y-1 gencl:text-body-2">
              <li>No state transitions or drag functionality</li>
              <li>Overlay click closes the sheet via onClose callback</li>
              <li>Close button triggers onClose which controls visibility</li>
              <li>Perfect for desktop modal patterns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Half - Sheet Display */}
      <div className="gencl:w-1/2 gencl:bg-secondary-100 gencl:relative">
        <div className="gencl:absolute gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center">
          <div className="gencl:text-center gencl:p-8">
            <h3 className="gencl:text-heading-3 gencl:mb-2">
              Sheet Preview Area
            </h3>
            <p className="gencl:text-body-1 gencl:text-secondary-600">
              {isVisible
                ? "Sheet is currently visible"
                : "Click 'Show Sheet' to preview the modal"}
            </p>
          </div>
        </div>

        <DraggableSheet
          visible={isVisible}
          enabledStates={["full-view"]}
          initialState="full-view"
          showOverlay={showOverlay}
          showIndicator={false}
          showNav={showNav}
          showClose={showClose}
          navTitle="Desktop Modal"
          theme={theme}
          transitionDuration={300}
          heights={{
            default: 15,
            "default-active": 18,
            "expand-view": 40,
            "panel-view": 70,
            "full-view": "100vh",
          }}
          onClose={() => setIsVisible(false)}
        >
          <div className="gencl:p-8 gencl:max-w-4xl gencl:mx-auto">
            <h2
              className={`gencl:text-heading-1 gencl:mb-6 ${theme === "dark" ? "gencl:text-white" : ""}`}
            >
              Desktop Modal Use Case
            </h2>

            <div
              className={`gencl:p-6 gencl:rounded-sm gencl:mb-6 ${
                theme === "dark" ? "gencl:bg-white/10" : "gencl:bg-primary-50"
              }`}
            >
              <h3
                className={`gencl:text-heading-3 gencl:mb-3 ${theme === "dark" ? "gencl:text-white" : ""}`}
              >
                Sample Content
              </h3>
              <p
                className={`gencl:text-body-1 ${theme === "dark" ? "gencl:text-white/90" : ""}`}
              >
                This is a full-view modal sheet. Use the controls on the left to
                customize the appearance and behavior.
              </p>
            </div>

            <div className="gencl:grid gencl:grid-cols-2 gencl:gap-6 gencl:mb-6">
              <div
                className={`gencl:p-6 gencl:rounded-sm ${
                  theme === "dark"
                    ? "gencl:bg-white/10"
                    : "gencl:bg-secondary-50"
                }`}
              >
                <h4
                  className={`gencl:text-heading-4 gencl:mb-3 ${theme === "dark" ? "gencl:text-white" : ""}`}
                >
                  Benefits
                </h4>
                <ul
                  className={`gencl:list-disc gencl:pl-6 gencl:space-y-1 ${theme === "dark" ? "gencl:text-white/90" : ""}`}
                >
                  <li>Simplified UX</li>
                  <li>No dragging complexity</li>
                  <li>Clear focus</li>
                  <li>Desktop optimized</li>
                </ul>
              </div>
              <div
                className={`gencl:p-6 gencl:rounded-sm ${
                  theme === "dark" ? "gencl:bg-white/10" : "gencl:bg-success-50"
                }`}
              >
                <h4
                  className={`gencl:text-heading-4 gencl:mb-3 ${theme === "dark" ? "gencl:text-white" : ""}`}
                >
                  Features
                </h4>
                <ul
                  className={`gencl:list-disc gencl:pl-6 gencl:space-y-1 ${theme === "dark" ? "gencl:text-white/90" : ""}`}
                >
                  <li>Full viewport coverage</li>
                  <li>Overlay backdrop</li>
                  <li>Theme support</li>
                  <li>Customizable navigation</li>
                </ul>
              </div>
            </div>

            <div className="gencl:space-y-4">
              <h3
                className={`gencl:text-heading-3 ${theme === "dark" ? "gencl:text-white" : ""}`}
              >
                Scrollable Content
              </h3>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`gencl:p-6 gencl:rounded-sm ${
                    theme === "dark"
                      ? "gencl:bg-white/10 gencl:border gencl:border-white/20"
                      : "gencl:bg-white gencl:border gencl:border-secondary-200"
                  }`}
                >
                  <h5
                    className={`gencl:text-heading-4 gencl:mb-2 ${theme === "dark" ? "gencl:text-white" : ""}`}
                  >
                    Section {i + 1}
                  </h5>
                  <p
                    className={`gencl:text-body-1 ${
                      theme === "dark"
                        ? "gencl:text-white/80"
                        : "gencl:text-secondary-600"
                    }`}
                  >
                    This is sample content for a desktop modal. The sheet takes
                    up the full viewport height and provides a focused
                    experience for the user.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DraggableSheet>
      </div>
    </div>
  );
};

export const DesktopExample: Story = {
  render: () => <DesktopExampleComponent />,
  parameters: {
    docs: {
      description: {
        story:
          "Desktop-optimized modal example with only full-view state enabled. Click the button to toggle visibility. No drag functionality - behaves as a traditional modal dialog with overlay backdrop.",
      },
    },
  },
};
