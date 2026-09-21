"use client";

import { Text } from "@genuin/ui/components/typography";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@genuin/components/molecules/link";

import type { IntelligenceTextBlockProps, IntelligenceUserTextBlockProps } from "./intelligence-chat.types";

/**
 * Built-in rich-text response: optional title, paragraphs, and numbered
 * sections with bullet items + inline links (the design's list response).
 */
export function IntelligenceTextBlock({ title, paragraphs, sections }: IntelligenceTextBlockProps) {
  return (
    <div data-slot="intelligence-text-block" className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-4">
      {title && (
        <Text asChild size="body-1" weight="semibold" className="gencl:text-secondary-900">
          <h3>{title}</h3>
        </Text>
      )}

      {paragraphs?.map((paragraph, index) => (
        <Text key={index} as="p" size="body-1" weight="medium" className="gencl:text-secondary-700">
          {paragraph}
        </Text>
      ))}

      {sections && sections.length > 0 && (
        <ol className="gencl:flex gencl:list-decimal gencl:flex-col gencl:gap-4 gencl:ps-6">
          {sections.map((section) => (
            <Text
              asChild
              key={section.heading}
              size="body-1"
              weight="medium"
              className="gencl:ps-1 gencl:text-secondary-900 gencl:marker:font-semibold">
              <li>
                <Text as="span" size="body-1" weight="semibold" className="gencl:text-secondary-900">
                  {section.heading}
                </Text>
                <ul className="gencl:mt-2 gencl:flex gencl:list-disc gencl:flex-col gencl:gap-1 gencl:ps-5 gencl:font-medium">
                  {section.items.map((item, itemIndex) => (
                    <Text key={itemIndex} asChild size="body-1" weight="medium" className="gencl:text-secondary-700">
                      <li>
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
                    </Text>
                  ))}
                </ul>
              </li>
            </Text>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Built-in block for the user's own prompt. */
export function IntelligenceUserTextBlock({ text }: IntelligenceUserTextBlockProps) {
  return (
    <Text as="p" size="body-1" weight="medium" className="gencl:whitespace-pre-wrap gencl:text-secondary-900">
      {text}
    </Text>
  );
}
