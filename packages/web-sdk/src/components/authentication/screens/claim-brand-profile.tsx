// import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { ModalShell } from '../modal-shell'
// import { Button } from '@components/ui/button'
import { Button } from '@/components/ui/button'
// import { ClaimBrandProfileIcon } from '@icons/claim-brand-profile-icon'
import { ClaimBrandProfileIcon } from '@/components/icons/claim-brand-profile-icon'
import { useBaseContext } from '@/context/base'
import { BCC_URL } from '@/const'
// import Link from 'next/link'

function cleanURL(url: any) {
  return url?.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')
}

export function ClaimBrandProfile() {
  const { brandDetails } = useBaseContext()

  return (
    <ModalShell>
      <ClaimBrandProfileIcon className='h-72 fill-primary' />
      <h3 className='text-center text-title-1-demi sm:text-heading-3'>
        Claim Brand Profile
      </h3>
      <p className='text-center text-title-3-med'>
        Empower your brand's narrative by claiming your space, building engaging
        communities, and connecting directly with your audience.
      </p>
      <a
        href={`${BCC_URL}/claim-brand?domain=${cleanURL(brandDetails?.website)}&brand_id=${brandDetails?.brand_id}`}
        target='_blank'
        className='w-full'>
        <Button
          variant='default'
          className='w-full text-title-3-med !text-white'>
          Verify your brand
        </Button>
      </a>
    </ModalShell>
  )
}
