import type { Meta, StoryObj } from "@storybook/react";
import { Report } from "./report";
import { Button } from "@genuin/ui/button";

const meta: Meta<typeof Report> = {
  title: "Molecules/Report",
  component: Report,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
**Report** is a molecule component for reporting posts or comments.  
It opens a dialog with selectable reasons for reporting the content.  
Use the \`reportFor\` prop to specify whether you are reporting a post or a comment.
        `,
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Report>;

export const PostReport: Story = {
  render: () => (
    <Report reportFor="VIDEO" contentId="post-123">
      <Button className="gencl:bg-primary gencl:text-white">Report Post</Button>
    </Report>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Report dialog for a post. Click the button to open the report dialog for a post.",
      },
    },
  },
};

export const CommentReport: Story = {
  render: () => (
    <Report reportFor="COMMENT" contentId="comment-456">
      <Button className="gencl:bg-primary gencl:text-white">
        Report Comment
      </Button>
    </Report>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Report dialog for a comment. Click the button to open the report dialog for a comment.",
      },
    },
  },
};
