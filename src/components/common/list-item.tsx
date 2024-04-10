import { CustomAvatar } from '@components/custom/custom-avatar'

export function ListItem({
  title,
  subtitle,
  description,
  image,
  isAvatar,
}: {
  title: string
  subtitle?: string
  description?: string
  image?: string
  isAvatar: boolean
}) {
  return (
    <div className="flex items-center gap-x-1 rounded-lg p-2 hover:bg-monochrome-10">
      <CustomAvatar
        className="h-12 w-12 bg-red-40"
        imageUrl={image ?? ''}
        fallbackString={title ?? ''}
        isAvatar={isAvatar}
      />
      <div className="mx-2">
        <p className="line-clamp-1 text-body-1-demi">{subtitle}</p>
        {title && <p className="line-clamp-1 text-body-1-med">{title}</p>}
        {description && <p className="line-clamp-1 text-body-1-med text-tertiary">{description}</p>}
      </div>
    </div>
  )
}
