import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@genuin/ui/accordion";
import { Avatar } from "@genuin/ui/avatar";
import { useMemo } from "react";

import { useCategory } from "@genuin/components/react-query/api/category/category";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

export function Category() {
  const { data } = useCategory();
  const categories = useMemo(() => {
    const allCategories = data?.categories ?? [];
    return allCategories.length > 5 ? allCategories.slice(0, 5) : allCategories;
  }, [data]);

  if (!categories.length) {
    return;
  }

  return (
    <Accordion
      type="single"
      collapsible={true}
      defaultValue="categories"
      className="gencl:!w-full gencl:py-4 gencl:px-3 gencl:border-b gencl:border-secondary-100"
    >
      <AccordionItem value="categories">
        <AccordionTrigger className="gencl:px-3 gencl:py-2 gencl:hidden gencl:xl:!flex">
          <div className="gencl:text-body-1-bold">Categories</div>
        </AccordionTrigger>
        <AccordionContent className="gencl:pb-0">
          <Accordion collapsible type="single" className="gencl:w-full">
            {categories.map((cat, index) => (
              <AccordionItem key={index} value={`category-${index}`}>
                <AccordionTrigger className="gencl:justify-between gencl:items-center gencl:px-3 gencl:py-2 gencl:hidden gencl:xl:!flex">
                  <div className="gencl:text-body-1-medium gencl:text-nowrap">{cat.category}</div>
                </AccordionTrigger>
                <AccordionContent className="gencl:flex gencl:flex-col gencl:pb-0">
                  {cat.communities.map((community, commIndex) => (
                    <Link
                      key={commIndex}
                      href={buildPageUrl({type : "community" , slug : community.slug , searchParams : {feed : "1"}})}
                      className="gencl:flex gencl:items-center gencl:gap-2 gencl:py-2 gencl:px-2 gencl:xl:px-3 gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:rounded-lg"
                    >
                      <Avatar
                        isAvatar={false}
                        imageUrl={community.dp || ""}
                        alt={community.community_name}
                        size="xs"
                      />
                      <p className="gencl:text-body-1-medium gencl:text-nowrap gencl:hidden gencl:xl:!block">
                        {community.community_name}
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
