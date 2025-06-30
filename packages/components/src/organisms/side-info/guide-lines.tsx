"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@genuin/ui/accordion";
import { useState } from "react";

import type { GuidelineType } from "./side-info";

const INITIAL_DISPLAY_COUNT = 3;

export function Guidelines({ guidelines }: { guidelines?: GuidelineType[] }) {
  const [showAll, setShowAll] = useState(false);

  if (!guidelines || guidelines.length === 0) return;

  const shouldShowMore = guidelines.length > INITIAL_DISPLAY_COUNT;
  const displayedGuidelines = showAll
    ? guidelines
    : guidelines.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="gencl:border-t gencl:pt-4 gencl:border-secondary-300">
      <p className="gencl:text-body-1-semi-bold gencl:mb-4">Guidelines</p>
      <Accordion collapsible type="single" className="">
        {displayedGuidelines.map((guideline, index) => (
          <AccordionItem
            key={guideline.id}
            value={`guideline-${guideline.id}`}
            className="gencl:px-1"
          >
            <AccordionTrigger className="gencl:text-left gencl:py-1 gencl:text-body-1-medium! gencl:[&_svg]:text-black gencl:cursor-pointer gencl:text-secondary-600 gencl:hover:text-secondary-900">
              <span className="gencl:flex">
                <span className="">{index + 1}.&nbsp;</span>
                {guideline.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="gencl:pb-2">
              <p className="gencl:text-body-1-semi-bold gencl:text-secondary-500 gencl:ml-4">
                {guideline.description}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
        {shouldShowMore && (
          <div className="gencl:mt-4 gencl:px-4">
            <p
              onClick={() => setShowAll(!showAll)}
              className="gencl:text-body-1-medium gencl:cursor-pointer gencl:transition-colors"
            >
              {showAll ? `Show less` : `Show more`}
            </p>
          </div>
        )}
      </Accordion>
    </div>
  );
}
