import { Link } from "@genuin/components/molecules/link";
import { GenuinLogo } from "@genuin/ui/icons";

export function PoweredByGenuin() {
  return (
    <div className="gencl:!hidden gencl:xl:!block gencl:border-t gencl:p-4 gencl:border-secondary-100 gencl:justify-self-end gencl:mt-auto">
      <div className="gencl:flex gencl:items-center gencl:px-3">
        <p className="gencl:text-body-2-semi-bold gencl:whitespace-nowrap gencl:text-secondary-600">
          Powered by
        </p>
        <Link
          href="https://begenuin.com?utm_source=web&utm_medium=sidebar"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GenuinLogo />
        </Link>
      </div>
    </div>
  );
}
