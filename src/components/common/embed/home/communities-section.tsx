import { type EmbedConfigsType } from '@/hooks/use-embed-details'
import { type CommunitiesSectionType } from '../../../../../types/embed/embed-home'
import MultiEmbed from '../multi-embed'
import { useGenuinOptions } from '@/lib/stores/genuin-options'

const CommunitiesSection = ({
  communitiesSection,
  embedConfigs,
}: {
  communitiesSection?: CommunitiesSectionType
  embedConfigs: EmbedConfigsType
}) => {
  const isMobile = useGenuinOptions((state) => state.isMobile)
  if (!communitiesSection) return null

  const embedKey = isMobile ? 'Home/Search Embed1' : 'Home/Post Sales Embed'

  return (
    <section className="py-10 md:py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-cap-1-bold-home text-primary md:text-title-2-bold">{communitiesSection.sectionTitle}</p>
        <p className="text-new-h2-mobile md:text-title-1-bold-home-m">{communitiesSection.title}</p>
      </div>
      <div className="rounded-xl pt-10 md:m-10 md:pt-0 md:shadow-[0px_8px_24px_rgba(0,0,0,0.1)]">
        <MultiEmbed
          dataEmbedId={embedConfigs[embedKey].embedId}
          dataEmbedApiKey={embedConfigs[embedKey].embedApiKey}
          style={{
            height: isMobile ? '615px' : '750px',
            width: isMobile ? '350px' : '100%',
            zIndex: 40,
          }}
        />
      </div>
    </section>
  )
}

export default CommunitiesSection
