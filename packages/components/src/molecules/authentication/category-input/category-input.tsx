import { Button } from "@genuin/ui/button";
import { cn } from "@genuin/ui/utils";
import React, { ComponentProps, useState } from "react";

export interface CategoryType {
  category_name: string;
  icon: React.ReactNode;
  categories: string[];
}

export interface CategoryInputProps extends ComponentProps<"div"> {
  data: CategoryType[];
}

export function CategoryInput({ data, ...props }: CategoryInputProps) {
  const [selectedCategory, setSelectedCategory] = useState<string[]>([])

  const handleCategorySelection = (cat: string) => {
    setSelectedCategory((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  return (
    <div className="gencl:p-12 gencl:rounded-2xl gencl:min-w-xl" {...props}>
      <div className="gencl:text-center gencl:flex gencl:items-center gencl:gap-3 gencl:flex-col">
        <p className="gencl:text-headline-2-semi-bold">
          What are you interested in?
        </p>
        <p className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:w-4/5">
          Get started by picking three topics you're interested in, to see more
          of what you love.
        </p>
      </div>
      <div className="gencl:max-h-[50vh] gencl:overflow-y-auto gencl:my-6">
        {data.map((category, index) => {
          return (
            <div
              key={index}
              className="gencl:not-last:border-b gencl:border-b-secondary-200 gencl:not-first:py-4 gencl:first:pb-4"
            >
              <div className="gencl:flex gencl:gap-2">
                {category.icon}
                <p className="gencl:text-body-1-semi-bold gencl:mb-2">
                  {category.category_name}
                </p>
              </div>
              <div className="gencl:flex gencl:flex-wrap gencl:gap-2">
                {category.categories.map((item, idx) => (
                  <Button
                    key={idx}
                    theme="outline"
                    className={cn("gencl:rounded-3xl gencl:px-3 gencl:py-2 gencl:text-body-1-medium", selectedCategory.includes(item) ? "gencl:border gencl:border-primary gencl:bg-primary-100" : "")}
                    onClick={() => handleCategorySelection(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Button disabled={selectedCategory.length < 3} theme="primary" className="gencl:w-full">Choose 3+</Button>
    </div>
  );
}
