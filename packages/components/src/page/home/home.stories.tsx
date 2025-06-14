import type { Meta, StoryFn } from "@storybook/react-vite";

import { BaseLayout } from "@genuin/components/templates/base-layout";

import { Home } from "./home";

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

export const Default = Template.bind({});
Default.args = {};
