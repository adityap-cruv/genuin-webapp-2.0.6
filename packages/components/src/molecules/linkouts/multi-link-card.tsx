import { checkAndAppendHttps } from "@genuin/ui/lib/utils";
import { LinkData } from "@react-query/api/linkouts/schema";
import { LinkIcon } from "lucide-react";

interface MultiLinkCardProps {
  links: LinkData[];
  maxVisible?: number;
}

export const MultiLinkCard: React.FC<MultiLinkCardProps> = ({
  links,
  maxVisible = 3,
}) => {
  const visibleLinks = links.slice(0, maxVisible);
  const hasMore = links.length > maxVisible;

  const handleLinkClick = (link: LinkData) => {
    const url = checkAndAppendHttps(link.link);
    window.open(url, "_blank");
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    const nextSibling = target.nextElementSibling as HTMLElement;
    target.style.display = "none";
    if (nextSibling) {
      nextSibling.style.display = "flex";
    }
  };

  return (
    <div className="gencl:bg-black/50 gencl:gap-2 gencl:flex gencl:items-center gencl:justify-between gencl:backdrop-blur-md gencl:rounded-lg gencl:text-sm gencl:font-medium gencl:text-white gencl:p-2 gencl:w-full">
      <div className="gencl:flex-1 gencl:text-start gencl:flex gencl:items-center gencl:gap-2 gencl:line-clamp-1">
        {visibleLinks.map((link, index) => (
          <div
            key={`${link.link}-${index}`}
            className="gencl:h-16 gencl:w-16 gencl:rounded-lg gencl:bg-[#F4F5F6] gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer gencl:transition-colors gencl:overflow-hidden"
            onClick={() => handleLinkClick(link)}
          >
            {link.image && link.image.trim() !== "" ? (
              <>
                <img
                  src={link.image}
                  alt=""
                  className="gencl:w-full gencl:h-full gencl:object-cover"
                  onError={handleImageError}
                />
                <LinkIcon className="gencl:h-6 gencl:w-6 gencl:shrink-0 gencl:stroke-black gencl:hidden" />
              </>
            ) : (
              <LinkIcon className="gencl:h-6 gencl:w-6 gencl:shrink-0 gencl:stroke-black " />
            )}
          </div>
        ))}
        {hasMore && (
          <div className="gencl:h-16 gencl:w-16 gencl:rounded-lg gencl:bg-gray-300 gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:text-black gencl:text-xs gencl:font-semibold">
            +{links.length - maxVisible}
          </div>
        )}
      </div>
    </div>
  );
};
