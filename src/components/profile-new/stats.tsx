import { abbreviateNumber, cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type StatsType = {
  /**
   * Here is key will be Name of the stat and value will be the number of that stat.
   */
  values: Record<string, number>
} & ComponentProps<'div'>

export function Stats({ values, className, ...restProps }: StatsType) {
  return (
    <div className={cn('flex w-min justify-between gap-x-2 md:gap-x-6', className)} {...restProps}>
      {Object.keys(values).map((key) => {
        return (
          <div key={key} className="flex items-center">
            <p className="text-title-3-bold">{abbreviateNumber(values[key])}</p>
            <p className="px-1 text-cap-1-demi text-tertiary md:text-body-1-med">{key}</p>
          </div>
        )
      })}
    </div>
  )
}
