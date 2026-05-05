import type { Meta, StoryObj } from "@storybook/react";

import { SelectableList } from "./selectable-list";

const meta: Meta<typeof SelectableList> = {
  title: "Molecules/SelectableList",
  component: SelectableList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SelectableList>;

const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape", "Honeydew"];

export const Default: Story = {
  render: () => (
    <SelectableList>
      {items.map((item, index) => (
        <SelectableList.Item key={item} index={index}>
          {item}
        </SelectableList.Item>
      ))}
    </SelectableList>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <SelectableList className="gencl:border-blue-300 gencl:bg-blue-50">
      {items.map((item, index) => (
        <SelectableList.Item key={item} index={index} className="gencl:text-blue-900">
          {item}
        </SelectableList.Item>
      ))}
    </SelectableList>
  ),
};

export const ManyItemsWithScrolling: Story = {
  render: () => (
    <SelectableList>
      {Array.from({ length: 50 }).map((_, i) => (
        <SelectableList.Item key={i} index={i}>
          Item #{i + 1}
        </SelectableList.Item>
      ))}
    </SelectableList>
  ),
};

export const KeyboardNavigationInfo: Story = {
  render: () => (
    <div>
      <p className="gencl:mb-2 gencl:text-sm gencl:text-gray-600">
        Use ↑ and ↓ keys to navigate the list. The highlighted item is updated based on keyboard or mouse hover.
      </p>
      <SelectableList>
        {["Red", "Green", "Blue", "Yellow", "Purple"].map((item, index) => (
          <SelectableList.Item key={item} index={index}>
            {item}
          </SelectableList.Item>
        ))}
      </SelectableList>
    </div>
  ),
};
