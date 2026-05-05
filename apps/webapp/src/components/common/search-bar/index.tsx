"use client";
import { type ReactNode } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import { cn } from "@lib/utils";

import { SearchBody } from "./body";
import "./hide-swiper.css";
import { SearchInput } from "./input";
import { useSearchBarStore } from "./store";

import "swiper/css";

export const SearchBar = {
  mobile: Mobile,
  desktop: SearchDesktop,
};

function SearchDesktop() {
  const { updateFocus, isOpen, close } = useSearchBarStore();

  return (
    <Popover open={isOpen}>
      <PopoverTrigger>
        <SearchInput.desktop />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={10}
        avoidCollisions
        className="h-[75vh] w-96 overflow-clip rounded-2xl p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onFocus={() => {
          updateFocus(false, true);
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
          setTimeout(() => {
            const searchElement = document.getElementById("search-input") as HTMLInputElement;

            const focus = document.activeElement == searchElement;
            if (!focus) close();
            if (!focus && searchElement) searchElement.value = "";
            // updateFocus(focus, false)
          }, 200);
        }}>
        <SearchBody />
      </PopoverContent>
    </Popover>
  );
}

function Mobile({
  children,
  variant = "light",
}: {
  children: ReactNode;
  variant: "light" | "dark" | "transparent" | null;
}) {
  return (
    <Sheet modal={false}>
      <SheetTrigger
        className={cn(
          "flex h-[40px] w-[40px] items-center justify-center rounded-full",
          variant === "light" ? "bg-tertiary-200" : "bg-monochrome-black/20"
        )}>
        {children}
      </SheetTrigger>
      <SheetContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        showDefaultClose={false}
        className="w-full border-0 p-0 outline-0"
        side={"right"}>
        <SearchInput.mobile />
        <SearchBody />
      </SheetContent>
    </Sheet>
  );
}
