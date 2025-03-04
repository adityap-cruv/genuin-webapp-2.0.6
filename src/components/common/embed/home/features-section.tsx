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
    <>
      <section className="hidden py-20 md:block">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-title-2-bold text-primary">{featuresSection.sectionTitle}</p>
          <p className="text-title-1-bold-home-m">{featuresSection.title}</p>
        </div>
        <div className="flex items-center gap-20 pt-10">
          <div className="flex w-1/4 flex-col gap-14 text-center">
            {featuresSection?.options.map((item) => (
              <p
                className={`cursor-pointer text-title-2-bold transition-all ${
                  item === selectedItem
                    ? 'rounded-full bg-primary py-5 text-title-2-bold text-monochrome-white'
                    : 'hover:scale-105 hover:text-primary'
                }`}
                onClick={() => {
                  setSelectedItem(item)
                }}
                key={item}>
                {item}
              </p>
            ))}
          </div>
          <div className="w-3/4">
            <MultiEmbed
              dataEmbedId={embedConfigs['Home/Search Embed'].embedId}
              dataEmbedApiKey={embedConfigs['Home/Search Embed'].embedApiKey}
              style={{
                height: '600px',
              }}
            />
          </div>
        </div>
      </section>

      <section className="py-10 md:hidden">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-cap-1-bold-home text-primary">{featuresSection.sectionTitle}</p>
          <p className="text-new-h2-mobile">{featuresSection.title}</p>
          <div className="hide-scrollbar flex h-14 w-full items-center gap-8 overflow-hidden overflow-x-scroll text-center">
            {featuresSection?.options.map((item) => (
              <p
                className={`cursor-pointer whitespace-nowrap text-cap-1-bold-home transition-all ${
                  item === selectedItem
                    ? 'rounded-full bg-primary px-4 py-3 text-monochrome-white'
                    : 'hover:scale-105 hover:text-primary'
                }`}
                onClick={() => {
                  setSelectedItem(item)
                }}
                key={item}>
                {item}
              </p>
            ))}
          </div>
          <MultiEmbed
            dataEmbedId={embedConfigs['Home/Search Embed'].embedId}
            dataEmbedApiKey={embedConfigs['Home/Search Embed'].embedApiKey}
            style={{
              height: '500px',
            }}
          />
        </div>
      </section>
    </>
  )
}

export default FeaturesSection
