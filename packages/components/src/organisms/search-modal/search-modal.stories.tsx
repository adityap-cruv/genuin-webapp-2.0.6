import type { Meta, StoryObj } from "@storybook/react";
import { SearchModal } from "./search-modal";
import { Button } from "@genuin/ui/button";
import { useState } from "react";
import { UserIcon, HashIcon, FileTextIcon } from "lucide-react";

const meta: Meta<typeof SearchModal> = {
  title: "Organisms/Search/SearchModal",
  component: SearchModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockResults = [
  {
    id: "1",
    title: "John Doe",
    description: "Software Engineer at Tech Corp",
    type: "user" as const,
    icon: <UserIcon className="gencl:h-4 gencl:w-4" />,
  },
  {
    id: "2",
    title: "Jane Smith",
    description: "UX Designer and Product Manager",
    type: "user" as const,
    icon: <UserIcon className="gencl:h-4 gencl:w-4" />,
  },
  {
    id: "3",
    title: "React Development",
    description: "Frontend framework discussions and best practices",
    type: "topic" as const,
    icon: <HashIcon className="gencl:h-4 gencl:w-4" />,
  },
  {
    id: "4",
    title: "TypeScript Tips",
    description: "Advanced TypeScript patterns and techniques",
    type: "topic" as const,
    icon: <HashIcon className="gencl:h-4 gencl:w-4" />,
  },
  {
    id: "5",
    title: "Building Modern React Apps",
    description: "A comprehensive guide to modern React development",
    type: "post" as const,
    icon: <FileTextIcon className="gencl:h-4 gencl:w-4" />,
  },
  {
    id: "6",
    title: "State Management in 2024",
    description: "Comparing different state management solutions",
    type: "post" as const,
    icon: <FileTextIcon className="gencl:h-4 gencl:w-4" />,
  },
];

// Default story with trigger button
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Search</Button>
        <SearchModal
          {...args}
          open={open}
          onOpenChange={setOpen}
          results={mockResults}
          onSelect={(result) => {
            console.log("Selected:", result);
            setOpen(false);
          }}
          onSearch={(query) => {
            console.log("Searching for:", query);
          }}
        />
      </>
    );
  },
  args: {
    placeholder: "Search...",
    emptyMessage: "No results found.",
  },
};
