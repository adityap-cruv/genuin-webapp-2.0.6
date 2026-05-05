import type { Meta, StoryFn } from "@storybook/react-vite";

import { Home } from "@genuin/components/page/home";
import { BaseLayout } from "@genuin/components/templates/base-layout";

export default {
  title: "Page/Home",
  component: Home,
  decorators: [
    (Story) => (
      <BaseLayout>
        <Story />
      </BaseLayout>
    ),
  ],
} as Meta<typeof Home>;

const Template: StoryFn = (args) => <Home {...args} />;

export const Default: StoryFn = Template.bind({});
Default.args = {};
