import { GenuinIcon } from '@icons/genuin-icon'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { cn } from '@lib/utils'
// import Image from 'next/image'
import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'> & {
  /**
   * Image Height in case of brand logo changes
   */
  imageHeight: number
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

function LogoProcessor({ className, imageHeight, type, ...props }: ProcessorProps) {
  const { brandWebLogo } = useGenuinOptions((state) => ({ embed: state.embed, brandWebLogo: state.brandWebLogo }))

  // TODO: Find a way to use next/image here.
  if (brandWebLogo)
    return (
      <img
        src={brandWebLogo}
        style={{ height: imageHeight }}
        className={cn('object-cover', className)}
        alt="brand logo"
      />
    )

  switch (type) {
    case 'text':
      return <GenuinIcon.text style={{ maxHeight: imageHeight, height: imageHeight }} {...props} />
    case 'icon':
      return <GenuinIcon.icon style={{ maxHeight: imageHeight, height: imageHeight }} {...props} />
    case 'logo':
      return <GenuinIcon.logo style={{ maxHeight: imageHeight, height: imageHeight }} {...props} />
  }
}
