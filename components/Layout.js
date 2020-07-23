import React from 'react';
import NextHead from 'next/head';
import { NextSeo } from 'next-seo';
import '../pages/style.css'

const Layout = ({ children, title, content, description, currentUrl, keyword }) => (
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
    <NextSeo
      title={title}
      description={description}
      openGraph={{
        url: currentUrl,
        title: 'Genuin',
        description: description,
        images: [
          {
            url: content,
            width: 300,
            height: 200,
            alt: 'Genuin',
          },
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.2/css/bulma.min.css" /> 
    </NextHead>
    <div className="overlay"></div>
    <div className="main" style={{ backgroundImage: `url(${content})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', height: '754px' }}>
      {children}
    </div>
  </div>
);

export default Layout;