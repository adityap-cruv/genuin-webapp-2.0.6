import { Meta, StoryFn } from "@storybook/react-vite";
import { Home } from "./home";

export default {
  title: "Page/Home",
  component: Home,
} as Meta;

const Template: StoryFn = (args) => <Home {...args} />;

export const Default = Template.bind({});
Default.args = {};
