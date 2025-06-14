import type { Meta, StoryFn } from "@storybook/react-vite";

import { BaseLayout } from "@genuin/components/templates/base-layout";

import { Home } from "@genuin/components/page/home";

export default {
  title: "Page/Home",
  component: Home,
  decorators: [
    (Story) => (
      <BaseLayout search={undefined}>
        <Story />
      </BaseLayout>
    ),
  ],
} as Meta<typeof Home>;

const Template: StoryFn = (args) => <Home {...args} />;

export const Default = Template.bind({});
Default.args = {};
