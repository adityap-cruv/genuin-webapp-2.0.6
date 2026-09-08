import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@genuin/ui/accordion";
import { Avatar } from "@genuin/ui/avatar";
import { cn } from "@genuin/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { useMemo } from "react";

import { compressText } from "@genuin/components/lib/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Link } from "@genuin/components/molecules/link";
import { useCategory } from "@genuin/components/react-query/api/category/category";

const accordionVariants = cva("gencl:!w-full gencl:py-4 gencl:px-3 gencl:border-b gencl:border-secondary-100", {
  variants: {
    variant: {
      default: "gencl:hidden gencl:xl:block! gencl:xl:border-b",
      collapsed: "gencl:flex gencl:flex-col gencl:gap-1",
      mobile: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * First character of the first word. Spread rather than indexed so a leading emoji
 * comes back whole instead of as half a surrogate pair.
 */
function getFirstInitial(name: string) {
  return ([...name.trim()][0] ?? "").toUpperCase();
}

type CategoryProps = Omit<
  React.ComponentProps<typeof Accordion> & VariantProps<typeof accordionVariants>,
  "type" | "collapsible" | "defaultValue"
> & {
  onItemClick?: () => void;
};

// TODO: Figure out why restProps are not being passed down correctly
export function Category({ variant, className, onItemClick, ...restProps }: CategoryProps) {
  const { data } = useCategory();
  const categories = useMemo(() => {
    const allCategories = data?.categories ?? [];
    return allCategories.length > 5 ? allCategories.slice(0, 5) : allCategories;
  }, [data]);

  if (!categories.length) {
    return;
  }

  // Represent each category with its first community's real image. The category initial remains
  // the accessible fallback when that community has no image or the image cannot be loaded.
  if (variant === "collapsed") {
    return (
      <div className={cn(accordionVariants({ variant }), className)}>
        {categories.map((cat, index) => (
          <div key={index} title={cat.category} className="gencl:flex gencl:justify-center gencl:py-1">
            <Avatar
              isAvatar={false}
              imageUrl={cat.communities[0]?.dp || ""}
              alt={cat.category}
              fallback={getFirstInitial(cat.category)}
              size="xs"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible={true}
      defaultValue="categories"
      className={cn(accordionVariants({ variant }), className)}>
      <AccordionItem value="categories">
        <AccordionTrigger className="gencl:px-3 gencl:py-2">
          <div className="gencl:text-body-1-bold">Categories</div>
        </AccordionTrigger>
        <AccordionContent className="gencl:pb-0">
          <Accordion collapsible type="single" className="gencl:w-full">
            {categories.map((cat, index) => (
              <AccordionItem key={index} value={`category-${index}`}>
                <AccordionTrigger className="gencl:justify-between gencl:items-center gencl:px-3 gencl:py-2 gencl:!flex">
                  <p title={cat.category} className="gencl:text-body-1-medium gencl:text-nowrap gencl:line-clamp-1">
                    {compressText(cat.category, 22)}
                  </p>
                </AccordionTrigger>
                <AccordionContent className="gencl:flex gencl:flex-col gencl:pb-0">
                  {cat.communities.map((community, commIndex) => (
                    <Link
                      key={commIndex}
                      href={buildPageUrl({
                        type: "community",
                        slug: community.slug,
                        searchParams: { feed: "1" },
                      })}
                      onClick={onItemClick}
                      className="gencl:flex gencl:items-center gencl:gap-2 gencl:py-2 gencl:px-2 gencl:xl:px-3 gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:rounded-lg">
                      <Avatar isAvatar={false} imageUrl={community.dp || ""} alt={community.community_name} size="xs" />
                      <p title={community.community_name} className="gencl:text-body-1-medium gencl:text-nowrap">
                        {compressText(community.community_name, 20)}
                      </p>
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
            {data?.categories && data.categories.length > 5 && (
              <div className="gencl:px-3 gencl:py-2 gencl:text-body-1-medium gencl:text-primary gencl:cursor-pointer">
                See more
              </div>
            )}
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
