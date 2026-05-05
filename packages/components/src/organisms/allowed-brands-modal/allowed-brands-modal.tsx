import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@genuin/ui";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import type { ReactNode } from "react";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import { useBaseContext } from "@genuin/components/context";
import { BrandListItem, BrandListItemSkeleton } from "@genuin/components/molecules/brand-list-item";
import { SearchInput } from "@genuin/components/molecules/search-input";
import { usePaginatedAllowedBrands } from "@genuin/components/react-query/api/posts/allowed-brands";
import type { Brand } from "@genuin/components/react-query/api/posts/types";

import { SearchEmptyState, SearchErrorState } from "../search-modal";

export type AllowedBrandModalProps = {
  setOpen?: (open: boolean) => void;
  children?: ReactNode;
  dialogTriggerClassName?: string;
};

interface BodyContentProps {
  list: Brand[];
  isLoading: boolean;
  error: boolean;
  totalResults: number;
  query: string;
  hasNextPage: boolean;
  isLoadingNextPage: boolean;
  getNextPage: () => void;
}

const SeachLoadingState = ({ length = 5 }: { length?: number }) => {
  return Array.from({ length }).map((_, idx) => <BrandListItemSkeleton key={idx} />);
};

const BodyContent = ({
  list,
  isLoading,
  error,
  totalResults,
  query,
  hasNextPage,
  isLoadingNextPage,
  getNextPage,
}: BodyContentProps) => {
  if (isLoading) {
    return (
      <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:flex-1 gencl:overflow-y-auto">
        <SeachLoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <SearchErrorState
        message="Failed to load results. Please try again."
        className="gencl:flex-1 gencl:overflow-hidden gencl:overflow-y-auto gencl:min-h-0"
      />
    );
  }

  if (totalResults === 0) {
    return (
      <div className="gencl:flex gencl:flex-1 gencl:justify-center">
        <div className="gencl:relative">
          <SearchEmptyState
            title={`No results for "${query?.length > 19 ? `${query.slice(0, 18)}...` : query}"`}
            subtitle="Try a different search term."
            className="gencl:min-h-0 gencl:h-full"
          />
          <span className="gencl:text-[250px]! gencl:text-secondary-50 gencl:absolute gencl:inset-0 gencl:m-auto gencl:flex gencl:items-center gencl:justify-center pointer-events-none select-none">
            !
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="gencl:flex-1 gencl:overflow-y-auto">
      <InfiniteScroll
        hasNextPage={hasNextPage}
        getNextPage={getNextPage}
        isLoadingNextPage={isLoadingNextPage}
        loader={<SeachLoadingState length={1} />}>
        <div className="gencl:flex gencl:flex-col gencl:gap-2">
          {list.map((brand, idx) => (
            <BrandListItem key={idx} label={brand.brand_url} avatar={{ url: brand.logo, isAvatar: false }} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export const AllowedBrandModal = ({ setOpen: openModal, children, dialogTriggerClassName }: AllowedBrandModalProps) => {
  const { brandDetails } = useBaseContext();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedSearchQuery] = useDebounceValue(query, 300);

  const { data, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } = usePaginatedAllowedBrands({
    limit: 5,
    query_string: debouncedSearchQuery,
    brand_id: brandDetails?.brand_id,
  });

  const handleOpenChange = (status: boolean) => {
    setOpen(status);
    openModal?.(status);
  };

  return (
    <Dialog type="allowed-brands-dialog" open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={dialogTriggerClassName}>{children}</DialogTrigger>
      <DialogContent>
        <div className="gencl:h-[400px] gencl:flex gencl:flex-col gencl:gap-6 gencl:flex-1">
          <DialogHeader className="gencl:text-headline-3-bold gencl:text-start gencl:border-0">
            Allowed brands
          </DialogHeader>

          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="gencl:rounded-full"
            placeholder="Search..."
            onClear={() => setQuery("")}
          />

          {/* SCROLL AREA */}
          <BodyContent
            error={Boolean(error)}
            isLoading={isLoading}
            list={data}
            totalResults={data?.length}
            query={query}
            hasNextPage={hasNextPage}
            isLoadingNextPage={isFetchingNextPage}
            getNextPage={fetchNextPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
