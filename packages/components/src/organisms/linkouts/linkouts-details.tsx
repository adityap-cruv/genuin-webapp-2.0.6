import React, { useEffect, useState, useMemo } from "react";
import { LinkCard } from "@genuin/components/molecules/linkouts/single-link-card";
import { MultiLinkCard } from "@genuin/components/molecules/linkouts/multi-link-card";
import { useGetLinkouts } from "@genuin/components/react-query/api/linkouts/get-linkouts";
import { LinkoutsType } from "@genuin/components/react-query/api/linkouts/schema";
import { cn } from "@genuin/ui/lib/utils";
import useShowLinkouts from "@genuin/components/hooks/use-show-linkouts";

interface LinkOutContentRendererProps {
  linkouts: LinkoutsType;
  linkoutId: number | null | undefined;
  className?: string;
  isActive: boolean;
}

export const LinkOutContentRenderer = ({
  linkouts: initialLinkouts,
  linkoutId,
  className,
  isActive,
}: LinkOutContentRendererProps) => {
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

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(showLinkouts);

  // Handle entrance and exit animations
  useEffect(() => {
    if (showLinkouts) {
      setShouldRender(true);
      // Small delay to ensure DOM update before animation starts
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for exit animation to complete before removing from DOM
      const timer = setTimeout(() => setShouldRender(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [showLinkouts]);

  const linkouts = initialLinkouts || fetchedLinkouts;

  // Memoize rendered linkouts to avoid unnecessary re-renders
  const renderedLinkouts = useMemo(() => {
    if (!linkouts || linkouts.length === 0) {
      return null;
    }

    return linkouts.map((item, index) => {
      const { links, cta_text, cta_link } = item;

      if (!links || links.length === 0) {
        return null;
      }

      const sortedLinks = [...links].sort(
        (a, b) => (a.position || 0) - (b.position || 0)
      );

      if (sortedLinks.length === 1) {
        const link = sortedLinks[0];
        if (!link) return null;
        const showThumbnail = !!(link.image && link.image.trim() !== "");

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
            maxVisible={100}
          />
        );
      }
    });
  }, [linkouts]);

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading…</div>;
  }

  if (isError || !linkouts || linkouts.length === 0) {
    return null;
  }

  // Only render if shouldRender is true (controlled by animation effect)
  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={cn(
        "gencl:transition-transform gencl:duration-300 gencl:ease-out",
        isVisible ? "gencl:translate-y-0" : "gencl:translate-y-full",
        "gencl:space-y-4",
        className
      )}
    >
      {renderedLinkouts}
    </div>
  );
};
