import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet";

export default {
  title: "Components/Sheet",
  component: Sheet,
} as Meta;

type Story = StoryFn<typeof Sheet>;

const Template: Story = (args) => (
  <Sheet {...args}>
    <SheetTrigger>
      <button className="gencl::btn gencl::btn-primary">Open Sheet</button>
    </SheetTrigger>
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Sheet Title</SheetTitle>
        <SheetDescription>
          This is a description for the sheet.
        </SheetDescription>
      </SheetHeader>
      <div className="gencl::p-4">Sheet Content goes here...</div>
      <SheetFooter>
        <button className="gencl::btn gencl::btn-secondary">Action</button>
      </SheetFooter>
      <SheetClose>
        <button className="gencl::btn gencl::btn-danger">Close</button>
      </SheetClose>
    </SheetContent>
  </Sheet>
);

export const Default = Template.bind({});
Default.args = {};
