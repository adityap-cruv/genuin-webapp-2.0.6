import { GenuinIcon } from '@icons/genuin-icon'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { cn } from '@lib/utils'
import { type ComponentProps } from 'react'
// import { CustomImage } from '../custom/custom-image'

type Props = ComponentProps<'svg'> & {
  /**
   * Image Height in case of brand logo changes
   */
  imageHeight: number
  logo?: string
}

export const AppLogo = {
  icon: Icon,
  text: Text,
  logo: Logo,
}

function Icon({ ...props }: Props) {
  return <LogoProcessor {...props} type="icon" />
}

function Text({ ...props }: Props) {
  return <LogoProcessor {...props} type="text" />
}

function Logo({ ...props }: Props) {
  return <LogoProcessor {...props} type="logo" />
}

type ProcessorProps = { type: 'icon' | 'text' | 'logo' } & Props

function LogoProcessor({ className, imageHeight, type, logo, ...props }: ProcessorProps) {
  const { brandWebLogo } = useGenuinOptions((state) => ({ brandWebLogo: state.brandWebLogo }))

  if (brandWebLogo)
    return (
      <div className="relative" style={{ height: imageHeight, width: 150 }}>
        <img
          src={brandWebLogo}
          style={{ height: imageHeight }}
          className={cn('object-cover', className)}
          alt="brand logo"
        />
      </div>
    )

  switch (type) {
    case 'text':
      return <GenuinIcon.text height={imageHeight} {...props} />
    case 'icon':
      return <GenuinIcon.icon height={imageHeight} {...props} />
    case 'logo':
      return <GenuinIcon.logo height={imageHeight} {...props} />
  }
}
