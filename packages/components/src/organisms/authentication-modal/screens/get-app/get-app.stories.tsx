import type { Meta, StoryObj } from "@storybook/react";
import { GetApp } from "./get-app";

/**
 * The GetApp component provides users with options to receive app download links
 * via email or phone number. It includes a QR code scanner and proper input validation.
 */
const meta: Meta<typeof GetApp> = {
  title: "Organisms/Authentication/GetApp",
  component: GetApp,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Download app form supporting both email and phone number methods with QR code scanning option.",
      },
    },
  },
  decorators: [(Story) => <Story />],
  tags: ["autodocs"],
  argTypes: {
    // onSubmit: {
    //   description: "Callback fired when form is submitted",
    //   control: false,
    // },
    // defaultCountry: {
    //   description: "Default country code for phone input",
    //   control: { type: "select" },
    //   options: ["US", "IN", "GB", "CA"],
    // },
    // className: {
    //   description: "Additional CSS classes to apply",
    //   control: { type: "text" },
    // },
  },
};

export default meta;
type Story = StoryObj<typeof GetApp>;

/**
 * Default view showing all download options
 */
export const Default: Story = {
  args: {
    // defaultCountry: "US",
    // onSubmit: () => console.log("Submit clicked"),
    // deepLink:
    //   "https://play.google.com/store/apps/details?id=com.begenuin.begenuin&hl=en%3F%5Bobject%20Object%5D%5Bobject%20Object%5D%3D",
  },
  parameters: {
    docs: {
      description: {
        story: "Default view with QR code, phone, and email input options.",
      },
    },
  },
};
