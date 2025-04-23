// import Image, { type ImageProps } from 'next/image'
import { getWebpUrlForImage } from '@/utils'
import { type ComponentProps } from 'react'

type CustomImageProps = ComponentProps<'img'>

export function CustomImage({ src, ...restProps }: CustomImageProps) {
  return (
    <img
      src={getWebpUrlForImage(src)}
      {...restProps}
    />
  )
}
