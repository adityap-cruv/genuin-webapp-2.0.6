import Image, { type ImageProps } from 'next/image'
import { getWebpUrlForImage } from '@/lib/utils'

type CustomImageProps = ImageProps & {
  useWebp?: boolean
}

export function CustomImage({ src, useWebp = true, ...restProps }: CustomImageProps) {
  return <Image unoptimized src={typeof src === 'string' && useWebp ? getWebpUrlForImage(src) : src} {...restProps} />
}
