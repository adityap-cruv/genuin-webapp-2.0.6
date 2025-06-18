import { ThreeDotsIcon } from "@genuin/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/popover";

import { SideBarActionLinks } from "./sidebar-actions-link";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

export function SidebarActions({
  brandConfiguredTerms,
  brandConfiguredPrivacy,
}: {
  brandConfiguredTerms: string;
  brandConfiguredPrivacy: string;
}) {
  return (
    <div className="gencl:px-3 gencl:py-4 gencl:!w-full gencl:min-h-48 gencl:border-b gencl:border-secondary-100">
      {SideBarActionLinks.map((links, index) => {
        const Icon = links.icon;
        return (
          <Link
            key={index}
            href={buildPageUrl({ type: links.type })}
            className="gencl:flex gencl:rounded-lg gencl:items-center gencl:gap-4 gencl:px-2 gencl:py-2 gencl:xl:py-4 gencl:xl:px-3 gencl:hover:bg-secondary-50 gencl:cursor-pointer"
          >
            <Icon className="gencl:w-6 gencl:h-6" />
            <p className="gencl:text-body-1-medium gencl:hidden gencl:xl:!block">
              {links.text}
            </p>
          </Link>
        );
      })}
      <Popover>
        <PopoverTrigger asChild>
          <div className="gencl:flex gencl:rounded-lg gencl:items-center gencl:gap-4 gencl:px-3 gencl:py-2 gencl:hover:bg-secondary-50 gencl:cursor-pointer">
            <ThreeDotsIcon className="gencl:h-6 gencl:w-6 gencl:p-0" />
            <p className="gencl:text-body-1-medium gencl:hidden gencl:xl:!block">
              More
            </p>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="gencl:shadow-none gencl:focus-visible:outline-none gencl:focus-visible:ring-0 gencl:bg-white gencl:rounded-lg gencl:p-3 gencl:w-fit gencl:border gencl:border-secondary-100"
        >
          <Link href={brandConfiguredTerms ?? buildPageUrl({ type: "terms" })}>
            <p className="gencl:text-body-1-medium gencl:p-2 gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:rounded-lg">
              Terms and Condition
            </p>
          </Link>
          <Link
            href={brandConfiguredPrivacy ?? buildPageUrl({ type: "privacy" })}
          >
            <p className="gencl:text-body-1-medium gencl:p-2 gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:rounded-lg">
              Privacy Policy
            </p>
          </Link>
        </PopoverContent>
      </Popover>
    </div>
  );
}
