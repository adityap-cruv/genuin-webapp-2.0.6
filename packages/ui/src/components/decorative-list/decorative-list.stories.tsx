import React from "react";

import { DecorativeList } from "./decorative-list";

// Mock Link component for Storybook
interface LinkProps {
  href: string;
  title?: string;
  children: React.ReactNode;
}
const Link = ({ href, title, children }: LinkProps) => (
  <a href={href} title={title} style={{ textDecoration: "none" }}>
    {children}
  </a>
);

// Mock data for demonstration
const loop = { name: "Sample Loop Group", slug: "sample-loop" };
const PATH_NAME = { loop: (slug: string) => `/loops/${slug}` };

export default {
  title: "Components/DecorativeList",
  component: DecorativeList,
};

export const WithCustomChildren = () => (
  <DecorativeList>
    <div className="gencl:h-2 gencl:w-full" />
    <Link href={PATH_NAME.loop(loop.slug)} title={loop.name ?? "Genuin Loop"}>
      <li className="gencl:relative gencl:flex gencl:h-full gencl:w-full gencl:items-center gencl:justify-between gencl:rounded-md gencl:border gencl:border-tertiary-200 gencl:bg-monochrome-white gencl:p-4 ">
        <p className="gencl:line-clamp-2 gencl:w-full gencl:break-words gencl:pr-2 gencl:text-body-1-demi">
          {loop?.name}
        </p>
        <p className="gencl:whitespace-nowrap gencl:text-cap-1-med gencl:text-primary gencl:hover:text-primary-600">
          View Group
        </p>
      </li>
    </Link>
  </DecorativeList>
);
