import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta: Meta = {
  title: "GenAI/UI/Dialog",
  parameters: {
    // `centered` wraps the story in a transformed container which creates
    // a new containing block and breaks `position: fixed` on the overlay.
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Radix-backed modal portalled into `.genai-sdk-container`. Stories " +
          "render the trigger; click it to open.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="gai:font-headline-4-semi">Confirm action</DialogTitle>
          <DialogDescription className="gai:text-secondary-gray-700">
            This is a story for the genai SDK Dialog. The content is portalled into
            <code className="gai:px-1">.genai-sdk-container</code>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open (no close X)</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="gai:font-headline-4-semi">No escape hatch</DialogTitle>
          <DialogDescription>Use the buttons below to dismiss.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
