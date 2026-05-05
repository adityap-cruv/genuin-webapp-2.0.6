import type { StoryFn, Meta } from "@storybook/react";

import type { MentionInputProps } from "./mention-input";
import { MentionInput } from "./mention-input";

export default {
  title: "Molecules/MentionInput",
  component: MentionInput,
} as Meta;

const mockUser = {
  name: "Jane Doe",
  isAvatar: true,
  image: "https://randomuser.me/api/portraits/women/44.jpg",
};

const Template: StoryFn<MentionInputProps> = (args: MentionInputProps) => <MentionInput {...args} />;

export const Default: StoryFn<MentionInputProps> = Template.bind({});
Default.args = {
  videoId: "2a22d143-2566-4a23-b342-448357ab6f3d",
  loopId: "loop456",
  user: mockUser,
  onCommentPosted: (comment: any) => {
    // eslint-disable-next-line no-console
    console.log("Comment posted:", comment);
  },
};
