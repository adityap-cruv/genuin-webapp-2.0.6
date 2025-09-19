"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
} from "@genuin/ui/dialog";
import { RadioGroup, RadioItem } from "@genuin/ui/radio";
import React, { ComponentProps, useCallback, useMemo, useState } from "react";
import { REPORT_HEADER_DATA, REPORT_REASON_DATA } from "./report-data";
import { Button } from "@genuin/ui/button";
import {
  ReportType,
  useReport,
} from "@genuin/components/react-query/api/report";
import { Loader } from "@genuin/ui/loader";
import { UseMutationResult } from "@tanstack/react-query";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useAuthContext } from "@genuin/components/context/auth";
import { MEDIA_BASE_URL } from "@genuin/components/lib/utils/env";
import { useAnalytics } from "@genuin/components/context/analytics";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Link } from "../link";
import { Success } from "@genuin/components/molecules/success";

type ReportProps = ComponentProps<typeof Dialog> & {
  reportFor: "VIDEO" | "COMMENT";
  contentId: string;
  shareUrl?: string;
  videoSlug?: string;
  children: React.ReactNode;
};

export function Report({
  reportFor,
  contentId,
  shareUrl,
  videoSlug,
  children,
  ...props
}: ReportProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const { user } = useAuthContext();
  const { track, EventName } = useAnalytics();
  const { handleAuthCallback } = useAuthContext();
  const { modalConfig } = useEmbedConfigs();

  // Create return query params for authentication callbacks
  const returnQueryParams = useMemo(
    () =>
      createReturnQueryParams({
        url: shareUrl,
        action: "repost",
        additionalParams: {
          videoSlug: videoSlug ?? undefined,
        },
      }),
    [shareUrl, videoSlug]
  );

  // Setup authentication callback handler
  const clickHandler = handleAuthCallback({
    authCallbackData: { path: "/", action: "report", returnQueryParams },
    urlToOpen: shareUrl,
  });

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
  };

  const reportMutation = useReport(contentId, reportFor);

  const handleSubmit = useCallback(() => {
    const feedbackPayload = {
      type: reportFor,
      contentId,
      feedback: {
        type: REPORT_REASON_DATA.indexOf(selectedReason),
        text: selectedReason,
      },
    };

    reportMutation.mutate(feedbackPayload, {
      onSuccess: () => {
        track(
          reportFor === "COMMENT"
            ? EventName.COMMENT_REPORT
            : EventName.VIDEO_REPORT,
          {
            content_id: contentId,
            content_category: "loop",
            event_record_screen: "feed",
            event_target_screen: "none",
            report_reason: selectedReason,
            report_type: reportFor,
          }
        );
      },
    });
  }, [reportMutation, selectedReason, contentId, reportFor, track, EventName]);

  if (!user) {
    if (clickHandler) {
      return (
        <div
          onClick={() => {
            clickHandler();
          }}
        >
          {children}
        </div>
      );
    }

    if (modalConfig.hideModal) {
      return (
        <Link href={shareUrl ?? "/home"} target="_blank">
          {children}
        </Link>
      );
    }

    return (
      <AuthenticationModal
        asChild
        getAppData={{
          data: {
            type: "report",
            payload: {
              shareUrl: shareUrl ?? "",
              videoSlug: videoSlug ?? "",
            },
          },
        }}
      >
        {children}
      </AuthenticationModal>
    );
  }
  return (
    <Dialog modal {...props}>
      <DialogTrigger asChild className="gencl:!border-none">
        {children}
      </DialogTrigger>
      <DialogContent className="gencl:max-w-xl gencl:!rounded-t-2xl gencl:md:rounded-2xl gencl:flex gencl:flex-col gencl:gap-y-4">
        {reportMutation.isSuccess ? (
          <Success
            text="Thanks for your Feedback"
            description="Our team will review and act on your report."
          />
        ) : (
          <ReportContent
            reportMutation={reportMutation}
            handleSubmit={handleSubmit}
            reportFor={reportFor}
            selectedReason={selectedReason}
            handleReasonChange={handleReasonChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReportContent({
  reportFor,
  selectedReason,
  handleSubmit,
  handleReasonChange,
  reportMutation,
}: {
  reportFor: "VIDEO" | "COMMENT";
  selectedReason: string;
  handleSubmit: () => void;
  handleReasonChange: (value: string) => void;
  reportMutation: UseMutationResult<boolean, Error, ReportType, unknown>;
}) {
  return (
    <>
      <DialogHeader className="gencl:border-none">
        <p className="gencl:text-headline-2-semi-bold gencl:text-black">
          {REPORT_HEADER_DATA[reportFor].title}
        </p>
      </DialogHeader>
      <p className="gencl:text-headline-4-semi-bold gencl:text-black">
        {REPORT_HEADER_DATA[reportFor].subtitle}
      </p>
      <p className="gencl:text-body-1-semi-bold gencl:text-secondary-500">
        Your report is anonymous.
      </p>
      <RadioGroup
        className="gencl:gap-4"
        value={selectedReason}
        onValueChange={handleReasonChange}
      >
        {REPORT_REASON_DATA.map((reason: string) => (
          <RadioItem key={reason} value={reason} label={reason} />
        ))}
      </RadioGroup>
      <Button
        theme="primary"
        disabled={selectedReason.trim() === "" || reportMutation.isPending}
        onClick={handleSubmit}
        className="gencl:w-full gencl:bg-primary"
      >
        {reportMutation.isPending ? (
          <Loader className="gencl:stroke-white" />
        ) : (
          "Submit"
        )}
      </Button>
    </>
  );
}
