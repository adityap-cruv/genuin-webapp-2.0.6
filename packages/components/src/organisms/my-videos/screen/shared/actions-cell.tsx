import { Loader } from "@genuin/ui/components/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/components/popover";
import { Toast } from "@genuin/ui/components/toaster";
import { EditIcon, BarGraphIcon, ThreeDotsIcon, BoostIcon, DeleteIcon, PublishIcon } from "@genuin/ui/icons";
import React, { useState } from "react";

import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Link } from "@genuin/components/molecules/link";
import { usePostVideoMutation } from "@genuin/components/react-query/api/posts/active-post";
import { useDeleteDraftsMutation } from "@genuin/components/react-query/api/posts/delete-drafts";
import { useDeletePostsMutation } from "@genuin/components/react-query/api/posts/delete-posts";

import { DeleteModal, type DeleteType } from "./delete-modal";

/**
 * Actions cell for the rightmost column in the My Videos table.
 * Handles edit, analytics, and more actions (boost, delete).
 */
export type ActionsCellVariant = "posted" | "draft";

interface ActionsCellProps {
  variant: ActionsCellVariant;
  postId: string;
  onEdit?: () => void;
  onAnalytics?: () => void;
  onBoost?: () => void;
  onPublished?: () => void;
  /** Callback called after successful deletion - use this to refresh the list */
  onDelete?: (postIds: string | string[]) => Promise<void> | void;
}

export function ActionsCell({
  variant,
  postId,
  onEdit,
  onAnalytics,
  onBoost,
  onPublished,
  onDelete,
}: ActionsCellProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Move draft to active video
  const { mutate: publishDraftPost, isPending: isLoadingPost } = usePostVideoMutation({
    onSuccess: ({ res }) => {
      if (res.data.code === 200) {
        if (onPublished) onPublished();
        Toast.Success({ message: "Video published successfully" });
      }
    },
    onError: () => {
      Toast.Error({
        message: "Failed to video post. Please try again later.",
      });
    },
  });

  // Initialize delete mutations
  const deleteDraftsMutation = useDeleteDraftsMutation({
    onSuccess: () => {
      console.log("Draft deleted successfully");
      setIsDeleteModalOpen(false);
      Toast.Success({
        message: "Draft deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete draft:", error);
      Toast.Error({
        message: "Failed to delete draft. Please try again.",
      });
    },
  });

  const deletePostsMutation = useDeletePostsMutation({
    onSuccess: () => {
      console.log("Post deleted successfully");
      setIsDeleteModalOpen(false);
      Toast.Success({
        message: "Video post deleted.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete post:", error);
      Toast.Error({
        message: "Something went wrong. Video post not deleted.",
      });
    },
  });

  // Determine delete type based on variant
  const deleteType: DeleteType = variant === "draft" ? "draft" : "post";

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (postIds: string | string[]) => {
    const idsArray = Array.isArray(postIds) ? postIds : [postIds];

    try {
      if (variant === "draft") {
        // Delete drafts
        await deleteDraftsMutation.mutateAsync(idsArray);
      } else {
        // Delete posts
        await deletePostsMutation.mutateAsync(idsArray);
      }

      // Call the optional onDelete callback if provided to refresh the list
      if (onDelete) {
        await onDelete(postIds);
      }

      // Close the modal after successful deletion
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Delete operation failed:", error);
    }
  };

  // Show Boost+Delete for posted, Publish+Delete for draft
  return (
    <div className="gencl:flex gencl:items-center gencl:justify-start gencl:gap-2">
      <Link
        href={buildPageUrl({
          type: variant === "posted" ? "post" : "posts-draft",
          slug: postId,
        })}>
        <span
          className="gencl:p-1 gencl:border-1 gencl:rounded-lg gencl:border-secondary-150 gencl:bg-white gencl:cursor-pointer gencl:hover:bg-secondary-100! gencl:flex gencl:items-center gencl:justify-center"
          // onClick={onEdit}
        >
          <EditIcon className="gencl:h-6 gencl:w-6" />
        </span>
      </Link>
      {/* {variant === "posted" && (
        <span
          className="gencl:p-1 gencl:border-1 gencl:rounded-lg gencl:border-secondary-150 gencl:bg-white gencl:cursor-pointer gencl:hover:bg-secondary-100! gencl:flex gencl:items-center gencl:justify-center"
          onClick={onAnalytics}
        >
          <BarGraphIcon theme={"light"} size={"lg"} />
        </span>
      )} */}
      <span className="gencl:p-1 gencl:border-1 gencl:rounded-lg gencl:border-secondary-150 gencl:bg-white gencl:cursor-pointer gencl:hover:bg-secondary-100! gencl:flex gencl:items-center gencl:justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <div className="gencl:flex gencl:items-center gencl:justify-center">
              <ThreeDotsIcon className="gencl:h-6 gencl:w-6 gencl:max-h-6" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            // sideOffset={-6}
            className="gencl:w-35 gencl:border gencl:border-secondary-150 gencl:rounded-2xl gencl:p-4 gencl:shadow-lg gencl:bg-white"
            side="bottom"
            align="end">
            <div className="gencl:flex gencl:flex-col">
              {/* {variant === "posted" && (
                <span
                  className="gencl:flex gencl:items-center gencl:px-2 gencl:py-3 gencl:rounded-lg gencl:hover:bg-secondary-50"
                  onClick={onBoost}
                >
                  <BoostIcon theme={"light"} size={"lg"} />
                  <span className="gencl:text-body-1-medium gencl:pl-4">
                    Boost
                  </span>
                </span>
              )} */}
              {variant === "draft" && (
                <span
                  className="gencl:flex gencl:items-center gencl:px-2 gencl:py-3 gencl:rounded-lg gencl:hover:bg-secondary-50"
                  onClick={() => {
                    publishDraftPost({ uuid: postId });
                  }}>
                  {isLoadingPost ? <Loader /> : <PublishIcon theme={"light"} size={"lg"} />}
                  <span className="gencl:text-body-1-medium gencl:pl-4">Publish</span>
                </span>
              )}
              <span
                className="gencl:flex gencl:items-center gencl:px-2 gencl:py-3 gencl:rounded-lg gencl:hover:bg-secondary-50"
                onClick={handleDeleteClick}>
                <DeleteIcon theme={"light"} size={"lg"} />
                <span className="gencl:text-body-1-medium gencl:pl-4">Delete</span>
              </span>
            </div>
          </PopoverContent>
        </Popover>
      </span>

      {/* Delete Modal */}
      <DeleteModal
        type={deleteType}
        postIds={postId}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onDelete={handleDeleteConfirm}
        isLoading={deleteDraftsMutation.isPending || deletePostsMutation.isPending}
      />
    </div>
  );
}
