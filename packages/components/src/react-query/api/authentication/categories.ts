import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForCategories } from "@react-query/keys/authentication";
import { API_PATHS } from "@react-query/paths";
import { useMutation, useQuery } from "@tanstack/react-query";
import z from "zod";

const TopicSchema = z.object({
  topic_id: z.string(),
  topic: z.string(),
  is_selected: z.boolean(),
});
export type Topic = z.infer<typeof TopicSchema>;

const CategorySchema = z.array(
  z.object({
    topics: z.array(TopicSchema),
    entity_id: z.string(),
    title: z.string(),
  })
);
export type Category = z.infer<typeof CategorySchema>;

function validateCategoryListResp(data: any) {
  try {
    return CategorySchema.parse(data);
  } catch (e) {
    throw new Error("Something went wrong validation in category list api!!");
  }
}

async function fetchCategoryList() {
  return await axiosInstance
    .get(API_PATHS.AUTH_GET_CATEGORIES)
    .then((res) => {
      return validateCategoryListResp(res.data.data);
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log("error::", e);
      throw new Error("Something went wrong category list api.");
    });
}

/**
 * A hook to fetch the list of categories using React Query.
 * @returns The query result object from React Query.
 */
export function useGetCategoriesQuery() {
  return useQuery({
    queryFn: fetchCategoryList,
    queryKey: getQueryKeyForCategories(),
  });
}

async function addTopics(topics: string[]) {
  return await axiosInstance
    .post(API_PATHS.AUTH_ADD_TOPICS, { topicIds: topics })
    .then((res) => {
      return true;
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log("Something went wrong posting topics");
      throw new Error("Something went wrong posting topics.");
    });
}

/**
 * A hook to add topics using React Query.
 * @param topics - An array of topic IDs to be added.
 * @returns The mutation object from React Query.
 */
export function useAddCategoriesMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (params: Awaited<ReturnType<typeof addTopics>>) => void;
  onError?: (error: unknown) => void;
}) {
  return useMutation({
    mutationFn: addTopics,
    mutationKey: getQueryKeyForCategories(),
    onSuccess,
    onError,
  });
}
