import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import type { Post } from "@genuin/components/react-query/api/posts/types";

import type { ColumnFactoryOptions } from "../shared/column-factory";
import { createColumns as createColumnsFactory } from "../shared/column-factory";

interface ColumnOptions {
  onRefresh?: () => void;
}

export const createColumns = (options: ColumnOptions = {}): ColumnDef<Post>[] => {
  const factoryOptions: ColumnFactoryOptions = {
    variant: "draft",
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
