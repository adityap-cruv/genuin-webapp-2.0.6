import type { Meta, StoryObj } from "@storybook/react-vite";

import AttachmentCard from "./AttachmentCard";

const meta: Meta<typeof AttachmentCard> = {
  title: "GenAI/Attachments/AttachmentCard",
  component: AttachmentCard,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Pdf: Story = {
  args: {
    name: "brand-guidelines.pdf",
    type: "application/pdf",
    status: "success",
  },
};

export const Csv: Story = {
  args: {
    name: "products-q1.csv",
    type: "text/csv",
    status: "success",
  },
};

export const Image: Story = {
  args: {
    name: "hero.png",
    type: "image/png",
    previewUrl: "https://picsum.photos/seed/genai/240/160",
    status: "success",
  },
};

export const Uploading: Story = {
  args: {
    name: "long-document.pdf",
    type: "application/pdf",
    status: "uploading",
  },
};

export const ErrorState: Story = {
  args: {
    name: "broken.pdf",
    type: "application/pdf",
    status: "error",
  },
};
