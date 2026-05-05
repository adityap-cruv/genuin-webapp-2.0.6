import { Button } from "@genuin/ui/components/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@genuin/ui/components/select";
import { ChevronFirstIcon, ChevronRightIcon, ChevronLeftIcon, ChevronLastIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import type { Table } from "@tanstack/react-table";
import React from "react";

import { useBaseContext } from "@genuin/components/context";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalCount?: number; // Total number of records for server-side pagination
}
export function DataTablePagination<TData>(props: DataTablePaginationProps<TData>) {
  const { table, totalCount } = props;
  const { useShadowDOM } = useBaseContext();
  // Common style for all pagination buttons
  const baseBtnClass =
    "gencl:h-8 gencl:w-6 gencl:px-3 gencl:py-2 gencl:rounded-none gencl:border-0 gencl:text-body-2-medium gencl:shadow-none";
  const iconBtnClass =
    "gencl:h-8! gencl:w-6! gencl:rounded-none gencl:border-0 gencl:bg-secondary-50 gencl:hover:bg-secondary-150";

  // PaginationButton: shared for all pagination controls
  function PaginationButton({
    children,
    onClick,
    disabled,
    isActive = false,
    isIcon = false,
    ariaLabel,
    className,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    isActive?: boolean;
    isIcon?: boolean;
    ariaLabel?: string;
    className?: string;
  }) {
    // For page number buttons, apply active/unselected color
    const activeClass = isActive
      ? "gencl:bg-secondary-700 gencl:text-white gencl:text-body-2-medium"
      : "gencl:bg-secondary-50 gencl:text-secondary-900! gencl:hover:bg-secondary-150";
    return (
      <Button
        variant={isIcon ? "icon" : "default"}
        theme={isIcon ? "outline" : undefined}
        size="sm"
        className={cn(isIcon ? iconBtnClass : `${baseBtnClass} ${activeClass}`, className)}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}>
        {children}
      </Button>
    );
  }

  return (
    <div className="gencl:flex gencl:items-center gencl:justify-between gencl:px-2">
      <div className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:flex-1 gencl:text-sm">
        {(() => {
          const { pageIndex, pageSize } = table.getState().pagination;
          const total = totalCount !== undefined ? totalCount : table.getFilteredRowModel().rows.length;
          const startItem = pageIndex * pageSize + 1;
          const endItem = Math.min((pageIndex + 1) * pageSize, total);

          return `Showing ${startItem} to ${endItem} of ${total} items`;
        })()}
      </div>
      <div className="gencl:flex gencl:items-center gencl:space-x-6 gencl:lg:space-x-8">
        <div className="gencl:flex gencl:items-center gencl:space-x-0 gencl:rounded-lg">
          {/* First Page Button */}
          <PaginationButton
            isIcon
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            ariaLabel="First page"
            className="gencl:rounded-l-lg!">
            <ChevronFirstIcon />
          </PaginationButton>

          {/* Previous Page Button */}
          <PaginationButton
            isIcon
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            ariaLabel="Previous page">
            <ChevronLeftIcon theme="light" size={"xl"} />
          </PaginationButton>

          {/* Page Number Buttons */}
          {(() => {
            const currentPage = table.getState().pagination.pageIndex;
            const totalPages = table.getPageCount();
            const pages = [];

            if (totalPages <= 7) {
              // Show all pages if total is 7 or less
              for (let i = 0; i < totalPages; i++) {
                pages.push(
                  <PaginationButton key={i} onClick={() => table.setPageIndex(i)} isActive={i === currentPage}>
                    {i + 1}
                  </PaginationButton>
                );
              }
            } else {
              // Always show first page
              pages.push(
                <PaginationButton key={0} onClick={() => table.setPageIndex(0)} isActive={0 === currentPage}>
                  1
                </PaginationButton>
              );

              if (currentPage <= 3) {
                // Show pages 2, 3, 4, 5 when current is near start
                for (let i = 1; i <= 4; i++) {
                  pages.push(
                    <PaginationButton key={i} onClick={() => table.setPageIndex(i)} isActive={i === currentPage}>
                      {i + 1}
                    </PaginationButton>
                  );
                }
                pages.push(
                  <span key="ellipsis-end" className="gencl:px-2 gencl:text-secondary-500">
                    ...
                  </span>
                );
              } else if (currentPage >= totalPages - 4) {
                // Show ellipsis and last few pages when current is near end
                pages.push(
                  <span key="ellipsis-start" className="gencl:px-2 gencl:text-secondary-500">
                    ...
                  </span>
                );
                for (let i = totalPages - 5; i < totalPages - 1; i++) {
                  pages.push(
                    <PaginationButton key={i} onClick={() => table.setPageIndex(i)} isActive={i === currentPage}>
                      {i + 1}
                    </PaginationButton>
                  );
                }
              } else {
                // Show ellipsis, current page with neighbors, ellipsis
                pages.push(
                  <span key="ellipsis-start" className="gencl:px-2 gencl:text-secondary-500">
                    ...
                  </span>
                );
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                  pages.push(
                    <PaginationButton key={i} onClick={() => table.setPageIndex(i)} isActive={i === currentPage}>
                      {i + 1}
                    </PaginationButton>
                  );
                }
                pages.push(
                  <span key="ellipsis-end" className="gencl:px-2 gencl:text-secondary-500">
                    ...
                  </span>
                );
              }

              // Always show last page
              pages.push(
                <PaginationButton
                  key={totalPages - 1}
                  onClick={() => table.setPageIndex(totalPages - 1)}
                  isActive={currentPage === totalPages - 1}>
                  {totalPages}
                </PaginationButton>
              );
            }

            return pages;
          })()}

          {/* Next Page Button */}
          <PaginationButton
            isIcon
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            ariaLabel="Next page">
            <ChevronRightIcon className="gencl:h-2 gencl:w-2" />
          </PaginationButton>

          {/* Last Page Button */}
          <PaginationButton
            isIcon
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            ariaLabel="Last page"
            className="gencl:rounded-r-lg!">
            <ChevronLastIcon />
          </PaginationButton>
        </div>

        {/* Page Size Selector */}
        <div className="gencl:flex gencl:items-center gencl:space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}>
            <SelectTrigger className="gencl:h-8 gencl:w-18 gencl:bg-secondary-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" className="gencl:w-18">
              {[10, 20].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
