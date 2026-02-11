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
    showOverlay: true,
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
// CUSTOM HEIGHT EXAMPLES
// ============================================================================

export const CustomHeightsVh: Story = {
  args: {
    navTitle: "Custom Heights (vh)",
    heights: {
      default: 15,
      "default-active": 20,
      "expand-view": 50,
      "panel-view": 80,
      "full-view": 95,
    },
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">
          Custom Heights (vh units)
        </h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Heights configured using viewport height percentages (15vh, 20vh,
          50vh, 80vh, 95vh).
        </p>
        <div className="gencl:space-y-2">
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

export const CustomHeightsPx: Story = {
  args: {
    navTitle: "Custom Heights (px)",
    heights: {
      default: "120px",
      "default-active": "180px",
      "expand-view": "400px",
      "panel-view": "600px",
      "full-view": "100vh",
    },
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">
          Custom Heights (px units)
        </h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Heights configured using pixel values (120px, 180px, 400px, 600px,
          100vh).
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Pixel-sized content {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const MixedHeightUnits: Story = {
  args: {
    navTitle: "Mixed Height Units",
    heights: {
      default: "150px",
      "default-active": 25, // vh
      "expand-view": "50%",
      "panel-view": "700px",
      "full-view": "100vh",
    },
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Mixed Units</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Demonstrates mixing different height units: px, vh, and % in the same
          configuration.
        </p>
        <ul className="gencl:list-disc gencl:pl-6 gencl:space-y-2">
          <li>default: 150px</li>
          <li>default-active: 25vh</li>
          <li>expand-view: 50%</li>
          <li>panel-view: 700px</li>
          <li>full-view: 100vh</li>
        </ul>
      </div>
    ),
  },
};

// ============================================================================
// STATE CONFIGURATION EXAMPLES
// ============================================================================

export const LimitedStates: Story = {
  args: {
    enabledStates: [
      "default",
      "expand-view",
      "full-view",
    ] as DraggableSheetState[],
    navTitle: "Limited States",
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

export const TwoStatesOnly: Story = {
  args: {
    enabledStates: ["default", "panel-view"] as DraggableSheetState[],
    navTitle: "Two States",
    showOverlay: true,
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">
          Simple Two-State Sheet
        </h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Only default and panel-view states enabled. Perfect for simple
          expand/collapse behavior.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Two-state content {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

// ============================================================================
// AUTO-EXPAND BEHAVIOR
// ============================================================================

export const FastAutoExpand: Story = {
  args: {
    expandDelay: 1000,
    navTitle: "Fast Auto-Expand (1s)",
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Fast Auto-Expand</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Auto-expands from default-active to expand-view after just 1 second.
          Hover to trigger, then wait.
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

export const SlowAutoExpand: Story = {
  args: {
    expandDelay: 5000,
    navTitle: "Slow Auto-Expand (5s)",
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Slow Auto-Expand</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Auto-expands after 5 seconds. User interaction cancels the timer.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Delayed expansion content {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

// ============================================================================
// INTERACTION EXAMPLES
// ============================================================================

export const NoIndicator: Story = {
  args: {
    showIndicator: false,
    navTitle: "No Drag Indicator",
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">No Drag Indicator</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Sheet without the drag indicator pill. You can still drag using the
          navigation bar.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Content without indicator {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const NoNavBar: Story = {
  args: {
    showNav: false,
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">No Navigation Bar</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Sheet without the navigation bar. Drag using the indicator pill only.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Content without nav {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const CustomTransition: Story = {
  args: {
    transitionDuration: 800,
    navTitle: "Slow Transition (800ms)",
    children: (
      <div className="gencl:p-6">
        <h2 className="gencl:text-heading-3 gencl:mb-4">Slow Transition</h2>
        <p className="gencl:text-body-1 gencl:mb-4">
          Transitions between states take 800ms instead of the default 350ms.
          Notice the smoother, slower motion.
        </p>
        <div className="gencl:space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="gencl:p-4 gencl:bg-secondary-50 gencl:rounded-sm"
            >
              Slow transition content {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

// ============================================================================
// ADVANCED USE CASES
// ============================================================================

export const RichContent: Story = {
  args: {
    navTitle: "Rich Content Example",
    showOverlay: true,
    initialState: "expand-view",
    children: (
      <div className="gencl:p-6">
        <div className="gencl:mb-6">
          <h2 className="gencl:text-heading-2 gencl:mb-2">Product Details</h2>
          <p className="gencl:text-body-1 gencl:text-secondary-600">
            SKU: ABC-12345
          </p>
        </div>

        <div className="gencl:grid gencl:grid-cols-2 gencl:gap-4 gencl:mb-6">
          <div className="gencl:p-4 gencl:bg-primary-50 gencl:rounded-sm">
            <h3 className="gencl:text-heading-4 gencl:mb-2">Price</h3>
            <p className="gencl:text-heading-3 gencl:text-primary-600">
              $99.99
            </p>
          </div>
          <div className="gencl:p-4 gencl:bg-success-50 gencl:rounded-sm">
            <h3 className="gencl:text-heading-4 gencl:mb-2">Stock</h3>
            <p className="gencl:text-heading-3 gencl:text-success-600">
              In Stock
            </p>
          </div>
        </div>

        <div className="gencl:mb-6">
          <h3 className="gencl:text-heading-3 gencl:mb-3">Description</h3>
          <p className="gencl:text-body-1 gencl:mb-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p className="gencl:text-body-1">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>

        <div className="gencl:space-y-2">
          <button className="gencl:w-full gencl:py-3 gencl:px-4 gencl:bg-primary-600 gencl:text-white gencl:rounded-sm gencl:font-medium">
            Add to Cart
          </button>
          <button className="gencl:w-full gencl:py-3 gencl:px-4 gencl:bg-secondary-100 gencl:text-secondary-900 gencl:rounded-sm gencl:font-medium">
            View Similar Items
          </button>
        </div>
      </div>
    ),
  },
};

export const FormExample: Story = {
  args: {
    navTitle: "Contact Form",
    showOverlay: true,
    initialState: "panel-view",
    children: (
      <form className="gencl:p-6 gencl:space-y-4">
        <div>
          <label className="gencl:block gencl:text-body-1-medium gencl:mb-2">
            Name
          </label>
          <input
            type="text"
            className="gencl:w-full gencl:px-4 gencl:py-2 gencl:border gencl:border-secondary-200 gencl:rounded-sm"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="gencl:block gencl:text-body-1-medium gencl:mb-2">
            Email
          </label>
          <input
            type="email"
            className="gencl:w-full gencl:px-4 gencl:py-2 gencl:border gencl:border-secondary-200 gencl:rounded-sm"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="gencl:block gencl:text-body-1-medium gencl:mb-2">
            Message
          </label>
          <textarea
            rows={6}
            className="gencl:w-full gencl:px-4 gencl:py-2 gencl:border gencl:border-secondary-200 gencl:rounded-sm"
            placeholder="Your message..."
          />
        </div>

        <button
          type="submit"
          className="gencl:w-full gencl:py-3 gencl:px-4 gencl:bg-primary-600 gencl:text-white gencl:rounded-sm gencl:font-medium"
        >
          Submit
        </button>
      </form>
    ),
  },
};

export const ListExample: Story = {
  args: {
    navTitle: "Notifications (23)",
    initialState: "expand-view",
    children: (
      <div>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="gencl:px-6 gencl:py-4 gencl:border-b gencl:border-secondary-100 hover:gencl:bg-secondary-50 gencl:cursor-pointer"
          >
            <div className="gencl:flex gencl:items-start gencl:gap-3">
              <div className="gencl:w-10 gencl:h-10 gencl:rounded-full gencl:bg-primary-100 gencl:flex gencl:items-center gencl:justify-center gencl:shrink-0">
                <span className="gencl:text-heading-4 gencl:text-primary-600">
                  {i + 1}
                </span>
              </div>
              <div className="gencl:flex-1">
                <h4 className="gencl:text-body-1-medium gencl:mb-1">
                  Notification Title {i + 1}
                </h4>
                <p className="gencl:text-body-2 gencl:text-secondary-600">
                  This is notification message {i + 1}. Click to view details.
                </p>
                <p className="gencl:text-body-3 gencl:text-secondary-400 gencl:mt-1">
                  {i + 1} hours ago
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
};
