import Image, { type ImageProps } from 'next/image'
import { getWebpUrlForImage } from '@/lib/utils'

type CustomImageProps = ImageProps

export function CustomImage({ src, ...restProps }: CustomImageProps) {
  return <Image unoptimized src={typeof src === 'string' ? getWebpUrlForImage(src) : src} {...restProps} />
}
