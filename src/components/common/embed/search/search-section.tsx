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
    <>
      {/* Desktop */}
      <section className="hidden md:block">
        <div className="flex flex-col gap-6 py-10">
          <div className="flex items-center justify-end gap-6">
            <div className="flex w-[450px] items-center justify-between rounded-full border border-secondary-400 p-2 px-5">
              <p className="text-body-1-med text-secondary-400">{searchTopSection?.searchInputText}</p>
              <SearchIcon className="stroke-secondary-400" />
            </div>
            <div>
              <ShoppingCartIcon />
            </div>
            <div>
              <Button className="rounded-full bg-monochrome-black px-7 py-4" disabled>
                <p className="text-body-1-bold">Sign In</p>
              </Button>
            </div>
          </div>
          <p className="text-title-2-bold">{searchTopSection?.searchResultText}</p>
          <div className="flex gap-4">
            <Button className="rounded-full px-7 py-4" variant={'default'} disabled>
              <p className="text-body-1-bold">{searchTopSection?.button[0].text}</p>
            </Button>
            <Button className="rounded-full px-7 py-4" disabled variant={'outline'}>
              <p className="text-body-1-bold">{searchTopSection?.button[1].text}</p>
            </Button>
          </div>
        </div>
        <div className="hide-scrollbar flex w-full snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth p-4">
          {searchTopSection?.searchItemsTop.map((item, index) => (
            <SearchItem
              className="max-w-[420px] flex-shrink-0 snap-start"
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
        <div className="py-20">
          <MultiEmbed
            dataEmbedId={`${embedConfigs['Home/Search Embed'].embedId}`}
            dataEmbedApiKey={embedConfigs['Home/Search Embed'].embedApiKey}
            genSdkId={1}
            style={{
              height: '600px',
            }}
          />
        </div>
        <div className="flex w-full items-center gap-6 py-10">
          <div className="grid w-auto grid-cols-2 gap-6">
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
          <div
            style={{
              height: '650px',
              width: '350px',
            }}
            className="flex items-center justify-center">
            <MultiEmbed
              dataEmbedId={`${embedConfigs['Home/Search Embed1'].embedId}`}
              dataEmbedApiKey={embedConfigs['Home/Search Embed1'].embedApiKey}
              genSdkId={2}
              style={{
                height: '650px',
                width: '350px',
              }}
            />
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="md:hidden">
        <div className="flex flex-col gap-4 py-10">
          <div className="flex items-center justify-end gap-2">
            <div className="flex w-[450px] items-center justify-between rounded-full border border-secondary-400 p-1.5 px-3">
              <p className="line-clamp-1 text-cap-2-demi text-secondary-400">{searchTopSection?.searchInputText}</p>
              <SearchIcon className="h-6 stroke-secondary-400" />
            </div>
            <div>
              <ShoppingCartIcon className="h-5" />
            </div>
            <div>
              <Button className="rounded-full bg-monochrome-black px-3 py-2" disabled>
                <p className="whitespace-nowrap text-cap-1-demi">Sign In</p>
              </Button>
            </div>
          </div>
          <p className="text-title-3-med">{searchTopSection?.searchResultText}</p>
          <div className="flex gap-4">
            <Button className="rounded-full px-3 py-2" disabled>
              <p className="text-cap-1-demi">{searchTopSection?.button[0].text}</p>
            </Button>
            <Button className="rounded-full px-3 py-2" disabled variant={'outline'}>
              <p className="text-cap-1-demi">{searchTopSection?.button[1].text}</p>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {searchTopSection?.searchItemsTop.map((item, index) => (
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
        <div className="py-10">
          <MultiEmbed
            dataEmbedId={`${embedConfigs['Home/Search Embed'].embedId}`}
            dataEmbedApiKey={embedConfigs['Home/Search Embed'].embedApiKey}
            genSdkId={1}
            style={{
              height: '600px',
            }}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
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
        <div className="my-10 flex justify-center">
          <MultiEmbed
            dataEmbedId={`${embedConfigs['Home/Search Embed1'].embedId}`}
            dataEmbedApiKey={embedConfigs['Home/Search Embed1'].embedApiKey}
            genSdkId={2}
            style={{
              height: '650px',
              width: '350px',
            }}
          />
        </div>
      </section>
    </>
  )
}

export default SearchSection
