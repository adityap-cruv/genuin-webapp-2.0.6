"use client";

import { Button } from "@genuin/ui/components/button";
import { Dialog, DialogContent, DialogTrigger } from "@genuin/ui/components/dialog";
import { cn } from "@genuin/ui/lib/utils";

import { Link } from "@genuin/components/molecules/link";

type LinkoutsListModalProps = {
  links: string[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  postId: string;
  type: "draft" | "posted";
};

export function LinkoutsListModal({
  links,
  isOpen,
  onOpenChange,
  children,
  className,
  postId,
  type,
}: LinkoutsListModalProps) {
  const handleDone = () => {
    onOpenChange?.(false);
  };

  return (
    <Dialog type="linkouts-list-modal" open={isOpen} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger asChild className={cn(className)}>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="gencl:max-w-md gencl:max-h-[80vh] gencl:overflow-hidden">
        <div className="gencl:p-6 gencl:pb-0!">
          <div className="gencl:space-y-6 gencl:mb-6">
            <h3 className="gencl:text-left gencl:text-headline-3-semi-bold">Links</h3>
            {links.length > 0 ? (
              <div className="gencl:max-h-60 gencl:overflow-y-auto gencl:space-y-2">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="gencl:p-3 gencl:bg-surface-100 gencl:rounded-lg gencl:border gencl:border-secondary-150">
                    <Link
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gencl:text-body-1-medium gencl:text-blue gencl:hover:underline gencl:break-all gencl:line-clamp-2 gencl:leading-relaxed">
                      {link}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gencl:text-center gencl:py-8 gencl:text-secondary-600">
                <p className="gencl:text-body-1-medium">No links available</p>
              </div>
            )}
          </div>
          <div className="gencl:flex gencl:gap-3 gencl:justify-end">
            <Link href={type === "draft" ? `/posts/drafts/${postId}` : `/posts/${postId}`}>
              <Button theme="text" className="gencl:text-secondary-900">
                Edit
              </Button>
            </Link>
            {links.length > 0 && (
              <Button theme="primary" onClick={handleDone}>
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
