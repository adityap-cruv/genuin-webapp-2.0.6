import { Button } from "@components/ui/button";
import { ModalShell } from "../../modal-shell";
import { addTopics, type Category, getCategoryList, type Topic } from "./api";
import { useState } from "react";
import { cn } from "@lib/utils";
import { Loader } from "@components/ui/loader";
import { useSession } from "next-auth/react";
import { type ScreenProps } from "..";

export function CategoryInput({ onNext }: ScreenProps) {
  const [selectedItems, setSelectedItem] = useState<Set<string>>(new Set());
  const [postingTopics, setPostingTopics] = useState(false);
  const [error, setError] = useState("");
  const { data, isLoading } = getCategoryList();
  const { update: updateSession, data: sessionData } = useSession();

  const getAllTopicIds = (categories: Category): string[] => {
    const allTopicIds: string[] = [];

    categories.forEach((category) => {
      category.topics.forEach((topic: Topic) => {
        allTopicIds.push(topic.topic_id);
      });
    });
    return allTopicIds;
  };

  async function handleSubmit(type?: string) {
    setPostingTopics(true);
    let topics = [...selectedItems.values()];

    if (type === "all") {
      topics = getAllTopicIds(data ?? []);
      console.log(topics);
    }

    const res = await addTopics(topics);
    if (res) {
      await updateSession({
        ...sessionData,
        user: { ...sessionData?.user, hasTopics: true },
      });
      if (sessionData?.user.usernameSet) {
        onNext();
      } else {
        onNext("USERNAME_INPUT");
      }
    } else {
      setError("Please try again.");
    }
    setPostingTopics(false);
  }

  return (
    <ModalShell className="max-h-[60vh] pb-0">
      {postingTopics ? (
        <div className="flex h-[50vh] w-full flex-col items-center justify-center text-center align-middle">
          <Loader size="md" className="mb-2" />
          <p>Customizing your feed...</p>
        </div>
      ) : (
        <>
          <span className="text-center">
            <p className="text-heading-3">What are you interested in?</p>
            <p className="text-title-3-med text-tertiary">
              Get started by picking three topics you're interested in, to see
              more of what you love.
            </p>
          </span>
          {isLoading ? (
            <div className="flex h-[40vh] w-full items-center justify-center">
              <Loader size="md" />
            </div>
          ) : (
            <div className="h-full w-full overflow-x-clip overflow-y-scroll">
              {data?.map((item) => {
                return (
                  <div
                    className="border-b border-b-tertiary-200 py-4 first:pt-0"
                    key={item.entity_id}
                  >
                    <p className="pb-2 text-title-3-demi">{item.title}</p>
                    <div className="flex w-full max-w-full flex-wrap overflow-clip">
                      {item.topics.map((topic) => {
                        return (
                          <p
                            onClick={() => {
                              setSelectedItem((state) => {
                                const newState = new Set([...state.values()]);
                                if (newState.has(topic.topic_id)) {
                                  newState.delete(topic.topic_id);
                                } else {
                                  newState.add(topic.topic_id);
                                }
                                return newState;
                              });
                            }}
                            className={cn(
                              "my-1 mr-2 line-clamp-1 w-fit cursor-pointer overflow-hidden break-all rounded-full border border-tertiary-200 px-3 py-1 text-body-1-demi leading-loose",
                              selectedItems.has(topic.topic_id) &&
                                "border-primary bg-primary-100"
                            )}
                            key={topic.topic_id}
                          >
                            {topic.topic}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button
            onClick={async () => {
              await handleSubmit();
            }}
            className="w-full"
            disabled={selectedItems.size < 3}
          >
            {postingTopics ? (
              <Loader
                size="md"
                className="fill-monochrome-white stroke-monochrome-white"
              />
            ) : (
              <p className="text-title-3-demi">
                {selectedItems.size < 3 ? "Choose 3+" : "Continue"}
              </p>
            )}
          </Button>
          <Button
            onClick={async () => {
              await handleSubmit("all");
            }}
            variant="outline"
            className="h-9 w-full"
          >
            {postingTopics ? (
              <Loader
                size="sm"
                className="fill-monochrome-white stroke-monochrome-white"
              />
            ) : (
              <p className="text-title-3-demi">Surprise Me</p>
            )}
          </Button>
        </>
      )}
      {error && (
        <p className="text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red">
          {error}
        </p>
      )}
    </ModalShell>
  );
}
