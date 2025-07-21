import type { Meta, StoryObj } from "@storybook/react";
import { ContactUs } from "./contact-us";

const meta: Meta<typeof ContactUs> = {
  title: "Organisms/Settings/Contact Us",
  component: ContactUs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered", // optional: centers the form in the canvas
  },
  argTypes: {
    email: { control: "text" },
  },
};

export default meta;

type ContactUsStateStories = StoryObj<typeof ContactUs>;

export const Default: ContactUsStateStories = {
  args: {
    email: "Enter email",
  },
};
