'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { Switch } from '@components/ui/switch'

export default function Component() {
  const isMobile = useGenuinOptions().isMobile

  return (
    <div>
      <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
        {isMobile && <Image src={icBack} alt="back" />}
        <p className="text-title-2-bold">Notifications</p>
        <div></div>
      </div>
      {isMobile && <hr className="bg-monochrome-9" />}
      <div className={`${isMobile ? 'm-4 my-6' : 'mx-8 my-4'} flex items-center justify-between`}>
        <p>Loops</p>
        <Switch onCheckedChange={() => {}} />
      </div>
    </div>
  )
}
