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
const AuthenticationModal = React.lazy(() =>
  import("@genuin/components/organisms/authentication-modal/index.js").then(
    (m) => ({
      default: m.AuthenticationModal,
    }),
  ),
);

import { useAuthContext } from "@genuin/components/context/auth";
import { useAnalytics, VideoTypes } from "@genuin/components/context/analytics";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Link } from "../link";
const Success = React.lazy(() =>
  import("@genuin/components/molecules/success/index.js").then((m) => ({
    default: m.Success,
  })),
);

import { Suspense } from "react";
import { useBaseContext } from "@genuin/components/context";
type ReportProps = ComponentProps<typeof Dialog> & {
  reportFor: "VIDEO" | "COMMENT";
  contentId: string;
  shareUrl?: string;
  videoSlug?: string;
  videoType?: VideoTypes;
  children: React.ReactNode;
  onClose?: () => void;
};

export function Report({
  reportFor,
  contentId,
  shareUrl,
  videoSlug,
  videoType,
  children,
  onClose,
  ...props
}: ReportProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      setOpen(value);
      if (!value) onClose?.();
    },
    [onClose],
  );

  const { user } = useAuthContext();
  const { useShadowDOM } = useBaseContext();
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
    [shareUrl, videoSlug],
  );

  // Setup authentication callback handler
  const clickHandler = handleAuthCallback({
    authCallbackData: { path: "/", action: "report", returnQueryParams },
    urlToOpen: shareUrl,
    pendingActionData: {
      action: "report",
      videoSlug: videoSlug,
    },
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
        setSelectedReason("");
        setTimeout(() => {
          reportMutation.reset();
          setOpen(false);
        }, 5000);
        track(
          reportFor === "COMMENT"
            ? EventName.COMMENT_REPORT
            : EventName.VIDEO_REPORT,
          {
            content_id: contentId,
            video_type: videoType,
            content_category: "loop",
            event_record_screen: "feed",
            event_target_screen: "none",
            report_reason: selectedReason,
            report_type: reportFor,
          },
        );
      },
    });
  }, [reportMutation, selectedReason, contentId, reportFor, track, EventName, videoType]);

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
      <Suspense fallback={children}>
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
      </Suspense>
    );
  }
  return (
    <Dialog modal open={open} onOpenChange={handleOpenChange} {...props}>
      <DialogTrigger
        autoFocus={false}
        className="gencl:border-none! gencl:flex gencl:justify-baseline gencl:outline-none "
      >
        {children}
      </DialogTrigger>
      <DialogContent className="gencl:max-w-xl gencl:rounded-t-2xl! gencl:sm:rounded-t-none gencl:sm:rounded-2xl! gencl:flex gencl:flex-col gencl:gap-y-4">
        {reportMutation.isSuccess ? (
          <Suspense fallback={<div>Loading…</div>}>
            <Success
              text="Thanks for your Feedback"
              description="Our team will review and act on your report."
            />
          </Suspense>
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
        <p className="gencl:text-headline-3-semi-bold gencl:sm:!text-headline-2-semi-bold gencl:text-black">
          {REPORT_HEADER_DATA[reportFor].title}
        </p>
      </DialogHeader>
      <p className="gencl:text-body-0-semi-bold gencl:sm:!text-headline-4-semi-bold gencl:text-black">
        {REPORT_HEADER_DATA[reportFor].subtitle}
      </p>
      <p className="gencl:text-body-1-medium gencl:sm:!text-body-1-semi-bold gencl:text-secondary-500">
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
