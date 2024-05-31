import { type ReactNode } from 'react'

export function BuildEnagageBoost({
  title,
  subtitle,
  imageSrc,
}: {
  title: ReactNode
  subtitle: string
  imageSrc: any
}) {
  return (
    <>
      <div className="hidden gap-9 py-16 md:flex">
        <div className="flex w-1/2 flex-col justify-center gap-6">
          {title}
          <p className="text-body-2-home">{subtitle}</p>
        </div>
        {imageSrc}
      </div>

      <div className="flex flex-col gap-6 py-9 md:hidden">
        {title}
        <p className="text-center text-cap-2-home-m">{subtitle}</p>
        {imageSrc}
      </div>
    </>
  )
}
