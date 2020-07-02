import React from 'react';
import NextHead from 'next/head';
import { NextSeo } from 'next-seo';
import '../pages/style.css'

const Layout = ({ children, title, content, description, currentUrl, keyword }) => (
  <div>
    <NextSeo
      title={title}
      description={description}
      // canonical="https://www.canonical.ie/"
      openGraph={{
        url: currentUrl,
        title: 'Genuine',
        description: description,
        images: [
          {
            url: content,
            width: 300,
            height: 200,
            alt: 'Genuine',
          },
        ],
        site_name: 'Genuine',
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
    { /* <meta charSet="UTF-8" />
      <title>{title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="icon" sizes="192x192" href="/static/touch-icon.png" />
      <link rel="apple-touch-icon" href="/static/touch-icon.png" />
      <link rel="mask-icon" href="/static/favicon-mask.svg" color="#49B882" />
      <link rel="icon" href="/static/favicon.ico" />
      <meta name="description" content={description} />
      <meta itemprop="name" content="Genuine" />
      <meta itemprop="description" content={description} />
      <meta itemprop="image" content={content} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Genuine" />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={content} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Genuine" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={content} /> */}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.2/css/bulma.min.css" /> 
    </NextHead>
    <div className="main" style={{ backgroundImage: `url(${content})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', height: '754px' }}>
      {children}
    </div>
  </div>
);

export default Layout;