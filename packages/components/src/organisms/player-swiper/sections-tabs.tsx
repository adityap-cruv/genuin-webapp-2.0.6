import { cn } from "@genuin/ui/lib/utils";
import React, { useEffect, useState, useRef } from "react";

import { useAnalytics } from "@genuin/components/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

type SectionsTabsProps = {
  className?: string;
  /**
   * Extra left padding (px) so the first tab clears an overlapping control (the
   * iHeart back button). Applied as inline padding rather than a Tailwind class
   * because the `gencl:`-prefixed `!important` utility did not win over the base
   * `p-4`, leaving the first tab under the back button. Inline padding is
   * deterministic and scrolls with the content, keeping the strip in-bounds.
   */
  leadingInset?: number;
  onSectionSelect?: (section: PostDetailsType["section"]) => void;
};

export const SectionsTabs = ({ className, leadingInset, onSectionSelect }: SectionsTabsProps) => {
  const embedDetails = useSafeEmbedContext();
  const { track, EventName } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
  const [sectionList, setSectionList] = useState(embedDetails?.embedEventBus.getContext().sectionList ?? []);
  const [selectedSection, setSelectedSection] = useState<PostDetailsType["section"]>(
    embedDetails?.embedEventBus.getContext().selectedSection ?? null
  );

  // Drag scrolling state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    if (!embedDetails) return;
    const updateState = () => {
      const context = embedDetails.embedEventBus.getContext();
      setSectionList(context.sectionList ?? []);
      setSelectedSection(context.selectedSection ?? null);
    };
    updateState();
    // Listen for changes if embedEventBus supports events
    if (embedDetails.embedEventBus.on) {
      embedDetails.embedEventBus.on("selectedSectionChange", updateState);
      return () => {
        embedDetails.embedEventBus.off("selectedSectionChange", updateState);
      };
    }
  }, [embedDetails]);

  // Scroll selected section into view when the selection itself changes.
  // `isDragging` is intentionally NOT a dependency: including it re-ran this effect
  // on drag-end (isDragging flips true→false), which re-centered the selected tab and
  // snapped the row back to its original position right after a manual scroll — so the
  // tab strip appeared unscrollable. Keying only on the selected id means a manual
  // scroll is left untouched; we only auto-center when the active section actually changes.
  useEffect(() => {
    if (!selectedSection?.id) return;

    const selectedTabElement = tabRefs.current.get(selectedSection.id);
    if (selectedTabElement && containerRef.current) {
      selectedTabElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
     
  }, [selectedSection?.id]);

  const containerStyle: React.CSSProperties = {
    userSelect: isDragging ? "none" : "auto",
    touchAction: "pan-x",
    ...(leadingInset
      ? {
          marginLeft: `${leadingInset}px`,
          width: `calc(100% - ${leadingInset}px)`,
        }
      : {}),
  };

  // Drag scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // 1:1 ratio for natural scrolling
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Video sections"
      className={cn(
        "swiper-no-swiping gencl:absolute gencl:z-50 gencl:flex gencl:w-full gencl:gap-2 gencl:overflow-x-auto gencl:scrollbar-none gencl:p-4 gencl:pb-0!",
        isDragging ? "gencl:cursor-grabbing" : "gencl:cursor-grab",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      // The tablist sits inside the player's Swiper. On touch, Swiper claims the
      // gesture and the native overflow-x scroll never starts (the row jiggles and
      // snaps back). `touch-action: pan-x` tells the browser to handle horizontal
      // panning here itself, so the tab row scrolls on mobile while vertical swipes
      // still reach the player. `swiper-no-swiping` keeps Swiper off this element too.
      style={containerStyle}>
      {sectionList?.map((section, index) => {
        const isSelected = selectedSection?.id === section?.id;
        return (
          <div
            key={section?.id ?? index}
            ref={(el) => {
              if (el && section?.id) {
                tabRefs.current.set(section.id, el);
              }
            }}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`section-panel-${section?.id ?? index}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              // Prevent click during drag
              if (isDragging) return;

              if (onSectionSelect) {
                onSectionSelect(section);
              }
              if (embedDetails) {
                // track the event while changing the section by clicking on it
                track(EventName.SECTION_CHANGES, {
                  section_id: section?.id,
                });
                embedDetails.updateSelectedSection(section);
                setSelectedSection(section);
              }
            }}
            className={cn(
              "gencl:text-body-0-semi-bold! gencl:h-9 gencl:sm:h-10! gencl:flex gencl:border gencl:items-center gencl:justify-center gencl:px-3.5 gencl:rounded-full gencl:text-white! gencl:transition-colors gencl:cursor-pointer gencl:whitespace-nowrap",
              selectedSection?.id === section?.id
                ? "gencl:bg-white gencl:border-white gencl:text-black!"
                : "gencl:bg-black/40 gencl:border-white/40 gencl:text-white!"
            )}>
            {section?.title}
          </div>
        );
      })}
    </div>
  );
};
