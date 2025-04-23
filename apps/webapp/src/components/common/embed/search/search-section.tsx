import { Button } from '@/components/ui/button'
import { SearchIcon } from '@icons/search-icon'
import { ShoppingCartIcon } from '@images/embed/social-icons/shopping-cart'
import React from 'react'
import SearchItem from './search-item'
import { type SearchTopSection } from '../../../../../types/embed/embed-search'
import MultiEmbed from '../multi-embed'
import { type EmbedConfigsType } from '@/hooks/use-embed-details'

const SearchSection = ({
  searchTopSection,
  embedConfigs,
}: {
  searchTopSection: SearchTopSection
  embedConfigs: EmbedConfigsType
}) => {
  return (
    <section>
      {/* Header Section */}
      <div className="flex flex-col gap-4 py-10 md:gap-6">
        <div className="flex items-center justify-end gap-2 md:gap-6">
          <div className="flex w-[450px] items-center justify-between rounded-full border border-secondary-400 p-1.5 px-3 md:p-2 md:px-5">
            <p className="line-clamp-1 text-cap-2-demi text-secondary-400 md:text-body-1-med">
              {searchTopSection?.searchInputText}
            </p>
            <SearchIcon className="h-6 stroke-secondary-400 md:h-auto" />
          </div>
          <div>
            <ShoppingCartIcon className="h-5 md:h-auto" />
          </div>
          <div>
            <Button className="rounded-full bg-monochrome-black px-3 py-2 md:px-7 md:py-4" disabled>
              <p className="whitespace-nowrap text-cap-1-demi md:text-body-1-bold">Sign In</p>
            </Button>
          </div>
        </div>
        <p className="text-title-3-med md:text-title-2-bold">{searchTopSection?.searchResultText}</p>
        <div className="flex gap-4">
          <Button className="rounded-full px-3 py-2 md:px-7 md:py-4" variant={'default'} disabled>
            <p className="text-cap-1-demi md:text-body-1-bold">{searchTopSection?.button[0].text}</p>
          </Button>
          <Button className="rounded-full px-3 py-2 md:px-7 md:py-4" disabled variant={'outline'}>
            <p className="text-cap-1-demi md:text-body-1-bold">{searchTopSection?.button[1].text}</p>
          </Button>
        </div>
      </div>

      {/* Top Search Items */}
      <div className="md:hide-scrollbar grid grid-cols-1 gap-4 md:flex md:w-full md:snap-x md:snap-mandatory md:gap-6 md:overflow-x-auto md:scroll-smooth md:p-4">
        {searchTopSection?.searchItemsTop.map((item, index) => (
          <SearchItem
            className="md:max-w-[420px] md:flex-shrink-0 md:snap-start"
            caption={item.caption}
            title={item.title}
            key={index}
            image={item.image ?? ''}
            price={item.price}
            time={item.time}
            button={item.button}
            highlightedText={item.highlightedText}
            searchItemType={searchTopSection.searchItemType}
          />
        ))}
      </div>

      {/* First Embed */}
      <div className="py-10 md:py-20">
        <MultiEmbed
          dataEmbedId={embedConfigs['Home/Search Embed'].embedId}
          dataEmbedApiKey={embedConfigs['Home/Search Embed'].embedApiKey}
          style={{
            height: '600px',
            width: '100%',
            padding: '8px',
          }}
        />
      </div>

      {/* Bottom Search Items and Second Embed */}
      <div className="flex w-full flex-col md:flex-row md:items-center md:gap-6">
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {searchTopSection?.searchItemsBottom.map((item, index) => (
            <SearchItem
              caption={item.caption}
              title={item.title}
              key={index}
              image={item.image ?? ''}
              price={item.price}
              time={item.time}
              button={item.button}
              highlightedText={item.highlightedText}
              searchItemType={searchTopSection.searchItemType}
            />
          ))}
        </div>
        <div className="my-10 flex justify-center md:my-0">
          <MultiEmbed
            dataEmbedId={embedConfigs['Home/Search Embed1'].embedId}
            dataEmbedApiKey={embedConfigs['Home/Search Embed1'].embedApiKey}
            style={{
              height: '650px',
              width: '350px',
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default SearchSection
