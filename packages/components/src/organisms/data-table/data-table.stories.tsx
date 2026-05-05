import { Button } from "@genuin/ui/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { DataTable } from "./data-table";
import { DataTableColumnHeader } from "./data-table-column-header";

// Sample data types
interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastLogin: string;
  posts: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  isAvailable: boolean;
}

// Sample data
const userData: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "Admin",
    lastLogin: "2024-01-15",
    posts: 42,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "inactive",
    role: "User",
    lastLogin: "2024-01-10",
    posts: 18,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "pending",
    role: "Moderator",
    lastLogin: "2024-01-12",
    posts: 156,
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    status: "active",
    role: "User",
    lastLogin: "2024-01-14",
    posts: 73,
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    status: "active",
    role: "Admin",
    lastLogin: "2024-01-13",
    posts: 289,
  },
];

const productData: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    category: "Electronics",
    price: 99.99,
    stock: 45,
    rating: 4.5,
    isAvailable: true,
  },
  {
    id: "2",
    name: "Coffee Mug",
    category: "Home & Kitchen",
    price: 15.99,
    stock: 0,
    rating: 4.2,
    isAvailable: false,
  },
  {
    id: "3",
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 79.99,
    stock: 23,
    rating: 4.7,
    isAvailable: true,
  },
  {
    id: "4",
    name: "Notebook Set",
    category: "Office Supplies",
    price: 12.5,
    stock: 156,
    rating: 4.0,
    isAvailable: true,
  },
];

// Column definitions for users
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    size: 200,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    size: 250,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        active: "gencl:bg-green-100 gencl:text-green-800",
        inactive: "gencl:bg-gray-100 gencl:text-gray-800",
        pending: "gencl:bg-yellow-100 gencl:text-yellow-800",
      };
      return (
        <span
          className={`gencl:px-2 gencl:py-1 gencl:rounded-full gencl:text-xs gencl:font-medium ${
            statusColors[status as keyof typeof statusColors]
          }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
    size: 120,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    size: 120,
  },
  {
    accessorKey: "posts",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Posts" />,
    cell: ({ row }) => {
      const posts = row.getValue("posts") as number;
      return <div className="gencl:text-right gencl:font-medium">{posts}</div>;
    },
    size: 100,
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Login" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastLogin"));
      return <div>{date.toLocaleDateString()}</div>;
    },
    size: 150,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button theme="outline" size="sm" className="gencl:h-8 gencl:w-8 gencl:p-0">
          <MoreHorizontal className="gencl:h-4 gencl:w-4" />
        </Button>
      );
    },
    size: 80,
    enableSorting: false,
  },
];

// Column definitions for products
const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Product Name" />,
    size: 250,
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    size: 150,
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <div className="gencl:text-right gencl:font-medium">${price.toFixed(2)}</div>;
    },
    size: 120,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <div
          className={`gencl:text-right gencl:font-medium ${
            stock === 0 ? "gencl:text-red-600" : "gencl:text-green-600"
          }`}>
          {stock}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "rating",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="gencl:flex gencl:items-center gencl:gap-1">
          <span>⭐</span>
          <span className="gencl:font-medium">{rating}</span>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "isAvailable",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Available" />,
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable") as boolean;
      return (
        <span
          className={`gencl:px-2 gencl:py-1 gencl:rounded-full gencl:text-xs gencl:font-medium ${
            isAvailable ? "gencl:bg-green-100 gencl:text-green-800" : "gencl:bg-red-100 gencl:text-red-800"
          }`}>
          {isAvailable ? "Yes" : "No"}
        </span>
      );
    },
    size: 100,
  },
];

// Simple columns without sorting
const simpleUserColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 250,
    enableSorting: false,
  },
  {
    accessorKey: "role",
    header: "Role",
    size: 120,
    enableSorting: false,
  },
];

const meta: Meta<typeof DataTable> = {
  title: "Organisms/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A flexible data table component built with TanStack Table. Supports sorting, column resizing, and custom cell rendering.",
      },
    },
  },
  argTypes: {
    columns: {
      control: false,
      description: "Column definitions for the table",
    },
    data: {
      control: false,
      description: "Data array to display in the table",
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DataTable columns={userColumns} data={userData} />,
  parameters: {
    docs: {
      description: {
        story: "Default data table with user data, sortable columns, and custom cell rendering.",
      },
    },
  },
};

export const ProductTable: Story = {
  render: () => <DataTable columns={productColumns} data={productData} />,
  parameters: {
    docs: {
      description: {
        story: "Data table displaying product information with pricing, stock, and availability status.",
      },
    },
  },
};

export const EmptyState: Story = {
  render: () => <DataTable columns={userColumns} data={[]} />,
  parameters: {
    docs: {
      description: {
        story: "Data table with no data showing the empty state message.",
      },
    },
  },
};

export const SingleRow: Story = {
  render: () => <DataTable columns={userColumns} data={userData.slice(0, 1)} />,
  parameters: {
    docs: {
      description: {
        story: "Data table with a single row of data.",
      },
    },
  },
};

export const WithoutSorting: Story = {
  render: () => <DataTable columns={simpleUserColumns} data={userData} />,
  parameters: {
    docs: {
      description: {
        story: "Data table with sorting disabled on all columns.",
      },
    },
  },
};

const statuses = ["active", "inactive", "pending"] as const;
const roles = ["Admin", "User", "Moderator"] as const;
const largeDataset: User[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: statuses[i % 3] as User["status"],
  role: roles[i % 3] as string,
  lastLogin: new Date(2024, 0, (i % 30) + 1).toISOString().split("T")[0] ?? "",
  posts: (i + 1) * 13,
}));

export const LargeDataset: Story = {
  render: () => <DataTable columns={userColumns} data={largeDataset} />,
  parameters: {
    docs: {
      description: {
        story: "Data table with a larger dataset to demonstrate scrolling and performance.",
      },
    },
  },
};

const minimalColumns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name", size: 300 },
  { accessorKey: "email", header: "Email", size: 300 },
];

export const MinimalColumns: Story = {
  render: () => <DataTable columns={minimalColumns} data={userData} />,
  parameters: {
    docs: {
      description: {
        story: "Data table with minimal column configuration, showing only name and email.",
      },
    },
  },
};

const customStyledColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="gencl:font-bold gencl:text-primary-600">{row.getValue("name")}</div>,
    size: 200,
  },
  {
    accessorKey: "posts",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Posts" />,
    cell: ({ row }) => {
      const posts = row.getValue("posts") as number;
      const isHighPerformer = posts > 100;
      return (
        <div
          className={`gencl:text-right gencl:font-medium gencl:px-2 gencl:py-1 gencl:rounded ${
            isHighPerformer ? "gencl:bg-green-100 gencl:text-green-800" : "gencl:text-gray-600"
          }`}>
          {posts}
          {isHighPerformer && " 🏆"}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusEmojis = { active: "✅", inactive: "❌", pending: "⏳" };
      return (
        <div className="gencl:flex gencl:items-center gencl:gap-2">
          <span>{statusEmojis[status as keyof typeof statusEmojis]}</span>
          <span>{status}</span>
        </div>
      );
    },
    size: 120,
  },
];

export const CustomCellStyling: Story = {
  render: () => <DataTable columns={customStyledColumns} data={userData} />,
  parameters: {
    docs: {
      description: {
        story: "Data table with custom cell styling, colors, and icons for enhanced visual presentation.",
      },
    },
  },
};
