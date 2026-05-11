import { SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Input } from "@components/ui/input";

import { useRepostModalStore } from "./state";

export function SearchInput() {
  const { data, search } = useRepostModalStore((state) => ({ data: state.repostCommunityData, search: state.search }));
  const setKeyword = useDebouncedCallback((value) => {
    search(value);
  }, 400);

  if (data)
    return (
      <div className="relative mb-2">
        <Input
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
          className="bg-tertiary-200 w-full rounded-full border-none pr-2 pl-10"
          autoFocus
        />
        <span className="absolute top-0 left-3 flex h-full items-center">
          <SearchIcon className="stroke-tertiary w-5 stroke-2" />
        </span>
      </div>
    );
}
