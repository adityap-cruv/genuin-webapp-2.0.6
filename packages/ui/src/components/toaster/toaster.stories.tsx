import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Toaster,
  Toast,
} from "./toaster"; // adjust path if needed
import { Button } from "@genuin/ui/components/button"; // Use any button or native <button>

const meta: Meta = {
  title: "Components/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

export const Success: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => Toast.Success({ message: "Link copied" })}>
        Show Success Toast
      </Button>
    </>
  ),
};

export const Error: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => Toast.Error({ message: "Something went wrong" })}>
        Show Error Toast
      </Button>
    </>
  ),
};

export const Descriptive: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => Toast.Success({ message: "Something went wrong" , description : "Long Text Description" })}>
        Show Toast
      </Button>
    </>
  ),
};