import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { cn, getAvatarUrl, getWebpUrlForImage } from '@lib/utils'

type Props = {
  isAvatar: boolean
  imageUrl: string
  fallbackString: string
  className?: string
}

export function CustomAvatar({ isAvatar = false, imageUrl, className, fallbackString }: Props) {
  return (
    <Avatar className={cn(className, 'flex items-center justify-center bg-red-40')}>
      <AvatarImage title={fallbackString} src={isAvatar ? getAvatarUrl(imageUrl) : getWebpUrlForImage(imageUrl)} />
      <AvatarFallback className="text-title-2-bold text-monochrome-white">
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
