import { Button } from '@/components/ui/button'
import React from 'react'
import { type GetStartedSectionType } from '../../../../../types/embed/embed-home'

const GetStartedSection = ({ getStartedSection }: { getStartedSection: GetStartedSectionType }) => {
  if (!getStartedSection || !getStartedSection.visibility) return null
  return (
    <>
      {/* Desktop */}
      <section className="my-20 hidden rounded-3xl bg-primary-100 md:block">
        <div className="flex w-full items-center justify-between gap-6 ">
          <div className="flex w-1/2 flex-col gap-6 p-20">
            <p className="text-title-2-bold text-primary">{getStartedSection.sectionTitle}</p>
            <p className="text-title-1-bold-home-m">{getStartedSection.title}</p>
            <p className="text-title-2-demi font-medium">{getStartedSection.caption}</p>
            <div>
              <Button className="rounded-full px-6 py-3">
                <p className="text-cap-1-home">{getStartedSection.button[0].text}</p>
              </Button>
            </div>
          </div>
          <div className="w-1/2">
            <img src={getStartedSection.carousalImage} alt="imgPuppet" />
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="my-10 rounded-3xl bg-primary-100 md:hidden">
        <div className="flex w-full items-center justify-between gap-6 ">
          <div className="flex flex-col gap-6 p-6">
            <p className="text-cap-1-bold-home text-primary">{getStartedSection.sectionTitle}</p>
            <p className="text-new-h2-mobile">{getStartedSection.title}</p>
            <p className="text-title-2-demi font-medium">{getStartedSection.caption}</p>
            <div>
              <Button className="rounded-full px-6 py-3">
                <p className="text-cap-1-home">{getStartedSection.button[0].text}</p>
              </Button>
            </div>
            <div>
              <img src={getStartedSection.carousalImage} alt="imgPuppet" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default GetStartedSection
