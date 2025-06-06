"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
} from "@genuin/ui/dialog";
import { RadioGroup, RadioItem } from "@genuin/ui/radio";
import React, { ComponentProps, useCallback, useState } from "react";
import { REPORT_HEADER_DATA, REPORT_REASON_DATA} from "./report-data";
import { Button } from "@genuin/ui/button";
import { ReportType, useReport } from "src/react-query/api/report";
import { Loader } from "@genuin/ui/loader";
import { UseMutationResult } from "@tanstack/react-query";
import { Image } from "@genuin/ui/image";

type ReportProps = ComponentProps<typeof Dialog> & {
  reportFor: "VIDEO" | "COMMENT";
  contentId: string;
  children: React.ReactNode;
};

export function Report({
  reportFor,
  contentId,
  children,
  ...props
}: ReportProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
  };

  const reportMutation = useReport(
    contentId,
    reportFor
  );

  const handleSubmit = useCallback(() => {
    const feedbackPayload = {
    type: reportFor,
    contentId,
    feedback: {
      type: REPORT_REASON_DATA.indexOf(selectedReason),
      text: selectedReason,
    },
  };
    reportMutation.mutate(feedbackPayload);
  }, [reportMutation]);

  return (
    <Dialog modal {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gencl:max-w-xl gencl:rounded-2xl">
        {reportMutation.isSuccess ? (
          <ReportSuccess />
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
      <DialogHeader>
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
        {reportMutation.isPending ? <Loader strokeColor={"white"} /> : "Submit"}
      </Button>
    </>
  );
}

// TODO: put a path for success image after hosting it.
function ReportSuccess() {
  return (
    <div className="gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:text-center gencl:gap-5">
      <Image
        alt="Success"
        src="put-path"
        className="gencl:h-40"
      />
      <div className="gencl:flex gencl:flex-col gencl:gap-2">
        <p className="gencl:text-headline-4-semi-bold">
          Thanks for your Feedback
        </p>
        <p className="gencl:text-body-1-semi-bold gencl:text-secondary-500">
          Our team will review and act on your report.
        </p>
      </div>
    </div>
  );
}
