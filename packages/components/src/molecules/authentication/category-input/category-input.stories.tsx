import type { Meta, StoryObj } from "@storybook/react";
import { CategoryInput, type CategoryType } from "./category-input";
import { 
  Code, 
  Paintbrush, 
  Briefcase, 
  Camera,
  Monitor,
  Figma,
  Building2,
  Palette
} from "lucide-react";

type Category = CategoryType;

/**
 * CategoryInput component allows users to select their interests from categorized options.
 * Supports multiple categories with subcategories and handles both small and large datasets.
 */
const meta: Meta<typeof CategoryInput> = {
  title: "Molecules/Authentication/CategoryInput",
  component: CategoryInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A component for selecting user interests during onboarding.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:max-w-2xl gencl:w-full gencl:bg-white gencl:shadow-sm">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    data: {
      description: 'Array of category objects containing name, icon, and subcategories',
      control: 'object',
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CategoryInput>;

export default meta;

type Story = StoryObj<typeof CategoryInput>;

// Use the Category type from props
const mockData: Category[] = [
  {
    category_name: "Technology",
    icon: <Code className="gencl:w-4 gencl:h-4" />,
    categories: ["Web Development", "AI", "Mobile Apps"],
  },
  {
    category_name: "Design",
    icon: <Paintbrush className="gencl:w-4 gencl:h-4" />,
    categories: ["UI/UX", "Graphic Design", "Typography"],
  },
];

/**
 * Compact version with minimal categories for quick selection
 */
export const CompactView: Story = {
  args: {
    data: mockData,
  },
  parameters: {
    docs: {
      description: {
        story: "Displays a minimal set of categories, ideal for quick onboarding.",
      },
    },
  },
};

/**
 * Extended view with multiple categories and options
 */
export const ExtendedView: Story = {
  args: {
    data: [
      {
        category_name: "Technology",
        icon: <Monitor className="gencl:w-4 gencl:h-4" />,
        categories: [
          "Web Development",
          "Mobile Apps",
          "Artificial Intelligence",
          "Machine Learning",
          "Cloud Computing",
          "Cybersecurity",
          "Blockchain",
          "DevOps",
          "Data Science",
        ],
      },
      {
        category_name: "Design",
        icon: <Figma className="gencl:w-4 gencl:h-4" />,
        categories: [
          "UI/UX Design",
          "Graphic Design",
          "Motion Design",
          "Typography",
          "Brand Design",
          "Product Design",
          "Design Systems",
          "Web Design",
          "3D Design",
        ],
      },
      {
        category_name: "Business",
        icon: <Building2 className="gencl:w-4 gencl:h-4" />,
        categories: [
          "Marketing",
          "Entrepreneurship",
          "Project Management",
          "Digital Marketing",
          "E-commerce",
          "Business Strategy",
          "Sales",
          "Startups",
          "Finance",
        ],
      },
      {
        category_name: "Creative",
        icon: <Palette className="gencl:w-4 gencl:h-4" />,
        categories: [
          "Photography",
          "Video Production",
          "Content Creation",
          "Writing",
          "Animation",
          "Illustration",
          "Music",
          "Film",
          "Art Direction",
        ],
      },
    ] satisfies Category[],
  },
  parameters: {
    docs: {
      description: {
        story: "Shows a comprehensive set of categories with many options, demonstrating scroll behavior and layout flexibility.",
      },
    },
  },
};