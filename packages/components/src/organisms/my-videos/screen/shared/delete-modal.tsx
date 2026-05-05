"use client";

import { Button } from "@genuin/ui/components/button";
import { Dialog, DialogContent, DialogTrigger } from "@genuin/ui/components/dialog";
import { Loader } from "@genuin/ui/components/loader";
import { cn } from "@genuin/ui/lib/utils";
import { useState } from "react";

const DELETE_CONTENT = {
  single: {
    draft: {
      title: "Delete Draft?",
      description:
        "Deleting this draft will permanently remove it from our servers. Are you sure you want to continue?",
      deleteAction: "Delete Draft",
    },
    post: {
      title: "Delete Post?",
      description: "Deleting this post will permanently remove it from our servers. Are you sure you want to continue?",
      deleteAction: "Delete Post",
    },
  },
  multiple: {
    draft: {
      title: "Delete Selected Drafts?",
      description:
        "Deleting these drafts will permanently remove them from our servers. Are you sure you want to continue?",
      deleteAction: "Delete Drafts",
    },
    post: {
      title: "Delete Selected Posts?",
      description:
        "Deleting these posts will permanently remove them from our servers. Are you sure you want to continue?",
      deleteAction: "Delete Posts",
    },
  },
} as const;

export type DeleteType = "draft" | "post";

type DeleteModalProps = {
  type?: DeleteType;
  postIds: string | string[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete?: (postIds: string | string[]) => Promise<void> | void;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export function DeleteModal({
  type = "post",
  postIds,
  isOpen,
  onOpenChange,
  onDelete,
  isLoading = false,
  children,
  className,
}: DeleteModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  // Determine if multiple items are being deleted
  const isMultiple = (): boolean => {
    return Array.isArray(postIds) && postIds.length > 1;
  };

  const contentType = isMultiple() ? "multiple" : "single";
  const content = DELETE_CONTENT[contentType];

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setInternalLoading(true);
      await onDelete(postIds);
      // Close modal after successful deletion
      onOpenChange?.(false);
    } catch (error) {
      console.error("Delete operation failed:", error);
      // Keep modal open on error so user can retry
    } finally {
      setInternalLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange?.(false);
  };

  const isDeleting = isLoading || internalLoading;

  return (
    <Dialog type="delete-modal" open={isOpen} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger asChild className={cn(className)}>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="gencl:max-w-md">
        <div className="gencl:p-2 gencl:pb-0!">
          <div className="gencl:space-y-6 gencl:mb-6">
            <h3 className="gencl:text-left gencl:text-headline-3-semi-bold">{content[type].title}</h3>
            <p className="gencl:text-left gencl:text-body-0-medium">{content[type].description}</p>
          </div>
          <div className="gencl:flex gencl:gap-3 gencl:justify-end">
            <Button theme="text" onClick={handleCancel} disabled={isDeleting} className="gencl:text-secondary-900!">
              Cancel
            </Button>
            <Button theme="primary" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader /> Deleting...
                </>
              ) : (
                content[type].deleteAction
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Convenience hook for programmatic usage
export function useDeleteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    type: DeleteType;
    postIds: string | string[];
    onDelete?: (postIds: string | string[]) => Promise<void> | void;
  } | null>(null);

  const openDeleteModal = (config: {
    type: DeleteType;
    postIds: string | string[];
    onDelete?: (postIds: string | string[]) => Promise<void> | void;
  }) => {
    setDeleteConfig(config);
    setIsOpen(true);
  };

  const closeDeleteModal = () => {
    setIsOpen(false);
    setDeleteConfig(null);
  };

  const DeleteModalComponent = deleteConfig ? (
    <DeleteModal
      type={deleteConfig.type}
      postIds={deleteConfig.postIds}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onDelete={deleteConfig.onDelete}
    />
  ) : null;

  return {
    openDeleteModal,
    closeDeleteModal,
    DeleteModalComponent,
    isOpen,
  };
}
