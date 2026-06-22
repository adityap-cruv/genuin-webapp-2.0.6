import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UploadedFile } from "@/types";

import { UploadedFilesList } from "./UploadedFilesList";

const meta: Meta<typeof UploadedFilesList> = {
  title: "GenAI/MessageInput/UploadedFilesList",
  component: UploadedFilesList,
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj<typeof meta>;

const fileFixture = (overrides: Partial<UploadedFile>): UploadedFile => ({
  id: overrides.id ?? `file-${Math.random().toString(36).slice(2, 8)}`,
  file: new File([], overrides.name ?? "untitled"),
  name: overrides.name ?? "untitled",
  size: overrides.size ?? 1024,
  type: overrides.type ?? "application/octet-stream",
  uploadStatus: overrides.uploadStatus ?? "success",
  ...overrides,
});

export const Mixed: Story = {
  args: {
    files: [
      fileFixture({ id: "1", name: "brand-guidelines.pdf", type: "application/pdf" }),
      fileFixture({
        id: "2",
        name: "hero.png",
        type: "image/png",
        preview: "https://picsum.photos/seed/genai-hero/240/160",
      }),
      fileFixture({ id: "3", name: "products-q1.csv", type: "text/csv" }),
    ],
    onRemove: (id) => console.log("[story] remove", id),
  },
};

export const Uploading: Story = {
  args: {
    files: [fileFixture({ id: "u1", name: "uploading.pdf", uploadStatus: "uploading" })],
    onRemove: () => {},
  },
};

export const Empty: Story = {
  args: { files: [], onRemove: () => {} },
};
