import { ImgNoResults } from '@images/search/no-results'

export function NoSearchResults({ forKeyword }: { forKeyword: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-2">
      <ImgNoResults className="mb-2" />
      <p className="line-clamp-2 w-full break-all px-4 text-center text-title-3-bold">{`No results for "${forKeyword}"`}</p>
      <p className="text-body-1-demi text-tertiary">Try searching something else</p>
    </div>
  )
}
