import { useRef } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { EditCoverImage, EditCoverImageHandle } from "./edit-cover-image";
import { Button } from "@genuin/ui/components";

const meta: Meta<typeof EditCoverImage> = {
  title: "Organisms/Edit Cover Image",
  component: EditCoverImage,
  tags: ["autodocs"],
  args: {
    videoURL:
      "https://media.begenuin.com/temp_video/67345114261af9b41c83dd80_1743510621960.mp4",
    thumbHeight: 90, // default value
  },
  argTypes: {
    videoURL: {
      control: "text",
      description: "MP4 video URL used to extract thumbnails and preview frame",
    },
    thumbHeight: {
      control: { type: "number" },
      description: "Height of each thumbnail in pixels",
    },
  },
};

export default meta;

type Story = StoryObj<typeof EditCoverImage>;

export const Default: Story = {
  render: (args) => {
    const ref = useRef<EditCoverImageHandle>(null);

    const handleCapture = async () => {
      const file = await ref.current?.captureImage();
      if (file) {
        console.log("Captured image file from story:", file);
      }
    };

    const handleDownload = async () => {
      const file = await ref.current?.captureImage();
      if (file) {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name || "cover_frame.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    };

    return (
      <div className="gencl:space-y-4">
        <EditCoverImage {...args} ref={ref} />
        <div className="gencl:flex gencl:gap-4">
          <Button onClick={handleCapture}>Capture Cover Frame</Button>
          <Button onClick={handleDownload}>Download Cover Frame</Button>
        </div>
      </div>
    );
  },
};
