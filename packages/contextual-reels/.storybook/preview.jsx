import { InstanceProvider } from "../src/instance/registry/InstanceContext";
import { EventBusProvider } from "../src/instance/coordination/EventBusContext";
import { ShadowDomProvider } from "../src/shadow-dom-context";
import "../src/styles/tailwind.css";

/** @type { import('@storybook/react').Preview } */
const preview = {
  tags: ["autodocs"],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <InstanceProvider instanceId="storybook-instance">
        <EventBusProvider>
          <ShadowDomProvider config={null}>
            <Story />
          </ShadowDomProvider>
        </EventBusProvider>
      </InstanceProvider>
    ),
  ],
};

export default preview;
