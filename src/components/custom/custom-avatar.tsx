import { Avatar, AvatarImage } from '@components/ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { isValidHTTPS, cn, getAvatarFallback } from '@lib/utils'

type Props = {
  isAvatar: boolean
  imageUrl: string
  fallbackString: string
  className?: string
}

export function CustomAvatar({ isAvatar = false, imageUrl, className, fallbackString }: Props) {
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={isAvatar ? getAvatarUrl(imageUrl) : imageUrl} />
      <AvatarFallback className="text-title-lg text-monochrome-white">
        {getAvatarFallback(fallbackString)}
        {/* <Image src={getAvatarUrl('cow_face')} alt="none" /> */}
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
