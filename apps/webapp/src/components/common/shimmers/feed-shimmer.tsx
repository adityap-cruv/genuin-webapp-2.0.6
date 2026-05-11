import { Shimmer } from "@components/ui/shimmer";

export const FeedShimmer = { mobile: Mobile, desktop: Desktop, comments: Comments };

function Mobile() {
  return (
    <div className="bg-new-off-black absolute inset-0 h-full w-full">
      <div className="absolute bottom-0 left-0 h-auto w-full px-2">
        <div className="mb-3 flex w-full">
          <div className="flex w-full flex-col justify-end">
            <div className="flex items-center gap-x-2">
              <Shimmer className="bg-monochrome-2 h-7 w-7 shrink-0 rounded-full" />
              <Shimmer className="bg-monochrome-2 h-3 w-1/5 rounded-full" />
              <Shimmer className="bg-monochrome-2 h-3 w-1/6 rounded-full" />
            </div>
            <Shimmer className="bg-monochrome-2 my-2 h-3 w-11/12 rounded-full" />
            <Shimmer className="bg-monochrome-2 h-3 w-11/12 rounded-full" />
          </div>
          <div className="pl-2">
            <ActionItem />
            <ActionItem />
            <ActionItem />
            <ActionItem />
            <ActionItem />
            <ActionItem />
          </div>
        </div>
        <Shimmer className="bg-monochrome-2 my-2 h-14 w-full" />
      </div>
    </div>
  );
}

function ActionItem() {
  return <Shimmer className="bg-monochrome-2 my-4 h-6 w-6 shrink-0" />;
}

function Desktop() {
  return (
    <div className="absolute inset-0 flex h-full w-full">
      <div className="flex-1">
        <Shimmer className="h-full w-full" />
      </div>
      <div className="relative h-full w-full flex-1 p-6">
        <span className="flex w-full items-center gap-x-4">
          <Shimmer className="h-11 w-11 shrink-0 rounded-full" />
          <Shimmer className="h-4 w-40 shrink-0 rounded-full" />
          <Shimmer className="h-4 w-20 rounded-full" />
        </span>
        <Shimmer className="mt-2 mb-1 h-4 rounded-full" />
        <Shimmer className="h-4 rounded-full" />
        <div className="border-monochrome-9 mt-4 border-t-2 border-b-2 p-4">
          <Shimmer className="h-4 w-1/5 rounded-full" />
          <div className="my-4 flex w-full">
            <Shimmer className="mt-4 h-10 w-10 rounded-full" />
            <div className="w-full">
              <div className="flex w-full items-center gap-x-4 py-4 pl-2">
                <div className="w-1/2">
                  <Shimmer className="h-4 w-1/2 rounded-full" />
                </div>
                <div className="flex w-1/2 gap-x-1">
                  <Shimmer className="h-7 w-2/3" />
                  <Shimmer className="h-7 w-8" />
                </div>
              </div>
              <div className="border-monochrome-9 flex w-full justify-between rounded-xl border-2 p-4">
                <Shimmer className="h-4 w-1/4" />
                <Shimmer className="h-4 w-1/6" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-monochrome-9 border-b-2 py-4">
          <Shimmer className="h-4 w-1/3" />
        </div>
        <div className="w-full py-2">
          <Comments iterations={5} />
        </div>
        <div className="border-monochrome-9 bg-monochrome-white absolute right-0 bottom-0 flex w-full items-center gap-x-4 border-t-2 p-2">
          <div className="border-monochrome-9 w-full rounded-full border-2 py-2 pl-2">
            <Shimmer className="h-3 w-1/3" />
          </div>
          <Shimmer className="h-6 w-6 shrink-0" />
          <Shimmer className="h-6 w-6 shrink-0" />
        </div>
      </div>
    </div>
  );
}

function Comments({ iterations }: { iterations: number }) {
  return (() => {
    const rows = [];
    for (let i = 0; i < iterations; i++) {
      rows.push(<CommentItem key={i} />);
    }
    return rows;
  })();
}

function CommentItem() {
  return (
    <div className="my-4">
      <div className="flex items-center gap-x-2">
        <Shimmer className="h-7 w-7 rounded-full" />
        <Shimmer className="h-4 w-1/3 rounded-full" />
      </div>
      <Shimmer className="my-2 h-4 w-full" />
      <Shimmer className="h-4 w-full" />
    </div>
  );
}
