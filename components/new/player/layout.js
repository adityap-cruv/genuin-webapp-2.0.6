import React from 'react';
import NextHead from 'next/head';
import { NextSeo } from 'next-seo';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

export const Layout = ({
  children,
  title,
  videoUrl,
  metaImage,
  metaImageWidth,
  metaImageHeight,
  content,
  description,
  currentUrl,
  keyword,
}) => (
  <div>
    <style jsx>{`
      @font-face {
        font-family: 'AvenirNext';
        src: url('/fonts/AvenirNext-Bold-01.ttf');
        src: url('/fonts/AvenirNext-BoldItalic-02.ttf');
        src: url('/fonts/AvenirNext-DemiBold-03.ttf');
        src: url('/fonts/AvenirNext-DemiBoldItalic-04.ttf');
        src: url('/fonts/AvenirNext-Heavy-09.ttf');
        src: url('/fonts/AvenirNext-HeavyItalic-10.ttf');
        src: url('/fonts/AvenirNext-Italic-05.ttf');
        src: url('/fonts/AvenirNext-Medium-06.ttf');
        src: url('/fonts/AvenirNext-MediumItalic-07.ttf');
        src: url('/fonts/AvenirNext-Regular-08.ttf');
        src: url('/fonts/AvenirNext-UltraLight-11.ttf');
        src: url('/fonts/AvenirNext-UltraLightItalic-12.ttf');
      }
      @font-face {
        font-family: 'AvenirNext-DemiBold';
        src: url('/fonts/AvenirNext-DemiBold-03.ttf');
      }
      @font-face {
        font-family: 'AvenirNext-Bold';
        src: url('/fonts/AvenirNext-Bold-01.ttf');
      }
    `}</style>
    <meta property='og:video:url' content={videoUrl} />
    <meta property='og:video:secure_url' content={videoUrl} />
    <meta property='og:video:type' content='video/mp4' />
    <NextSeo
      title={title}
      description={description}
      openGraph={{
        type: 'website',
        url: currentUrl,
        title: 'Genuin',
        description: description,
        videos: [
          {
            url: videoUrl,
            secure_url: videoUrl,
            type: 'video/mp4',
            width: '720',
            height: '1280',
            alt: 'Genuin',
          },
        ],
        images: [
          {
            url: metaImage,
            width: metaImageWidth,
            height: metaImageHeight,
            alt: 'Genuin',
          },
          // {
          //   url: content,
          //   width: 350,
          //   height: 650,
          //   alt: 'Genuin',
          // }
        ],
        site_name: 'Genuin',
      }}
      facebook={{
        appId: 1234567890,
      }}
      twitter={{
        handle: '@handle',
        site: '@site',
        cardType: 'summary_large_image',
      }}
    />
    <NextHead>
      {/* <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.2/css/bulma.min.css"
      /> */}
      {/* <script src="https:code.jquery.com/jquery-3.4.1.min.js"></script> */}
    </NextHead>
    <div className='overlay'></div>
    <div
      className='main'
      style={{
        backgroundImage: `url(${content})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {children}
    </div>
  </div>
);
