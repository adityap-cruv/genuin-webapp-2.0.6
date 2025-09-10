import React from "react";
import { Button } from "@genuin/ui/components";
import { PlusIcon } from "@genuin/ui/icons";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

interface NoDataStateProps {
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick?: () => void;
}

export function NoDataState({
  title,
  description,
  buttonLabel,
  onButtonClick,
}: NoDataStateProps) {
  return (
    <div className="gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:h-full gencl:bg-white gencl:rounded-xl gencl:border gencl:border-secondary-100">
      <span className="gencl:text-body-0-semi-bold gencl:mb-2">{title}</span>
      <span className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:mb-4">
        {description}
      </span>
      <Link href={buildPageUrl({ type: "posts-create" })}>
        <Button theme="secondary" size="md">
          <PlusIcon className="gencl:h-6 gencl:w-6" />
          {buttonLabel}
        </Button>
      </Link>
    </div>
  );
}
