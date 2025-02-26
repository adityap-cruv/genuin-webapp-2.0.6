import { type CommunitiesSectionType } from '../../../../../types/embed/embed-home'
import MultiEmbedHome from './multi-embed-home'

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
        <div className="pt-10 shadow-background">
          <MultiEmbedHome type="home4" />
        </div>
      </section>

      {/* Mobile */}
      <section className="py-10 md:hidden">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-cap-1-bold-home text-primary opacity-40">{communitiesSection.sectionTitle}</p>
          <p className="text-center text-new-h2-mobile opacity-40">{communitiesSection.title}</p>
          <div className="pt-10">
            <MultiEmbedHome type="home4" />
          </div>
        </div>
      </section>
    </>
  )
}

export default CommunitiesSection
