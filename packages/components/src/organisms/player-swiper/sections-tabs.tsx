import { useEffect, useState, useRef } from "react";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { cn } from "@genuin/ui/lib/utils";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useAnalytics } from "@genuin/components/context";

type SectionsTabsProps = {
  onSectionSelect?: (section: PostDetailsType["section"]) => void;
};

export const SectionsTabs = ({ onSectionSelect }: SectionsTabsProps) => {
  const embedDetails = useSafeEmbedContext();
  const { track, EventName } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sectionList, setSectionList] = useState(
    embedDetails?.embedEventBus.getContext().sectionList ?? []
  );
  const [selectedSection, setSelectedSection] = useState<
    PostDetailsType["section"]
  >(embedDetails?.embedEventBus.getContext().selectedSection ?? null);

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
        "swiper-no-swiping gencl:absolute gencl:top-0 gencl:z-50 gencl:flex gencl:w-full gencl:gap-2 gencl:overflow-x-auto gencl:scrollbar-none gencl:p-4 gencl:pb-0!",
        isDragging ? "gencl:cursor-grabbing" : "gencl:cursor-grab"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ userSelect: isDragging ? "none" : "auto" }}
    >
      {sectionList?.map((section, index) => {
        const isSelected = selectedSection?.id === section?.id;
        return (
          <div
            key={section?.id ?? index}
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
            )}
          >
            {section?.title}
          </div>
        );
      })}
    </div>
  );
};
