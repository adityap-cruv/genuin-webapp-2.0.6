import type { FC } from "react";
import type { MenuItem } from "./side-menu.types";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { cn } from "@genuin/ui/lib/utils";

interface SideMenuProps {
  items: MenuItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const SideMenu: FC<SideMenuProps> = ({ items, activeId, onSelect }) => {
  return (
    <ul className="gencl:w-53">
      {items.map((item) => {
        const isActive = item.id === activeId;
        const listItem = (
          <li
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "gencl:flex gencl:items-center gencl:gap-2 gencl:cursor-pointer gencl:px-3 gencl:py-2 gencl:my-1 gencl:rounded-md ",
              isActive
                ? "gencl:bg-secondary-50 gencl:text-body-1-bold"
                : "gencl:hover:bg-secondary-50 gencl:text-body-1-medium"
            )}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </li>
        );

        return item.variant === "signOut" ? (
          <AuthenticationModal key={item.id} customStep="SIGN_OUT" asChild>
            {listItem}
          </AuthenticationModal>
        ) : (
          listItem
        );
      })}
    </ul>
  );
};

export default SideMenu;
