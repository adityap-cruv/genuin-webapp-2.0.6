'use client'

import { useState } from 'react'
import { type FeaturesSectionType } from '../../../../../types/embed/embed-home'
import MultiEmbed from '../multi-embed'
import { type EmbedConfigsType } from '@/hooks/use-embed-details'

const FeaturesSection = ({
  featuresSection,
  embedConfigs,
}: {
  featuresSection: FeaturesSectionType
  embedConfigs: EmbedConfigsType
}) => {
  const [selectedItem, setSelectedItem] = useState(featuresSection?.options[1])

  if (!featuresSection || featuresSection?.options.length === 0) return null

  return (
    <section className="py-10 md:py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-cap-1-bold-home text-primary md:text-title-2-bold">{featuresSection.sectionTitle}</p>
        <p className="text-new-h2-mobile md:text-title-1-bold-home-m">{featuresSection.title}</p>
      </div>

      <div className="flex flex-col items-center gap-8 pt-6 md:flex-row md:gap-20 md:pt-10">
        <div className="hide-scrollbar flex w-full flex-row gap-6 overflow-x-auto text-center md:w-1/4 md:flex-col md:gap-14 md:overflow-visible">
          {featuresSection?.options.map((item) => (
            <p
              className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-3 text-center text-cap-1-bold-home transition-all md:whitespace-normal md:py-5 md:text-title-2-bold ${
                item === selectedItem ? 'bg-primary text-monochrome-white' : 'hover:scale-105 hover:text-primary'
              }`}
              onClick={() => {
                setSelectedItem(item)
              }}
              key={item}>
              {item}
            </p>
          ))}
        </div>
        <div className="w-full md:w-3/4">
          <MultiEmbed
            dataEmbedId={embedConfigs['Home/Search Embed'].embedId}
            dataEmbedApiKey={embedConfigs['Home/Search Embed'].embedApiKey}
            style={{ height: '600px', padding: '8px' }}
          />
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
