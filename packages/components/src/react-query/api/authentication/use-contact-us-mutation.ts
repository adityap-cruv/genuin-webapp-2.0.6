import { useMutation } from "@tanstack/react-query";

import { useAxiosInstance } from "@genuin/components/context/axios";

import { feedback } from "./contact-us";
import type { FeedbackType } from "./contact-us";

/**
 * Mutation hook for submitting contact-us feedback.
 * @returns Mutation object from React Query
 */
export function useContactUsMutation() {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (payload: Partial<FeedbackType>) => feedback(payload, axiosInstance),
    retry: false,
  });
}
