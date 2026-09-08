"use client";

import { Button } from "@genuin/ui/components/button";
import { Heading } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import { Sparkle, X } from "lucide-react";
import * as React from "react";

import type { IntelligencePanelShellProps } from "./intelligence-panel.types";

const PANEL_TITLE = "Intelligence";

const FILL_PARENT_SIZE = { width: "100%", height: "100%" } as const;

const PANEL_CLASS = cn(
  "gencl:@container gencl:flex gencl:max-h-full gencl:min-h-0 gencl:max-w-full gencl:flex-col",
  "gencl:overflow-hidden gencl:rounded-xl gencl:bg-white gencl:p-2 gencl:text-black",
  "gencl:ring-1 gencl:ring-secondary-200 gencl:ring-inset"
);

const SCROLL_CONTENT_CLASS = cn(
  "gencl:min-h-0 gencl:flex-1 gencl:overflow-y-auto",
  "gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden"
);

// `before:-inset-2` widens the tap target to ~32px without growing the icon.
const HEADER_ACTION_CLASS = cn(
  "gencl:relative gencl:size-4! gencl:rounded-full! gencl:p-0!",
  "gencl:before:absolute gencl:before:-inset-2 gencl:before:content-['']"
);

type IntelligencePanelHeaderProps = {
  headingId: string;
  onClose?: () => void;
  showClose?: boolean;
};

function IntelligencePanelHeader({ headingId, onClose, showClose = false }: IntelligencePanelHeaderProps) {
  return (
    <header className="gencl:flex gencl:h-9 gencl:shrink-0 gencl:-translate-y-1 gencl:items-center gencl:justify-between gencl:gap-2">
      <div className="gencl:flex gencl:min-w-0 gencl:items-center gencl:gap-2">
        <Sparkle
          aria-hidden="true"
          strokeWidth={1.75}
          className="gencl:size-4 gencl:shrink-0 gencl:text-secondary-900"
        />
        <Heading
          id={headingId}
          as="h2"
          level="headline-4"
          className="gencl:w-fit gencl:truncate gencl:font-medium! gencl:text-secondary-900"
          style={{ fontSize: "12px", lineHeight: "16px" }}>
          <span style={{ fontSize: "12px", lineHeight: "16px" }}>{PANEL_TITLE}</span>
        </Heading>
      </div>

      {showClose && (
        <div className="gencl:flex gencl:shrink-0 gencl:items-center gencl:gap-2">
          <Button
            type="button"
            variant="icon"
            theme="secondary"
            shape="circle"
            size="xs"
            aria-label={`Close ${PANEL_TITLE}`}
            onClick={onClose}
            className={cn(
              HEADER_ACTION_CLASS,
              "gencl:focus-visible:ring-2 gencl:focus-visible:ring-primary-400 gencl:focus-visible:ring-offset-2"
            )}>
            <X aria-hidden="true" className="gencl:size-3" />
          </Button>
        </div>
      )}
    </header>
  );
}

/**
 * Shared Intelligence frame. It owns the panel dimensions, scrolling, heading,
 * and actions while allowing consumers to compose any article presentation.
 */
export const IntelligencePanelShell = React.forwardRef<HTMLElement, IntelligencePanelShellProps>(
  function IntelligencePanelShell(
    {
      children,
      size = FILL_PARENT_SIZE,
      onClose,
      showClose = false,
      scrollContentClassName,
      footer,
      className,
      style,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    ref
  ) {
    const headingId = React.useId();

    return (
      <section
        ref={ref}
        data-slot="intelligence-panel-shell"
        aria-labelledby={ariaLabelledBy ?? headingId}
        className={cn(PANEL_CLASS, className)}
        style={{ width: size.width, height: size.height, ...style }}
        {...props}>
        <IntelligencePanelHeader headingId={headingId} onClose={onClose} showClose={showClose} />
        <div data-slot="intelligence-panel-scroll-content" className={cn(SCROLL_CONTENT_CLASS, scrollContentClassName)}>
          {children}
        </div>
        {footer}
      </section>
    );
  }
);
