import Link from "next/link";

import { useGenuinOptions } from "@/lib/stores/genuin-options";
import { Button } from "@components/ui/button";
import { ClaimBrandProfileIcon } from "@icons/claim-brand-profile-icon";

import { ModalShell } from "../modal-shell";

export function ClaimBrandProfile() {
  const { brandUrl, brandId } = useGenuinOptions((state) => ({
    brandUrl: state.config?.website,
    brandId: state.brandId,
  }));

  function cleanURL(url: any) {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
  }
  return (
    <ModalShell>
      <ClaimBrandProfileIcon className="fill-primary h-72" />
      <h3 className="text-title-1-demi sm:text-heading-3 text-center">Claim Brand Profile</h3>
      <p className="text-title-3-med text-center">
        Empower your brand's narrative by claiming your space, building engaging communities, and connecting directly
        with your audience.
      </p>
      <Link
        href={`${process.env.NEXT_PUBLIC_BCC_URL}/claim-brand?domain=${cleanURL(brandUrl)}&brand_id=${brandId}`}
        target="_blank"
        className="w-full">
        <Button variant="default" className="text-title-3-med !text-monochrome-white w-full">
          Verify your brand
        </Button>
      </Link>
    </ModalShell>
  );
}
