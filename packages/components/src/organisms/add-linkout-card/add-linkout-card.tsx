
import { Image } from "@genuin/ui/components/image";
import { DeleteIcon, EditIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { CardItems } from "../add-linkout/add-linkout";
import { Button } from "@genuin/ui/components/button";
import { ReadMore } from "@genuin/components/molecules/read-more";

type AddLinkCardProps = {
  item?: CardItems;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function AddLinkCard({
  item,
  className,
  onEdit,
  onDelete,
}: AddLinkCardProps) {
  return (
    <div
      className={cn(
        "gencl:bg-white gencl:border gencl:border-secondary-100 gencl:flex gencl:items-center gencl:justify-between gencl:w-full gencl:rounded-lg gencl:py-2 gencl:pr-3 gencl:pl-2 gencl:gap-4",
        className
      )}
    >
      <div className="gencl:flex gencl:items-center gencl:gap-4">
        <div className="gencl:flex gencl:items-center gencl:justify-center gencl:flex-shrink-0 gencl:w-16 gencl:h-16 gencl:bg-secondary-50 gencl:rounded-lg gencl:p-2">
          {item?.image ? (
            <Image alt="" height={48} width={48} scale={1} src={item?.image} />
          ) : (
            <span className="gencl:text-caption">No Image</span>
          )}
        </div>
        <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:h-full">
          <ReadMore
            textClassName="gencl:text-body-1-medium"
            maxLines={1}
            maxWidth="100%"
            text={item?.title}
          />
          <ReadMore
            className="gencl:text-secondary-600"
            textClassName="gencl:text-body-2-medium"
            maxLines={1}
            maxWidth="100%"
            text={item?.link || "Add Link"}
          />
        </div>
      </div>
      <div className="gencl:flex gencl:items-center gencl:gap-2">
        <Button
          className="gencl:!p-0 gencl:w-10"
          theme="outline"
          size="md"
          onClick={onEdit}
        >
          <EditIcon />
        </Button>
        <Button
          className="gencl:!p-0 gencl:w-10"
          theme="outline"
          size="md"
          onClick={onDelete}
        >
          <DeleteIcon />
        </Button>
      </div>
    </div>
  );
}
