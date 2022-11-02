import { NextSeo } from 'next-seo';
import NextHead from 'next/head';

export const SEO = ({
  videoUrl,
  description,
  videoPreviewImage,
  urlToCopy,
  title = "Genuin",
  metaImageWidth = 1200,
  metaImageHeight = 630,
  metaVideoHeight = 1280,
  metaVideoWidth = 720,
  openGraphTitle = "Genuin",
  videoType = "video/mp4",
  openGraphType = "website",
  includeHead = true,
}) => (
  <>
    {includeHead && (
      <NextHead>
        <meta property="og:video:url" content={videoUrl} />
        <meta property="og:video:secure_url" content={videoUrl} />
        <meta property="og:video:type" content={videoType} />
      </NextHead>
    )}
    <NextSeo
      title={title}
      description={description}
      openGraph={{
        type: openGraphType,
        url: urlToCopy,
        title: openGraphTitle,
        description: description,
        videos: [
          {
            url: videoUrl,
            secure_url: videoUrl,
            type: videoType,
            width: metaVideoWidth,
            height: metaVideoHeight,
            alt: "Genuin",
          },
        ],
        images: [
          {
            url: videoPreviewImage,
            width: metaImageWidth,
            height: metaImageHeight,
            alt: "Genuin",
          },
        ],
        site_name: "Genuin",
      }}
      facebook={{
        appId: 1234567890,
      }}
      twitter={{
        handle: "@handle",
        site: "@site",
        cardType: "summary_large_image",
      }}
    />
  </>
);
