import { CustomAvatar } from '@components/custom/custom-avatar'

export function ListItem({
  title,
  subtitle,
  description,
  image,
}: {
  title: string
  subtitle?: string
  description?: string
  image?: string
}) {
  return (
    <div className="flex items-center gap-x-1 rounded-lg p-2 hover:bg-monochrome-10">
      <CustomAvatar
        className="h-12 w-12 bg-red-40"
        imageUrl={image ?? ''}
        fallbackString={title ?? ''}
        isAvatar={false}
      />
      <div className="mx-2">
        <p className="line-clamp-1 text-body-1-demi">{subtitle}</p>
        {title && (
          <p className="line-clamp-1 text-body-1-med" style={{ fontWeight: 500 }}>
            {title}
          </p>
        )}
        {description && (
          <p className="line-clamp-1 text-body-1-med text-monochrome" style={{ fontWeight: 500 }}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
