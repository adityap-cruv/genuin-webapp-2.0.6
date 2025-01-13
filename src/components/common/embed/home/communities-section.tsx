import standardWall from '@images/embed/standard-wall.png'
import Image from 'next/image'
import videoFrame from '@images/embed/video-frame.png'
import { type CommunitiesSectionType } from '../../../../../types/embed/embed-home'

const CommunitiesSection = ({ communitiesSection }: { communitiesSection?: CommunitiesSectionType }) => {
  if (!communitiesSection) return null

  return (
    <>
      {/* Desktop */}
      <section className="hidden py-20 md:block">
        <div className="flex flex-col gap-3 text-center opacity-40">
          <p className="text-title-2-bold text-primary">{communitiesSection.sectionTitle}</p>
          <p className="text-title-1-bold-home-m">{communitiesSection.title}</p>
        </div>
        <div className="pt-10">
          <Image src={standardWall} alt="imgPuppet" className="shadow-2xl" />
        </div>
      </section>

      {/* Mobile */}
      <section className="py-10 md:hidden">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-cap-1-bold-home text-primary opacity-40">{communitiesSection.sectionTitle}</p>
          <p className="text-center text-new-h2-mobile opacity-40">{communitiesSection.title}</p>
          <div className="pt-10">
            <Image src={videoFrame} alt="imgPuppet" className="shadow-2xl" />
          </div>
        </div>
      </section>
    </>
  )
}

export default CommunitiesSection
