import { ComponentProps, ReactNode, useEffect, useMemo, useState } from "react";
import { Avatar } from "@genuin/ui/components/avatar";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { LockIcon, PublicIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";

type DetailsPageProps = {
  idToTrack: string;
  title: string;
  profileImageDetails?: {
    imageUrl: string;
    isAvatar: boolean;
    alt: string;
  };
  metadata?: { type: "PUBLIC" | "PRIVATE" };
  ctas?: ReactNode;
  isOpen?: boolean;
  className?: string;
} & ComponentProps<"div">;

export function DetailsPageTopbar({
  idToTrack,
  children,
  className,
  profileImageDetails,
  title,
  metadata,
  ctas,
  ...restProps
}: DetailsPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topBarWidth, setTopBarWidth] = useState<number | undefined>(undefined);

  // TODO: Replace this component with <PrivacyInfo/> component.
  function RenderTypeBadge() {
    switch (metadata?.type) {
      case "PUBLIC":
        return (
          <PublicIcon
            className="gencl:stroke-secondary-600 gencl:size-5"
            aria-label="Public"
          />
        );
      case "PRIVATE":
        return (
          <LockIcon
            className="gencl:stroke-secondary-600 gencl:size-5"
            aria-label="Private"
          />
        );
      default:
        return null;
    }
  }

  // TODO: performance heavy task, optimize this one.
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let resizeTimeout: NodeJS.Timeout;

    const setupObserver = () => {
      // Clean up existing observer
      if (observer) {
        observer.disconnect();
      }

      const detailsElement = document.getElementById(idToTrack);
      if (!detailsElement) return;

      const updateWidth = () => {
        setTopBarWidth(detailsElement.offsetWidth);
      };

      updateWidth();

      observer = new IntersectionObserver(
        ([entry]) => {
          // @ts-ignore
          setIsOpen(!entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      observer.observe(detailsElement);
    };

    const handleResize = () => {
      // Clear existing timeout
      clearTimeout(resizeTimeout);

      // Debounce the resize handler to avoid excessive re-setup
      resizeTimeout = setTimeout(() => {
        setupObserver();
      }, 100);
    };

    // Initial setup
    setupObserver();

    window.addEventListener("resize", handleResize);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [idToTrack]);

  return (
    <div
      className={cn(
        "gencl:absolute gencl:z-[-1] gencl:top-0 gencl:h-14 gencl:sm:ml-6 gencl:ml-0 gencl:transition-transform gencl:duration-200 gencl:ease-linear",
        "gencl:flex gencl:gap-2 gencl:items-center gencl:justify-between gencl:border-b gencl:border-b-secondary-150 gencl:bg-white",
        className
      )}
      style={{
        width: `${(topBarWidth || 0) + 10}px`,
        transform: `translateY(${isOpen ? "0" : "-100"}%) `,
        zIndex: 2,
      }}
      {...restProps}
    >
      <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:w-full">
        {profileImageDetails && (
          <Avatar
            isAvatar={profileImageDetails.isAvatar}
            imageUrl={profileImageDetails.imageUrl}
            alt={profileImageDetails.alt}
            size="md"
            aria-label="Profile Image"
          />
        )}
        <p className="gencl:text-headline-4-semi-bold gencl:line-clamp-1 gencl:break-all">
          {title}
        </p>
        <div className="gencl:ml-1">{RenderTypeBadge()}</div>
      </div>
      {ctas && ctas}
    </div>
  );
}

export function DetailsPageTopbarSkeleton() {
  return (
    <div className="gencl:w-full gencl:inline-flex gencl:justify-between gencl:items-center gencl:shrink-0 gencl:py-3 gencl:border-b gencl:border-b-secondary-150">
      <div className="gencl:flex gencl:gap-2 gencl:items-center">
        <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
        <Skeleton className="gencl:w-full gencl:min-w-3xs gencl:h-7 gencl:shrink-0" />
        <Skeleton className="gencl:size-7 gencl:shrink-0" />
      </div>
      <div className="gencl:flex gencl:gap-2">
        <Skeleton className="gencl:w-40 gencl:h-10" />
        <Skeleton className="gencl:w-12 gencl:h-10" />
      </div>
    </div>
  );
}
