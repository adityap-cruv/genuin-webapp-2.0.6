import { Skeleton } from "@genuin/ui/components/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@genuin/ui/components/table";
import React from "react";

export interface SkeletonColumn {
  width: string;
  header: React.ReactNode;
  cell: React.ReactNode;
}

interface SkeletonTableProps {
  /** An array of column definitions. */
  columns: SkeletonColumn[];
  /** Number of skeleton rows to display. Defaults to 5. */
  rows?: number;
  /** Whether to show the pagination skeleton. Defaults to true. */
  showPagination?: boolean;
}

/**
 * A generic, reusable skeleton loader for tables.
 * It displays a shimmer effect while data is loading and can be configured
 * for different table layouts by passing column definitions.
 *
 * @param columns - An array of column definitions.
 * @param rows - Number of skeleton rows to display (default: 5).
 * @param showPagination - Whether to show the pagination skeleton (default: true).
 */
export function SkeletonTable({ columns, rows = 5, showPagination = true }: SkeletonTableProps) {
  return (
    <div className="gencl:mx-auto gencl:py-2">
      <div className="gencl:w-full">
        <div className="gencl:rounded-md gencl:border gencl:border-secondary-150">
          <Table>
            <TableHeader>
              <TableRow className="gencl:border-secondary-150">
                {columns.map((col, index) => (
                  <TableHead key={index} className={col.width}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="gencl:border-secondary-150">
                  {columns.map((col, cellIndex) => (
                    <TableCell key={cellIndex}>{col.cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {showPagination && (
          <div className="gencl:flex gencl:items-center gencl:justify-between gencl:px-2 gencl:py-4">
            <div className="gencl:flex gencl:items-center gencl:space-x-2">
              <Skeleton className="gencl:h-4 gencl:w-32" />
            </div>
            <div className="gencl:flex gencl:items-center gencl:space-x-2">
              <Skeleton className="gencl:h-4 gencl:w-20" />
              <div className="gencl:flex gencl:items-center gencl:space-x-1">
                <Skeleton className="gencl:h-8 gencl:w-8" />
                <Skeleton className="gencl:h-8 gencl:w-8" />
                <Skeleton className="gencl:h-8 gencl:w-8" />
                <Skeleton className="gencl:h-8 gencl:w-8" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
