import { ChevronRightIcon } from "@genuin/ui/icons";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="gencl:flex">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const textClass = isLast
          ? "gencl:text-body-0-semi-bold"
          : "gencl:text-body-0-semi-bold gencl:text-secondary-600";

        return (
          <div key={index} className="gencl:flex gencl:items-center">
            {index !== 0 && (
              <span className="gencl:px-4">
                <ChevronRightIcon className="gencl:size-3" />
              </span>
            )}
            {item.href && !isLast ? (
              <a href={item.href} className={textClass}>
                {item.label}
              </a>
            ) : (
              <span className={textClass}>{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
};
