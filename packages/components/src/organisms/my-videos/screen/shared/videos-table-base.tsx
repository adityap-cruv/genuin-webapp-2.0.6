"use client";
import { useState, useMemo, ComponentType, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePaginatedPosts } from "@genuin/components/react-query/api/posts/paginated-posts";
import { useVideoStatistics } from "@genuin/components/react-query/api/posts/video-statistics";
import { useDeleteDraftsMutation } from "@genuin/components/react-query/api/posts/delete-drafts";
import { useDeletePostsMutation } from "@genuin/components/react-query/api/posts/delete-posts";
import { DataTable } from "../../../data-table";
import { NoDataState, DeleteModal, type DeleteType } from "../shared";
import { SearchInput } from "@genuin/components/molecules/search-input";
import { Button } from "@genuin/ui/components";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { DeleteIcon } from "@genuin/ui/icons";

interface VideosTableBaseProps {
  status: number;
  useColumns: (options?: { onRefresh?: () => void }) => ColumnDef<any>[];
  SkeletonComponent: ComponentType<{ rows: number }>;
  includeVideoStats?: boolean;
  noDataTitle?: string;
  noDataDescription?: string;
  onBulkDelete?: (postIds: string[]) => Promise<void> | void; // Add bulk delete handler
}

export default function VideosTableBase({
  status,
  useColumns,
  SkeletonComponent,
  includeVideoStats = false,
  noDataTitle = "No posts yet",
  noDataDescription = "Start by creating a post for your audience",
  onBulkDelete,
}: VideosTableBaseProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<
    Array<{
      id: string;
      desc: boolean;
    }>
  >([
    { id: "created_at", desc: true }, // Default to newest first
  ]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when search query changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery]);

  const queryString = debouncedSearchQuery.trim() || undefined;

  // Extract sort direction for API
  const sortDir =
    sorting.length > 0 && sorting[0]?.id === "created_at"
      ? sorting[0]?.desc
        ? "desc"
        : "asc"
      : "desc";

  const {
    data,
    isLoading,
    error,
    refetch: refetchPosts,
  } = usePaginatedPosts({
    page: pagination.pageIndex + 1, // API expects 1-based page numbers
    limit: pagination.pageSize,
    query_string: queryString,
    status,
    sort_dir: sortDir,
  });

  // Initialize delete mutations AFTER refetch is available
  const deleteDraftsMutation = useDeleteDraftsMutation({
    onSuccess: () => {
      console.log("Drafts deleted successfully");
      // Invalidate paginated posts queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["begenuin", "posts", "paginated"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete drafts:", error);
    },
  });

  const deletePostsMutation = useDeletePostsMutation({
    onSuccess: () => {
      console.log("Posts deleted successfully");
      // Invalidate paginated posts queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["begenuin", "posts", "paginated"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete posts:", error);
    },
  });

  const posts = data?.data || [];
  const totalCount = data?.meta?.total || 0;
  const pageCount = data?.meta?.totalPages || 0;

  // Create columns with refresh functionality
  const columns = useColumns({
    onRefresh: () => {
      // Trigger when the API successfully deletes a post or publishes a draft
      refetchPosts();
      // Invalidate paginated posts queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["begenuin", "posts", "paginated"],
      });
    },
  });

  // Extract post IDs for statistics (only if needed)
  const postIds = useMemo(() => {
    const ids = posts.map((post) => post.video?.id).filter(Boolean);
    return ids;
  }, [posts]);

  // Fetch video statistics for current posts (only if needed)
  const { data: statsData, isLoading: statsLoading } = useVideoStatistics({
    post_ids: includeVideoStats ? postIds : [],
  });

  // Get selected rows count
  const selectedRowsCount = Object.keys(rowSelection).length;

  // Get selected post IDs
  const selectedPostIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((index) => posts[parseInt(index)]?.video?.id)
      .filter((id): id is string => Boolean(id)); // Type guard to ensure string[]
  }, [rowSelection, posts]);

  // Determine delete type based on status (0 = draft, 1 = published)
  const deleteType: DeleteType = status === 3 ? "draft" : "post";

  // Handle search functionality
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  // Handle bulk actions
  const handleBulkAction = () => {
    if (selectedPostIds.length > 0) {
      setIsBulkDeleteModalOpen(true);
    }
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async (postIds: string | string[]) => {
    const idsArray = Array.isArray(postIds) ? postIds : [postIds];

    try {
      if (status === 3) {
        // Delete drafts
        await deleteDraftsMutation.mutateAsync(idsArray);
      } else {
        // Delete posts
        await deletePostsMutation.mutateAsync(idsArray);
      }

      // Clear selection after successful delete
      setRowSelection({});

      // Call the optional onBulkDelete callback if provided
      if (onBulkDelete) {
        await onBulkDelete(idsArray);
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      // Error handling is already done in the mutation's onError callback
    }
  };

  const tableMeta = {
    videoStats: includeVideoStats ? statsData?.data || {} : {},
    statsLoading: includeVideoStats ? statsLoading : false,
    includeVideoStats,
  };

  if (error) {
    return (
      <NoDataState
        title={noDataTitle}
        description={noDataDescription}
        buttonLabel="Create Post"
        // onButtonClick={onButtonClick}
      />
    );
  }

  return (
    <div className="gencl:mx-auto gencl:h-full">
      {/* Search bar and action button */}
      {(posts.length > 0 || debouncedSearchQuery) && (
        <div className="gencl:flex gencl:items-center gencl:justify-between gencl:mb-4 gencl:gap-4">
          <div>
            <SearchInput
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              className="gencl:w-80 gencl:rounded-full gencl:flex-shrink-0"
            />
          </div>
          {selectedRowsCount > 0 && (
            <Button
              onClick={handleBulkAction}
              theme="secondary"
              size="md"
              className="gencl:flex gencl:items-center gencl:gap-2 gencl:flex-shrink-0"
            >
              <DeleteIcon theme={"light"} size={"lg"} />
              Delete
            </Button>
          )}
        </div>
      )}

      {isLoading ? (
        <SkeletonComponent rows={pagination.pageSize} />
      ) : posts.length > 0 ? (
        <DataTable
          columns={columns}
          data={posts}
          pageCount={pageCount}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalCount={totalCount}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          meta={tableMeta}
        />
      ) : (
        <NoDataState
          title={debouncedSearchQuery ? "No results found" : noDataTitle}
          description={
            debouncedSearchQuery
              ? `No posts found matching "${debouncedSearchQuery}"`
              : noDataDescription
          }
          buttonLabel="Create Post"
          // onButtonClick={onButtonClick}
        />
      )}

      {/* Bulk Delete Modal */}
      {selectedPostIds.length > 0 && (
        <DeleteModal
          type={deleteType}
          postIds={selectedPostIds}
          isOpen={isBulkDeleteModalOpen}
          onOpenChange={setIsBulkDeleteModalOpen}
          onDelete={handleBulkDeleteConfirm}
          isLoading={
            deleteDraftsMutation.isPending || deletePostsMutation.isPending
          }
        />
      )}
    </div>
  );
}
