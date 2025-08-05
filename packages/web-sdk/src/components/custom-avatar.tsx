import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn, getAvatarUrl, getWebpUrlForImage } from '@/utils'

type Props = {
  isAvatar: boolean
  imageUrl: string
  fallbackString: string
  className?: string
  smallSize?: boolean
}

export function CustomAvatar({
  isAvatar = false,
  imageUrl,
  className,
  fallbackString,
  smallSize = false,
}: Props) {
  return (
    <Avatar
      className={cn(
        'flex items-center justify-center bg-tertiary-400',
         className,
      )}>
      <AvatarImage
        title={fallbackString}
        src={isAvatar ? getAvatarUrl(imageUrl) : getWebpUrlForImage(imageUrl)}
      />
      <AvatarFallback
        className={cn(
          smallSize
            ? '!text-cap-1-demi text-white'
            : '!text-title-2-bold text-white',
        )}>
        {getAvatarFallback(fallbackString)}
      </AvatarFallback>
    </Avatar>
  )
}

function getAvatarFallback(str: string | undefined) {
  if (!str) return 'U'
  const strArray = str?.split(' ')
  let ans = ''
  ans += strArray[0]?.charAt(0)
  if (strArray[1]) ans += strArray[1].charAt(0)
  return ans.toUpperCase()
}
