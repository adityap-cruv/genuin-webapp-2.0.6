import { ChevronLeft } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { useIHeartDemoStates } from "@/components/providers/iheart-demo-provider";
import { Input } from "@components/ui/input";
import { SheetClose } from "@components/ui/sheet";
import { SearchIcon } from "@icons/search-icon";
import { RECENT_SEARCH_CONTENT_TYPE } from "@lib/constants";
import Analytics from "@services/analytics";

import { postRecents } from "./api";
import { useSearchBarStore } from "./store";

export const SearchInput = {
  desktop: Desktop,
  mobile: Mobile,
};

function Desktop() {
  const { updateFocus, setKeyword } = useSearchBarStore();
  const { renderIn, shouldShowIHeartDemo } = useIHeartDemoStates();
  const showIHeartDemo = renderIn === "root" && shouldShowIHeartDemo;

  const debounced = useDebouncedCallback((value) => {
    if (value.trim() !== "") {
      setKeyword(value.trim());
      if (value.trim()) postRecents(RECENT_SEARCH_CONTENT_TYPE.text, undefined, value);
      void Analytics.track({
        eventName: "Keyword Searched",
        properties: { keyword_searched: value.trim(), search_source: "web" },
      });
    } else {
      setKeyword("");
    }
  }, 500);

  return (
    <div className={`relative min-w-[100px] ${showIHeartDemo ? "w-60" : "md:w-64 lg:w-72 xl:w-96"}`}>
      <Input
        onFocus={() => {
          updateFocus(true, false);
        }}
        onChange={(e) => {
          debounced(e.target.value);
        }}
        id="search-input"
        className="bg-tertiary-200 text-body-1-demi placeholder:text-tertiary rounded-full border-none pl-10 focus:border-none"
        placeholder="Search"
      />
      <SearchIcon className={`stroke-tertiary absolute top-0 left-3 flex h-full w-5 items-center`} />
    </div>
  );
}

function Mobile() {
  const { setKeyword, close } = useSearchBarStore();

  const debounced = useDebouncedCallback((value) => {
    setKeyword(value);
    if (value) postRecents(RECENT_SEARCH_CONTENT_TYPE.text, undefined, value);
    void Analytics.track({
      eventName: "Keyword Searched",
      properties: { keyword_searched: value, search_source: "web" },
    });
  }, 500);

  return (
    <div className="border-tertiary-200 flex w-full items-center border-b px-4 py-2">
      <SheetClose
        className="h-full pr-1 pl-0"
        onClick={() => {
          close();
        }}>
        <ChevronLeft className="stroke-secondary h-6 stroke-2 outline-none" />
      </SheetClose>
      <span className="relative w-full">
        <Input
          onChange={(e) => {
            debounced(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          id="search-input"
          className="bg-tertiary-200 text-body-1-demi placeholder:text-tertiary h-10 rounded-full border-none pl-8 focus:border-none"
          placeholder="Search"
        />
        <SearchIcon className={`stroke-tertiary absolute top-0 left-2 flex h-full w-5 items-center`} />
      </span>
    </div>
  );
}
