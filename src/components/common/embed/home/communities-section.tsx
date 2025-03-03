import { type EmbedConfigsType } from '@/hooks/use-embed-details'
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
        <div className="flex flex-col gap-3 text-center">
          <p className="text-title-2-bold text-primary">{communitiesSection.sectionTitle}</p>
          <p className="text-title-1-bold-home-m">{communitiesSection.title}</p>
        </div>
        <div
          className="m-10 rounded-xl "
          style={{
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
          }}>
          <MultiEmbed
            dataEmbedId={embedConfigs['Home/Post Sales Embed'].embedId}
            dataEmbedApiKey={embedConfigs['Home/Post Sales Embed'].embedApiKey}
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
          <p className="text-cap-1-bold-home text-primary">{communitiesSection.sectionTitle}</p>
          <p className="text-center text-new-h2-mobile">{communitiesSection.title}</p>
          <div className="pt-10">
            <MultiEmbed
              dataEmbedId={`${embedConfigs['Home/Search Embed1'].embedId}`}
              dataEmbedApiKey={embedConfigs['Home/Search Embed1'].embedApiKey}
              genSdkId={4}
              style={{
                height: '615px',
                width: '350px',
              }}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default CommunitiesSection
