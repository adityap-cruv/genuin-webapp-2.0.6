import React from 'react'
import { NextSeo } from 'next-seo'

export const SEO = ({
  videoUrl,
  description,
  videoPreviewImage,
  title = undefined,
  urlToCopy,
  metaImageWidth = undefined,
  metaImageHeight = undefined,
  metaVideoHeight = undefined,
  metaVideoWidth = undefined,
  openGraphTitle = 'Genuin',
  openGraphDescription,
  videoType = undefined,
  openGraphType = 'website',
  ownerProfileLink = 'www.genuin.com',
  videoDuration = undefined,
  releaseDate = undefined,
  updateTime = undefined,
  author = undefined
}) => {
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        openGraph={{
          type: openGraphType,
          url: urlToCopy,
          title: openGraphTitle,
          description: openGraphDescription,
          videos: [
            {
              url: videoUrl,
              secureUrl: videoUrl,
              type: videoType,
              width: metaVideoWidth,
              height: metaVideoHeight,
              alt: 'Genuin'
            }
          ],
          images: [
            {
              url: videoPreviewImage,
              width: metaImageWidth,
              height: metaImageHeight,
              alt: 'Genuin'
            }
          ],
          locale: 'en_us',
          site_name: 'Genuin'
        }}
        additionalMetaTags={[
          {
            property: 'og:video:director',
            content: ownerProfileLink
          },
          {
            property: 'og:video:release_date',
            content: releaseDate
          },
          {
            property: 'og:video:duration',
            content: videoDuration
          },
          {
            property: 'og:published_time',
            content: releaseDate
          },
          {
            property: 'og:modified_time',
            content: updateTime
          },
          {
            property: 'og:author',
            content: author
          }
        ]}
      />
    </>
  )
}
