import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@genuin/ui/components/table";
import type { ColumnDef, SortingState, RowSelectionState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Server-side pagination props
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  onPaginationChange?: (updater: any) => void;
  // Sorting props
  sorting?: SortingState;
  onSortingChange?: (updater: any) => void;
  // Row selection props
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: any) => void;
  // Meta data for columns
  meta?: any;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  totalCount,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  meta,
  ...props
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pageCount !== undefined
      ? {
          // Server-side pagination
          manualPagination: true,
          pageCount,
          state: {
            pagination: {
              pageIndex,
              pageSize,
            },
            ...(sorting && { sorting }),
            ...(rowSelection && { rowSelection }),
          },
          onPaginationChange,
          ...(onSortingChange && { onSortingChange }),
          ...(onRowSelectionChange && { onRowSelectionChange }),
        }
      : {
          // Client-side pagination
          getPaginationRowModel: getPaginationRowModel(),
          ...(sorting && {
            state: {
              sorting,
              ...(rowSelection && { rowSelection }),
            },
            onSortingChange,
            ...(onRowSelectionChange && { onRowSelectionChange }),
          }),
        }),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    enableSorting: true,
    enableRowSelection: true,
    meta,
    defaultColumn: {
      minSize: 0,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  });
  return (
    <>
      <div className="gencl:rounded-2xl gencl:border gencl:bg-white gencl:border-secondary-150 gencl:overflow-hidden">
        <div className="gencl:overflow-x-auto" style={{ height: "calc(100vh - 350px)" }}>
          <Table
            className="gencl:table-fixed"
            style={{
              width: "100%",
              tableLayout: "fixed",
              minWidth: "100%",
            }}>
            <TableHeader className="gencl:sticky gencl:top-0 gencl:z-10 gencl:bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="gencl:border-b gencl:border-secondary-150">
                  {headerGroup.headers.map((header) => {
                    const columnMeta = header.column.columnDef.meta as any;
                    const headerClassName =
                      columnMeta?.headerClassName || "gencl:text-body-1-semi-bold gencl:overflow-hidden";

                    return (
                      <TableHead
                        key={header.id}
                        className={headerClassName}
                        style={{
                          width: `${header.getSize()}px`,
                          minWidth: `${header.getSize()}px`,
                          maxWidth: `${header.getSize()}px`,
                        }}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="gencl:overflow-x-auto gencl:overflow-y-auto gencl:max-h-60">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`gencl:border-b gencl:border-secondary-150 gencl:hover:bg-secondary-50 gencl:min-h-20${row.getIsSelected() ? "gencl:bg-secondary-50" : ""}`}>
                    {row.getVisibleCells().map((cell) => {
                      const columnMeta = cell.column.columnDef.meta as any;
                      const cellClassName = columnMeta?.cellClassName || "gencl:overflow-hidden gencl:text-ellipsis";

                      return (
                        <TableCell
                          key={cell.id}
                          className={cellClassName}
                          style={{
                            width: `${cell.column.getSize()}px`,
                            minWidth: `${cell.column.getSize()}px`,
                            maxWidth: `${cell.column.getSize()}px`,
                          }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="gencl:mt-2">
        <DataTablePagination table={table} totalCount={totalCount} />
      </div>
    </>
  );
}
