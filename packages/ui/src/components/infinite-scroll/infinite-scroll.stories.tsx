import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState, useCallback } from "react";

import { InfiniteScroll } from "./infinite-scroll";
import { Loader } from "../loader"; // Assuming Loader is in a sibling directory

const meta: Meta<typeof InfiniteScroll> = {
  title: "Components/InfiniteScroll",
  component: InfiniteScroll,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen", // Use fullscreen to better demonstrate scrolling
  },
  argTypes: {
    hasNextPage: { control: "boolean" },
    isLoadingNextPage: { control: "boolean" },
    loader: { control: false }, // loader is demonstrated via specific stories
    children: { control: false },
    getNextPage: { action: "getNextPage" },
  },
};

export default meta;

type Story = StoryObj<typeof InfiniteScroll>;

const generateItems = (count: number, start: number = 0) => {
  return Array.from({ length: count }, (_, i) => ({
    id: start + i,
    text: `Item ${start + i + 1}`,
  }));
};

const ItemComponent = ({ text }: { text: string }) => (
  <div
    style={{
      padding: "20px",
      borderBottom: "1px solid #eee",
      textAlign: "center",
      minHeight: "100px", // Ensure items are tall enough to scroll
    }}
  >
    {text}
  </div>
);

export const Default: Story = {
  render: function DefaultInfiniteScroll() {
    const [items, setItems] = useState(() => generateItems(10));
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);

    const getNextPage = useCallback(() => {
      if (isLoadingNextPage || !hasNextPage) return;
      setIsLoadingNextPage(true);
      console.log("Fetching next page...");
      setTimeout(() => {
        const newItems = generateItems(10, items.length);
        setItems((prev) => [...prev, ...newItems]);
        setIsLoadingNextPage(false);
        if (items.length + newItems.length >= 50) {
          // Simulate end of data
          setHasNextPage(false);
          console.log("No more pages to load.");
        }
        console.log("Next page loaded.");
      }, 1500);
    }, [items.length, isLoadingNextPage, hasNextPage]);

    return (
      <div
        style={{ height: "500px", overflowY: "auto", border: "1px solid #ccc" }}
      >
        <InfiniteScroll
          hasNextPage={hasNextPage}
          isLoadingNextPage={isLoadingNextPage}
          getNextPage={getNextPage}
        >
          {items.map((item) => (
            <ItemComponent key={item.id} text={item.text} />
          ))}
        </InfiniteScroll>
      </div>
    );
  },
};

export const LoadingState: Story = {
  args: {
    hasNextPage: true,
    isLoadingNextPage: true,
    getNextPage: () =>
      console.log("Attempting to get next page while loading..."),
  },
  render: (args) => (
    <div
      style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc" }}
    >
      <InfiniteScroll {...args}>
        {generateItems(5).map((item) => (
          <ItemComponent key={item.id} text={item.text} />
        ))}
      </InfiniteScroll>
    </div>
  ),
};

export const NoMorePages: Story = {
  args: {
    hasNextPage: false,
    isLoadingNextPage: false,
    getNextPage: () =>
      console.log("Attempting to get next page when no more pages..."),
  },
  render: (args) => (
    <div
      style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc" }}
    >
      <InfiniteScroll {...args}>
        {generateItems(15).map((item) => (
          <ItemComponent key={item.id} text={item.text} />
        ))}
      </InfiniteScroll>
      {!args.hasNextPage && (
        <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
          End of content.
        </div>
      )}
    </div>
  ),
};

export const CustomLoader: Story = {
  render: function CustomLoaderInfiniteScroll() {
    const [items, setItems] = useState(() => generateItems(5));
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);

    const getNextPage = useCallback(() => {
      if (isLoadingNextPage || !hasNextPage) return;
      setIsLoadingNextPage(true);
      setTimeout(() => {
        const newItems = generateItems(5, items.length);
        setItems((prev) => [...prev, ...newItems]);
        setIsLoadingNextPage(false);
        if (items.length + newItems.length >= 20) {
          setHasNextPage(false);
        }
      }, 1500);
    }, [items.length, isLoadingNextPage, hasNextPage]);

    return (
      <div
        style={{ height: "400px", overflowY: "auto", border: "1px solid #ccc" }}
      >
        <InfiniteScroll
          hasNextPage={hasNextPage}
          isLoadingNextPage={isLoadingNextPage}
          getNextPage={getNextPage}
          loader={
            <div
              style={{ padding: "20px", textAlign: "center", color: "blue" }}
            >
              Loading more items, please wait...{" "}
              <Loader size="sm" className="inline-block ml-2" />
            </div>
          }
        >
          {items.map((item) => (
            <ItemComponent key={item.id} text={item.text} />
          ))}
        </InfiniteScroll>
      </div>
    );
  },
};
