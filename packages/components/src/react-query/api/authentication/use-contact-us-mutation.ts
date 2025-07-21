import { useMutation } from "@tanstack/react-query";
import { feedback } from "./contact-us";
import type { FeedbackType } from "./contact-us";

/**
 * Mutation hook for submitting contact-us feedback.
 * @returns Mutation object from React Query
 */
export function useContactUsMutation() {
  return useMutation({
    mutationFn: (payload: Partial<FeedbackType>) => feedback(payload),
    retry: false,
  });
}
