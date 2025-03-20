import TestimonialTab from './testimonial-tab'
import { type TestimonialSectionType } from '../../../../../types/embed/embed-home'
import MultiEmbed from '../multi-embed'
import { type EmbedConfigsType } from '@/hooks/use-embed-details'

const TestimonialSection = ({
  testimonialSection,
  embedConfigs,
}: {
  testimonialSection: TestimonialSectionType
  embedConfigs: EmbedConfigsType
}) => {
  if (!testimonialSection) return null

  return (
    <section className="py-10 md:py-20">
      <div className="flex w-full flex-col items-center gap-6 md:flex-row">
        <div className="hidden w-2/5 md:block">
          <MultiEmbed
            dataEmbedId={embedConfigs['Home/Search Embed1'].embedId}
            dataEmbedApiKey={embedConfigs['Home/Search Embed1'].embedApiKey}
            style={{ height: '615px', width: '350px' }}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-3 text-center md:w-3/5 md:items-start md:text-left">
          <p className="text-cap-1-bold-home text-primary md:text-title-2-bold">{testimonialSection.sectionTitle}</p>
          <p className="text-new-h2-mobile md:text-title-1-bold-home-m">{testimonialSection.title}</p>
          <p className="text-title-2-demi font-medium">{testimonialSection.caption}</p>
          <div className="mt-6">
            <TestimonialTab />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection
