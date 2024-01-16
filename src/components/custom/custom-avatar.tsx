import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { isValidHTTPS, cn } from '@lib/utils'

type Props = {
  isAvatar: boolean
  imageUrl: string
  fallbackString: string
  className?: string
}

export function CustomAvatar({ isAvatar = false, imageUrl, className, fallbackString }: Props) {
  return (
    <Avatar className={cn(className, 'flex items-center justify-center bg-red-40')}>
      <AvatarImage src={isAvatar ? getAvatarUrl(imageUrl) : imageUrl} />
      <AvatarFallback className="text-title-2-bold text-monochrome-white">
        {getAvatarFallback(fallbackString)}
      </AvatarFallback>
    </Avatar>
  )
}

function getAvatarUrl(avatarUrl: any) {
  if (avatarUrl) {
    return isValidHTTPS(avatarUrl)
      ? avatarUrl
      : `https://media.qa.begenuin.com/webapp_assets/assets/avatar/${avatarUrl}.gif`
  }
  return null
}

function getAvatarFallback(str: string | undefined) {
  if (!str) return 'U'
  const strArray = str?.split(' ')
  let ans = ''
  ans += strArray[0]?.charAt(0)
  if (strArray[1]) ans += strArray[1].charAt(0)
  return ans.toUpperCase()
}
