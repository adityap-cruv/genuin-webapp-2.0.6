import type { Meta, StoryFn } from "@storybook/react-vite";
import { BaseLayout } from "@genuin/components/templates/base-layout";
import { Explore } from "./explore";

/**
 * Explore page displays trending communities and groups in a unified view.
 * It uses the BaseLayout for consistent page structure.
 */
export default {
  title: "Page/Explore",
  component: Explore,
  decorators: [
    (Story) => (
      <BaseLayout>
        <Story />
      </BaseLayout>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Main explore page showing trending communities and groups.",
      },
    },
  },
} as Meta<typeof Explore>;

const Template: StoryFn = (args) => <Explore {...args} />;

export const Default = Template.bind({});
Default.args = {};
Default.parameters = {
  docs: {
    description: {
      story: "Default view of the explore page with trending sections.",
    },
  },
};
