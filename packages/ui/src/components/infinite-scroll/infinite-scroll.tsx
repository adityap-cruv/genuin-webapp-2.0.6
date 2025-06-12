"use client";
import React, { useCallback, useEffect, useId } from "react";

import { Loader } from "../loader";

type InfiniteScrollProps = {
  children: React.ReactNode;
  hasNextPage?: boolean;
  getNextPage?: () => void;
  isLoadingNextPage?: boolean;

  /**
   * In case you want to use a custom loader, pass it here.
   */
  loader?: React.ReactNode;
};

/**
 * Infinite scroll component that triggers a callback when the last element is in view.
 * @param param - Props for the component.
 * @returns JSX.Element
 */
export const InfiniteScroll = ({
  children,
  getNextPage,
  isLoadingNextPage,
  hasNextPage,
  loader,
}: InfiniteScrollProps) => {
  const lastElementId = useId();

  const elementLoader = loader ?? (
    <div className="gencl:h-10 gencl:w-full gencl:flex gencl:items-center gencl:justify-center">
      <Loader size="md" />
    </div>
  );

  const callNextPage = useCallback(() => {
    if (hasNextPage && !isLoadingNextPage) {
      getNextPage?.();
    }
  }, [getNextPage, hasNextPage, isLoadingNextPage]);

  useEffect(() => {
    const lastElement = document.getElementById(lastElementId);
    if (!lastElement) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];
        if (
          lastEntry &&
          lastEntry.isIntersecting &&
          lastEntry.intersectionRatio >= 0.95
        ) {
          callNextPage();
        }
      },
      { threshold: 0.95 }
    );

    observer.observe(lastElement);

    return () => {
      observer.unobserve(lastElement);
    };
  }, [callNextPage, lastElementId]);

  return (
    <>
      {children}
      <div id={lastElementId} className="gencl:h-2" />
      {hasNextPage && elementLoader}
    </>
  );
};
