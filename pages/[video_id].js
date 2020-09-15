import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import Error from 'next/error';
import { NextSeo } from 'next-seo';
import axios from 'axios';
const ShortUrlPage = (props) => {
    const router = useRouter();
    const { video_id } = router.query
    // console.log('video_id', video_id);
    useEffect(() => {
        if(video_id !== undefined && video_id !== null && video_id !== ''){
            // setTimeout(function(){
                var redirect_url = process.env.apps_flyer_url + video_id;
                redirect_url = redirect_url.replace('{{video_id}}',video_id);
                console.log('redirect_url', redirect_url);
                window.location.href = redirect_url;
            // }, 300);
        }
    });
    var currentUrl = process.env.hostname + props.url.asPath;
    var description = props.data.description;
    var videoThumbnail = props.data.videoThumbnail;
    return (
        <div>
            <NextSeo
                title="Genuin"
                description={description}
                openGraph={{
                url: currentUrl,
                title: 'Genuin',
                description: description,
                images: [
                    // {
                    //   url: metaImage,
                    //   width: metaImageWidth,
                    //   height: metaImageHeight,
                    //   alt: 'Genuin',
                    // },
                    {
                    url: videoThumbnail,
                    width: 300,
                    height: 200,
                    alt: 'Genuin',
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
ShortUrlPage.getInitialProps = async ({ query: { video_id } }) => {
    return axios.post(process.env.apiurl+ "/api/v3/users/video/meta_data/" + video_id)
    .then(response => {
        return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
        return Promise.resolve({ data: {} })
    });
}
export default ShortUrlPage;