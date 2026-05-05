import type { Meta, StoryObj } from "@storybook/react-vite";

import FileSelectDropzone from "./file-select-dropzone";

const meta: Meta<typeof FileSelectDropzone> = {
  title: "Molecules/File Select Dropzone",
  component: FileSelectDropzone,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof FileSelectDropzone>;

export const Default: Story = {
  render: (args) => (
    <div className="gencl:min-w-80">
      <FileSelectDropzone {...args} />
    </div>
  ),
  args: {
    onFileChange: (file) => alert(`File uploaded: ${file.name}`),
    config: { validation: { video: {} } },
  },
};

export const MultipleFiles: Story = {
  render: Default.render,
  args: {
    config: { multiple: true, validation: { video: {} } },
    onFileChange: (file) => alert(`File uploaded: ${file.name}`),
  },
};

export const Disabled: Story = {
  render: Default.render,
  args: {
    disabled: true,
    config: { validation: { video: {} } },
    onFileChange: (file) => alert(`File uploaded: ${file.name}`),
  },
};

export const CustomFileTypes: Story = {
  render: Default.render,
  args: {
    config: { allowedFileTypes: ["PNG"], validation: { video: {} } },
    onError: (error) => alert(`Error: ${error}`),
    onFileChange: (file) => alert(`File uploaded: ${file.name}`),
  },
};

export const WithErrorHandling: Story = {
  render: Default.render,
  args: {
    onFileChange: (file) => alert(`File uploaded: ${file.name}`),
    onError: (error) => alert(`Upload error: ${error}`),
  },
};

export const WithInProgress: Story = {
  render: Default.render,
  args: {
    isLoading: true,
    onFileChange: (file) => alert(`File uploaded: ${file.name}`),
  },
};
