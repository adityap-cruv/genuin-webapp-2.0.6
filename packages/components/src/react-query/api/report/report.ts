import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { getQueryKeyForReport } from "@genuin/components/react-query/keys/report";

/**
 * Submits a report for a video or comment to the server.
 * @param data - The report data containing contentId, type, and feedback
 * @returns A boolean indicating whether the report was successfully submitted
 */
/**
 * Submits a report to the server using the provided report data.
 *
 * @param data - An object containing the report details, including content ID, type, and feedback.
 * @returns A promise that resolves to `true` if the report was submitted successfully, otherwise throws an error.
 * @throws {Error} Throws an error if the report submission fails.
 */

const TYPE_MAPPING = {
  VIDEO: 2,
  COMMENT: 3,
} as const;

export type ReportType = {
  contentId: string;
  type: keyof typeof TYPE_MAPPING;
  feedback: {
    type: number; // Index of the reason in REPORTREASONDATA
    text: string; // The reason text
  };
};

async function submitReport(data: ReportType): Promise<boolean> {
  try {
    const response = await axiosInstance.post("/api/v3/report", {
      content_id: data.contentId,
      type: TYPE_MAPPING[data.type],
      feedback: data.feedback,
    });
    return response.status === 200;
  } catch (error) {
    throw new Error("Failed to submit report");
  }
}

/**
 * React hook for submitting reports
 * @returns Mutation object for handling report submissions
 */
function useReport(contentId: string, type: "VIDEO" | "COMMENT") {
  return useMutation({
    mutationKey: getQueryKeyForReport(contentId, type),
    mutationFn: submitReport,
    onError: (error) => {
      console.error("Report submission failed:", error);
    },
  });
}

export { useReport, submitReport };
