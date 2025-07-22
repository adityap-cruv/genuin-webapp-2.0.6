"use client";

import { type ComponentProps, useState } from "react";
import { cn } from "@genuin/ui/utils";
import { SearchIcon } from "@genuin/ui/icons";
import { SearchModal } from "@genuin/components/organisms/search-modal";

export type SearchProps = ComponentProps<"div"> & {
  placeholder?: string;
  onSearch?: (query: string) => void;
};

export function Search({
  className,
  placeholder = "Search...",
  onSearch,
  ...restProps
}: SearchProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSearch = (query: string) => {
    onSearch?.(query);
  };

  return (
    <>
      <div
        className={cn(
          "gencl:relative gencl:max-w-lg gencl:cursor-pointer",
          className
        )}
        onClick={handleInputClick}
        {...restProps}
      >
        <div className="gencl:relative gencl:w-xs gencl:hidden gencl:md:block!">
          <div
            className={cn(
              "gencl:flex gencl:h-10 gencl:text-body-1-medium gencl:w-full gencl:px-4 gencl:py-3",
              "gencl:cursor-pointer gencl:border gencl:border-secondary-100",
              "gencl:rounded-full gencl:items-center gencl:gap-2",
              "gencl:outline-none"
            )}
            role="button"
            tabIndex={0}
            aria-label={`Search: ${placeholder}`}
          >
            <SearchIcon size="md" />
            <span className="gencl:text-secondary-600 gencl:select-none gencl:flex-1 gencl:hover:text-secondary-900 gencl:transition-colors">
              {placeholder}
            </span>
          </div>
        </div>

        <div className="gencl:flex gencl:size-9 gencl:md:hidden! gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/40">
          <SearchIcon size="md" theme="light" />
        </div>
      </div>

      {isModalOpen && (
        <SearchModal
          type="search-modal"
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsModalOpen(false);
            }
          }}
          placeholder={placeholder}
          onSearch={handleSearch}
        />
      )}
    </>
  );
}
