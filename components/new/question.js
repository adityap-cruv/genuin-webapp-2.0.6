import React, { useMemo } from 'react';
import { NextSeo } from 'next-seo';

const logo = require('../../images/logo_header_new.png');
const ios = require('../../images/badge_appstore.png');
const android = require('../../images/badge_playstore.png');

export const Question = ({
  preview_image,
  asPath,
  question,
  owner,
  question_id,
  genuinurl,
  host,
}) => {
  const handleAndroidInstallClick = () => {
    window.open('https://install.begenuin.com/86sn/cgs');
  };
  const handleIosInstallClick = () => {
    window.open('https://install.begenuin.com/86sn/cgs');
  };
  var currentUrl = useMemo(() => host + asPath, [asPath]);
  const _question = useMemo(() =>
    Boolean(question) ? 'Question on Genuin: ' + question : question
  );
  const askedBy = useMemo(() =>
    Boolean(owner?.nickname) ? `asked by @${owner.nickname}` : owner?.nickname
  );
  const description = useMemo(
    () => `Answer this trending question on Genuin${askedBy}`,
    [askedBy]
  );

  return (
    <>
      <NextSeo
        title={_question}
        description={description}
        openGraph={{
          type: 'object',
          url: currentUrl,
          title: `${_question}`,
          images: [
            {
              url: preview_image,
              width: 1084,
              height: 546,
              alt: 'Genuin',
            },
            {
              url: preview_image,
              width: 300,
              height: 200,
              alt: 'Genuin',
              // type:'image/png'
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
      {Boolean(question_id) ? (
        <>
          <style>{`
      .preview_image {
          opacity: 1;
          width: 76.96%;
          height: auto;
          position: relative;
          margin-top: 4.5%;
          margin-left: 11.52%;
          border-radius: 20px;
      }
      `}</style>
          <img className='preview_image' src={preview_image} />
        </>
      ) : (
        <>
          <style>{`
                    .chat_not_found {
                        opacity: 1;
                        width: 53.47%;
                        height: auto;
                        position: relative;
                        padding: 17.8% 0px 14.8% 0px;
                        margin-left: 23.26%;
                        text-align:center;
                    }
                    .chat_not_found h3 {
                        color: #ffffff;
                        font-family: 'AvenirNext-Bold';
                        font-size: 36px;
                        letter-spacing: 0px;
                    }
                    .chat_not_found p {
                        color: #ffffff;
                        font-family: 'AvenirNext-Medium';
                        font-size: 28px;
                        letter-spacing: 0px;
                    }
                    .chat_not_found a {
                        text-decoration: none;
                        color: #0645FF;
                    }
                    .not_found_page_logo {
                        position: absolute;
                        top: 4%;
                        left: 5%;
                    }
                    .not_found_page_logo img {
                        width: 180px;
                        cursor: pointer;
                    }
                    `}</style>
          <div className='not_found_page_logo'>
            <img src={logo} alt='Genuin' href={genuinurl ?? ''} />
          </div>
          <div className='chat_not_found'>
            <h3>Sorry, this page isn’t available.</h3>
            <p>
              The link you followed may be broken, or the page may have been
              removed. Go to <a href={genuinurl ?? ''}>Genuin homepage.</a>
            </p>
          </div>
        </>
      )}

      <div className='app_store_buttons'>
        <div className='ios'>
          <img src={ios} onClick={handleIosInstallClick} alt='badge_appstore' />
        </div>
        <div className='android'>
          <img
            src={android}
            onClick={handleAndroidInstallClick}
            alt='badge_playstore'
          />
        </div>
      </div>
    </>
  );
};
