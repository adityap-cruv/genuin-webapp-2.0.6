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
      <div className="hidden py-16 md:flex">
        <div className="flex w-1/2 flex-col justify-center gap-6">
          {title}
          <p className="text-body-2-home">{subtitle}</p>
        </div>
        <div className="w-1/2">
          <img src={imageSrc} className="w-full rounded-[36px] shadow-sm" alt="Information Section" />
        </div>
      </div>

      <div className="flex flex-col gap-6 py-9 md:hidden">
        {title}
        <p className="text-cap-2-home-m text-center">{subtitle}</p>
        <img src={imageSrc} className="w-full rounded-[36px] shadow-sm" alt="Information Section" />
      </div>
    </>
  )
}
