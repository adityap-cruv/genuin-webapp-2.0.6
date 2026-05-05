import { Button } from "@genuin/ui/components/button";
import { AscIcon, DescIcon, SortIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import type { Column } from "@tanstack/react-table";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("gencl:flex gencl:items-center gencl:gap-2", className)}>
      <Button
        theme="text"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          column.toggleSorting();
        }}
        className="gencl:px-0">
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <DescIcon className="gencl:h-4" />
        ) : column.getIsSorted() === "asc" ? (
          <AscIcon className="gencl:h-4" />
        ) : (
          <SortIcon className="gencl:h-4" />
        )}
      </Button>
    </div>
  );
}
