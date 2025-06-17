import React from "react";
import { LinkCard } from "@genuin/components/molecules/linkouts/single-link-card";
import { MultiLinkCard } from "@genuin/components/molecules/linkouts/multi-link-card";
import { useGetLinkouts } from "@genuin/components/react-query/api/linkouts/get-linkouts";
import { LinkoutsType } from "@genuin/components/react-query/api/linkouts/schema";
import { cn } from "@genuin/ui/lib/utils";
import useShowLinkouts from "@genuin/components/hooks/use-show-linkouts";
import { AnimatePresence, motion } from "motion/react";

interface LinkOutContentRendererProps {
  linkouts: LinkoutsType;
  linkoutId: number | null | undefined;
  className?: string;
  isActive: boolean;
}

export const LinkOutContentRenderer: React.FC<LinkOutContentRendererProps> = ({
  linkouts: initialLinkouts,
  linkoutId,
  className,
  isActive,
}) => {
  const { showLinkouts } = useShowLinkouts({
    linkoutId,
    isActive,
  });
  const {
    data: fetchedLinkouts,
    isLoading,
    isError,
  } = useGetLinkouts(linkoutId ?? 1, {
    enabled: !initialLinkouts && !!linkoutId,
    staleTime: 1000 * 60, // 1 minute
  });

  const linkouts = initialLinkouts || fetchedLinkouts;

  if (isLoading) {
    return <div>Loading…</div>;
  }

  if (isError || !linkouts || linkouts.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {showLinkouts && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 40, stiffness: 300 }}
        >
          <div className={cn("gencl:space-y-4", className)}>
            {linkouts.map((item, index) => {
              const { links, cta_text, cta_link } = item;

              if (!links || links.length === 0) {
                return null;
              }

              const sortedLinks = [...links].sort(
                (a, b) => (a.position || 0) - (b.position || 0)
              );

              if (sortedLinks.length === 1) {
                const link = sortedLinks[0];
                if (!link) return;
                const showThumbnail = !!(
                  link.image && link.image.trim() !== ""
                );

                return (
                  <LinkCard
                    key={`single-${index}`}
                    link={link}
                    showThumbnail={showThumbnail}
                    ctaText={cta_text ?? ""}
                    ctaLink={cta_link ?? ""}
                  />
                );
              } else {
                return (
                  <MultiLinkCard
                    key={`multi-${index}`}
                    links={sortedLinks}
                    maxVisible={3}
                  />
                );
              }
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
