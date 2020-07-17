import React from 'react';
import NextHead from 'next/head';
import { NextSeo } from 'next-seo';
import '../pages/style.css'

const Layout = ({ children, title, content, description, currentUrl, keyword }) => (
  <div>
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
    <div class="overlay"></div>
    <div className="main" style={{ backgroundImage: `url(${content})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', height: '754px' }}>
      {children}
    </div>
  </div>
);

export default Layout;