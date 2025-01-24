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
  searchItemType,
}: {
  className?: string
  title?: string
  image?: string
  caption?: string
  price?: string
  time?: string
  searchItemType?: number
}) => {
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
}

export default SearchItem
