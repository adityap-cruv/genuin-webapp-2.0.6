import { ErrorIcon } from "@genuin/ui/icons";
import { useCategory } from "src/react-query/api/category/category";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@genuin/ui/accordion";
import { Avatar } from "@genuin/ui/avatar";
import { useMemo } from "react";
import { Loader } from "@genuin/ui/loader";

export function Category() {
  const { data, isLoading, isError } = useCategory();
  const categories = useMemo(() => {
    const allCategories = data?.categories ?? [];
    return allCategories.length > 5 ? allCategories.slice(0, 5) : allCategories;
  }, [data]);

  // TODO: Add shimmer loading state
  if (isLoading) {
    return (
      <div className="gencl:h-full gencl:w-full">
        <Loader size="md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-2 gencl:p-4">
        <ErrorIcon className="gencl:w-8 gencl:h-8" />
        <p className="gencl:text-body-2-medium gencl:text-secondary-300">
          We're unable to load category..
        </p>
      </div>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible={true}
      defaultValue="categories"
      className="gencl:w-full gencl:py-4 gencl:px-3 gencl:border-b-4 gencl:border-secondary-100"
    >
      <AccordionItem value="categories">
        <AccordionTrigger className="gencl:px-3 gencl:py-2">
          <div className="gencl:text-body-1-bold">Categories</div>
        </AccordionTrigger>
        <AccordionContent className="gencl:pb-0">
          <Accordion type="multiple" className="gencl:w-full">
            {categories.map((cat, index) => (
              <AccordionItem key={index} value={`category-${index}`}>
                <AccordionTrigger className="gencl:flex gencl:justify-between gencl:items-center gencl:px-3 gencl:py-2">
                  <div className="gencl:text-body-1-medium">{cat.category}</div>
                </AccordionTrigger>
                <AccordionContent className="gencl:flex gencl:flex-col gencl:pb-0">
                  {cat.communities.map((community, commIndex) => (
                    <div
                      key={commIndex}
                      // className="gencl:flex gencl:items-center gencl:gap-2 gencl:py-1"
                      className="gencl:flex gencl:items-center gencl:gap-2 gencl:py-2 gencl:px-3"
                    >
                      <Avatar
                        isAvatar={false}
                        imageUrl={community.dp || ""}
                        alt={community.community_name}
                        size="xs"
                      />
                      <div className="gencl:text-body-1-medium">
                        {community.community_name}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
            {data?.categories && data.categories.length > 5 && (
              <div className="gencl:px-3 gencl:py-2 gencl:text-body-1-medium gencl:text-blue gencl:cursor-pointer">
                See more
              </div>
            )}
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
