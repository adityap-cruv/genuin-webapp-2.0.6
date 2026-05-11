import { ImgNoResults } from "@images/search/no-results";

export function NoSearchResults({ forKeyword }: { forKeyword: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-2">
      <ImgNoResults className="mb-2" />
      <p className="text-title-3-bold line-clamp-2 w-full px-4 text-center break-all">{`No results for "${forKeyword}"`}</p>
      <p className="text-body-1-demi text-tertiary">Try searching something else</p>
    </div>
  );
}
