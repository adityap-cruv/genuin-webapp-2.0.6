import { SideBarActionLinks } from "./sidebar-actions-link";

export function SidebarActions() {
  return (
    <div className="gencl:py-4 gencl:px-3 gencl:min-w-60 gencl:min-h-48 gencl:border-b-4 gencl:border-secondary-100">
      {SideBarActionLinks.map((links, index) => {
        const Icon = links.icon;
        return (
          <div
            key={index}
            className="gencl:flex gencl:rounded-lg gencl:items-center gencl:gap-4 gencl:px-3 gencl:py-2 gencl:hover:bg-secondary-50 gencl:cursor-pointer"
          >
            <Icon className="gencl:w-6 gencl:h-6" />
            <p className="gencl:text-body-1-medium">{links.text}</p>
          </div>
        );
      })}
    </div>
  );
}
