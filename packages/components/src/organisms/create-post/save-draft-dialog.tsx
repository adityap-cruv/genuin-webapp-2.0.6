import { Button } from "@genuin/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@genuin/ui/components/dialog";
import { Loader } from "@genuin/ui/components/loader";

interface SaveDraftDialogProps {
  open: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onSaveDraft: () => void;
}

export default function SaveDraftDialog({
  open,
  isDeleting,
  onOpenChange,
  onDelete,
  onSaveDraft,
}: SaveDraftDialogProps) {
  return (
    <Dialog type="confirmation-dialog" open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="gencl:border-0 gencl:mb-6">
          <DialogTitle className="gencl:text-start gencl:text-headline-3-semi-bold">Save Your Progress?</DialogTitle>
        </DialogHeader>
        <DialogDescription className="gencl:text-body-0-medium">
          You&apos;re leaving the post creation flow. Do you want to save this as a draft to finish later?
        </DialogDescription>
        <DialogFooter className="gencl:mt-6 gencl:gap-4">
          <Button theme="custom" onClick={onDelete} disabled={isDeleting}>
            {isDeleting && <Loader strokeColor="black" />}
            Delete
          </Button>
          <DialogClose>
            <Button theme="primary" onClick={onSaveDraft} disabled={isDeleting}>
              Save as Draft
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
