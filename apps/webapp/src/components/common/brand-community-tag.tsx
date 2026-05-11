"use client";
import Link from "next/link";

import { CustomAvatar } from "@components/custom/custom-avatar";
import { PATH_NAME } from "@lib/utils/constants/path";

export function BrandCommunityTag({
  brandSlug,
  brandLogo,
  brandName,
}: {
  brandSlug: string | null | undefined;
  brandLogo: string | null | undefined;
  brandName: string | null | undefined;
}) {
  return (
    <>
      <Link href={{ pathname: PATH_NAME.brand(brandSlug ?? "") }}>
        <div className="bg-tertiary-200 flex items-center gap-1 rounded-full p-1 pr-1.5">
          <CustomAvatar
            imageUrl={brandLogo ?? ""}
            fallbackString={brandName ?? ""}
            isAvatar={false}
            className="h-4 w-4"
          />
          <p
            className="text-cap-1-demi text-secondary truncate"
            style={{
              maxWidth: "10ch",
            }}>
            {brandName}
          </p>
        </div>
      </Link>
    </>
  );
}
