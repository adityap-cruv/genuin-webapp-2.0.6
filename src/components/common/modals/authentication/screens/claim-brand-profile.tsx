import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { ClaimBrandProfileIcon } from '@icons/claim-brand-profile-icon'
import Link from 'next/link'

export function ClaimBrandProfile() {
  const brandUrl = useGenuinOptions().config?.website

  function cleanURL(url: any) {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '')
  }
  return (
    <ModalShell>
      <ClaimBrandProfileIcon className="h-72 fill-primary" />
      <h3 className="text-center text-title-1-demi sm:text-heading-3">Claim Brand Profile</h3>
      <p className="text-center text-title-3-med">
        Empower your brand's narrative by claiming your space, building engaging communities, and connecting directly
        with your audience.
      </p>
      <Link
        href={`${process.env.NEXT_PUBLIC_BCC_URL}/claim-brand?domain=${cleanURL(brandUrl)}`}
        target="_blank"
        className="w-full">
        <Button variant="default" className="w-full text-title-3-med !text-new-off-white">
          Verify your brand
        </Button>
      </Link>
    </ModalShell>
  )
}
