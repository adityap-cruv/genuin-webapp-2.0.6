import { useEffect, useState } from "react";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { cn } from "@genuin/ui/lib/utils";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

type SectionsTabsProps = {
  onSectionSelect?: (section: PostDetailsType["section"]) => void;
};

export const SectionsTabs = ({ onSectionSelect }: SectionsTabsProps) => {
  const embedDetails = useSafeEmbedContext();
  const [sectionList, setSectionList] = useState(
    embedDetails?.embedEventBus.getContext().sectionList ?? []
  );
  const [selectedSection, setSelectedSection] = useState<
    PostDetailsType["section"]
  >(embedDetails?.embedEventBus.getContext().selectedSection ?? null);

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

  return (
    <div className="swiper-no-swiping gencl:absolute gencl:top-0 gencl:z-50 gencl:flex gencl:h-13 gencl:sm:h-16! gencl:w-full gencl:gap-2 gencl:overflow-x-auto gencl:scrollbar-none gencl:p-4 gencl:pb-0!">
      {sectionList?.map((section, index) => (
        <div
          key={section?.id ?? index}
          onClick={(e) => {
            e.stopPropagation();
            if (onSectionSelect) {
              onSectionSelect(section);
            }
            if (embedDetails) {
              embedDetails.updateSelectedSection(section);
              setSelectedSection(section);
            }
          }}
          className={cn(
            "gencl:text-body-0-semi-bold gencl:h-9 gencl:sm:h-10! gencl:flex gencl:border gencl:items-center gencl:justify-center gencl:px-3.5 gencl:rounded-full gencl:text-white gencl:transition-colors gencl:cursor-pointer gencl:whitespace-nowrap",
            selectedSection?.id === section?.id
              ? "gencl:bg-white gencl:text-black! gencl:border-white"
              : "gencl:bg-black/40 gencl:border-white/40"
          )}
        >
          {section?.title}
        </div>
      ))}
    </div>
  );
};
