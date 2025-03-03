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
    <>
      {/* Desktop */}
      <section className="hidden py-20 md:block">
        <div className="flex w-full items-center gap-6">
          <div className="w-2/5">
            <MultiEmbed
              dataEmbedId={embedConfigs['Home/Search Embed1'].embedId}
              dataEmbedApiKey={embedConfigs['Home/Search Embed1'].embedApiKey}
              genSdkId={3}
              style={{
                height: '615px',
                width: '350px',
              }}
            />
          </div>
          <div className="flex w-3/5 flex-col gap-3">
            <p className="text-title-2-bold text-primary">{testimonialSection.sectionTitle}</p>
            <p className="text-title-1-bold-home-m">{testimonialSection.title}</p>
            <p className="text-title-2-demi font-medium">{testimonialSection.caption}</p>
            <div className="mt-6">
              <TestimonialTab />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-10 md:hidden">
        <div className="flex flex-col items-center gap-3">
          {/* <MultiEmbed
            dataEmbedId={embedConfigs['Home/Search Embed1'].embedId}
            genSdkId={3}
            style={{
              height: '615px',
              width: '350px',
            }}
          /> */}
          <p className="text-cap-1-bold-home text-primary">{testimonialSection.sectionTitle}</p>
          <p className="text-center text-new-h2-mobile">{testimonialSection.title}</p>
          <p className="text-center text-title-2-demi font-medium">{testimonialSection.caption}</p>
          <div className="mt-6">
            <TestimonialTab />
          </div>
        </div>
      </section>
    </>
  )
}

export default TestimonialSection
