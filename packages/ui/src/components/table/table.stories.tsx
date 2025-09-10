import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Basic: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of users and their roles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Jane Doe</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>John Smith</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>2 users</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <Table>
      <TableCaption>Selectable users table.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>
            <input type="checkbox" aria-label="Select all" />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <input type="checkbox" aria-label="Select Jane" />
          </TableCell>
          <TableCell>Jane Doe</TableCell>
          <TableCell>jane@example.com</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <input type="checkbox" aria-label="Select John" />
          </TableCell>
          <TableCell>John Smith</TableCell>
          <TableCell>john@example.com</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
