import { cn } from '@/lib/utils'
import { PriceTagIcon } from '@images/embed/social-icons/price-tag-icon'
import { WalletInHandIcon } from '@images/embed/social-icons/wallet-in-hand-icon'

// TODO ADD IMAGE AND ITEMTYPE
const SearchItem = ({
  className,
  title,
  image,
  caption,
  price,
  time,
  highlightedText,
  button,
  searchItemType = 1,
}: {
  className?: string
  title?: string
  image?: string
  caption?: string
  price?: string
  time?: string
  highlightedText?: string
  searchItemType?: number
  button?: Array<{
    text: string
    variant: any
  }>
}) => {
  if (searchItemType === 1)
    return (
      <div
        className={cn('flex w-full items-center gap-6 rounded-xl bg-monochrome-white p-6', className)}
        style={{
          boxShadow: '0px 0px 41px 0px rgba(0, 0, 0, 0.08)',
        }}>
        <img src={image} alt="food-item" className="h-24 w-24 md:h-32 md:w-32" />
        <div className="flex flex-col gap-2">
          <p className="line-clamp-2 text-title-3-bold text-secondary md:text-title-2-bold">{title}</p>
          <p className="line-clamp-1 text-body-1-med text-tertiary">{caption}</p>
          <div className="flex justify-between">
            <p className="flex items-center gap-1 text-body-1-demi text-secondary md:text-title-3-demi">
              <PriceTagIcon className="h-4 stroke-primary" />
              <span>{price}</span>
            </p>
            <p className="flex items-center gap-1 text-body-1-demi text-secondary md:text-title-3-demi">
              <WalletInHandIcon className="h-4 stroke-primary" />
              <span>{time}</span>
            </p>
          </div>
        </div>
      </div>
    )

  if (searchItemType === 2)
    return (
      <div
        className={cn('flex w-full flex-col items-center gap-3 rounded-xl bg-monochrome-white p-4', className)}
        style={{
          boxShadow: '0px 0px 41px 0px rgba(0, 0, 0, 0.08)',
        }}>
        <div className="flex w-full items-center gap-4">
          {image && <img src={image} alt="food-item" className="h-14 w-14 md:h-16 md:w-16" />}
          <div>
            <p className="line-clamp-2 text-title-3-bold text-secondary md:text-title-2-bold">{title}</p>
            <p className="text-cap-1-demi text-new-light-grey md:text-body-1-demi">{caption}</p>
          </div>
        </div>

        <p className="cap-1-med rounded-lg bg-primary-200 p-2 text-body-1-med md:text-title-3-demi">
          {highlightedText}
        </p>

        <div className="flex w-full justify-between text-cap-1-med md:text-body-1-demi">
          <div>{time}</div>
          <div>{price}</div>
        </div>

        <div className="flex w-full items-center justify-between text-body-1-med md:text-title-3-demi">
          {button?.[0] && (
            <div className="w-1/2 rounded border border-primary-100 py-2.5 text-center">{button[0].text}</div>
          )}
          {button?.[1] && (
            <div className="w-1/2 rounded border border-primary-100 bg-primary py-2.5 text-center text-monochrome-white">
              {button[1].text}
            </div>
          )}
        </div>
      </div>
    )
}

export default SearchItem
