import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import axios from 'axios';
const QRShortUrlPage = (props) => {
    const router = useRouter();
    const { qr_code } = router.query
    useEffect(() => {
        if(qr_code !== undefined && qr_code !== null && qr_code !== ''){
            var qr_code_to_use = (props.data.qr_code !== undefined && props.data.qr_code !== null)?props.data.qr_code:'';
            var redirect_url = process.env.record_apps_flyer_url + qr_code_to_use;
            redirect_url = redirect_url.replace('{{qr_code}}',qr_code_to_use);
            window.location.href = redirect_url;
        }
    });
    const abbreviateNumber = (value) => {
        var newValue = value;
        if (value >= 1000) {
            var suffixes = ["", "k", "m", "b","t"];
            var suffixNum = Math.floor( (""+value).length/3 );
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
                if (dotLessShortValue.length <= 2) { break; }
            }
            if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
            newValue = shortValue+suffixes[suffixNum];
        }
        return newValue;
    }
    var currentUrl = process.env.hostname + props.url.asPath;
    var name_nickname = props.data.owner.name !== undefined && props.data.owner.name !== null && props.data.owner.name !== '' ? props.data.owner.name : `@${props.data.owner.nickname}`;
    var views_formatted = abbreviateNumber(props.data.owner.no_of_views);
    var meta_title = `Record and publish videos for ${name_nickname}`;
    var meta_description = `${name_nickname}, ${props.data.owner.no_of_videos} Videos, ${views_formatted} Views, ${props.data.owner.no_of_replies} Replies`;
    var preview_image = (props.data.preview_image !== undefined && props.data.preview_image !== null)?props.data.preview_image:'';
    return (
        <div>
            <NextSeo
                title={meta_title}
                description={meta_description}
                openGraph={{
                    type: 'object',
                    url: currentUrl,
                    title: `${meta_title}`,
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
                        }
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
            <p>Redirecting...</p>
        </div>
    );
}
QRShortUrlPage.getInitialProps = async ({ query: { qr_code } }) => {
    var url_to_use = `${process.env.apiurl}/api/v3/qr/web?qr_code=${qr_code}`;
    // console.log('api url', url_to_use);
    return axios.get(url_to_use)
    .then(response => {
        // console.log('api response', response);
        return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
        console.log('api err', err);
        return Promise.resolve({ data: {} })
    });
}
export default QRShortUrlPage;