import { useComments } from "@genuin/components/react-query/api/comments";
import { cn } from "@genuin/ui/lib/utils";

type CommentButtonProps = {
  defaultNode: React.ReactNode;
  count?: number;
  showCount?: boolean;
  onClick?: () => void;
  className?: string;
  countClassName?: string;
  postId : string;
};

export function CommentButton({
  defaultNode,
  count,
  showCount = true,
  onClick,
  className,
  countClassName,
  postId
}: CommentButtonProps) {
  const {data} = useComments(postId)
  return (
    <span onClick={onClick} className={className}>
      {defaultNode}
      {showCount && (
        <p
          className={cn(
            "gencl:p-0 gencl:text-center gencl:text-body-2-medium",
            countClassName
          )}
        >
          {data?.pages[0]?.comments.length || count}
        </p>
      )}
    </span>
  );
}
