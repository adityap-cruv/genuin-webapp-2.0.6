import { ReactNode } from "react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  notificationCount?: number;
  isActive?: boolean;
  variant?: "default" | "signOut";
}

export interface MenuProps {
  items: MenuItem[];
  onSelect: (id: string) => void;
  activeId: string;
}
