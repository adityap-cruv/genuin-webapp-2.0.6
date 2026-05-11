import { Dialog, DialogClose, DialogContent } from "@components/ui/dialog";
import { Loader } from "@components/ui/loader";
import { CloseIcon } from "@icons/close-icon";
import { IcLoop } from "@icons/ic-loop";

import { Body } from "./body";
import { SearchInput } from "./search-input";
import { useRepostModalStore } from "./state";

export function Modal() {
  const { isOpen, close, isLoading, data, searchStr } = useRepostModalStore((state) => ({
    isOpen: state.isOpen,
    close: state.close,
    data: state.repostCommunityData,
    isLoading: state.isLoading,
    searchStr: state.searchStr,
  }));

  return (
    <Dialog open={isOpen} modal>
      <DialogContent
        showClose={false}
        className="z-[60] flex h-5/6 flex-col overflow-hidden rounded-t-lg sm:h-2/3 sm:min-h-[400px] sm:w-full sm:max-w-lg sm:px-8 sm:pt-6 sm:pb-0"
        onInteractOutside={(e) => {
          close();
        }}
        onKeyUp={(e) => {
          if (e.code === "Escape") close();
        }}>
        <DialogClose
          className="absolute top-4 right-4 focus:ring-0"
          onClick={(e) => {
            close();
          }}>
          <CloseIcon />
        </DialogClose>
        <p className="text-title-1-bold flex justify-center pb-5">Repost Post</p>
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader size="md" />
          </div>
        ) : (data ?? searchStr !== "") ? (
          <>
            <SearchInput />
            <Body />
          </>
        ) : (
          <NoData />
        )}
      </DialogContent>
    </Dialog>
  );
}

function NoData() {
  return (
    <div className="flex h-auto flex-1 flex-col items-center justify-center">
      <div className="bg-tertiary-200 w-fit rounded-full p-2">
        <IcLoop className="fill-monochrome-black h-20" />
      </div>
      <p className="text-title-2-bold pt-4">No available Groups</p>
      <p className="text-body-1-demi text-center">
        You must be a member in a Group to
        <br /> repost videos.
      </p>
    </div>
  );
}
