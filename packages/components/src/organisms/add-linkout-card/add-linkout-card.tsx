import { Button } from "@genuin/ui/components/button";
import { Image } from "@genuin/ui/components/image";
import { DeleteIcon, EditIcon, LinkIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";

import type { CardItems } from "../add-linkout/add-linkout";

type AddLinkCardProps = {
  item?: CardItems;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function AddLinkCard({ item, className, onEdit, onDelete }: AddLinkCardProps) {
  return (
    <div
      className={cn(
        "gencl:bg-white gencl:border gencl:border-secondary-100 gencl:flex gencl:items-center gencl:justify-between gencl:w-full gencl:rounded-lg gencl:py-2 gencl:pr-3 gencl:pl-2 gencl:gap-4",
        className
      )}>
      <div className="gencl:flex gencl:items-center gencl:gap-4">
        <div className="gencl:flex gencl:items-center gencl:justify-center gencl:flex-shrink-0 gencl:w-16 gencl:h-16 gencl:bg-secondary-50 gencl:rounded-lg gencl:p-2">
          {item?.image ? (
            <Image alt="Thumbnail" height={48} width={48} scale={1} src={item?.image} useWebp={false} />
          ) : (
            <LinkIcon className="gencl:stroke-secondary-600" />
          )}
        </div>
        <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:h-full">
          <p className="gencl:text-body-1-medium gencl:line-clamp-1 gencl:break-all">{item?.title}</p>
          <p className="gencl:text-body-2-medium gencl:text-secondary-600 gencl:line-clamp-1 gencl:break-all">
            {item?.link || "Add Link"}
          </p>
        </div>
      </div>
      <div className="gencl:flex gencl:items-center gencl:gap-2">
        <Button className="gencl:!p-0 gencl:w-10" theme="outline" size="md" onClick={onEdit}>
          <EditIcon />
        </Button>
        <Button className="gencl:!p-0 gencl:w-10" theme="outline" size="md" onClick={onDelete}>
          <DeleteIcon />
        </Button>
      </div>
    </div>
  );
}
