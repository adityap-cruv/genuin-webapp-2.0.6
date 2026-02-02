import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchIcon } from "@genuin/ui/icons";

import { Skeleton } from "@genuin/ui/components/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@genuin/ui/components/select";
import { useGetCommunityGroupList } from "@genuin/components/react-query/api/post";
import { Avatar } from "@genuin/ui/components/avatar";
import { Input } from "@genuin/ui/components/input";
import {
  CommunityOption,
  DropdownProps,
  FilterItem,
  GroupOption,
} from "./community-group-selector.types";
import { useBaseContext } from "@genuin/components/context";
import { getRootContainer } from "../root-portal/shadow-root/shadow-dom.utils";

const transformCommunityData = (data: any[]): CommunityOption[] =>
  data.map((community) => ({
    value: community.community_id,
    label: community.name,
    avatar: {
      url: community.dp_m || community.dp,
      isAvatar: true,
    },
    groups:
      community.chats?.map(
        (chat: { chat_id: string; group: { group_name: string } }) => ({
          value: chat.chat_id,
          label: chat.group.group_name,
        })
      ) || [],
  }));

/* Dropdown Component */
function DropdownSelector({
  label,
  items,
  value,
  showAvatar = true,
  onChange,
  disabled = false,
}: DropdownProps) {
  const [query, setQuery] = useState("");
  const { useShadowDOM } = useBaseContext();
  const filteredItems: FilterItem[] = query
    ? items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  return (
    <Select
      value={value?.value || ""}
      onValueChange={onChange}
      onOpenChange={() => setQuery("")}
      disabled={disabled}
    >
      <SelectTrigger className="gencl:bg-white">
        <SelectValue placeholder={`Select ${label}`}>
          {showAvatar && value?.avatar && (
            <Avatar
              alt={value.label}
              imageUrl={value.avatar.url}
              isAvatar={value.avatar.isAvatar}
              size="xs"
            />
          )}
          {value?.label}
        </SelectValue>
      </SelectTrigger>

      <SelectContent
        className="gencl:rounded-xl"
        viewportClassName="gencl:p-0"
        showScrollUpButton={false}
        showScrollDownButton={false}
        container={getRootContainer(useShadowDOM)}
      >
        <div className="gencl:pt-0 gencl:pr-4 gencl:pb-4 gencl:pl-4">
          <div className="gencl:sticky gencl:top-0 gencl:z-10 gencl:bg-white gencl:border-border gencl:pb-2 gencl:pt-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label}`}
              icon={<SearchIcon />}
              className="gencl:rounded-full"
            />
          </div>

          {filteredItems?.length === 0 ? (
            <div className="gencl:text-body-2-medium gencl:text-secondary-600 gencl:text-center gencl:py-3">
              {label} not found.
            </div>
          ) : (
            filteredItems?.map(({ value, label, avatar }) => (
              <SelectItem key={value} value={value} showTickMark={false}>
                {showAvatar && (
                  <Avatar
                    alt={label}
                    imageUrl={avatar?.url || ""}
                    isAvatar={avatar?.isAvatar || false}
                    size="xs"
                  />
                )}
                {label}
              </SelectItem>
            ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
}

/* Main Selector */
export function CommunityGroupSelector({
  onSelectChange,
  communityId,
  groupId,
}: {
  communityId?: string;
  groupId?: string;
  onSelectChange: (communityId: string, groupId: string | null) => void;
}) {
  const { data: communityData } = useGetCommunityGroupList();
  const communityOptions = useMemo(
    () => transformCommunityData(communityData || []),
    [communityData]
  );

  const [selectedCommunity, setSelectedCommunity] =
    useState<CommunityOption | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);

  const handleCommunityChange = (communityId: string) => {
    const selected =
      communityOptions.find((c) => c.value === communityId) || null;
    setSelectedCommunity(selected);
    setSelectedGroup(null);
    onSelectChange(communityId, null);
  };

  const handleGroupChange = (groupId: string) => {
    if (!selectedCommunity?.value) return console.log("Community not selected");
    const selected =
      selectedCommunity?.groups.find((g) => g.value === groupId) || null;
    setSelectedGroup(selected);
    onSelectChange(selectedCommunity?.value, groupId);
  };

  const syncSelectedValues = useCallback(() => {
    if (!communityOptions?.length) return;

    const matchedCommunity = communityOptions.find(
      (community) => community.value === communityId
    );

    const matchedGroup = matchedCommunity?.groups?.find(
      (group) => group.value === groupId
    );

    setSelectedCommunity(matchedCommunity ?? null);
    setSelectedGroup(matchedGroup ?? null);
  }, [communityOptions, communityId, groupId]);

  useEffect(() => {
    syncSelectedValues();
  }, [syncSelectedValues, communityOptions]);

  return (
    <div className="gencl:relative gencl:h-28">
      <DropdownSelector
        label="Community"
        items={communityOptions}
        value={selectedCommunity}
        onChange={handleCommunityChange}
      />

      <div className="gencl:absolute gencl:z-0 gencl:h-8 gencl:w-8 gencl:left-6">
        <div className="gencl:absolute gencl:h-full gencl:w-full gencl:rounded-b-[12px] gencl:border-l gencl:border-b gencl:border-secondary-150" />
      </div>

      <div className="gencl:absolute gencl:w-[calc(100%-46px)] gencl:mt-3 gencl:left-[46px]">
        <DropdownSelector
          label="Group"
          items={selectedCommunity?.groups || []}
          value={selectedGroup}
          onChange={handleGroupChange}
          showAvatar={false}
          disabled={!selectedCommunity}
        />
      </div>
    </div>
  );
}

/* Skeleton */
export function CommunityGroupSelectorSkeleton() {
  return (
    <div className="gencl:relative gencl:h-28">
      <Skeleton className="gencl:w-full gencl:h-10" />
      <div className="gencl:absolute gencl:z-0 gencl:h-8 gencl:w-8 gencl:left-6">
        <div className="gencl:absolute gencl:h-full gencl:w-full gencl:rounded-b-[12px] gencl:border-l gencl:border-b gencl:border-secondary-150" />
      </div>
      <div className="gencl:absolute gencl:w-[calc(100%-46px)] gencl:mt-3 gencl:left-[46px]">
        <Skeleton className="gencl:w-full gencl:h-10" />
      </div>
    </div>
  );
}
