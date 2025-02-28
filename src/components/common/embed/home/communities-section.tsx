import { EmbedConfigsType } from '@/hooks/use-embed-details'
import { type CommunitiesSectionType } from '../../../../../types/embed/embed-home'
import MultiEmbed from '../multi-embed'

const CommunitiesSection = ({
  communitiesSection,
  embedConfigs,
}: {
  communitiesSection?: CommunitiesSectionType
  embedConfigs: EmbedConfigsType
}) => {
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
          <MultiEmbed
            dataEmbedId={embedConfigs['Home/Post Sales Embed'].embedId}
            genSdkId={4}
            style={{
              height: '750px',
            }}
          />
        </div>
      </section>

      {/* Mobile */}
      <section className="py-10 md:hidden">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-cap-1-bold-home text-primary opacity-40">{communitiesSection.sectionTitle}</p>
          <p className="text-center text-new-h2-mobile opacity-40">{communitiesSection.title}</p>
          <div className="pt-10">
            <MultiEmbed
              dataEmbedId={embedConfigs['Home/Post Sales Embed'].embedId}
              genSdkId={4}
              style={{
                height: '600px',
              }}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default CommunitiesSection
