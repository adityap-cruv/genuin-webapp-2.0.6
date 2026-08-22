"use client";

import { Heading, Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@genuin/components/molecules/link";

import type { IntelligenceTextBlockProps, IntelligenceUserTextBlockProps } from "./intelligence-chat.types";

const BODY_TEXT_CLASS = "gencl:text-body-0-medium gencl:text-secondary-700";

/**
 * Built-in rich-text response: optional title, paragraphs, and numbered
 * sections with bullet items + inline links (the design's list response).
 */
export function IntelligenceTextBlock({ title, paragraphs, sections }: IntelligenceTextBlockProps) {
  return (
    <div data-slot="intelligence-text-block" className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-4">
      {title && (
        <Heading as="h3" level="headline-4" weight="medium" className="gencl:text-secondary-900">
          {title}
        </Heading>
      )}

      {paragraphs?.map((paragraph, index) => (
        <Text key={index} as="p" size="body-0" weight="medium" className="gencl:text-secondary-700">
          {paragraph}
        </Text>
      ))}

      {sections && sections.length > 0 && (
        <ol className="gencl:flex gencl:list-decimal gencl:flex-col gencl:gap-4 gencl:ps-6">
          {sections.map((section) => (
            <li
              key={section.heading}
              className="gencl:ps-1 gencl:text-body-0-medium gencl:text-secondary-900 gencl:marker:font-semibold">
              <Text as="span" size="body-0" weight="semibold" className="gencl:text-secondary-900">
                {section.heading}
              </Text>
              <ul className="gencl:mt-2 gencl:flex gencl:list-disc gencl:flex-col gencl:gap-1 gencl:ps-5 gencl:font-medium">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className={cn(BODY_TEXT_CLASS, "gencl:font-medium gencl:leading-[22px]")}>
                    {item.text}
                    {item.link && (
                      <>
                        <br />
                        <Link
                          href={item.link.href}
                          className="gencl:inline-flex gencl:items-center gencl:gap-0.5 gencl:text-primary gencl:underline gencl:underline-offset-2">
                          {item.link.label}
                          <ArrowUpRight aria-hidden="true" className="gencl:size-3.5" />
                        </Link>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Built-in block for the user's own prompt. */
export function IntelligenceUserTextBlock({ text }: IntelligenceUserTextBlockProps) {
  return (
    <Text as="p" size="body-0" weight="medium" className="gencl:whitespace-pre-wrap gencl:text-secondary-900">
      {text}
    </Text>
  );
}
