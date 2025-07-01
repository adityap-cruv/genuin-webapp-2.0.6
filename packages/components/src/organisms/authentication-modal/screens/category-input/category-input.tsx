import {
  useAddCategoriesMutation,
  useGetCategoriesQuery,
} from "@genuin/components/react-query/api/authentication/categories";
import { Button } from "@genuin/ui/button";
import { cn } from "@genuin/ui/utils";
import { ComponentProps, useState } from "react";
import { SubmitButton } from "../../submit-button";
import { useAuthContext } from "@genuin/components/context/auth";
import { Loader } from "@genuin/ui/components/loader";
import { useAuthenticationModalContext } from "../../context";

export type CategoryInputProps = ComponentProps<"div">;

export function CategoryInput({ ...props }: CategoryInputProps) {
  const { updateUser } = useAuthContext();
  const { isFetching, data: categories } = useGetCategoriesQuery();
  const [error, setError] = useState<string | null>(null);
  const { setStep } = useAuthenticationModalContext();

  const { mutate: addCategories, isPending } = useAddCategoriesMutation({
    onSuccess: (response) => {
      if (response) {
        updateUser({ hasTopics: true });
      }
      setStep("EDIT_USERNAME");
    },
    onError: (error) => {
      // TODO: show toast if error occurs.
      setError("Error adding categories");
      // Handle error appropriately, e.g., show a notification
      // console.error("Error adding categories:", error);
    },
  });

  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [isSurpriseMe, setIsSurpriseMe] = useState(false);

  const handleCategorySelection = (cat: string) => {
    setSelectedCategory((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const getAllTopicIds = () => {
    if (!Array.isArray(categories)) return [];
    return categories.flatMap((category) =>
      category.topics.map((item: any) => item.topic_id)
    );
  };

  const handleSurpriseMe = () => {
    setIsSurpriseMe(true);
    const allTopicIds = getAllTopicIds();
    setSelectedCategory(allTopicIds);
    addCategories(allTopicIds, {
      onSettled: () => {
        updateUser({ hasTopics: true });
        setIsSurpriseMe(false);
      },
    });
  };

  return (
    <div {...props}>
      <div className="gencl:text-center gencl:flex gencl:items-center gencl:gap-3 gencl:flex-col">
        <p className="gencl:text-headline-2-semi-bold">
          What are you interested in?
        </p>
        <p className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:w-4/5">
          Get started by picking three topics you're interested in, to see more
          of what you love.
        </p>
      </div>
      <div className="gencl:max-h-[40vh] gencl:overflow-y-auto gencl:my-6">
        {isFetching && (
          <div className="gencl:w-full gencl:flex gencl:justify-center gencl:items-center">
            <Loader />
          </div>
        )}
        {!isFetching && !Array.isArray(categories) && (
          <p className="gencl:text-body-1-medium gencl:text-error-600">
            Failed to load categories. Please try again.
          </p>
        )}
        {Array.isArray(categories) &&
          categories.map((category, index) => {
            return (
              <div
                key={index}
                className="gencl:not-last:border-b gencl:border-b-secondary-200 gencl:not-first:py-4 gencl:first:pb-4"
              >
                <div className="gencl:flex gencl:gap-2">
                  <p className="gencl:text-body-1-semi-bold gencl:mb-2">
                    {category.title}
                  </p>
                </div>
                <div className="gencl:flex gencl:flex-wrap gencl:gap-2">
                  {category.topics.map((item, idx) => (
                    <Button
                      key={idx}
                      theme="outline"
                      className={cn(
                        "gencl:rounded-3xl gencl:px-3 gencl:py-2 gencl:text-body-1-medium",
                        selectedCategory.includes(item.topic_id)
                          ? "gencl:border gencl:border-primary gencl:bg-primary-100"
                          : ""
                      )}
                      onClick={() => handleCategorySelection(item.topic_id)}
                    >
                      {item.topic}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
      <SubmitButton
        isLoading={isPending && !isSurpriseMe}
        title="Choose 3+"
        error={error ?? ""}
        disabled={selectedCategory.length < 3 || isPending || isSurpriseMe}
        onClick={() => {
          addCategories(selectedCategory);
        }}
      />
      <Button
        onClick={handleSurpriseMe}
        theme="outline"
        className="gencl:h-9 gencl:w-full gencl:mt-2 gencl:border-primary"
        disabled={
          isPending ||
          isSurpriseMe ||
          !Array.isArray(categories) ||
          categories.length === 0
        }
      >
        {isSurpriseMe ? (
          <Loader className="gencl:stroke-primary gencl:fill-primary" />
        ) : (
          <p className="gencl:text-title-3-demi gencl:text-primary">
            Surprise Me
          </p>
        )}
      </Button>
    </div>
  );
}
