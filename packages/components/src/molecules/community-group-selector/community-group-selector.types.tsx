export type AvatarInfo = { url: string; isAvatar: boolean };

export type GroupOption = { value: string; label: string };

export type CommunityOption = {
  value: string;
  label: string;
  avatar?: AvatarInfo;
  groups: GroupOption[];
};

export type DropdownValue = {
  value: string;
  label: string;
  avatar?: AvatarInfo;
};

export type DropdownProps = {
  label: string;
  items: CommunityOption[] | GroupOption[];
  value: DropdownValue | null;
  showAvatar?: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export type FilterItem = {
  value: string;
  label: string;
  avatar?: { url?: string; isAvatar?: boolean };
};
