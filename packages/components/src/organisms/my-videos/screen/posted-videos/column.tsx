import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Post } from "@genuin/components/react-query/api/posts/types";
import {
  createColumns as createColumnsFactory,
  ColumnFactoryOptions,
} from "../shared/column-factory";

interface ColumnOptions {
  onRefresh?: () => void;
}

export const createColumns = (
  options: ColumnOptions = {}
): ColumnDef<Post>[] => {
  const factoryOptions: ColumnFactoryOptions = {
    variant: "posted",
    onRefresh: options.onRefresh,
  };

  return createColumnsFactory(factoryOptions);
};

// Backward compatibility - use the default columns without options
export const columns = createColumns();

// Memoized version to prevent unnecessary re-renders
export const useColumns = (options: ColumnOptions = {}) => {
  return useMemo(() => createColumns(options), [options.onRefresh]);
};
