import { CustomAvatar } from '@components/custom/custom-avatar'
import { TickIcon } from '@icons/tick-icon'

export function ListItem({
  title,
  subtitle,
  description,
  image,
  isAvatar,
  brand,
  isOwner,
}: {
  title: string
  subtitle?: string
  description?: string
  image?: string
  isAvatar: boolean
  isOwner: boolean
  brand?: {
    brand_id: number
    brand_slug: string
  } | null
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
        <div className="flex items-center gap-2">
          <p className="line-clamp-1 text-body-1-demi">{subtitle}</p>
          {brand && (
            <div className="flex items-center gap-0.5">
              <TickIcon className="h-3 w-3 fill-primary" />
              <p className="text-cap-2-demi text-primary">Brand</p>
            </div>
          )}
          {isOwner && (
            <p className="flex items-center gap-1 rounded-full bg-primary-200 p-1 pr-1.5 text-cap-1-demi text-primary">
              Owner
            </p>
          )}
        </div>
        {title && <p className="line-clamp-1 text-body-1-med">{title}</p>}
        {description && <p className="line-clamp-1 text-body-1-med text-tertiary">{description}</p>}
      </div>
    </div>
  )
}
